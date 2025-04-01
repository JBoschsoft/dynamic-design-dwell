
import { Candidate } from './types';

// Mock data for demo purposes
export const mockCandidates: Candidate[] = Array(100).fill(null).map((_, i) => ({
  id: `c-${i}`,
  name: `Kandydat ${i + 1}`,
  email: `kandydat${i + 1}@example.com`,
  position: ['Developer', 'Designer', 'Manager', 'Tester', 'Analyst'][i % 5],
  stage: ['Nowy', 'Screening', 'Wywiad', 'Oferta', 'Zatrudniony', 'Odrzucony'][i % 6] as Candidate['stage'],
  source: ['LinkedIn', 'Aplikacja', 'Polecenie', 'ATS', 'Inne'][i % 5],
  appliedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
}));
