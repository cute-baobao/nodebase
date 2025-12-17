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
import { NodeTypeValues } from "@/db";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { XGetTweetData, xGetTweetDataSchema } from "./schema";

interface XGetTweetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: XGetTweetData) => void;
  defaultValues: Partial<XGetTweetData>;
}

export function XGetTweetDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: XGetTweetDialogProps) {
  // const { data: credentials, isLoading: isCredentialsLoading } =
  //   useCredentialByType("X_API");
  // const logo = getCredentialLogo("X_API");

  const flows = useReactFlow();

  const haveCronTrigger = useMemo(() => {
    return flows.getNodes().some((node) => node.type === NodeTypeValues[10]);
  }, [flows]);

  const form = useForm<XGetTweetData>({
    resolver: zodResolver(xGetTweetDataSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      userId: defaultValues.userId || "",
      since: defaultValues.since ?? false,
      maxTweets: defaultValues.maxTweets ?? 10,
    },
  });

  const watchVariableName =
    useWatch({
      control: form.control,
      name: "variableName",
    }) || "xPost";

  const handleSubmit = useCallback(
    (data: XGetTweetData) => {
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
        userId: defaultValues.userId || "",
        since: defaultValues.since ?? false,
        maxTweets: defaultValues.maxTweets ?? 10,
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pr-4">
        <DialogHeader>
          <DialogTitle>X Get Tweet Configuration</DialogTitle>
          <DialogDescription>
            Configure the X node to fetch tweets using the X API.
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
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter user ID" />
                    </FormControl>
                    <FormDescription>
                      The user ID to fetch tweets from.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {haveCronTrigger && (
                <FormField
                  control={form.control}
                  name="since"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 cursor-pointer"
                        />
                      </FormControl>
                      <FormLabel className="mb-0 cursor-pointer">
                        Include tweets since a certain date Using With cron
                        trigger
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="maxTweets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tweets</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        max="100"
                        min="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of tweets to fetch (5-100).
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
