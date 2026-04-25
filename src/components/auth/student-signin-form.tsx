"use client";
// Student signin form — username input + 4-digit PIN keypad.
// Uses useActionState to bind to the signInStudent server action.
import { startTransition, useActionState, useState } from "react";
import { signInStudent, type SigninState } from "@/app/actions/auth-signin";

// 3×4 PIN keypad layout: rows of [1-9], [backspace, 0, submit]
const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["⌫", "0", "✓"],
] as const;

export function StudentSigninForm() {
  const [pin, setPin] = useState("");
  const [state, formAction, isPending] = useActionState<SigninState, FormData>(
    signInStudent,
    undefined
  );

  function handleKey(key: string) {
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
    } else if (key === "✓") {
      // Trigger form submission programmatically via the hidden submit button
      document.getElementById("student-submit-btn")?.click();
    } else if (pin.length < 4) {
      setPin((p) => p + key);
    }
  }

  // Build a FormData and dispatch the action when the hidden input is submitted.
  // Server actions called from useActionState must run inside a transition.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("pin", pin);
    startTransition(() => formAction(fd));
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-center">Đăng nhập học sinh</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {/* Username field */}
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm font-medium">
            Tên đăng nhập
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên đăng nhập"
          />
        </div>

        {/* PIN display — 4 masked dots */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Mã PIN (4 chữ số)</span>
          <div className="flex justify-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl ${
                  i < pin.length
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300"
                }`}
              >
                {i < pin.length ? "●" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Hidden pin input for form submission */}
        <input type="hidden" name="pin" value={pin} readOnly />

        {/* 3×4 PIN keypad */}
        <div className="grid grid-cols-3 gap-2">
          {KEYPAD_ROWS.flat().map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKey(key)}
              className={`h-14 rounded-xl text-xl font-semibold transition-colors ${
                key === "✓"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : key === "⌫"
                    ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
              aria-label={
                key === "⌫" ? "Xóa" : key === "✓" ? "Xác nhận" : key
              }
            >
              {key}
            </button>
          ))}
        </div>

        {/* Hidden submit button triggered by the ✓ keypad key */}
        <button
          id="student-submit-btn"
          type="submit"
          disabled={isPending || pin.length !== 4}
          className="sr-only"
          aria-hidden="true"
        >
          Đăng nhập
        </button>

        {/* Visible submit button fallback */}
        <button
          type="submit"
          disabled={isPending || pin.length !== 4}
          className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        Phụ huynh?{" "}
        <a href="/parent/signin" className="text-blue-500 hover:underline">
          Đăng nhập tại đây
        </a>
      </p>
    </div>
  );
}
