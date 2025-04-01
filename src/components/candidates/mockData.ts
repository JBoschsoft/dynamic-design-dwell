
import { Candidate } from './types';

// Function to generate random candidates
const generateRandomCandidates = (count: number): Candidate[] => {
  const firstNames = ['Anna', 'Jan', 'Katarzyna', 'Piotr', 'Magdalena', 'Tomasz', 'Aleksandra', 'Michał', 'Natalia', 'Jakub', 'Karolina', 'Marcin', 'Barbara', 'Krzysztof', 'Ewa', 'Adam', 'Joanna', 'Marek', 'Marta', 'Łukasz', 'Agnieszka', 'Paweł', 'Monika', 'Grzegorz', 'Zofia'];
  
  const lastNames = ['Nowak', 'Kowalski', 'Wiśniewski', 'Dąbrowski', 'Lewandowski', 'Wójcik', 'Kamiński', 'Zieliński', 'Szymański', 'Woźniak', 'Jankowski', 'Kwiatkowski', 'Kaczmarek', 'Mazur', 'Krawczyk', 'Piotrowski', 'Grabowski', 'Nowakowski', 'Pawłowski', 'Michalski', 'Majewski', 'Olszewski', 'Jabłoński', 'Dudek', 'Adamczyk'];
  
  const stages: Array<Candidate['stage']> = ['Nowy', 'Screening', 'Wywiad', 'Oferta', 'Zatrudniony', 'Odrzucony'];
  
  const domains = ['example.com', 'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'wp.pl', 'onet.pl', 'interia.pl', 'o2.pl', 'tlen.pl'];
  
  const candidates: Candidate[] = [];
  
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    const stage = stages[Math.floor(Math.random() * stages.length)];
    
    // Create a random date within the last 2 years
    const now = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(now.getFullYear() - 2);
    const randomTimestamp = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
    const appliedAt = new Date(randomTimestamp);
    
    candidates.push({
      id: i.toString(),
      firstName,
      lastName,
      email: `${emailPrefix}@${domain}`,
      phone: `+48 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
      stage,
      source: 'Manual',
      appliedAt
    });
  }
  
  return candidates;
};

export const mockCandidates: Candidate[] = generateRandomCandidates(750);
