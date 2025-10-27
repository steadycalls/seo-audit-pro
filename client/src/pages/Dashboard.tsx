import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileSearch, TrendingUp, AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { data: audits, isLoading } = trpc.audits.list.useQuery();
  const { data: integrations } = trpc.integrations.list.useQuery();

  const hasDataForSEO = integrations?.some(i => i.provider === 'dataforseo' && i.isActive === 1);
  const completedAudits = audits?.filter(a => a.status === 'completed') || [];
  const runningAudits = audits?.filter(a => a.status === 'running') || [];
  const failedAudits = audits?.filter(a => a.status === 'failed') || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SEO Audit Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive SEO analysis powered by DataForSEO
            </p>
          </div>
          <Link href="/audits/new">
            <Button size="lg" disabled={!hasDataForSEO}>
              <Plus className="h-4 w-4 mr-2" />
              New Audit
            </Button>
          </Link>
        </div>

        {/* Integration Warning */}
        {!hasDataForSEO && (
          <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                DataForSEO Integration Required
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-300">
                To run SEO audits, you need to configure your DataForSEO API credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/integrations">
                <Button variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-950">
                  Configure Integration
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
              <FileSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{audits?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAudits.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{runningAudits.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{failedAudits.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Audits */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audits</CardTitle>
            <CardDescription>Your latest SEO audit reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : audits && audits.length > 0 ? (
              <div className="space-y-4">
                {audits.slice(0, 5).map((audit) => (
                  <Link key={audit.id} href={`/audits/${audit.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium">{audit.domain}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(audit.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                        {audit.creditsUsed > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {audit.creditsUsed} credits
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No audits yet</p>
                {hasDataForSEO && (
                  <Link href="/audits/new">
                    <Button>Create Your First Audit</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

