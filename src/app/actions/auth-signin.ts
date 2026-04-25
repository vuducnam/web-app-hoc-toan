"use server";
// Server actions for student PIN signin and parent password signin.
// Both actions: validate with zod → rate-limit → call NextAuth signIn → redirect or return error.
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/auth";
import {
  checkLoginRateLimit,
  resetLoginRateLimit,
} from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const studentSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  pin: z
    .string()
    .length(4, "Mã PIN phải có 4 chữ số")
    .regex(/^\d{4}$/, "Mã PIN chỉ gồm chữ số"),
});

const parentSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

// ---------------------------------------------------------------------------
// State shape returned to useActionState
// ---------------------------------------------------------------------------

export type SigninState = { error?: string } | undefined;

// ---------------------------------------------------------------------------
// signInStudent
// ---------------------------------------------------------------------------

export async function signInStudent(
  _prevState: SigninState,
  formData: FormData
): Promise<SigninState> {
  const raw = {
    username: formData.get("username"),
    pin: formData.get("pin"),
  };

  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) {
    // Zod v4 uses .issues (was .errors in v3)
    const msg = parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
    return { error: msg };
  }

  const { username, pin } = parsed.data;
  const rateLimitKey = `student:${username}`;

  // Check rate limit BEFORE attempting auth to avoid DB query on blocked key
  const { limited } = checkLoginRateLimit(rateLimitKey);
  if (limited) {
    return { error: "Quá nhiều lần thử. Vui lòng đợi 15 phút rồi thử lại." };
  }

  try {
    await signIn("student-pin", { username, pin, redirect: false });
    // Success — reset rate limit counter and redirect
    resetLoginRateLimit(rateLimitKey);
  } catch (err) {
    if (err instanceof AuthError) {
      // Generic message — no info leakage about which field was wrong
      return { error: "Sai thông tin đăng nhập" };
    }
    throw err; // Unexpected errors bubble up
  }

  // redirect() must be called outside try/catch (it throws internally)
  redirect("/student");
}

// ---------------------------------------------------------------------------
// signInParent
// ---------------------------------------------------------------------------

export async function signInParent(
  _prevState: SigninState,
  formData: FormData
): Promise<SigninState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = parentSchema.safeParse(raw);
  if (!parsed.success) {
    // Zod v4 uses .issues (was .errors in v3)
    const msg = parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
    return { error: msg };
  }

  const { email, password } = parsed.data;
  const rateLimitKey = `parent:${email}`;

  const { limited } = checkLoginRateLimit(rateLimitKey);
  if (limited) {
    return { error: "Quá nhiều lần thử. Vui lòng đợi 15 phút rồi thử lại." };
  }

  try {
    await signIn("parent-credentials", { email, password, redirect: false });
    resetLoginRateLimit(rateLimitKey);
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Sai thông tin đăng nhập" };
    }
    throw err;
  }

  redirect("/parent");
}
