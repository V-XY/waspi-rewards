// app/components/kyc/KYCProgress.tsx
'use client';

interface KYCProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  labels?: string[];
}

export function KYCProgress({
  currentStep,
  totalSteps,
  completedSteps,
  labels = ['ID Type', 'Face + ID Photos', 'ID Card Photos', 'Signatures'],
}: KYCProgressProps) {
  const progress = (completedSteps.length / totalSteps) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-midnight font-medium">
            KYC Progress - {Math.round(progress)}%
          </span>
          <span className="text-warm-gray">
            {completedSteps.length} of {totalSteps} steps
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-sunrise transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isActive = stepNumber === currentStep;
          const isPending = !isCompleted && !isActive;

          return (
            <div
              key={index}
              className={`
                flex items-center gap-2 p-2 rounded-lg text-xs transition-all
                ${isCompleted 
                  ? 'bg-ghost-green/50 text-emerald-700' 
                  : isActive 
                    ? 'bg-solar-flare/10 text-solar-flare border border-solar-flare/20' 
                    : 'bg-gray-50 text-warm-gray'
                }
              `}
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                {isCompleted ? '✓' : isActive ? stepNumber : stepNumber}
              </span>
              <span className="truncate">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      {currentStep <= totalSteps && (
        <p className="text-sm text-warm-gray">
          {currentStep === totalSteps && completedSteps.length === totalSteps
            ? '🎉 All steps complete! Ready to submit.'
            : completedSteps.length === 0
              ? '📋 Start your KYC verification'
              : `📝 ${completedSteps.length} of ${totalSteps} steps complete`}
        </p>
      )}
    </div>
  );
}