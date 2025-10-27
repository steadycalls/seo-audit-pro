import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, Loader2, TrendingUp, XCircle, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "wouter";

export default function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const auditId = parseInt(id || "0");

  const { data: audit, refetch } = trpc.audits.getById.useQuery({ id: auditId });
  const { data: report } = trpc.audits.getReport.useQuery(
    { auditId },
    { enabled: audit?.status === 'completed' }
  );

  // Auto-refresh while running
  useEffect(() => {
    if (audit?.status === 'running' || audit?.status === 'pending') {
      const interval = setInterval(() => {
        refetch();
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [audit?.status, refetch]);

  if (!audit) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading audit...</p>
        </div>
      </DashboardLayout>
    );
  }

  const criticalIssues = report?.criticalIssues ? JSON.parse(report.criticalIssues) : [];
  const warnings = report?.warnings ? JSON.parse(report.warnings) : [];
  const goodSignals = report?.goodSignals ? JSON.parse(report.goodSignals) : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link href="/audits">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Audits
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{audit.domain}</h1>
              <p className="text-muted-foreground mt-2">
                Audit started on {new Date(audit.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                audit.status === 'completed'
                  ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                  : audit.status === 'running'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                  : audit.status === 'failed'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {audit.status}
            </span>
          </div>
        </div>

        {/* Running State */}
        {(audit.status === 'running' || audit.status === 'pending') && (
          <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                Audit in Progress
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-300">
                Your SEO audit is currently running. This typically takes 2-5 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={33} className="h-2" />
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                Analyzing on-page elements, backlinks, and generating AI insights...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {audit.status === 'failed' && (
          <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                Audit Failed
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                The audit encountered an error. Please try again or contact support if the issue persists.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Completed State - Results */}
        {audit.status === 'completed' && report && (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalPages}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Backlinks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.totalBacklinks}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {report.referringDomains} domains
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Load Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.avgLoadTime}ms</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Credits Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{audit.creditsUsed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues */}
            {criticalIssues.length > 0 && (
              <Card className="border-red-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Issues ({criticalIssues.length})
                  </CardTitle>
                  <CardDescription>Issues that require immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {criticalIssues.map((issue: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <Card className="border-orange-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <TrendingUp className="h-5 w-5" />
                    Warnings & Opportunities ({warnings.length})
                  </CardTitle>
                  <CardDescription>Areas for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {warnings.map((warning: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Good Signals */}
            {goodSignals.length > 0 && (
              <Card className="border-green-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Good Signals ({goodSignals.length})
                  </CardTitle>
                  <CardDescription>Positive aspects of your SEO</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {goodSignals.map((signal: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
                <CardDescription>Detailed metrics from the audit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">On-Page Metrics</h4>
                    <div className="text-sm space-y-1">
                      <p>404 Errors: <span className="font-medium">{report.errors404}</span></p>
                      <p>5xx Errors: <span className="font-medium">{report.errors5xx}</span></p>
                      <p>Missing Titles: <span className="font-medium">{report.missingTitles}</span></p>
                      <p>Missing Descriptions: <span className="font-medium">{report.missingDescriptions}</span></p>
                      <p>Duplicate Titles: <span className="font-medium">{report.duplicateTitles}</span></p>
                      <p>Missing H1: <span className="font-medium">{report.missingH1}</span></p>
                      <p>Missing Alt Text: <span className="font-medium">{report.missingAltText}</span></p>
                      <p>Mobile Score: <span className="font-medium">{report.mobileScore}/100</span></p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Backlink Metrics</h4>
                    <div className="text-sm space-y-1">
                      <p>Total Backlinks: <span className="font-medium">{report.totalBacklinks}</span></p>
                      <p>Referring Domains: <span className="font-medium">{report.referringDomains}</span></p>
                      <p>Dofollow Links: <span className="font-medium">{report.dofollowLinks}</span></p>
                      <p>Nofollow Links: <span className="font-medium">{report.nofollowLinks}</span></p>
                      <p>Toxic Links: <span className="font-medium">{report.toxicLinks}</span></p>
                      <p>Avg Domain Rank: <span className="font-medium">{report.avgDomainRank}</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

