// Status pill for exam attempt/assignment states.
const STATUS_LABEL: Record<string, { vi: string; cls: string }> = {
  ASSIGNED: { vi: "Đã giao", cls: "bg-brand-100 text-brand-800" },
  IN_PROGRESS: { vi: "Đang làm", cls: "bg-amber-100 text-amber-800" },
  SUBMITTED: { vi: "Đã nộp", cls: "bg-emerald-100 text-emerald-800" },
  EXPIRED: { vi: "Hết giờ", cls: "bg-red-100 text-red-700" },
};

export function ExamStatusBadge({ status }: { status: string }) {
  const { vi, cls } = STATUS_LABEL[status] ?? { vi: status, cls: "bg-ink-100 text-ink-700" };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold ${cls}`}>
      {vi}
    </span>
  );
}
