
import React from 'react';
import { MessageSquare, BarChart3, MessageCircle } from 'lucide-react';

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="bg-primary-100 p-3 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Usprawnij procesy rekrutacyjne</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nasza platforma automatyzuje żmudne zadania rekrutacyjne, pozwalając Twojemu
            zespołowi skupić się na strategicznych aspektach.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MessageCircle className="text-primary" size={24} />}
            title="AI-rozmowy kwalifikacyjne"
            description="Automatyzacja wstępnych wywiadów przez AI, oszczędzająca czas i redukująca koszty rekrutacji."
          />
          <FeatureCard
            icon={<MessageSquare className="text-primary" size={24} />}
            title="Wielokanałowa komunikacja"
            description="Zintegrowane kanały: telefon, SMS, e-mail i chat w jednym widoku procesu komunikacji."
          />
          <FeatureCard
            icon={<BarChart3 className="text-primary" size={24} />}
            title="Analityka czasu rzeczywistego"
            description="Szczegółowe raporty i wskaźniki KPI dające kompleksowy wgląd w procesy screeningowe."
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
