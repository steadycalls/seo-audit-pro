import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function NewAudit() {
  const [, setLocation] = useLocation();
  const [domain, setDomain] = useState("");

  const createMutation = trpc.audits.create.useMutation({
    onSuccess: (data) => {
      toast.success("Audit started successfully!");
      setLocation(`/audits/${data.auditId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start audit");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain) {
      toast.error("Please enter a domain");
      return;
    }

    // Clean up domain input
    let cleanDomain = domain.trim();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, ''); // Remove protocol
    cleanDomain = cleanDomain.replace(/\/$/, ''); // Remove trailing slash

    if (!cleanDomain) {
      toast.error("Please enter a valid domain");
      return;
    }

    createMutation.mutate({ domain: cleanDomain });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New SEO Audit</h1>
          <p className="text-muted-foreground mt-2">
            Enter a domain to start a comprehensive SEO analysis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Domain Information</CardTitle>
            <CardDescription>
              Enter the website domain you want to audit (without http:// or https://)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="domain">Website Domain</Label>
                <Input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  disabled={createMutation.isPending}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Example: example.com or subdomain.example.com
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Audit...
                  </>
                ) : (
                  "Start SEO Audit"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">
              What This Audit Includes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600 dark:text-blue-300 space-y-3">
            <div>
              <strong>Phase 1: On-Page & Technical Analysis</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Full site crawl (up to 100 pages)</li>
                <li>HTTP status code analysis (404s, 5xx errors)</li>
                <li>Meta tags audit (titles, descriptions, H1s)</li>
                <li>Duplicate content detection</li>
                <li>Image optimization (missing alt text)</li>
                <li>Page speed and Core Web Vitals</li>
                <li>Mobile-friendliness check</li>
              </ul>
            </div>

            <div>
              <strong>Phase 2: Off-Page & Authority Analysis</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Backlink profile summary</li>
                <li>Referring domains analysis</li>
                <li>Dofollow vs. Nofollow ratio</li>
                <li>Toxic link detection</li>
                <li>Domain authority metrics</li>
              </ul>
            </div>

            <div>
              <strong>Phase 3: AI-Powered Summary</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Critical issues requiring immediate attention</li>
                <li>Warnings and improvement opportunities</li>
                <li>Positive signals and strengths</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
              <strong>Estimated Time:</strong> 2-5 minutes<br />
              <strong>Estimated Credits:</strong> ~485 Manus credits
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

