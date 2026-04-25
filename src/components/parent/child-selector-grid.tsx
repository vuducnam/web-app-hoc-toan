// Server component: grid of ChildCards linking to /parent/child/[id].
// Used when a parent has 2+ children.

import Link from "next/link";

interface ChildSummary {
  id: string;
  name: string;
  compositeRating: number;
}

interface ChildSelectorGridProps {
  items: ChildSummary[];
}

function tierLabel(v: number): string {
  if (v >= 85) return "Xuất sắc";
  if (v >= 70) return "Tốt";
  if (v >= 50) return "Khá";
  if (v >= 30) return "Trung bình";
  return "Cần cải thiện";
}

export function ChildSelectorGrid({ items }: ChildSelectorGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic">
        Chưa có học sinh nào được liên kết với tài khoản này.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((child) => (
        <Link
          key={child.id}
          href={`/parent/child/${child.id}`}
          className="group block rounded-lg border border-ink-400/30 bg-white shadow-flat p-5 hover:shadow-soft hover:-translate-y-px transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500"
          aria-label={`Xem chi tiết: ${child.name}`}
        >
          {/* Avatar placeholder — initials */}
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-3">
            <span className="text-lg font-bold text-brand-700">
              {child.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <p className="text-base font-semibold text-ink-900 truncate">{child.name}</p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-brand-700">
              {child.compositeRating}
            </span>
            <span className="text-xs font-medium text-ink-600 bg-brand-50 rounded-sm px-2 py-0.5">
              {tierLabel(child.compositeRating)}
            </span>
          </div>

          <p className="mt-1 text-xs text-ink-400">Xem chi tiết →</p>
        </Link>
      ))}
    </div>
  );
}
