// Server component: renders 1-3 rule-based Vietnamese recommendation strings.

interface RecommendationsListProps {
  items: string[];
}

export function RecommendationsList({ items }: RecommendationsListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic">Chưa đủ dữ liệu để đưa ra nhận định.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-ink-900">
          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
