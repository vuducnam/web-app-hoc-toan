// Shared "back to home" link for auth pages (signin / signup).
// Server component — no client interactivity needed.
import Link from "next/link";

export function AuthBackLink() {
  return (
    <div className="w-full max-w-sm mx-auto mb-4">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        ← Trang chủ
      </Link>
    </div>
  );
}
