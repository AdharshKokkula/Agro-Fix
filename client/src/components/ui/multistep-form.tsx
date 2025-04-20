import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  content: ReactNode;
}

interface MultistepFormProps {
  steps: Step[];
  onComplete: () => void;
}

export function MultistepForm({ steps, onComplete }: MultistepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between px-2 md:px-8">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full font-bold",
                  step.id === currentStep
                    ? "bg-primary-600 text-white"
                    : step.id < currentStep
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {step.id}
              </div>
              <div
                className={cn(
                  "text-sm font-medium mt-2",
                  step.id === currentStep
                    ? "text-primary-600"
                    : step.id < currentStep
                    ? "text-primary-600"
                    : "text-gray-500"
                )}
              >
                {step.title}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-2 md:px-8 mt-4">
          {steps.map((step, index) => {
            // Don't render line after the last step
            if (index === steps.length - 1) return null;
            
            // Calculate progress for this segment
            const isComplete = currentStep > step.id;
            const isActive = currentStep === step.id + 1;
            
            return (
              <div key={`line-${step.id}`} className="flex-1 h-1 bg-gray-200 mx-4">
                <div 
                  className="h-1 bg-primary-600" 
                  style={{ 
                    width: isComplete ? "100%" : isActive ? "50%" : "0%" 
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div>
        {steps.map((step) => (
          <div
            key={step.id}
            className={step.id === currentStep ? "block" : "hidden"}
          >
            {step.content}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
          >
            Back
          </Button>
        )}
        {currentStep < steps.length && (
          <Button
            type="button"
            className="ml-auto"
            onClick={goToNextStep}
          >
            Continue
          </Button>
        )}
        {currentStep === steps.length && (
          <Button 
            type="button"
            className="ml-auto"
            onClick={onComplete}
          >
            Complete Order
          </Button>
        )}
      </div>
    </div>
  );
}
