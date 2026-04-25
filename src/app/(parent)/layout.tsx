// Parent route group layout — server component.
// Enforces PARENT role via verifyParent(), wraps with theme-parent class.
import { verifyParent } from "@/lib/dal";
import { ParentHeader } from "@/components/parent/parent-header";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifyParent();

  return (
    <div className="theme-parent min-h-screen flex flex-col">
      <ParentHeader userName={user.name} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
