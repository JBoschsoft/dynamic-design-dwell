import { Campaign } from './types';

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Frontend Developer Recruitment',
    position: 'Frontend Developer',
    department: 'Engineering',
    owner: 'Anna Kowalska', // Added owner
    status: 'active',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-02-28T00:00:00Z',
    location: 'Warszawa, Polska',
    description: 'Poszukujemy utalentowanego Frontend Developera...',
    requirements: ['Doświadczenie z React', '3+ lat doświadczenia'],
    responsibilities: ['Tworzenie interfejsów użytkownika', 'Optymalizacja wydajności'],
    candidatesCount: 12,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Backend Engineer Hiring',
    position: 'Backend Engineer',
    department: 'Engineering',
    owner: 'Piotr Nowak', // Added owner
    status: 'draft',
    startDate: '2024-03-01T00:00:00Z',
    endDate: null,
    location: 'Kraków, Polska',
    description: 'We are looking for a skilled Backend Engineer...',
    requirements: ['Node.js experience', 'Experience with databases'],
    responsibilities: ['Develop server-side logic', 'API design and implementation'],
    candidatesCount: 5,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Data Scientist Opportunity',
    position: 'Data Scientist',
    department: 'Data Science',
    owner: 'Maria Lewandowska', // Added owner
    status: 'closed',
    startDate: '2023-11-01T00:00:00Z',
    endDate: '2023-12-15T00:00:00Z',
    location: 'Gdańsk, Polska',
    description: 'Seeking a Data Scientist to analyze and interpret complex data...',
    requirements: ['Python', 'Machine Learning'],
    responsibilities: ['Data analysis', 'Model building'],
    candidatesCount: 20,
    createdAt: '2023-10-15T00:00:00Z',
    updatedAt: '2023-12-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'Project Manager Vacancy',
    position: 'Project Manager',
    department: 'Management',
    owner: 'Katarzyna Wójcik', // Added owner
    status: 'active',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-03-31T00:00:00Z',
    location: 'Wrocław, Polska',
    description: 'Looking for an experienced Project Manager...',
    requirements: ['Project management skills', 'Leadership experience'],
    responsibilities: ['Project planning', 'Team coordination'],
    candidatesCount: 8,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'UX Designer Position',
    position: 'UX Designer',
    department: 'Design',
    owner: 'Adam Zaleski', // Added owner
    status: 'paused',
    startDate: '2023-09-01T00:00:00Z',
    endDate: '2023-10-31T00:00:00Z',
    location: 'Poznań, Polska',
    description: 'We are hiring a talented UX Designer...',
    requirements: ['UX design skills', 'Figma experience'],
    responsibilities: ['User research', 'Prototyping'],
    candidatesCount: 15,
    createdAt: '2023-08-15T00:00:00Z',
    updatedAt: '2023-10-31T00:00:00Z'
  },
];
