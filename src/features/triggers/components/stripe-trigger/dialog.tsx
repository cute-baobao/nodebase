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

interface StripeTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StripeTriggerDialog({
  open,
  onOpenChange,
}: StripeTriggerDialogProps) {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const baseURL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const webhookURL = `${baseURL}/api/webhooks/stripe?workflowId=${workflowId}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(webhookURL);
      toast.success("Webhook URL copied to clipboard");
    } catch (error) {
      toast.error(`Failed to copy webhook URL: ${(error as Error).message}`);
    }
  }, [webhookURL]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Stripe Dashboard to trigger this
            workflow on payment events.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
              <li>Open your Stripe Dashboard</li>
              <li>Go to Developers &rarr; Webhooks</li>
              <li>Click {'"Add endpoint"'}</li>
              <li>Paste the webhook URL above</li>
              <li>
                Select events to listen for (e.g., payment_intent.succeeded)
              </li>
              <li>Save and copy the signing secret</li>
            </ol>
          </div>

          <div className="bg-muted space-y-3 rounded-lg p-4">
            <h4 className="text-sm font-medium">Available Variables</h4>
            <ul>
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{stripe.amount}}"}
                </code>
                - Payment amount
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{stripe.currency}}"}
                </code>
                - Currency code
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{stripe.customerId}}"}
                </code>
                - Customer ID
              </li>
              <li>
                <code className="bg-background rounded px-1 py-0.5">
                  {"{{JSON stripe}}"}
                </code>
                - Full event data as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
