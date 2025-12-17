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
import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { XCreatePostData, xCreatePostDataSchema } from "./schema";

interface XCreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: XCreatePostData) => void;
  defaultValues: Partial<XCreatePostData>;
}

export function XCreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: XCreatePostDialogProps) {
  // const { data: credentials, isLoading: isCredentialsLoading } =
  //   useCredentialByType("X_API");
  // const logo = getCredentialLogo("X_API");
  const form = useForm<XCreatePostData>({
    resolver: zodResolver(xCreatePostDataSchema),
    defaultValues: {
      // credentialId: defaultValues.credentialId || "",
      variableName: defaultValues.variableName || "",
      text: defaultValues.text || "",
      in_reply_to_tweet_id: defaultValues.in_reply_to_tweet_id || "",
    },
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "xPost";

  const watchText = useWatch({
    control: form.control,
    name: "text",
  });

  const handleSubmit = useCallback(
    (data: XCreatePostData) => {
      onSubmit(data);
      onOpenChange(false);
    },
    [onSubmit, onOpenChange],
  );

  // Reset form values when dialog is opened
  useEffect(() => {
    if (open) {
      form.reset({
        // credentialId: defaultValues.credentialId || "",
        variableName: defaultValues.variableName || "",
        text: defaultValues.text || "",
        in_reply_to_tweet_id: defaultValues.in_reply_to_tweet_id || "",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-4">
        <DialogHeader>
          <DialogTitle>X Create Post Configuration</DialogTitle>
          <DialogDescription>
            Configure the X node to create a post using the X API.
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
                      <Input {...field} placeholder="xPost" />
                    </FormControl>
                    <FormDescription>
                      Use this name to reference the result in other node:{" "}
                      {`{{${watchVariableName}.data}}`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X API Credential</FormLabel>
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
              /> */}
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px] font-mono text-sm"
                        placeholder="Enter your post content (supports template variables like {{triggerData.message}})"
                      />
                    </FormControl>
                    <FormDescription>
                      The content to post on X. Use {"{{variables}}"} for simple
                      values or {"{{json variable}}"} to stringify objects.
                      Character count: {watchText?.length || 0}/300
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="in_reply_to_tweet_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>In Reply To Tweet ID (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      If provided, the post will be a reply to the tweet with
                      this ID.
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
