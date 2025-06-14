import z from "zod";
export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(5, { message: "Username should be at least 5 character long" })
    .max(20, { message: "Username should be most 20 characters long" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(50, { message: "Email must be no more then 50 chareacters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(50, { message: "Password must be no more than 50 chracters" }),
});

export const shortlinksSchema = z.object({
  shortcode: z
    .string({ required_error: "Shortcode is required" })
    .trim()
    .min(3, { message: "short code must be atlest 3 character" })
    .max(20, { message: "Shortcode cannat be longer thwn 20 characters" }),
  url: z
    .string({ required_error: "Url is required" })
    .trim()
    .url({ message: "Enter a valid url" })
    .max(1000, { message: "Url cannot be longer then 1000 characters" }),
});
