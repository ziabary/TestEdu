export interface Exercise {
  question: string;
  answer: string;
  detail: string;
}

export interface Subchapter {
  name: string;
  summary: string;
  detail?: string;
  fromBook?: Exercise[];
  custom?: Exercise[];
  challenging?: Exercise[];
}

export interface Chapter {
  name: string;
  summary: string;
  detail: string;
  subchapters: Subchapter[];
  exercises?: Exercise[];
}

export interface BookData {
  desc: {
    firstLine: {
      anonymous: string;
      authenticated: string;
    };
    nextLines: string;
  };
  chapters:Chapter[];
} 

export interface BookItem {
  id: string
  title: string
  disabled?: boolean
  hidden?: boolean
}
export interface BooksByGrade {
  [grade: string]: {
    gradeLabel: string
    books: BookItem[]
  }
}