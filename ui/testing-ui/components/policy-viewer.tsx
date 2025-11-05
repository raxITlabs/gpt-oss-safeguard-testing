import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Target, AlertCircle } from "lucide-react";
import { parsePolicy, getPolicyCategory, getSeverityLevel, type PolicyInfo } from "@/lib/policy-utils";

interface PolicyViewerProps {
  policyText: string;
  className?: string;
}

export function PolicyViewer({ policyText, className }: PolicyViewerProps) {
  const policy: PolicyInfo = parsePolicy(policyText);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {policy.title}
        </CardTitle>
        {policy.goal && (
          <CardDescription className="flex items-center gap-2 mt-2">
            <Target className="h-4 w-4" />
            <span>{policy.goal}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {policy.sections.length > 0 ? (
              policy.sections.map((section, idx) => {
                const severity = getSeverityLevel(section.code);

                return (
                  <div key={idx} className="border-l-4 border-muted pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={section.level.endsWith('0') ? "secondary" : "default"}
                        className="font-mono"
                      >
                        {section.code}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {severity.label}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2 whitespace-pre-wrap">{section.description}</p>
                    {section.examples && section.examples.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground font-semibold">Examples:</p>
                        {section.examples.map((example, exIdx) => (
                          <div
                            key={exIdx}
                            className="text-xs bg-muted/50 p-2 rounded italic"
                          >
                            "{example}"
                          </div>
                        ))}
                      </div>
                    )}
                    {idx < policy.sections.length - 1 && <Separator className="mt-4" />}
                  </div>
                );
              })
            ) : (
              // Fallback: Display raw policy if parsing failed
              <div>
                <div className="flex items-center gap-2 mb-4 text-[color:var(--status-warning)]">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Displaying raw policy (parsing unavailable)</span>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-xs whitespace-pre-wrap font-mono">{policyText}</pre>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
