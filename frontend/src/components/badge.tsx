import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" | "outline" | "wine-white" | "wine-rose" | "wine-red" | "wine-sparkling" | "wine-sweet" | "wine-fortified";
  size?: "sm" | "md" | "lg";
}

const badgeVariants = {
  variant: {
    // Outline grigio - per uso generico
    default: "border-2 border-gray-600 bg-white text-gray-900",
    // GREEN TEAL - per carico
    success: "border-2 border-earth-teal bg-earth-teal text-white",
    // TERRACOTTA - per scarico
    warning: "border-2 border-earth-terracotta bg-earth-terracotta text-white",
    // BRICK - per errori/critici
    danger: "border-2 border-earth-brick bg-earth-brick text-white",
    // SAGE - per badge riepilogativi
    info: "border-2 border-earth-sage bg-earth-sage text-white",
    // TAUPE - per stati neutri
    neutral: "border-2 border-earth-taupe bg-earth-taupe-light text-earth-taupe-dark",
    // Outline - per elementi descrittivi
    outline: "border-2 border-gray-400 bg-white text-gray-700",
    // Tipi di vino - colori specifici
    "wine-white": "border-2 border-wine-white bg-wine-white text-gray-800",
    "wine-rose": "border-2 border-wine-rose bg-wine-rose text-gray-800",
    "wine-red": "border-2 border-wine-red bg-wine-red text-white",
    "wine-sparkling": "border-2 border-wine-sparkling bg-wine-sparkling text-gray-800",
    "wine-sweet": "border-2 border-wine-sweet bg-wine-sweet text-white",
    "wine-fortified": "border-2 border-wine-fortified bg-wine-fortified text-white",
  },
  size: {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  },
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-bold shadow-sm";
    const variantStyles = badgeVariants.variant[variant];
    const sizeStyles = badgeVariants.size[size];
    const combinedClassName = cn(baseStyles, variantStyles, sizeStyles, className);

    return (
      <span ref={ref} className={combinedClassName} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
