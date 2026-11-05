// The demo staff directory and "who am I" per account (prototype — no backend).
// Tasks, list moves and report requests all name people from here, so one person reads the
// same everywhere. The signed-in person per account matches the name in that account's top nav.

export type StaffRole =
  | 'Country Scout' | 'Head Scout' | 'Lead Scout' | 'Senior Scout'
  | 'Video Manager' | 'Package Uploader' | 'Full Match Uploader';

export interface Person { name: string; role: StaffRole }

/** Account route prefix → the person signed in there. "" is the un-prefixed Country Scout routes. */
const ACCOUNT_ME: Record<string, Person> = {
  '':                     { name: 'Vanessa Kalondu', role: 'Country Scout' },
  '/country-scout':       { name: 'Vanessa Kalondu', role: 'Country Scout' },
  '/head-scout':          { name: 'Vanessa Kalondu', role: 'Head Scout' },
  '/lead-scout':          { name: 'Tom Legg',        role: 'Lead Scout' },
  '/senior-scout':        { name: 'David Mbugua',    role: 'Senior Scout' },
  '/video-manager':       { name: 'Marcus Ofori',    role: 'Video Manager' },
  '/package-uploader':    { name: 'Ama Serwaa',      role: 'Package Uploader' },
  '/full-match-uploader': { name: 'Zawadi Juma',     role: 'Full Match Uploader' },
};

const STAFF: Person[] = [
  { name: 'Amara Diallo',    role: 'Country Scout' },
  { name: 'Yusuf Bello',     role: 'Country Scout' },
  { name: 'Peace Okafor',    role: 'Head Scout' },
  { name: 'Tom Legg',        role: 'Lead Scout' },
  { name: 'Kwame Asante',    role: 'Lead Scout' },
  { name: 'David Mbugua',    role: 'Senior Scout' },
  { name: 'Sanoussy Sinare', role: 'Senior Scout' },
  { name: 'Marcus Ofori',    role: 'Video Manager' },
  { name: 'Ama Serwaa',      role: 'Package Uploader' },
  { name: 'Zawadi Juma',     role: 'Full Match Uploader' },
];

export const meFor = (base: string): Person => ACCOUNT_ME[base] ?? ACCOUNT_ME[''];

/** Everyone a task can go to, the signed-in person first. */
export const directoryFor = (base: string): Person[] => {
  const me = meFor(base);
  return [me, ...STAFF.filter(p => p.name !== me.name)];
};

export const roleOf = (name: string, base: string): StaffRole | undefined =>
  directoryFor(base).find(p => p.name === name)?.role;

/** Lead and Senior scouts file the reports (D-26). */
export const REPORTING_ROLES: StaffRole[] = ['Lead Scout', 'Senior Scout'];

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

/** The current account's route prefix, read from the address ("/lead-scout", or "" for Country Scout). */
export const currentBase = (pathname = typeof window !== 'undefined' ? window.location.pathname : ''): string => {
  const first = '/' + (pathname.split('/')[1] ?? '');
  return first in ACCOUNT_ME ? first : '';
};
