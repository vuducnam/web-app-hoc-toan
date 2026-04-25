// Server component — "Tiếp tục" CTA button linking to the practice page.
// Receives resolved skill data from the dashboard RSC.
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ContinueCtaProps {
  skillKey: string;
  skillName: string;
}

export function ContinueCta({ skillKey, skillName }: ContinueCtaProps) {
  return (
    <Button variant="celebration" asChild className="w-full sm:w-auto">
      <Link href={`/student/practice/${skillKey}`}>
        Tiếp tục: {skillName} →
      </Link>
    </Button>
  );
}
