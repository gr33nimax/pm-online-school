export interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
  content: string;
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  blocks: Block[];
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'student';
}


export interface Question {
  id: string;
  text: string;
  image?: string; // Новое поле для картинки в вопросе
  options: string[];
  correctIndex: number;
}

export interface Test {
  id: string;
  title: string;
  questions: Question[];
}