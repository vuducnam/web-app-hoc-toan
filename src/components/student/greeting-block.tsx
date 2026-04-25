// Server component — greeting section with Mimi and random encouragement phrase.
// pickEncouragement uses Math.random() at request time — safe on server RSC.
import { MimiSVG } from "@/components/mimi/mimi-svg";
import { pickEncouragement } from "@/lib/ui/encouragement-pool";

interface GreetingBlockProps {
  name: string;
}

export function GreetingBlock({ name }: GreetingBlockProps) {
  const phrase = pickEncouragement("greeting");

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <MimiSVG state="happy" size={96} className="shrink-0" />
      <div className="min-w-0">
        <p className="text-ink-600 text-sm font-semibold mb-1">{phrase}</p>
        <h1 className="font-display font-bold text-3xl text-brand-700 truncate">
          Chào {name}!
        </h1>
      </div>
    </div>
  );
}
