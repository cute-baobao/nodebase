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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient, signIn } from "@/lib/auth-client";
import { loginFormSchema, LoginFormSchema } from "@/lib/shared/schemas/auth";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    // validate on change so `formState.isValid` updates promptly
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormSchema) => {
    setLoading(true);
    await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/",
      fetchOptions: {
        onResponse: () => {
          setLoading(false);
        },
        onRequest: () => {
          setLoading(true);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: async () => {
          router.push("/");
        },
      },
    });
  };

  const signInGithub = async () => {
    await authClient.signIn.social(
      {
        provider: "github",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (error) => {
          toast.error(
            " Github OAuth error: " +
              (error instanceof Error ? error.message : String(error)),
          );
        },
      },
    );
  };

  // use isSubmitting for request-in-flight state, and isValid to enable submit
  const { isValid, isSubmitting } = loginForm.formState;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                          href="#"
                          className="ml-auto inline-block text-sm underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <p> Login </p>
                )}
              </Button>

              <div
                className={cn(
                  "flex w-full items-center gap-2",
                  "flex-col justify-between",
                )}
              >
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full gap-2")}
                  disabled={loading}
                  onClick={signInGithub}
                >
                  <Image
                    src="/logos/github.svg"
                    alt="Github Logo"
                    width={16}
                    height={16}
                  />
                  Sign in with Github
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col justify-center border-t py-2">
          <p className="text-center text-xs text-neutral-500">
            Secured by <span className="text-orange-400">better-auth.</span>
          </p>
          <p className="text-center text-xs text-neutral-500">
            Don{"`"}t have an account?{" "}
            <Link href="/register" className="underline hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
