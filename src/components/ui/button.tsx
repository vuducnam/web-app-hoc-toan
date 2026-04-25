import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/ui/cn";

/**
 * Button — CVA-based with 6 variants:
 * student: primary, secondary, ghost, celebration
 * parent: parent-primary, parent-secondary
 */
const buttonVariants = cva(
  // base: accessible focus ring + min touch target
  "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500",
  {
    variants: {
      variant: {
        /** Student primary — teal chunky press-down */
        primary: [
          "bg-brand-500 text-white font-semibold font-display",
          "rounded-xl shadow-chunky-brand",
          "active:translate-y-[3px] active:shadow-none",
          "hover:bg-brand-700",
          "min-h-[56px] px-6 py-3 text-lg",
        ],
        /** Student secondary — outlined */
        secondary: [
          "bg-white text-brand-500 font-semibold font-display",
          "border-2 border-brand-500 rounded-xl shadow-chunky",
          "active:translate-y-[3px] active:shadow-none",
          "hover:bg-brand-50",
          "min-h-[56px] px-6 py-3 text-lg",
        ],
        /** Student ghost — transparent minor link */
        ghost: [
          "bg-transparent text-ink-600 font-medium",
          "rounded-xl",
          "hover:bg-brand-50 hover:text-brand-700",
          "min-h-[56px] px-4 py-3",
        ],
        /** Student celebration — sun yellow CTA */
        celebration: [
          "bg-sun-500 text-ink-900 font-bold font-display",
          "rounded-xl shadow-chunky-sun",
          "active:translate-y-[3px] active:shadow-none",
          "hover:bg-sun-300",
          "min-h-[56px] px-8 py-4 text-xl",
        ],
        /** Parent primary — teal flat with hover lift */
        "parent-primary": [
          "bg-brand-700 text-white font-semibold",
          "rounded-md shadow-flat",
          "hover:shadow-soft hover:-translate-y-[1px]",
          "min-h-[40px] px-5 py-2 text-sm",
        ],
        /** Parent secondary — neutral outlined */
        "parent-secondary": [
          "bg-white text-ink-600 font-medium",
          "border border-ink-400 rounded-md",
          "hover:border-ink-600 hover:text-ink-900",
          "min-h-[40px] px-4 py-2 text-sm",
        ],
      },
      size: {
        default: "",
        sm: "text-sm min-h-[36px] px-4 py-2",
        lg: "text-xl min-h-[64px] px-8 py-4",
        icon: "min-h-[56px] min-w-[56px] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
