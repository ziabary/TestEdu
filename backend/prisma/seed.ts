import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  // Create a sample user
  const user = await prisma.tblUser.create({
    data: {
      usrPhone: "+989123456789",
      usrName: "علی",
      usrEmail: "ali@example.com",
      usrAvatar: "/public/images/avatar-default.png",
      usrGrade: 7,
      usrQuestions: 10,
      usrCreatedBy_usrID: 1,
      usrUpdatedBy_usrID: 1
    }
  })

  // Create a sample account
  const account = await prisma.tblAccount.create({
    data: {
      accUserID: user.usrID,
      accBalance: 0,
      accTotalSpent: 0,
      accCreatedBy_usrID: user.usrID,
      accUpdatedBy_usrID: user.usrID
    }
  })

  // Create a sample invoice
  await prisma.tblInvoice.create({
    data: {
      invAccountID: account.accID,
      invPackage: "starter",
      invQuestions: 10,
      invPrice: 10000,
      invStatus: "paid",
      invCreatedBy_usrID: user.usrID,
      invUpdatedBy_usrID: user.usrID
    }
  })

  // Create sample progress
  await prisma.tblProgress.create({
    data: {
      prgUserID: user.usrID,
      prgSubject: "math",
      prgChapter: "chapter1",
      prgCompletion: 40,
      prgLastActivity: "practice",
      prgData: { practicesDone: 5 },
      prgCreatedBy_usrID: user.usrID,
      prgUpdatedBy_usrID: user.usrID
    }
  })

  // Create sample chat
  await prisma.tblChat.create({
    data: {
      chtUserID: user.usrID,
      chtSessionID: uuidv4(),
      chtSubject: "math",
      chtChapter: "chapter1",
      chtQuestion: "چرا -۲ × -۳ مثبت می‌شه؟",
      chtResponse: "این یک پاسخ موقت است. در نسخه نهایی، پاسخ‌ها توسط هوش مصنوعی گروک تولید خواهند شد.",
      chtCost: 1,
      chtCreatedBy_usrID: user.usrID
    }
  })

  // Create sample content
  await prisma.tblContent.create({
    data: {
      cntSubject: "math",
      cntChapter: "chapter1",
      cntType: "explanation",
      cntData: {
        text: "\\[\\text{اعداد صحیح مثل دوستان باحال ریاضی‌ان:}\\] شامل اعداد مثبت (مثل \\(5\\))، منفی (مثل \\(-3\\)) و صفر. فکر کن روی یه خط راست راه می‌ری: به راست بری، اعداد مثبتن؛ به چپ، منفین. جمع و تفریق؟ مثل حرکت روی این خطه! مثلاً: \\[-4 + 7 = 3\\] یعنی از \\(-4\\) به راست \\(7\\) قدم برو، می‌رسی به \\(3\\). ضرب و تقسیم هم قانون دارن: دوتا منفی با هم، مثبت می‌شن (مثل \\(-2 × -3 = 6\\)). اگه یکی مثبت و یکی منفی باشه، جواب منفیه (\\(-2 × 3 = -6\\)). تقسیم هم همین‌جوریه! حالا بیایم یه کم بازی کنیم و ببینیم چطور کار می‌کنه."
      },
      cntCreatedBy_usrID: user.usrID,
      cntUpdatedBy_usrID: user.usrID
    }
  })

  await prisma.tblContent.create({
    data: {
      cntSubject: "math",
      cntChapter: "chapter1",
      cntType: "practice",
      cntData: {
        questions: [
          { id: 1, question: "\\[-4 + 7\\]", answer: "\\[3\\]", explanation: "از \\(-4\\) به راست \\(7\\) واحد حرکت می‌کنیم، به \\(3\\) می‌رسیم." },
          { id: 2, question: "\\[5 - 8\\]", answer: "\\[-3\\]", explanation: "\\(5\\) رو \\(8\\) واحد به چپ می‌ریم، می‌رسیم به \\(-3\\)." },
          { id: 3, question: "\\[-2 × 3\\]", answer: "\\[-6\\]", explanation: "عدد منفی در مثبت، جواب منفی می‌ده: \\(-2 × 3 = -6\\)." },
          { id: 4, question: "\\[-6 ÷ 2\\]", answer: "\\[-3\\]", explanation: "تقسیم منفی به مثبت، منفیه: \\(-6 ÷ 2 = -3\\)." },
          { id: 5, question: "\\[0 - (-5)\\]", answer: "\\[5\\]", explanation: "منفیِ منفی می‌شه مثبت: \\(0 + 5 = 5\\)." }
        ]
      },
      cntCreatedBy_usrID: user.usrID,
      cntUpdatedBy_usrID: user.usrID
    }
  })

  await prisma.tblContent.create({
    data: {
      cntSubject: "math",
      cntChapter: "chapter1",
      cntType: "exam",
      cntData: {
        questions: [
          { id: 1, question: "\\[-3 + 5\\]", points: 2, simpleAnswer: "\\[2\\]", detailedAnswer: "از \\(-3\\) به راست \\(5\\) واحد حرکت می‌کنیم، به \\(2\\) می‌رسیم." },
          { id: 2, question: "\\[4 × -2\\]", points: 2, simpleAnswer: "\\[-8\\]", detailedAnswer: "ضرب عدد مثبت در منفی، منفی می‌شه: \\(4 × -2 = -8\\)." },
          { id: 3, question: "\\[-6 - 2\\]", points: 2, simpleAnswer: "\\[-8\\]", detailedAnswer: "تفریق عدد منفی مثل جمع معکوسه: \\(-6 + (-2) = -8\\)." },
          { id: 4, question: "\\[-10 ÷ -5\\]", points: 2, simpleAnswer: "\\[2\\]", detailedAnswer: "تقسیم دو عدد منفی، مثبت می‌شه: \\(-10 ÷ -5 = 2\\)." },
          { id: 5, question: "\\[(-4 + 2) × -3\\]", points: 2, simpleAnswer: "\\[6\\]", detailedAnswer: "اول پرانتز: \\(-4 + 2 = -2\\). بعد ضرب: \\(-2 × -3 = 6\\) (منفی در منفی، مثبت)."}
        ],
        duration: 900 // 15 minutes in seconds
      },
      cntCreatedBy_usrID: user.usrID,
      cntUpdatedBy_usrID: user.usrID
    }
  })

  // Create sample action log
  await prisma.tblActionLogs.create({
    data: {
      atlBy_usrID: user.usrID,
      atlType: "login",
      atlDescription: {
        table: "tblUser",
        rowID: user.usrID,
        action: "user logged in"
      }
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 