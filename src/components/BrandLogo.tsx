import logo from "@/assets/brand/recardnize-logo.svg";
import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="recardnize"
      width={1847}
      height={280}
      className={cn("block h-auto shrink-0", className)}
    />
  );
}
