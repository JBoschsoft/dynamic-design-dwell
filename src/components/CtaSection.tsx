
import React from 'react';
import { Button } from "@/components/ui/button";

const CtaSection = () => {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Gotowy usprawnić proces screeningu?</h2>
        <p className="mb-8 max-w-2xl mx-auto">
          Dołącz do firm, które zrewolucjonizowały swoje procesy rekrutacyjne z
          ProstyScreening.ai.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="bg-white text-primary hover:bg-gray-100 px-6">
            Rozpocznij za darmo
          </Button>
          <Button 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white/20 transition-colors duration-300 px-6 font-semibold"
          >
            Umów prezentację
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;

