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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CronJobData, cronJobDataSchema } from "./schema";

interface CronJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CronJobData) => void;
  defaultValues: Partial<CronJobData>;
}

export function CronJobDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: CronJobDialogProps) {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const form = useForm<CronJobData>({
    resolver: zodResolver(cronJobDataSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      cronExpression: defaultValues.cronExpression || "* * * * *",
      timezone: defaultValues.timezone || "UTC",
    },
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "myCronJob";

  const handleSubmit = useCallback(
    (data: CronJobData) => {
      onSubmit(data);
      onOpenChange(false);
    },
    [onSubmit, onOpenChange],
  );

  // Reset form values when dialog is opened
  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        cronExpression: defaultValues.cronExpression || "* * * * *",
        timezone: defaultValues.timezone || "UTC",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-4">
        <DialogHeader>
          <DialogTitle>Cron Job Schedule</DialogTitle>
          <DialogDescription>
            Configure the schedule for this trigger node
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh] w-full">
          <Form {...form}>
            <form
              className="mt-4 space-y-8 pr-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="variableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="myCronJob" />
                    </FormControl>
                    <FormDescription>
                      Reference this trigger in other nodes:{" "}
                      {`{{${watchVariableName}.triggerTime}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cronExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cron Expression</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="* * * * *" />
                    </FormControl>
                    <FormDescription>
                      Format: Minute Hour Day Month DayOfWeek (e.g.{" "}
                      {"0 9 * * 1"}
                      for every Monday at 9am)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Asia/Shanghai">
                          Asia/Shanghai
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          America/New_York
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Europe/London
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The timezone to use for the schedule
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button onClick={form.handleSubmit(handleSubmit)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
