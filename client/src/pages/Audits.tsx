import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileSearch, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Audits() {
  const { data: audits, isLoading } = trpc.audits.list.useQuery();
  const { data: integrations } = trpc.integrations.list.useQuery();

  const hasDataForSEO = integrations?.some(i => i.provider === 'dataforseo' && i.isActive === 1);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SEO Audits</h1>
            <p className="text-muted-foreground mt-2">
              View and manage all your website audits
            </p>
          </div>
          <Link href="/audits/new">
            <Button size="lg" disabled={!hasDataForSEO}>
              <Plus className="h-4 w-4 mr-2" />
              New Audit
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Audits</CardTitle>
            <CardDescription>Complete history of your SEO audit reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading audits...</div>
            ) : audits && audits.length > 0 ? (
              <div className="space-y-3">
                {audits.map((audit) => (
                  <Link key={audit.id} href={`/audits/${audit.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{audit.domain}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(audit.createdAt).toLocaleDateString()} at{" "}
                            {new Date(audit.createdAt).toLocaleTimeString()}
                          </p>
                          {audit.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              Completed: {new Date(audit.completedAt).toLocaleDateString()} at{" "}
                              {new Date(audit.completedAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
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
                          <span className="text-sm text-muted-foreground font-medium">
                            {audit.creditsUsed} credits
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileSearch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No audits yet</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by running your first SEO audit
                </p>
                {hasDataForSEO ? (
                  <Link href="/audits/new">
                    <Button>Create Your First Audit</Button>
                  </Link>
                ) : (
                  <Link href="/integrations">
                    <Button>Configure DataForSEO Integration</Button>
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

