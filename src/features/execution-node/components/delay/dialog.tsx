import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DelayData, delayDataSchema } from "./schema";

interface DelayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DelayData) => void;
  defaultValues: Partial<DelayData>;
}

export function DelayDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: DelayDialogProps) {
  const form = useForm<DelayData>({
    resolver: zodResolver(delayDataSchema),
    defaultValues: {
      duration: defaultValues.duration || 1000,
    },
  });

  const handleSubmit = useCallback(
    (data: DelayData) => {
      onSubmit(data);
      onOpenChange(false);
    },
    [onSubmit, onOpenChange],
  );

  // Reset form values when dialog is opened
  useEffect(() => {
    if (open) {
      form.reset({
        duration: defaultValues.duration || 1000,
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-4">
        <DialogHeader>
          <DialogTitle>Delay Configuration</DialogTitle>
          <DialogDescription>
            Configure the delay duration in milliseconds. The workflow will
            pause for the specified time before continuing to the next node.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mt-4 space-y-8 pr-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (milliseconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="86400000"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the delay duration in milliseconds. For example: 1000
                    = 1 second, 60000 = 1 minute. Maximum: 86400000 ms (24
                    hours).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="mt-4">
          <Button onClick={form.handleSubmit(handleSubmit)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
