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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

const httpRequestFormSchema = z.object({
  endPoint: z.url({ message: "Please enter a valid URL" }),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  body: z.string().optional(),
});

export type HttpRequestForm = z.infer<typeof httpRequestFormSchema>;

interface HttpRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof httpRequestFormSchema>) => void;
  defaultEndPoint?: string;
  defaultMethod?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  defaultBody?: string;
}

export function HttpRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultEndPoint = "",
  defaultMethod = "GET",
  defaultBody = "",
}: HttpRequestDialogProps) {
  const form = useForm<HttpRequestForm>({
    resolver: zodResolver(httpRequestFormSchema),
    defaultValues: {
      endPoint: defaultEndPoint,
      method: defaultMethod,
      body: defaultBody,
    },
  });

  const watchMethod = useWatch({control: form.control, name: "method"});
  const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod);

  const handleSubmit = useCallback(
    (data: HttpRequestForm) => {
      onSubmit(data);
      onOpenChange(false);
    },
    [onSubmit, onOpenChange],
  );

  // Reset form values when dialog is opened
  useEffect(() => {
    if (open) {
      form.reset({
        endPoint: defaultEndPoint,
        method: defaultMethod,
        body: defaultBody,
      });
    }
  }, [open, defaultEndPoint, defaultMethod, defaultBody, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Http Request</DialogTitle>
          <DialogDescription>
            Configure settings for the HTTP request node
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mt-4 space-y-8"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The HTTP method to use for the request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://api.example.com/users/{{httpResponse.data.id}}"
                    />
                  </FormControl>
                  <FormDescription>
                    Static URL or use {"{{variables}}"} for simple values or{" "}
                    {"{{json variable}}"} to stringify objects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showBodyField && (
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px] font-mono text-sm"
                        placeholder={
                          '{\n "userId":"{{httpResponse.data.id}}",\n "name":"{{httpResponse.data.name}}",\n "items":{{httpResponse.data.items}}\n}'
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      JSON with template variables. Use {"{{variables}}"} for
                      simple values, or{"{{json variable}}"} to stringify
                      objects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
