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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { DiscordData, discordDataSchema } from "./schema";

interface DiscordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DiscordData) => void;
  defaultValues: Partial<DiscordData>;
}

export function DiscordDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: DiscordDialogProps) {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const form = useForm<DiscordData>({
    resolver: zodResolver(discordDataSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      webhookUrl: defaultValues.webhookUrl || "",
      content: defaultValues.content || "",
      username: defaultValues.username || "",
    },
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "myDiscord";

  const handleSubmit = useCallback(
    (data: DiscordData) => {
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
        webhookUrl: defaultValues.webhookUrl || "",
        content: defaultValues.content || "",
        username: defaultValues.username || "",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-4">
        <DialogHeader>
          <DialogTitle>Discord Configuration</DialogTitle>
          <DialogDescription>
            Configure the Discord webhook settings for this node.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh]">
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
                      <Input {...field} placeholder="myDiscord" />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the result in other node:{" "}
                      {`{{${watchVariableName}.aiResponse.text}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://discord.com/api/webhooks/..."
                      />
                    </FormControl>
                    <FormDescription>
                      Get this from Discord: Channel Setting &rarr; Integrations
                      &rarr; Webhooks
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[80px] font-mono text-sm"
                        placeholder={"Hello from Nodebase! {{variable}}"}
                      />
                    </FormControl>
                    <FormDescription>
                      The message to send. Use {"{{variables}}"} for simple
                      values or {"{{json variable}}"} to stringify objects.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Username (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bot Username" />
                    </FormControl>
                    <FormDescription>
                      Overwrite the default bot username.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button
                ref={submitButtonRef}
                type="submit"
                style={{ display: "none" }}
                aria-hidden="true"
              ></button>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button onClick={() => submitButtonRef.current?.click()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
