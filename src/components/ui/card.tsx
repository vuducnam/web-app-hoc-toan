import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui/cn";

/**
 * Card — CVA-based with 5 variants:
 * student: skill, topic, badge
 * parent: child, metric
 */
const cardVariants = cva("relative overflow-hidden", {
  variants: {
    variant: {
      /** Student skill card — chunky rounded, brand border */
      skill: [
        "bg-paper rounded-2xl border-2 border-brand-100 shadow-chunky",
        "p-5",
      ],
      /** Student topic card — gradient brand tint */
      topic: [
        "bg-gradient-to-b from-brand-50 to-white rounded-xl border border-brand-100",
        "shadow-soft p-4",
      ],
      /** Student badge card — tier-colored border, square feel */
      badge: [
        "bg-white rounded-xl border-3 border-tier-gold",
        "shadow-chunky p-4 flex flex-col items-center gap-2",
      ],
      /** Parent child card — flat white */
      child: [
        "bg-white rounded-lg shadow-flat border border-ink-400/20",
        "p-4 flex items-center gap-4",
      ],
      /** Parent metric card — compact data display */
      metric: [
        "bg-white rounded-md border border-ink-400/30 shadow-flat",
        "p-4",
      ],
    },
  },
  defaultVariants: {
    variant: "skill",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
);

Card.displayName = "Card";

/** Convenience sub-components for card sections */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1 mb-3", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display font-semibold text-xl text-ink-900 leading-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-ink-600", className)} {...props} />
));
CardContent.displayName = "CardContent";
