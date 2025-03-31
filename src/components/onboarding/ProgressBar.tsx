
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Konfiguracja konta</h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalSteps }).map((_, step) => (
                <div
                  key={step}
                  className={`h-2 w-12 rounded-full ${
                    step + 1 === currentStep
                      ? 'bg-primary'
                      : step + 1 < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">Krok {currentStep} z {totalSteps}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
