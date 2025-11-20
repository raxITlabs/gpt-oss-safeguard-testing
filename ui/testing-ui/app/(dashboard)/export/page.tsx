"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileJson, FileText, Loader2, AlertCircle } from "lucide-react";
import { getTestData } from "@/actions/get-test-data";
import { extractPolicy, parsePolicy, type PolicyInfo } from "@/lib/policy-utils";
import { PolicyViewer } from "@/components/policy-viewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryPolicy {
    category: string;
    policyText: string;
    policyInfo: PolicyInfo;
}

export default function ExportPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [policies, setPolicies] = useState<CategoryPolicy[]>([]);

    useEffect(() => {
        async function fetchPolicies() {
            try {
                setLoading(true);
                const data = await getTestData();

                const uniquePolicies = new Map<string, string>();

                // Extract unique policies per category
                data.inferences.forEach(inference => {
                    if (inference.category && !uniquePolicies.has(inference.category)) {
                        const policyText = extractPolicy(inference);
                        if (policyText) {
                            uniquePolicies.set(inference.category, policyText);
                        }
                    }
                });

                const processedPolicies: CategoryPolicy[] = Array.from(uniquePolicies.entries()).map(([category, policyText]) => ({
                    category,
                    policyText,
                    policyInfo: parsePolicy(policyText)
                })).sort((a, b) => a.category.localeCompare(b.category));

                setPolicies(processedPolicies);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load policies");
            } finally {
                setLoading(false);
            }
        }

        fetchPolicies();
    }, []);

    const handleDownloadMarkdown = (policy: CategoryPolicy) => {
        const blob = new Blob([policy.policyText], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${policy.category.toLowerCase().replace(/\s+/g, '-')}-policy.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportAll = async () => {
        try {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            const folder = zip.folder("policies");

            if (!folder) return;

            policies.forEach((policy) => {
                const filename = `${policy.category.toLowerCase().replace(/\s+/g, '-')}-policy.md`;
                folder.file(filename, policy.policyText);
            });

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = `policies-export-${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to generate zip:", err);
            setError("Failed to generate export file");
        }
    };

    if (loading) {
        return (
            <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
                <PageHeader
                    title="Export Policies"
                    description="View and export safety policies for all categories"
                />
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
                <PageHeader
                    title="Export Policies"
                    description="View and export safety policies for all categories"
                />
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </main>
        );
    }

    return (
        <main className="flex-1 px-4 py-6 space-y-6 lg:px-6">
            <PageHeader
                title="Export Policies"
                description="View and export safety policies for all categories"
                actions={
                    <Button onClick={handleExportAll} disabled={policies.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export All (ZIP)
                    </Button>
                }
            />

            {policies.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Policies Found</h3>
                        <p className="text-muted-foreground">
                            Run tests to generate policy data.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {policies.map((policy) => (
                        <Card key={policy.category} className="overflow-hidden">
                            <CardHeader className="bg-muted/50">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            {policy.category}
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {policy.policyInfo.code}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>{policy.policyInfo.title}</CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownloadMarkdown(policy)}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Markdown
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="border-t">
                                    <PolicyViewer
                                        policyText={policy.policyText}
                                        className="border-0 shadow-none rounded-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
    );
}
