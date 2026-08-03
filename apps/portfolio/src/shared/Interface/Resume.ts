export interface ResumeObject {
  basics: Basics;
  work: Work[];
  volunteer: Volunteer[];
  education: Education[];
  awards: Award[];
  certificates: Certificate[];
  publications: Publication[];
  skills: Skill[];
  languages: Language[];
  interests: Interest[];
  references: Reference[];
  projects: Project[];
}

interface Project {
  name: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
  url: string;
}

interface Reference {
  name: string;
  reference: string;
}

interface Interest {
  name: string;
  keywords: string[];
}

interface Language {
  language: string;
  fluency: string;
}

interface Skill {
  name: string;
  keywords: Keyword[];
}

interface Keyword {
  name: string;
  url: string;
}

interface Publication {
  name: string;
  publisher: string;
  releaseDate: string;
  url: string;
  summary: string;
}

interface Certificate {
  name: string;
  date: string;
  issuer: string;
  url: string;
}

interface Award {
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

interface Education {
  institution: string;
  url: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  score: string;
  courses: string[];
}

interface Volunteer {
  organization: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
}

interface Work {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
  projects: {
    name: string;
    startDate: string;
    endDate: string;
    position: string;
    description: string;
    link: string;
    skills: string[];
  }[];
}

interface Basics {
  name: string;
  jobtitle: string;
  image: string;
  email: string;
  phone: string;
  socialUrl: {
    name: string;
    url: string;
  }[];
  summary: string[];
  location: Location;
  profiles: Profile[];
}

interface Profile {
  network: string;
  username: string;
  url: string;
}

interface Location {
  address: string;
  postalCode: string;
  city: string;
  countryCode: string;
  region: string;
}
