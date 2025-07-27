export interface Course {
  id: string;
  title: string;
  description: string;
  syllabus?: string;
  instructor: string; // User UID
  instructorName: string;
  category: string;
  duration: number; // Duration in hours
  maxStudents: number;
  enrolledStudents: string[]; // Array of student UIDs
  lessons: Lesson[];
  assignments: Assignment[];
  isActive: boolean;
  isApproved: boolean; // For admin approval
  createdAt: Date;
  updatedAt: Date;
  price?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  thumbnailUrl?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string; // HTML content or markdown
  videoUrl?: string;
  resources: Resource[];
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: Date;
  maxPoints: number;
  allowedFileTypes: string[];
  maxFileSize: number; // in MB
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  description?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number; // 0-100
  completedLessons: string[];
  submissions: Submission[];
  grade?: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  courseId: string;
  fileUrl: string;
  fileName: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
}