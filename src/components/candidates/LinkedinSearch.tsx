
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Linkedin, Search, Loader2 } from 'lucide-react';
import { LinkedinProfileData } from './types';

interface LinkedinSearchProps {
  onDataFetched: (data: LinkedinProfileData) => void;
}

const LinkedinSearch: React.FC<LinkedinSearchProps> = ({ onDataFetched }) => {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = async () => {
    if (!profileUrl.trim()) {
      setError('Wprowadź adres URL profilu LinkedIn');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to scrape LinkedIn data
      // In a real implementation, you would call your backend API here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data for demonstration
      const mockData: LinkedinProfileData = {
        profileUrl: profileUrl,
        headline: 'Senior Frontend Developer at Example Company',
        summary: 'Experienced developer with 5+ years of experience in React, TypeScript, and modern web technologies.',
        experience: [
          {
            title: 'Senior Frontend Developer',
            company: 'Example Company',
            duration: '2020 - Present',
            description: 'Leading frontend development for enterprise applications.'
          },
          {
            title: 'Frontend Developer',
            company: 'Previous Company',
            duration: '2018 - 2020',
            description: 'Worked on various web applications using React.'
          }
        ],
        education: [
          {
            school: 'University of Technology',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            duration: '2014 - 2018'
          }
        ],
        skills: ['JavaScript', 'React', 'TypeScript', 'HTML/CSS', 'Node.js'],
        lastUpdated: new Date()
      };
      
      onDataFetched(mockData);
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania danych');
      console.error('LinkedIn search error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Linkedin className="h-5 w-5 mr-2 text-[#0A66C2]" />
          <CardTitle>LinkedIn</CardTitle>
        </div>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://www.linkedin.com', '_blank')}
          >
            Otwórz LinkedIn
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Wprowadź URL profilu LinkedIn..."
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Pobieranie
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Szukaj
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          Wprowadź adres URL profilu LinkedIn, aby pobrać informacje o kandydacie i automatycznie zaktualizować jego profil.
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedinSearch;
