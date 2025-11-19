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
import { useCredentialByType } from "@/features/credentials/hooks/use-credentials";
import { getCredentialLogo } from "@/lib/configs/credential-constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { ResendData, resendDataSchema } from "./schema";

interface OpenaiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResendData) => void;
  defaultValues: Partial<ResendData>;
}

export function ResendDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: OpenaiDialogProps) {
  const { data: credentials, isLoading: isCredentialsLoading } =
    useCredentialByType("RESEND");
  const logo = getCredentialLogo("RESEND");
  const form = useForm<ResendData>({
    resolver: zodResolver(resendDataSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      variableName: defaultValues.variableName || "",
      from: defaultValues.from || "",
      to: defaultValues.to || [{ email: "" }],
      subject: defaultValues.subject || "",
      content: defaultValues.content || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "to",
  });

  const addEmailField = useCallback(() => {
    append({ email: "" });
    console.log("Appended email field");
    console.log(fields);
  }, [append, fields]);

  const removeEmailField = useCallback(
    (index: number) => fields.length > 1 && remove(index),
    [fields.length, remove],
  );

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "myResend";

  const handleSubmit = useCallback(
    (data: ResendData) => {
      console.log("Form submitted with data:", data);
      onSubmit(data);
      onOpenChange(false);
    },
    [onSubmit, onOpenChange],
  );

  // Reset form values when dialog is opened
  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        variableName: defaultValues.variableName || "",
        from: defaultValues.from || "",
        to: defaultValues.to || [{ email: "" }],
        subject: defaultValues.subject || "",
        content: defaultValues.content || "",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-4">
        <DialogHeader>
          <DialogTitle>Resend Configuration</DialogTitle>
          <DialogDescription>
            Configure the Resend node to send emails using the Resend API.
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
                      <Input {...field} placeholder="myResend" />
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
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resend Credential</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          disabled={
                            isCredentialsLoading || !credentials?.length
                          }
                          className="w-full"
                        >
                          <SelectValue placeholder="Select a credential" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentials?.map((credential) => (
                          <SelectItem key={credential.id} value={credential.id}>
                            <div className="flex gap-2">
                              <Image
                                src={logo}
                                alt={credential.name}
                                width={16}
                                height={16}
                                className="object-contain"
                              />
                              {credential.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="bao <bao@mail.com>" />
                    </FormControl>
                    <FormDescription>
                      The email address to send from.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to"
                render={({}) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">
                        Recipient Emails
                      </FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addEmailField}
                      >
                        Add Email
                      </Button>
                    </div>
                    <FormControl>
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`to.${index}`}
                            render={({ field: emailField }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input
                                      type="email"
                                      placeholder={`recipient${index + 1}@example.com`}
                                      value={emailField.value.email}
                                      onChange={(e) =>
                                        emailField.onChange({
                                          email: e.target.value,
                                        })
                                      }
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeEmailField(index)}
                                      disabled={fields.length === 1}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      The recipient email addresses. Separate multiple emails
                      with commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="myResend" />
                    </FormControl>
                    <FormDescription>
                      The subject of the email. Use {"{{variables}}"} for simple
                      values or {"{{json variable}}"} to stringify objects
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
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px] font-mono text-sm"
                        placeholder={"Email: {{json httpResponse.data}}"}
                      />
                    </FormControl>
                    <FormDescription>
                      The content to send to the email. Use {"{{variables}}"}{" "}
                      for simple values or {"{{json variable}}"} to stringify
                      objects.
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
