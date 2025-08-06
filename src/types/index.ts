export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  role?: 'user' | 'admin' | 'moderator';
  isVerified?: boolean;
  stats?: {
    totalUploads: number;
    totalDownloads: number;
    totalRatings: number;
    studyStreak: number;
  };
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
  reviews?: Review[];
  reportCount?: number;
  isReported?: boolean;
}

export interface Review {
  id: string;
  noteId: string;
  userId: string;
  userDisplayName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  isHelpful: number;
  reportCount: number;
}

export interface Report {
  id: string;
  itemId: string;
  itemType: 'note' | 'review' | 'user';
  reportedBy: string;
  reason: 'inappropriate' | 'spam' | 'copyright' | 'fake' | 'other';
  description?: string;
  createdAt: Date;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: Date;
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

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'download' | 'achievement' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface SearchFilters {
  subject?: string;
  university?: string;
  career?: string;
  year?: number;
  fileType?: string;
  rating?: number;
  uploadedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}