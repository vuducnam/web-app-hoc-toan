// Server component: last 5 attempts shown as a simple session list.
// Groups by date proximity — shows each attempt's skill + result + time.

interface RecentAttempt {
  id: string;
  skillKey: string;
  skillNameVi: string;
  correct: boolean;
  elapsedMs: number;
  createdAt: Date;
}

interface RecentSessionsListProps {
  attempts: RecentAttempt[];
}

function formatTime(ms: number): string {
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export function RecentSessionsList({ attempts }: RecentSessionsListProps) {
  if (attempts.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic">Chưa có bài làm nào gần đây.</p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-ink-400/10">
      {attempts.map((a) => (
        <li key={a.id} className="flex items-center gap-3 py-2.5">
          {/* Correct/wrong dot */}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${
              a.correct ? "bg-success" : "bg-warn"
            }`}
            aria-label={a.correct ? "Đúng" : "Sai"}
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink-900 truncate">{a.skillNameVi}</p>
            <p className="text-xs text-ink-400">{formatDate(a.createdAt)}</p>
          </div>

          <span className="text-xs text-ink-600 flex-shrink-0">
            {formatTime(a.elapsedMs)}
          </span>
        </li>
      ))}
    </ul>
  );
}
