"use client";
// Parent self-registration form — name + email + password.
// Binds to signUpParent server action via useActionState.
import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpParent, type SignupState } from "@/app/actions/auth-signup";

export function ParentSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<SignupState, FormData>(
    signUpParent,
    undefined,
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center">Đăng ký phụ huynh</h1>

      <form action={formAction} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Họ và tên
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            minLength={2}
            maxLength={80}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="email@example.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full border rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ít nhất 8 ký tự"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>

        {state?.error && (
          <p role="alert" className="text-sm text-red-600 text-center">
            {state.error}
          </p>
        )}
      </form>

      <p className="text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <Link href="/parent/signin" className="text-blue-500 hover:underline">
          Đăng nhập
        </Link>
      </p>
      <p className="text-sm text-gray-500">
        Học sinh?{" "}
        <Link href="/student/signin" className="text-blue-500 hover:underline">
          Đăng nhập tại đây
        </Link>
      </p>
    </div>
  );
}
