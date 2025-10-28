import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ManualTirggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualTirggerDialog({
  open,
  onOpenChange,
}: ManualTirggerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Tirgger</DialogTitle>
          <DialogDescription>
            Configure settings for the manual trigger node
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-xs">Manual Trigger</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
