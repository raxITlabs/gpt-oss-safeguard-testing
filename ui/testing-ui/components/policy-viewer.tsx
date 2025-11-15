import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Target, AlertCircle } from "lucide-react";
import { parsePolicy, getPolicyCategory, getSeverityLevel, type PolicyInfo } from "@/lib/policy-utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PolicyViewerProps {
  policyText: string;
  className?: string;
}

export function PolicyViewer({ policyText, className }: PolicyViewerProps) {
  const policy: PolicyInfo = parsePolicy(policyText);

  // Preprocess markdown to convert equals-based headers
  const preprocessMarkdown = (text: string) => {
    return text
      // Convert "====== TEXT ======" to "## TEXT"
      .replace(/^[=]{3,}\s*(.+?)\s*[=]{3,}$/gm, '## $1')
      // Convert "====== TEXT" (no trailing equals) to "## TEXT"
      .replace(/^[=]{3,}\s*(.+?)$/gm, '## $1')
      // Convert lines that are just equals signs to subtle dividers
      .replace(/^[=]{3,}$/gm, '---');
  };

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
        <ScrollArea className="h-[400px] w-full" aria-label="Policy content">
          <article role="article" className="space-y-4">
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
                    <div className="text-sm mb-2 prose prose-sm dark:prose-invert max-w-none
                      prose-headings:font-semibold prose-headings:tracking-tight prose-headings:mb-2 prose-headings:mt-4
                      prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:my-2
                      prose-ul:my-2 prose-li:my-0.5
                      prose-code:text-xs prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-hr:my-4 prose-hr:border-t prose-hr:border-border/50">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h3 className="text-base font-bold text-foreground mb-2" {...props} />,
                          h2: ({node, ...props}) => <h4 className="text-sm font-semibold text-foreground mb-2" {...props} />,
                          h3: ({node, ...props}) => <h5 className="text-sm font-semibold text-foreground mb-1" {...props} />,
                          hr: ({node, ...props}) => <div className="my-4 border-t border-border/30" {...props} />,
                          p: ({node, ...props}) => <p className="my-1 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="my-2 space-y-0.5" {...props} />,
                          li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                        }}
                      >
                        {preprocessMarkdown(section.description)}
                      </Markdown>
                    </div>
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
                <div className="flex items-center gap-2 mb-4 text-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Displaying policy as markdown</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none
                  prose-headings:font-semibold prose-headings:tracking-tight prose-headings:mb-3 prose-headings:mt-6
                  prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:my-2
                  prose-ul:my-2 prose-li:my-0.5
                  prose-code:text-xs prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-hr:my-6 prose-hr:border-t prose-hr:border-border/50">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h2 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h3 className="text-lg font-semibold text-foreground mb-3" {...props} />,
                      h3: ({node, ...props}) => <h4 className="text-base font-semibold text-foreground mb-2" {...props} />,
                      hr: ({node, ...props}) => <div className="my-6 border-t border-border/30" {...props} />,
                      p: ({node, ...props}) => <p className="my-2 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="my-3 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                    }}
                  >
                    {preprocessMarkdown(policyText)}
                  </Markdown>
                </div>
              </div>
            )}
          </article>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
