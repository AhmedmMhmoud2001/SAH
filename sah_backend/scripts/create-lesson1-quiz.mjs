import prisma from '../src/lib/db.js'

const lessonId = '432f5cc0-7e9b-421f-a216-579d9e7fd962'
const courseId = '37a5b46d-fd5f-47ff-9f60-ce9ebab4e3ac'

async function main() {
  let quiz = await prisma.quiz.findFirst({ where: { lessonId, type: 'lesson' } })

  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: {
        lessonId,
        courseId,
        type: 'lesson',
        title: 'اختبار الدرس 1 (Excel)',
        enTitle: 'Lesson 1 Quiz (Excel)',
      },
    })
  } else if (!quiz.courseId) {
    quiz = await prisma.quiz.update({
      where: { id: quiz.id },
      data: { courseId },
    })
  }

  const questions = [
    {
      text: 'ما وظيفة الدالة SUM في Excel؟',
      textEn: 'What does the SUM function do in Excel?',
      options: ['جمع مجموعة أرقام', 'طرح رقمين', 'حساب المتوسط', 'عدّ الخلايا غير الفارغة'],
      optionsEn: ['Add a range of numbers', 'Subtract two numbers', 'Calculate average', 'Count non-empty cells'],
      correctIndex: 0,
    },
    {
      text: 'أي مرجع خلية يُثبت الصف والعمود معاً؟',
      textEn: 'Which cell reference locks both row and column?',
      options: ['A1', '$A1', 'A$1', '$A$1'],
      optionsEn: ['A1', '$A1', 'A$1', '$A$1'],
      correctIndex: 3,
    },
    {
      text: 'لعمل فلترة للبيانات في جدول، أي تبويب غالباً تستخدم؟',
      textEn: 'To filter data in a table, which tab is commonly used?',
      options: ['Insert', 'Data', 'View', 'Formulas'],
      optionsEn: ['Insert', 'Data', 'View', 'Formulas'],
      correctIndex: 1,
    },
    {
      text: 'ما معنى الخطأ #DIV/0! ؟',
      textEn: 'What does the #DIV/0! error mean?',
      options: ['محاولة قسمة على صفر', 'خلية فارغة', 'مرجع غير صالح', 'خطأ في اسم دالة'],
      optionsEn: ['Division by zero', 'Empty cell', 'Invalid reference', 'Function name error'],
      correctIndex: 0,
    },
    {
      text: 'أي دالة تُستخدم لحساب متوسط القيم؟',
      textEn: 'Which function calculates the average of values?',
      options: ['AVERAGE', 'MAX', 'MIN', 'COUNT'],
      optionsEn: ['AVERAGE', 'MAX', 'MIN', 'COUNT'],
      correctIndex: 0,
    },
  ]

  await prisma.$transaction([
    prisma.question.deleteMany({ where: { quizId: quiz.id } }),
    prisma.question.createMany({
      data: questions.map((q) => ({
        quizId: quiz.id,
        text: q.text,
        textEn: q.textEn,
        options: JSON.stringify(q.options),
        optionsEn: JSON.stringify(q.optionsEn),
        correctIndex: q.correctIndex,
      })),
    }),
  ])

  const count = await prisma.question.count({ where: { quizId: quiz.id } })
  console.log(JSON.stringify({ quizId: quiz.id, lessonId, createdQuestions: count }, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

