"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CredentialType, CredentialTypeValues } from "@/db";
import { useUpgradeModal } from "@/lib/hooks/use-upgrade-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  useCreateCredential,
  useUpdatedCredential,
} from "../hooks/use-credentials";
import { credentialTypeOptions } from "@/lib/configs/credential-constants";

interface CredentialProps {
  initialData?: {
    id: string;
    name: string;
    value: string;
    type: CredentialType;
  };
}

const credentialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(CredentialTypeValues),
  value: z.string().min(1, "Value is required"),
});

type CredentialFormData = z.infer<typeof credentialSchema>;



export function CredentialForm({ initialData }: CredentialProps) {
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdatedCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialTypeValues[0],
      value: "",
    },
  });

  const onSubmit = async (data: CredentialFormData) => {
    if (isEdit && initialData) {
      await updateCredential.mutateAsync({
        id: initialData.id,
        ...data,
      });
    } else {
      await createCredential.mutateAsync(data, {
        onError: (error) => {
          handleError(error);
        },
        onSuccess: () => {
          router.push("/credentials");
        },
      });
    }
  };
  return (
    <>
      {modal}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? "Update your API key or credential details."
              : "Add a new API key or credential to your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Credential Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
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
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                                className="object-contain"
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
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
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="value">Value</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Credential Value"
                        {...field}
                      />
                    </FormControl>
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
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button asChild variant="outline">
            <Link href="/credentials" prefetch>
              Cancel
            </Link>
          </Button>
          <Button
            onClick={() => submitButtonRef.current?.click()}
            disabled={updateCredential.isPending || createCredential.isPending}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
