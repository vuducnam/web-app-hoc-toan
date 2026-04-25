// Server component: parent-side header — "Toán SGK – Phụ huynh" + signout.
// No Mimi, no coral, no chunky buttons.
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

interface ParentHeaderProps {
  userName?: string | null;
}

export function ParentHeader({ userName }: ParentHeaderProps) {
  return (
    <header className="border-b border-ink-400/20 bg-white shadow-flat">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
        <div>
          <span className="text-xl font-semibold text-ink-900 tracking-tight">
            Toán SGK
          </span>
          <span className="ml-2 text-sm text-ink-600 font-normal">– Phụ huynh</span>
        </div>

        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-ink-600">
              Xin chào, <span className="font-medium text-ink-900">{userName}</span>
            </span>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="parent-secondary" size="sm">
              Đăng xuất
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
