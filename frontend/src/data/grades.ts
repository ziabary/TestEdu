export interface Grade {
  id: number
  name: string
  description: string
  motivation: string
  active: boolean
  hidden?: boolean
}

export interface GradeCategory {
  name: string
  collapsible: boolean
  grades: Grade[]
}

export interface GradeData {
  categories: GradeCategory[]
}

export const gradeData: GradeData = {
  categories: [
    {
      name: "دبستان دوره اول",
      collapsible: true,
      grades: [
        {
          id: 0,
          name: "پیش‌دبستانی",
          description: "شروع یک ماجراجویی یادگیری با بازی و خلاقیت!",
          motivation: "هر روز با کنجکاوی، یک قدم به دنیای بزرگ‌تر نزدیک‌تر می‌شی!",
          active: false,
          hidden: true
        },
        {
          id: 1,
          name: "کلاس اول",
          description: "گام اول به سوی کشف دنیای دانش و مهارت‌های جدید!",
          motivation: "با تلاشت، می‌تونی هر چیزی رو که می‌خوای یاد بگیری!",
          active: false
        },
        {
          id: 2,
          name: "کلاس دوم",
          description: "یادگیری بیشتر و بازی با ایده‌های تازه!",
          motivation: "هر سؤالی که داری، با شجاعت بپرس و کشف کن!",
          active: false
        },
        {
          id: 3,
          name: "کلاس سوم",
          description: "زمان کشف دنیای بزرگ‌تر با اعتماد به نفس!",
          motivation: "با هر تلاش کوچک، یه قهرمان بزرگ می‌شی!",
          active: false
        }
      ]
    },
    {
      name: "دبستان دوره دوم",
      collapsible: true,
      grades: [
        {
          id: 4,
          name: "کلاس چهارم",
          description: "کاوش در دانش با تفکر و خلاقیت بیشتر!",
          motivation: "هر روز یه فرصت جدیده که خودت رو بسازی!",
          active: false
        },
        {
          id: 5,
          name: "کلاس پنجم",
          description: "آمادگی برای چالش‌های بزرگ‌تر با پشتکار!",
          motivation: "با پشتکارت، می‌تونی به هر هدفی برسی!",
          active: false
        },
        {
          id: 6,
          name: "کلاس ششم",
          description: "لحظه‌ای برای درخشش و آماده‌سازی برای آینده!",
          motivation: "با اعتماد به خودت، آینده رو خودت بساز!",
          active: false
        }
      ]
    },
    {
      name: "متوسطه دوره اول",
      collapsible: true,
      grades: [
        {
          id: 7,
          name: "کلاس هفتم",
          description: "شروع یک سفر هیجان‌انگیز به دنیای علم و دانش!",
          motivation: "هر قدمت تو یادگیری، یه موفقیت بزرگه!",
          active: true
        },
        {
          id: 8,
          name: "کلاس هشتم",
          description: "زمان رشد مهارت‌ها و کشف استعدادهای جدید!",
          motivation: "با تلاشت، می‌تونی دنیا رو تغییر بدی!",
          active: false
        },
        {
          id: 9,
          name: "کلاس نهم",
          description: "آمادگی برای انتخاب مسیر آینده با جاه‌طلبی!",
          motivation: "با شجاعت، بهترین نسخه خودت رو بساز!",
          active: false
        }
      ]
    },
    {
      name: "متوسطه دوره دوم",
      collapsible: true,
      grades: [
        {
          id: 10,
          name: "کلاس دهم",
          description: "شروع مسیر تخصصی با رویاهایت!",
          motivation: "هر روز، یه قدم به رویاهات نزدیک‌تر می‌شی!",
          active: false
        },
        {
          id: 11,
          name: "کلاس یازدهم",
          description: "زمان تمرکز و ساخت پایه‌های موفقیت!",
          motivation: "با پشتکار، می‌تونی به قله‌ها برسی!",
          active: false
        },
        {
          id: 12,
          name: "کلاس دوازدهم",
          description: "لحظه طلایی برای تحقق آرزوهات!",
          motivation: "با تلاش آخر، آینده‌ات رو بدرخشن کن!",
          active: false
        }
      ]
    }
  ]
} 