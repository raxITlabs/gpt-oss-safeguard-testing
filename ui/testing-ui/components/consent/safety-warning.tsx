import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SafetyWarning() {
  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">Content Warning</AlertTitle>
      <AlertDescription className="mt-2 text-sm leading-relaxed">
        This dashboard contains <strong>AI safety testing results</strong> that may include
        harmful prompts, offensive language, and sensitive content used for research and
        testing purposes. Access is restricted to authorized researchers and safety
        professionals who understand the nature of this content and commit to using it
        responsibly.
      </AlertDescription>
    </Alert>
  );
}
