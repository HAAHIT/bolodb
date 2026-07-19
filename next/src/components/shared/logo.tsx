import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showText?: boolean;
  tagline?: string;
  className?: string;
}

export function Logo({ size = 32, showText = true, tagline, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <rect width="32" height="32" rx="6" className="fill-current" />
        <path
          d="M10 10L22 22M22 10L10 22"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">BoloDB</span>
          {tagline && (
            <span className="text-xs text-muted-foreground leading-tight">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
