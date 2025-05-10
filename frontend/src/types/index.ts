export interface User {
  usrID: number
  usrPhone: string
  usrName?: string
  usrEmail?: string
  usrAvatar?: string
  usrGrade: number
  usrQuestions: number
  usrCreatedBy_usrID: number
  usrCreatedDateTime: string
  usrUpdatedBy_usrID: number | null
  usrUpdatedDateTime: string | null
}

export interface Progress {
  mathMinistry: number
  mathSupplementary: number
  physics: number
  practiceCount: number
  examCount: number
  successRate: number
  studyTime: number
}

export interface Account {
  accID: number
  accUserID: number
  accBalance: number
  accCreatedBy_usrID: number
  accCreatedDateTime: string
}

export interface Chat {
  chtID: number
  chtUserID: number
  chtSessionID: string
  chtGrade: number
  chtSubject: string | null
  chtBook: string | null
  chtChapter: string | null
  chtQuestion: string
  chtResponse: string
  chtCost: number
  chtCreatedBy_usrID: number
  chtCreatedDateTime: string
}

export interface Invoice {
  invID: number
  invUserID: number
  invAccountID: number
  invAmount: number
  invQuestions: number
  invCreatedBy_usrID: number
  invCreatedDateTime: string
}

export interface PracticeQuestion {
  question: string
  answer: string
  explanation: string
}

export interface ExamQuestion extends PracticeQuestion {
  id: number
}

export interface ExamResult {
  successRate: number
  score: number
  maxScore: number
}
