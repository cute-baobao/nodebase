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
import { Textarea } from "@/components/ui/textarea";
import { DEEPSEEK_AVAILABLE_MODELS } from "@/lib/configs/ai-constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { DeepseekData, deepseekDataSchema } from "./schema";

interface DeepseekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DeepseekData) => void;
  defaultValues: Partial<DeepseekData>;
}

export function DeepseekDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: DeepseekDialogProps) {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const form = useForm<DeepseekData>({
    resolver: zodResolver(deepseekDataSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      model: defaultValues.model || DEEPSEEK_AVAILABLE_MODELS[0],
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
    },
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "myDeepseek";

  const handleSubmit = useCallback(
    (data: DeepseekData) => {
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
        model: defaultValues.model || DEEPSEEK_AVAILABLE_MODELS[0],
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-4">
        <DialogHeader>
          <DialogTitle>Deepseek Configuration</DialogTitle>
          <DialogDescription>
            Configure the AI model and prompts for this node.
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
                      <Input {...field} placeholder="myDeepseek" />
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
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEEPSEEK_AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The AI model to use for the request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[80px] font-mono text-sm"
                        placeholder={"You are a helpful assistant that..."}
                      />
                    </FormControl>
                    <FormDescription>
                      Sets the behavior of the assistant. Use {"{{variables}}"}{" "}
                      for simple values or {"{{json variable}}"} to stringify
                      objects.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px] font-mono text-sm"
                        placeholder={
                          "Summarize the text: {{json httpResponse.data}}"
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      The prompt to send to the AI. Use {"{{variables}}"} for
                      simple values or {"{{json variable}}"} to stringify
                      objects.
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
