import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GoogleFormTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoogleFormTriggerDialog({
  open,
  onOpenChange,
}: GoogleFormTriggerDialogProps) {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const webhookURL = `${baseURL}/api/webhooks/google-form?workflowId=${workflowId}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(webhookURL);
      toast.success("Webhook URL copied to clipboard");
    } catch (error) {
      toast.error(`Failed to copy webhook URL: ${(error as Error).message}`);
    }
  }, [webhookURL]);

  const copyScriptToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateGoogleFormScript(webhookURL));
      toast.success("Script copied to clipboard");
    } catch (error) {
      toast.error(`Failed to copy Script: ${(error as Error).message}`);
    }
  }, [webhookURL]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-4">
        <DialogHeader>
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form{"'"}s App Script to trigger
            this workflow when a form is submitted.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] h-full">
          <div className="space-y-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  value={webhookURL}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant={"outline"}
                  onClick={copyToClipboard}
                  type="button"
                >
                  <CopyIcon className="size-4" />
                </Button>
              </div>
            </div>
            <div className="bg-muted space-y-2 rounded-lg p-4">
              <h4 className="text-sm font-medium">Setup instructions:</h4>
              <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
                <li>Open your Google Form</li>
                <li>Click the three dots menu &rarr; Script editor</li>
                <li>Copy adn paste the script below</li>
                <li>Replace WEBHOOK_URL with your webhook URL above</li>
                <li>Save and click {'"Triggers"'} &rarr; Add Trigger </li>
                <li>Choose: From form &rarr; On form submit &rarr; Save</li>
              </ol>
            </div>
            <div className="bg-muted space-y-3 rounded-lg p-4">
              <h4 className="text-sm font-medium">Google Apps Script:</h4>
              <Button
                type="button"
                variant="outline"
                onClick={copyScriptToClipboard}
              >
                <CopyIcon className="size-4" />
                Copy Google Apps Script
              </Button>
              <p className="text-muted-foreground text-xs">
                This script includes your webhook URL and handles form
                submissions
              </p>
            </div>

            <div className="bg-muted space-y-3 rounded-lg p-4">
              <h4 className="text-sm font-medium">Available Variables</h4>
              <ul>
                <li>
                  <code className="bg-background rounded px-1 py-0.5">
                    {"{{googleForm.respondentEmail}}"}
                  </code>
                  - Respondent{"'"}s email
                </li>
                <li>
                  <code className="bg-background rounded px-1 py-0.5">
                    {"{{googleForm.reponses['Question Name']}}"}
                  </code>
                  - Specific answer
                </li>
                <li>
                  <code className="bg-background rounded px-1 py-0.5">
                    {"{{json GoogleForm.responses}}"}
                  </code>
                  - All responses as JSON
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
