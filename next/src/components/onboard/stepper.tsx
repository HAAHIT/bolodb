import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              i <= currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "text-sm hidden sm:inline",
              i <= currentStep
                ? "text-foreground font-medium"
                : "text-muted-foreground",
            )}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8",
                i < currentStep ? "bg-primary" : "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
