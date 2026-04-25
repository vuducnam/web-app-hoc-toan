"use client";
// Parent dashboard: form to create a new child (student) account.
// Username + 4-digit PIN + display name. Server action verifies parent session.
import { useActionState, useState } from "react";
import {
  createChildAccount,
  type CreateChildState,
} from "@/app/actions/parent-children";

export function AddChildForm() {
  const [state, formAction, isPending] = useActionState<CreateChildState, FormData>(
    createChildAccount,
    undefined,
  );
  // PIN state is local to a single submit cycle; remount-via-key resets it on success.
  const [pin, setPin] = useState("");

  // Force form remount on success → clears all native inputs + PIN state in one go.
  const formKey = state?.success ?? "initial";

  return (
    <form
      key={formKey}
      action={formAction}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="child-name" className="text-sm font-medium text-ink-900">
          Tên học sinh
        </label>
        <input
          id="child-name"
          name="name"
          type="text"
          required
          maxLength={80}
          className="border border-ink-400/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Bé Minh"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="child-username" className="text-sm font-medium text-ink-900">
          Tên đăng nhập
        </label>
        <input
          id="child-username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={32}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          pattern="[a-zA-Z0-9_-]+"
          className="border border-ink-400/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="be-minh"
        />
        <span className="text-xs text-ink-400">
          Chữ, số, gạch dưới, gạch nối. 3-32 ký tự.
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="child-pin" className="text-sm font-medium text-ink-900">
          Mã PIN (4 chữ số)
        </label>
        <input
          id="child-pin"
          name="pin"
          type="text"
          required
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="border border-ink-400/30 rounded-md px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="••••"
        />
        <span className="text-xs text-ink-400">
          Bé sẽ dùng PIN này để đăng nhập.
        </span>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isPending ? "Đang tạo..." : "Tạo tài khoản"}
      </button>

      {state?.error && (
        <p role="alert" className="text-sm text-coral-500 text-center">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-sm text-brand-700 text-center">
          {state.success}
        </p>
      )}
    </form>
  );
}
