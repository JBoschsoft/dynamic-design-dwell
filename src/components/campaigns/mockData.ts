
import { Campaign } from './types';
import { addDays, format, subDays } from 'date-fns';

// Helper to format dates consistently
const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

// Create dates relative to current date
const today = new Date();
const yesterday = subDays(today, 1);
const lastWeek = subDays(today, 7);
const nextMonth = addDays(today, 30);
const inTwoMonths = addDays(today, 60);

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Senior Frontend Developer',
    position: 'Frontend Developer',
    department: 'Engineering',
    status: 'active',
    startDate: formatDate(yesterday),
    endDate: formatDate(nextMonth),
    location: 'Warszawa',
    description: 'Poszukujemy doświadczonego frontend developera do pracy nad naszą aplikacją SaaS.',
    requirements: [
      'Min. 5 lat doświadczenia w React',
      'Znajomość TypeScript',
      'Doświadczenie z Next.js',
      'Znajomość zagadnień wydajnościowych'
    ],
    responsibilities: [
      'Rozwój frontend aplikacji',
      'Współpraca z zespołem projektowym',
      'Optymalizacja wydajności',
      'Code review'
    ],
    candidatesCount: 12,
    createdAt: formatDate(lastWeek),
    updatedAt: formatDate(yesterday)
  },
  {
    id: '2',
    name: 'DevOps Engineer',
    position: 'DevOps Engineer',
    department: 'Operations',
    status: 'active',
    startDate: formatDate(lastWeek),
    endDate: formatDate(inTwoMonths),
    location: 'Kraków',
    description: 'Poszukujemy DevOps Engineer do zarządzania infrastrukturą chmurową.',
    requirements: [
      'Doświadczenie z AWS/Azure',
      'Znajomość Kubernetes',
      'Terraform',
      'CI/CD pipelines'
    ],
    responsibilities: [
      'Zarządzanie infrastrukturą',
      'Automatyzacja procesów',
      'Monitoring i optymalizacja',
      'Wsparcie developerów'
    ],
    candidatesCount: 8,
    createdAt: formatDate(lastWeek),
    updatedAt: formatDate(today)
  },
  {
    id: '3',
    name: 'Marketing Specialist',
    position: 'Marketing Specialist',
    department: 'Marketing',
    status: 'draft',
    startDate: formatDate(nextMonth),
    endDate: null,
    location: 'Wrocław',
    description: 'Szukamy specjalisty ds. marketingu z doświadczeniem w kampaniach digital.',
    requirements: [
      'Min. 3 lata doświadczenia w digital marketingu',
      'Znajomość Google Analytics',
      'Doświadczenie z SEO/SEM',
      'Umiejętność analizy danych'
    ],
    responsibilities: [
      'Planowanie kampanii marketingowych',
      'Analiza efektywności działań',
      'Współpraca z działem sprzedaży',
      'Rozwój strategii marketingowej'
    ],
    candidatesCount: 0,
    createdAt: formatDate(today),
    updatedAt: formatDate(today)
  },
  {
    id: '4',
    name: 'UX/UI Designer',
    position: 'UX/UI Designer',
    department: 'Design',
    status: 'active',
    startDate: formatDate(yesterday),
    endDate: formatDate(nextMonth),
    location: 'Remote',
    description: 'Poszukujemy kreatywnego UX/UI designera do projektowania interfejsów naszych produktów.',
    requirements: [
      'Portfolio projektów UX/UI',
      'Znajomość Figma',
      'Doświadczenie w projektowaniu aplikacji mobilnych',
      'Znajomość podstaw user research'
    ],
    responsibilities: [
      'Projektowanie interfejsów użytkownika',
      'Tworzenie prototypów',
      'Współpraca z zespołem developerskim',
      'Prowadzenie testów użyteczności'
    ],
    candidatesCount: 5,
    createdAt: formatDate(lastWeek),
    updatedAt: formatDate(today)
  },
  {
    id: '5',
    name: 'Backend Java Developer',
    position: 'Backend Developer',
    department: 'Engineering',
    status: 'closed',
    startDate: formatDate(subDays(today, 60)),
    endDate: formatDate(yesterday),
    location: 'Gdańsk',
    description: 'Zatrudnimy Java Developera do pracy nad systemami płatności.',
    requirements: [
      'Doświadczenie w Java 11+',
      'Spring Boot',
      'Bazy danych SQL i NoSQL',
      'Znajomość microservices'
    ],
    responsibilities: [
      'Rozwój usług backend',
      'Integracja z zewnętrznymi API',
      'Optymalizacja wydajności',
      'Utrzymanie istniejącego kodu'
    ],
    candidatesCount: 20,
    createdAt: formatDate(subDays(today, 60)),
    updatedAt: formatDate(yesterday)
  }
];
