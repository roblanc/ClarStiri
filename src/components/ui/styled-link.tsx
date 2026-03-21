import * as React from "react";
import { cn } from "@/lib/utils";

export const StyledLink = React.forwardRef<
    HTMLAnchorElement,
    React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, children, ...props }, ref) => {
    return (
        <a
            ref={ref}
            className={cn(
                "text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-4 transition-colors font-medium",
                className
            )}
            {...props}
        >
            {children}
        </a>
    );
});

StyledLink.displayName = "StyledLink";
