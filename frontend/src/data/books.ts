import { BooksByGrade } from "@/types/book";

export const books: BooksByGrade = {
  "7": {
    gradeLabel: "هفتم",
    books: [
      { id: 'math', title: 'ریاضی' },
      { id: 'math-ex', title: 'ریاضی تکمیلی' },
      { id: 'science', title: 'علوم' },
      { id: 'persian', title: 'فارسی', disabled: true },
      { id: 'quran', title: 'قرآن', disabled: true },
      { id: 'social', title: 'اجتماعی', disabled: true },
      { id: 'arabic', title: 'عربی', disabled: true },
      { id: 'asemani', title: 'پیام‌های آسمانی', disabled: true },
      { id: 'honar', title: 'هنر', hidden: true },
    ]
  }
  // سایر پایه‌ها را به همین صورت اضافه کنید
} 