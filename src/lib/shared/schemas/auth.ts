import z from "zod";

export const loginFormSchema = z.object({
  email: z.email().min(1, "Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email().min(1, "Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    image: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
export type LoginFormSchema = z.infer<typeof loginFormSchema>;
