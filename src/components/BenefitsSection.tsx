import React from 'react';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
const BenefitItem = ({
  text
}: {
  text: string;
}) => {
  return <div className="flex items-center gap-3 mb-3">
      <div className="bg-green-500 rounded-full flex items-center justify-center h-5 w-5">
        <Check size={14} className="text-white" />
      </div>
      <p className="text-gray-700">{text}</p>
    </div>;
};
const BenefitsSection = () => {
  return <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <img alt="Time Savings" className="w-full max-w-md mx-auto" src="https://picsum.photos/536/354" />
          </div>
          
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold mb-6">Oszczędzaj czas i zasoby</h2>
            
            <div className="space-y-3">
              <BenefitItem text="Skróć czas rekrutacji o 70% dzięki automatyzacji" />
              <BenefitItem text="Zminimalizuj koszty dzięki AI-screening" />
              <BenefitItem text="Uzyskaj kompleksowe dane do lepszych decyzji" />
              <BenefitItem text="Zwiększ jakość dopasowań kandydatów" />
              <BenefitItem text="Popraw doświadczenie kandydatów w procesie rekrutacji" />
            </div>
            
            <Button className="mt-6 bg-primary hover:bg-primary-700">
              Dowiedz się więcej <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
export default BenefitsSection;