
import React from 'react';
import { LinkedinProfileData } from './types';
import { Card, CardContent } from '@/components/ui';
import { Check, Briefcase, GraduationCap } from 'lucide-react';

interface LinkedinProfileDisplayProps {
  data: LinkedinProfileData;
}

const LinkedinProfileDisplay: React.FC<LinkedinProfileDisplayProps> = ({ data }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-6">
      {data.headline && (
        <div>
          <h4 className="font-medium mb-1">Nagłówek</h4>
          <p className="text-sm">{data.headline}</p>
        </div>
      )}
      
      {data.summary && (
        <div>
          <h4 className="font-medium mb-1">Podsumowanie</h4>
          <p className="text-sm whitespace-pre-wrap">{data.summary}</p>
        </div>
      )}
      
      {data.experience && data.experience.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Doświadczenie</h4>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-0.5">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h5 className="font-medium">{exp.title}</h5>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-sm text-muted-foreground">{exp.duration}</p>
                  {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.education && data.education.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Wykształcenie</h4>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-0.5">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h5 className="font-medium">{edu.school}</h5>
                  {edu.degree && <p className="text-sm">{edu.degree}</p>}
                  {edu.fieldOfStudy && <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>}
                  {edu.duration && <p className="text-sm text-muted-foreground">{edu.duration}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.skills && data.skills.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Umiejętności</h4>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <div 
                key={index} 
                className="bg-secondary px-3 py-1 rounded-full text-xs flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.lastUpdated && (
        <div className="text-xs text-muted-foreground mt-4">
          Ostatnia aktualizacja: {data.lastUpdated.toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default LinkedinProfileDisplay;
