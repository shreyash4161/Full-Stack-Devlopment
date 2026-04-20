export interface User {
  id: string;
  email: string;
  name: string;
  role: 'instructor' | 'student';
}

export interface Question {
  _id?: string;
  text: string;
  type: 'text' | 'textarea' | 'rating' | 'multiple-choice';
  options?: string[];
  required: boolean;
}

export interface Form {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: User;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  answer: string | number;
}

export interface Feedback {
  _id: string;
  formId: Form;
  studentId: User;
  answers: Answer[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, role: string) => Promise<User>;
  logout: () => void;
  validateToken: () => Promise<void>;
}
