import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  href?: string;
}

const buttonVariants = {
  variant: {
    primary: "bg-gray-600 text-white shadow-md hover:bg-gray-500 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2",
    secondary: "border-2 border-gray-600 bg-white text-gray-600 shadow-sm hover:bg-gray-50",
    outline: "border-2 border-gray-400 bg-white text-gray-600 shadow-sm hover:border-gray-600 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
  },
  size: {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, href, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    const variantStyles = buttonVariants.variant[variant];
    const sizeStyles = buttonVariants.size[size];
    const combinedClassName = cn(baseStyles, variantStyles, sizeStyles, className);

    if (href) {
      return (
        <Link href={href} className={combinedClassName}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
