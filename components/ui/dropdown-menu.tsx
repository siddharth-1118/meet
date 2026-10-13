import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("relative inline-block text-left z-50", className)} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
DropdownMenu.displayName = "DropdownMenu";

export { DropdownMenu };