export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Note {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
  subject: string;
  university?: string;
  career?: string;
  year?: number;
  downloads: number;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
  category: 'personal' | 'shared';
}

export interface StudySession {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'study' | 'exam' | 'assignment' | 'reminder';
  status: 'pending' | 'completed' | 'cancelled';
  tags: string[];
  createdAt: Date;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  duration: number; // en minutos
  breakDuration: number; // en minutos
  completedCycles: number;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  subject: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
  timesReviewed: number;
  correctAnswers: number;
  createdAt: Date;
}

export interface UserProgress {
  userId: string;
  weeklyStudyTime: number; // en minutos
  monthlyStudyTime: number;
  totalNotes: number;
  totalDownloads: number;
  studyStreak: number; // días consecutivos
  lastStudyDate: Date;
  achievements: string[];
}