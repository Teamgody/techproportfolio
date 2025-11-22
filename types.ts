
export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: 'image/jpeg' | 'application/pdf';
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  headline: string;
  contactInfo: string;
  avatarUrl: string;
  skills: string[];
  projects: Project[];
  awards: Award[];
  experience: Experience[];
  education: Education[];
}

export interface User {
  id: string;
  email: string;
}

export type PageView =
  | { name: 'home' }
  | { name: 'profile'; profileId: string }
  | { name: 'editProfile'; profileId: string }
  | { name: 'login' }
  | { name: 'signup' };
