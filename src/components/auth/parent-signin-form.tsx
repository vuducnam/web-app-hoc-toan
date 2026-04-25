"use client";
// Parent signin form — email + password with show/hide toggle.
// Uses useActionState to bind to the signInParent server action.
import { useActionState } from "react";
import { useState } from "react";
import { signInParent, type SigninState } from "@/app/actions/auth-signin";

export function ParentSigninForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<SigninState, FormData>(
    signInParent,
    undefined
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center">Đăng nhập phụ huynh</h1>

      <form action={formAction} className="flex flex-col gap-4 w-full">
        {/* Email field */}
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

        {/* Password field with show/hide toggle */}
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
              autoComplete="current-password"
              className="w-full border rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập mật khẩu"
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

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {/* Error message */}
        {state?.error && (
          <p role="alert" className="text-sm text-red-600 text-center">
            {state.error}
          </p>
        )}
      </form>

      <p className="text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <a href="/parent/signup" className="text-blue-500 hover:underline">
          Đăng ký
        </a>
      </p>
      <p className="text-sm text-gray-500">
        Học sinh?{" "}
        <a href="/student/signin" className="text-blue-500 hover:underline">
          Đăng nhập tại đây
        </a>
      </p>
    </div>
  );
}
