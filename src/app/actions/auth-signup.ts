"use server";
// Server action for parent self-registration.
// Validate → check email unique → hash password → create User → auto-signin → redirect.
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashSecret } from "@/lib/auth-hashing";
import { checkLoginRateLimit } from "@/lib/rate-limit";

const parentSignupSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(80),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(128),
});

export type SignupState = { error?: string } | undefined;

export async function signUpParent(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = parentSignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const { name, email, password } = parsed.data;

  // Rate-limit by email — prevents abuse / signup spam
  const { limited } = checkLoginRateLimit(`signup:${email}`);
  if (limited) {
    return { error: "Quá nhiều lần thử. Vui lòng đợi 15 phút rồi thử lại." };
  }

  // Email uniqueness check
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email này đã được đăng ký" };
  }

  const passwordHash = await hashSecret(password);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "PARENT" },
  });

  // Auto-signin after successful signup
  try {
    await signIn("parent-credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      // Account created but auto-signin failed — direct user to signin
      redirect("/parent/signin");
    }
    throw err;
  }

  redirect("/parent");
}
