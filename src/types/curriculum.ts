export type MediumType = 'digital' | 'traditional' | 'both';

export type ResourceType = 'youtube' | 'book' | 'article' | 'course' | 'tool';

export interface Resource {
  title: string;
  author: string;
  type: ResourceType;
  url: string;
  description: string;
  isFree: boolean;
}

export interface CheckItem {
  id: string;
  unitId: string;
  termId: number;
  title: string;
  description: string;
  targetCount?: number;
  recommendedDuration?: string;
  tags: string[];
}

export interface Unit {
  id: string;
  termId: number;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  keyConcepts: string[];
  resources: Resource[];
  checks: CheckItem[];
}

export interface GraduationPrompt {
  title: string;
  brief: string;
  requirements: string[];
  tips: string[];
}

export interface Term {
  id: number;
  number: number;
  title: string;
  subtitle: string;
  estimatedWeeks: number;
  description: string;
  color: string;
  icon: string;
  units: Unit[];
  graduationPrompt: GraduationPrompt;
}

export interface CheckProofImage {
  id: string;
  dataUrl: string;
  timestamp: string;
  note?: string;
}

export interface CheckState {
  checkId: string;
  completed: boolean;
  completedAt?: string;
  images: CheckProofImage[];
  notes?: string;
}

export interface MilestoneArtwork {
  id: string;
  termNumber: number; // 0 = baseline, 1-9 = term graduation
  termTitle: string;
  title: string;
  dataUrl: string;
  date: string;
  reflectionNotes: string;
  hoursSpent?: number;
  confidenceRating?: number; // 1 to 5
}

export interface UserProfile {
  id: string;
  name: string;
  medium: MediumType;
  goal: string;
  baselineArtwork?: {
    title: string;
    dataUrl: string;
    date: string;
    notes: string;
  };
  createdAt: string;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface AppStateData {
  profile: UserProfile | null;
  checks: Record<string, CheckState>;
  milestones: MilestoneArtwork[];
}
