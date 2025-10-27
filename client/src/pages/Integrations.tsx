import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Trash2, Plus, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Integrations() {
  const [showForm, setShowForm] = useState(false);
  const [apiLogin, setApiLogin] = useState("");
  const [apiPassword, setApiPassword] = useState("");

  const { data: integrations, isLoading } = trpc.integrations.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.integrations.create.useMutation({
    onSuccess: () => {
      toast.success("DataForSEO integration added successfully");
      utils.integrations.list.invalidate();
      setShowForm(false);
      setApiLogin("");
      setApiPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add integration");
    },
  });

  const deleteMutation = trpc.integrations.delete.useMutation({
    onSuccess: () => {
      toast.success("Integration removed");
      utils.integrations.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove integration");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiLogin || !apiPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    createMutation.mutate({
      provider: "dataforseo",
      apiLogin,
      apiPassword,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your API credentials and third-party integrations
          </p>
        </div>

        {/* DataForSEO Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>DataForSEO API</CardTitle>
                <CardDescription>
                  Required for running SEO audits. Get your credentials at{" "}
                  <a
                    href="https://app.dataforseo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    app.dataforseo.com
                  </a>
                </CardDescription>
              </div>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credentials
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-accent/50">
                <div className="space-y-2">
                  <Label htmlFor="apiLogin">API Login (Email)</Label>
                  <Input
                    id="apiLogin"
                    type="text"
                    value={apiLogin}
                    onChange={(e) => setApiLogin(e.target.value)}
                    placeholder="your-email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiPassword">API Password</Label>
                  <Input
                    id="apiPassword"
                    type="password"
                    value={apiPassword}
                    onChange={(e) => setApiPassword(e.target.value)}
                    placeholder="Your API password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Integration"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setApiLogin("");
                      setApiPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : integrations && integrations.length > 0 ? (
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{integration.apiLogin}</p>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(integration.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: integration.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No integrations configured yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">
              About DataForSEO Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600 dark:text-blue-300 space-y-2">
            <p>
              Each audit consumes DataForSEO API credits based on the size of your website and the
              depth of analysis.
            </p>
            <p>
              <strong>Estimated usage for a 100-page site with 100 backlinks:</strong> ~485 Manus
              credits (approximately $0.50-$1.00 in DataForSEO API costs)
            </p>
            <p>
              Make sure your DataForSEO account has sufficient balance before running audits.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

