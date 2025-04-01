
import { Candidate } from './types';

export const mockCandidates: Candidate[] = [
  { 
    id: '1', 
    name: 'Anna Nowak', 
    email: 'anna.nowak@example.com', 
    phone: '+48 123 456 789',
    stage: 'Nowy', 
    source: 'LinkedIn', 
    appliedAt: new Date('2023-09-10T10:30:00') 
  },
  { 
    id: '2', 
    name: 'Jan Kowalski', 
    email: 'jan.kowalski@example.com', 
    phone: '+48 234 567 890',
    stage: 'Screening', 
    source: 'Strona firmowa', 
    appliedAt: new Date('2023-09-09T14:45:00')
  },
  { 
    id: '3', 
    name: 'Katarzyna Wiśniewska', 
    email: 'k.wisniewska@example.com', 
    phone: '+48 345 678 901',
    stage: 'Screening', 
    source: 'LinkedIn', 
    appliedAt: new Date('2023-09-08T09:15:00')
  },
  { 
    id: '4', 
    name: 'Piotr Dąbrowski', 
    email: 'piotr.dabrowski@example.com', 
    phone: '+48 456 789 012',
    stage: 'Wywiad', 
    source: 'Polecenie', 
    appliedAt: new Date('2023-09-07T16:20:00')
  },
  { 
    id: '5', 
    name: 'Magdalena Lewandowska', 
    email: 'm.lewandowska@example.com', 
    phone: '+48 567 890 123',
    stage: 'Wywiad', 
    source: 'LinkedIn', 
    appliedAt: new Date('2023-09-06T11:00:00')
  },
  { 
    id: '6', 
    name: 'Tomasz Wójcik', 
    email: 'tomasz.wojcik@example.com', 
    phone: '+48 678 901 234',
    stage: 'Oferta', 
    source: 'Strona firmowa', 
    appliedAt: new Date('2023-09-05T13:30:00')
  },
  { 
    id: '7', 
    name: 'Aleksandra Kamińska', 
    email: 'a.kaminska@example.com', 
    phone: '+48 789 012 345',
    stage: 'Zatrudniony', 
    source: 'LinkedIn', 
    appliedAt: new Date('2023-09-04T10:45:00')
  },
  { 
    id: '8', 
    name: 'Michał Zieliński', 
    email: 'michal.zielinski@example.com', 
    phone: '+48 890 123 456',
    stage: 'Odrzucony', 
    source: 'Polecenie', 
    appliedAt: new Date('2023-09-03T15:10:00')
  },
  { 
    id: '9', 
    name: 'Natalia Szymańska', 
    email: 'n.szymanska@example.com', 
    phone: '+48 901 234 567',
    stage: 'Nowy', 
    source: 'LinkedIn', 
    appliedAt: new Date('2023-09-02T09:30:00')
  },
  { 
    id: '10', 
    name: 'Jakub Woźniak', 
    email: 'jakub.wozniak@example.com', 
    phone: '+48 012 345 678',
    stage: 'Nowy', 
    source: 'Strona firmowa', 
    appliedAt: new Date('2023-09-01T14:00:00')
  },
  { 
    id: '11', 
    name: 'Karolina Jankowska', 
    email: 'k.jankowska@example.com', 
    phone: '+48 987 654 321',
    stage: 'Screening', 
    source: 'LinkedIn', 
    appliedAt: new Date('2023-08-31T11:20:00')
  }
];
