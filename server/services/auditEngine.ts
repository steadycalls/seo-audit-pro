/**
 * SEO Audit Engine
 * Orchestrates the complete audit workflow across all phases
 */

import { DataForSEOService, analyzeBacklinkToxicity } from './dataforseo';
import { updateAudit, createAuditReport, updateAuditReport } from '../db';
import { invokeLLM } from '../_core/llm';

interface AuditEngineConfig {
  auditId: number;
  domain: string;
  dataForSEOLogin: string;
  dataForSEOPassword: string;
}

interface AuditResult {
  success: boolean;
  creditsUsed: number;
  error?: string;
}

export class AuditEngine {
  private config: AuditEngineConfig;
  private dataForSEO: DataForSEOService;
  private creditsUsed: number = 0;

  constructor(config: AuditEngineConfig) {
    this.config = config;
    this.dataForSEO = new DataForSEOService({
      login: config.dataForSEOLogin,
      password: config.dataForSEOPassword,
    });
  }

  async runFullAudit(): Promise<AuditResult> {
    try {
      await updateAudit(this.config.auditId, {
        status: 'running',
        startedAt: new Date(),
      });

      // Initialize the report
      await createAuditReport({
        auditId: this.config.auditId,
      });

      // Phase 1: On-Page & Technical
      const onPageData = await this.runOnPageAudit();
      this.creditsUsed += 250; // Estimated credits

      // Phase 2: Backlink Analysis
      const backlinkData = await this.runBacklinkAudit();
      this.creditsUsed += 45; // Estimated credits

      // Phase 3: Generate AI Summary
      const summary = await this.generateAISummary(onPageData, backlinkData);
      this.creditsUsed += 50; // Estimated credits for AI

      // Update final report
      await updateAuditReport(this.config.auditId, {
        ...onPageData,
        ...backlinkData,
        criticalIssues: JSON.stringify(summary.critical),
        warnings: JSON.stringify(summary.warnings),
        goodSignals: JSON.stringify(summary.good),
        rawData: JSON.stringify({ onPageData, backlinkData }),
      });

      await updateAudit(this.config.auditId, {
        status: 'completed',
        completedAt: new Date(),
        creditsUsed: this.creditsUsed,
      });

      return {
        success: true,
        creditsUsed: this.creditsUsed,
      };
    } catch (error) {
      await updateAudit(this.config.auditId, {
        status: 'failed',
        completedAt: new Date(),
        creditsUsed: this.creditsUsed,
      });

      return {
        success: false,
        creditsUsed: this.creditsUsed,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async runOnPageAudit() {
    const taskId = await this.dataForSEO.startOnPageCrawl(this.config.domain);

    // Wait for crawl to complete (in production, this should be async with polling)
    await this.waitForTask(taskId, 60000); // 60 second timeout

    const summary = await this.dataForSEO.getOnPageSummary(taskId);
    const pages = await this.dataForSEO.getOnPagePages(taskId);

    // Analyze the data
    let errors404 = 0;
    let errors5xx = 0;
    let missingTitles = 0;
    let missingDescriptions = 0;
    let duplicateTitles = 0;
    let duplicateDescriptions = 0;
    let missingH1 = 0;
    let missingAltText = 0;
    let totalLoadTime = 0;

    const titlesSeen = new Map<string, number>();
    const descriptionsSeen = new Map<string, number>();

    for (const page of pages) {
      // Status codes
      if (page.status_code === 404) errors404++;
      if (page.status_code >= 500) errors5xx++;

      // Meta tags
      if (!page.meta?.title) {
        missingTitles++;
      } else {
        const title = page.meta.title;
        titlesSeen.set(title, (titlesSeen.get(title) || 0) + 1);
      }

      if (!page.meta?.description) {
        missingDescriptions++;
      } else {
        const desc = page.meta.description;
        descriptionsSeen.set(desc, (descriptionsSeen.get(desc) || 0) + 1);
      }

      // H1 tags
      if (!page.meta?.h1 || page.meta.h1.length === 0) {
        missingH1++;
      }

      // Images without alt text
      if (page.meta?.images) {
        missingAltText += page.meta.images.filter((img: any) => !img.alt).length;
      }

      // Load time
      if (page.page_timing?.time_to_interactive) {
        totalLoadTime += page.page_timing.time_to_interactive;
      }
    }

    // Count duplicates
    Array.from(titlesSeen.values()).forEach(count => {
      if (count > 1) duplicateTitles++;
    });
    Array.from(descriptionsSeen.values()).forEach(count => {
      if (count > 1) duplicateDescriptions++;
    });

    return {
      totalPages: pages.length,
      errors404,
      errors5xx,
      missingTitles,
      missingDescriptions,
      duplicateTitles,
      duplicateDescriptions,
      missingH1,
      missingAltText,
      avgLoadTime: pages.length > 0 ? Math.round(totalLoadTime / pages.length) : 0,
      mobileScore: summary?.checks?.mobile_friendly ? 100 : 50,
    };
  }

  private async runBacklinkAudit() {
    const summary = await this.dataForSEO.getBacklinkSummary(this.config.domain);
    const backlinks = await this.dataForSEO.getBacklinks(this.config.domain, 100);

    const toxicLinks = analyzeBacklinkToxicity(backlinks);

    return {
      totalBacklinks: summary.total_backlinks,
      referringDomains: summary.referring_domains,
      dofollowLinks: summary.dofollow,
      nofollowLinks: summary.nofollow,
      toxicLinks,
      avgDomainRank: this.calculateAvgRank(backlinks),
    };
  }

  private calculateAvgRank(backlinks: any[]): number {
    if (backlinks.length === 0) return 0;
    const totalRank = backlinks.reduce((sum, link) => sum + (link.rank || 0), 0);
    return Math.round(totalRank / backlinks.length);
  }

  private async generateAISummary(onPageData: any, backlinkData: any) {
    const prompt = `You are an SEO expert analyzing a website audit. Based on the following data, provide a structured analysis:

ON-PAGE DATA:
- Total Pages: ${onPageData.totalPages}
- 404 Errors: ${onPageData.errors404}
- 5xx Errors: ${onPageData.errors5xx}
- Missing Titles: ${onPageData.missingTitles}
- Missing Descriptions: ${onPageData.missingDescriptions}
- Duplicate Titles: ${onPageData.duplicateTitles}
- Duplicate Descriptions: ${onPageData.duplicateDescriptions}
- Missing H1: ${onPageData.missingH1}
- Missing Alt Text: ${onPageData.missingAltText}
- Avg Load Time: ${onPageData.avgLoadTime}ms
- Mobile Score: ${onPageData.mobileScore}

BACKLINK DATA:
- Total Backlinks: ${backlinkData.totalBacklinks}
- Referring Domains: ${backlinkData.referringDomains}
- Dofollow Links: ${backlinkData.dofollowLinks}
- Nofollow Links: ${backlinkData.nofollowLinks}
- Toxic Links: ${backlinkData.toxicLinks}
- Avg Domain Rank: ${backlinkData.avgDomainRank}

Provide your analysis in the following JSON format with 3-5 items per category:
{
  "critical": ["issue 1", "issue 2", ...],
  "warnings": ["warning 1", "warning 2", ...],
  "good": ["positive 1", "positive 2", ...]
}`;

    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are an SEO expert. Respond only with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'seo_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              critical: {
                type: 'array',
                items: { type: 'string' },
                description: 'Critical issues that need immediate attention',
              },
              warnings: {
                type: 'array',
                items: { type: 'string' },
                description: 'Warnings and opportunities for improvement',
              },
              good: {
                type: 'array',
                items: { type: 'string' },
                description: 'Positive signals and strengths',
              },
            },
            required: ['critical', 'warnings', 'good'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    return JSON.parse(contentStr || '{"critical":[],"warnings":[],"good":[]}');
  }

  private async waitForTask(taskId: string, timeout: number): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < timeout) {
      const status = await this.dataForSEO.getTaskStatus(taskId);
      if (status && status.status_code === 20000) {
        return; // Task completed
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Task timeout');
  }
}

