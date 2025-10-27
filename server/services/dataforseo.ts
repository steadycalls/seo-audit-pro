/**
 * DataForSEO API Integration Service
 * Handles all interactions with the DataForSEO API
 */

interface DataForSEOCredentials {
  login: string;
  password: string;
}

interface OnPageTask {
  id: string;
  status_code: number;
  status_message: string;
}

interface BacklinkSummary {
  total_backlinks: number;
  referring_domains: number;
  dofollow: number;
  nofollow: number;
}

export class DataForSEOService {
  private credentials: DataForSEOCredentials;
  private baseUrl = 'https://api.dataforseo.com/v3';

  constructor(credentials: DataForSEOCredentials) {
    this.credentials = credentials;
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const auth = Buffer.from(`${this.credentials.login}:${this.credentials.password}`).toString('base64');
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Phase 1: On-Page & Technical Audit
   */
  async startOnPageCrawl(domain: string): Promise<string> {
    const payload = [{
      target: domain,
      max_crawl_pages: 100,
      load_resources: true,
      enable_javascript: true,
      custom_js: null,
    }];

    const response = await this.makeRequest('/on_page/task_post', 'POST', payload);
    
    if (response.tasks && response.tasks[0] && response.tasks[0].id) {
      return response.tasks[0].id;
    }
    
    throw new Error('Failed to start on-page crawl');
  }

  async getOnPageSummary(taskId: string) {
    const response = await this.makeRequest(`/on_page/summary/${taskId}`);
    return response.tasks?.[0]?.result?.[0] || null;
  }

  async getOnPagePages(taskId: string) {
    const response = await this.makeRequest(`/on_page/pages/${taskId}`);
    return response.tasks?.[0]?.result || [];
  }

  /**
   * Phase 2: Backlink Analysis
   */
  async getBacklinkSummary(domain: string): Promise<BacklinkSummary> {
    const payload = [{
      target: domain,
      internal_list_limit: 10,
      backlinks_status_type: 'live',
    }];

    const response = await this.makeRequest('/backlinks/summary/live', 'POST', payload);
    const result = response.tasks?.[0]?.result?.[0];

    return {
      total_backlinks: result?.backlinks || 0,
      referring_domains: result?.referring_domains || 0,
      dofollow: result?.dofollow || 0,
      nofollow: result?.nofollow || 0,
    };
  }

  async getReferringDomains(domain: string) {
    const payload = [{
      target: domain,
      limit: 100,
    }];

    const response = await this.makeRequest('/backlinks/referring_domains/live', 'POST', payload);
    return response.tasks?.[0]?.result || [];
  }

  async getBacklinks(domain: string, limit: number = 100) {
    const payload = [{
      target: domain,
      limit,
      backlinks_status_type: 'live',
    }];

    const response = await this.makeRequest('/backlinks/backlinks/live', 'POST', payload);
    return response.tasks?.[0]?.result || [];
  }

  /**
   * Phase 3: Keyword Rankings (if keywords provided)
   */
  async checkKeywordRankings(domain: string, keywords: string[], location: string = 'United States') {
    // This would use the SERP API or Rank Tracker API
    // For now, returning a placeholder structure
    return {
      keywords: keywords.map(kw => ({
        keyword: kw,
        position: null,
        url: null,
      })),
    };
  }

  /**
   * Utility: Check task status
   */
  async getTaskStatus(taskId: string) {
    const response = await this.makeRequest(`/on_page/tasks_ready`);
    const tasks = response.tasks?.[0]?.result || [];
    return tasks.find((t: any) => t.id === taskId);
  }
}

/**
 * Analyze backlinks for toxicity based on simple heuristics
 */
export function analyzeBacklinkToxicity(backlinks: any[]): number {
  let toxicCount = 0;

  for (const link of backlinks) {
    const rank = link.rank || 0;
    const anchorText = (link.anchor || '').toLowerCase();
    const domain = (link.domain_from || '').toLowerCase();

    // Simple toxicity rules
    if (rank < 10) toxicCount++;
    if (anchorText.includes('viagra') || anchorText.includes('casino') || anchorText.includes('porn')) {
      toxicCount++;
    }
    if (domain.endsWith('.xyz') || domain.endsWith('.info')) {
      toxicCount++;
    }
  }

  return toxicCount;
}

