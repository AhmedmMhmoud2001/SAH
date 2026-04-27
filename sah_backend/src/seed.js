import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Clear existing data
  await prisma.certificateRequest.deleteMany({})
  await prisma.rolePermission.deleteMany({})
  await prisma.permission.deleteMany({})
  await prisma.role.deleteMany({})
  await prisma.quizResult.deleteMany({})
  await prisma.question.deleteMany({})
  await prisma.progress.deleteMany({})
  await prisma.transaction.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.coupon.deleteMany({})
  await prisma.refund.deleteMany({})
  await prisma.enrollment.deleteMany({})
  await prisma.lesson.deleteMany({})
  await prisma.quiz.deleteMany({})
  await prisma.course.deleteMany({})
  await prisma.contactMessage.deleteMany({})
  await prisma.contactInfo.deleteMany({})
  await prisma.about.deleteMany({})
  if (prisma.homePage) {
    try {
      await prisma.homePage.deleteMany({})
    } catch (e) {
      console.warn('⚠️ Skipping homePage cleanup (did you run migrations?):', e?.code || e?.message || e)
    }
  } else {
    console.warn('⚠️ prisma.homePage is missing. Run `npm run db:generate` after updating schema.')
  }
  await prisma.user.deleteMany({})

  console.log('✅ Cleared existing data')

  // 2. Permissions
  const permissionsData = [
    { name: 'users:read', description: 'Can view users' },
    { name: 'users:write', description: 'Can create/edit users' },
    { name: 'courses:read', description: 'Can view courses' },
    { name: 'courses:write', description: 'Can manage courses and lessons' },
    { name: 'finance:read', description: 'Can view orders and revenue' },
    { name: 'rbac:manage', description: 'Can manage roles and permissions' },
    { name: 'content:manage', description: 'Can manage About and Contact pages' }
  ]

  const createdPermissions = await Promise.all(
    permissionsData.map(p => prisma.permission.create({ data: p }))
  )

  // 3. Roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'System Administrator with full access',
      permissions: {
        create: createdPermissions.map(p => ({ permissionId: p.id }))
      }
    }
  })

  const employeeRole = await prisma.role.create({
    data: {
      name: 'Employee',
      description: 'Staff member with limited access',
      permissions: {
        create: createdPermissions
          .filter(p => !p.name.includes('rbac'))
          .map(p => ({ permissionId: p.id }))
      }
    }
  })

  // 4. Users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@sah.com',
      phone: '+966500000001',
      passwordHash: hashedPassword,
      role: 'admin',
      roleId: adminRole.id
    }
  })

  const employeeUser = await prisma.user.create({
    data: {
      name: 'Employee User',
      email: 'employee@sah.com',
      phone: '+966500000002',
      passwordHash: hashedPassword,
      role: 'employee',
      roleId: employeeRole.id
    }
  })

  const studentUser = await prisma.user.create({
    data: {
      name: 'Student User',
      email: 'student@sah.com',
      phone: '+966500000010',
      passwordHash: hashedPassword,
      role: 'student'
    }
  })

  const moreStudents = await Promise.all(
    [
      { name: 'Ahmed Ali', email: 'ahmed@student.com', phone: '+966500000011' },
      { name: 'Sara Hassan', email: 'sara@student.com', phone: '+966500000012' },
      { name: 'Mohammed Salem', email: 'mohammed@student.com', phone: '+966500000013' },
      { name: 'Reem Khaled', email: 'reem@student.com', phone: '+966500000014' },
    ].map((u) =>
      prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash: hashedPassword,
          role: 'student',
        },
      }),
    ),
  )


  // 5. Courses & Content
  const certificateAr =
    'بعد إتمام الدورة بنجاح، ستحصل على شهادة إتمام رسمية من أكاديمية SAH يمكنك إضافتها إلى سيرتك الذاتية أو مشاركتها على LinkedIn، لتثبت اكتسابك للمهارات المطلوبة وتعزز فرصك المهنية.'
  const certificateEn =
    'After completing the course successfully, you will receive an official certificate from SAH Academy. You can add it to your CV or share it on LinkedIn to showcase your skills and improve your career opportunities.'

  const coursesData = [
    {
      code: 'ACC101',
      title: 'محاسبة لغير المحاسبين',
      enTitle: 'Accounting for Non-Accountants',
      shortDesc: 'ابدأ من الصفر وتعلّم أساسيات المحاسبة بطريقة عملية.',
      enShortDesc: 'Start from zero and learn accounting fundamentals in a practical way.',
      longDesc: 'دورة شاملة في مبادئ المحاسبة الأساسية وتطبيقاتها العملية مع أمثلة وتمارين.',
      enLongDesc: 'A comprehensive course in basic accounting principles with practical examples and exercises.',
      duration: '20 ساعة',
      level: 'Beginner',
      price: 299,
      imageUrl: '/uploads/seed/course-acc101.svg',
      curriculumDetails: [
        { title: 'مدخل إلى المحاسبة', description: 'تعريف المحاسبة، أهدافها، ومجالات استخدامها مع أمثلة عملية.' },
        { title: 'الدورة المحاسبية', description: 'خطوات الدورة المحاسبية من المستندات حتى إعداد القوائم.' },
        { title: 'القيود اليومية', description: 'فهم المدين والدائن وتطبيقات القيود اليومية الأساسية.' },
        { title: 'القوائم المالية', description: 'قائمة الدخل والميزانية والتدفقات النقدية وكيفية قراءتها.' },
      ],
      enCurriculumDetails: [
        { title: 'Intro to accounting', description: 'What accounting is, why it matters, and practical examples.' },
        { title: 'Accounting cycle', description: 'From source documents to financial statements step-by-step.' },
        { title: 'Journal entries', description: 'Debits/credits and the most common journal entries.' },
        { title: 'Financial statements', description: 'Income statement, balance sheet, cash flows, and how to read them.' },
      ],
      audience: ['المبتدئون', 'رواد الأعمال', 'غير المتخصصين'],
      enAudience: ['Beginners', 'Entrepreneurs', 'Non-specialists'],
      certificateText: certificateAr,
      enCertificateText: certificateEn,
      lessons: [
        { title: 'مقدمة في المحاسبة', enTitle: 'Introduction to Accounting', duration: '15:00', sortOrder: 1 },
        { title: 'الدورة المحاسبية', enTitle: 'The Accounting Cycle', duration: '20:00', sortOrder: 2 },
      ],
    },
    {
      code: 'COST201',
      title: 'محاسبة التكاليف وتحليل التكاليف',
      enTitle: 'Cost Accounting & Cost Analysis',
      shortDesc: 'تعلم التكاليف والانحرافات وقرارات التسعير.',
      enShortDesc: 'Learn costing, variances, and pricing decisions.',
      longDesc: 'تعلّم مفاهيم التكاليف وأنواعها، تحليل الانحرافات، واتخاذ قرارات التسعير بناءً على بيانات دقيقة.',
      enLongDesc: 'Learn cost concepts, variance analysis, and pricing decisions based on accurate data.',
      duration: '20 ساعة',
      level: 'Intermediate',
      price: 420,
      imageUrl: '/uploads/seed/course-cost201.svg',
      curriculumDetails: [
        { title: 'مقدمة في التكاليف', description: 'مفاهيم التكاليف وأنواعها وكيفية تصنيفها.' },
        { title: 'مراكز التكلفة', description: 'تجميع وتحليل التكاليف حسب الأقسام والأنشطة.' },
        { title: 'الانحرافات', description: 'فهم الانحرافات وتحليلها وربطها بالأداء.' },
        { title: 'قرارات التسعير', description: 'قرارات التسعير باستخدام بيانات التكلفة والربحية.' },
      ],
      enCurriculumDetails: [
        { title: 'Costing fundamentals', description: 'Core cost concepts and classifications.' },
        { title: 'Cost centers', description: 'Grouping and analyzing costs by departments/activities.' },
        { title: 'Variance analysis', description: 'What variances are and how to interpret them.' },
        { title: 'Pricing decisions', description: 'Pricing decisions based on cost and profitability data.' },
      ],
      audience: ['محاسبو التكاليف', 'المدراء', 'رواد الأعمال'],
      enAudience: ['Cost accountants', 'Managers', 'Entrepreneurs'],
      certificateText: certificateAr,
      enCertificateText: certificateEn,
      lessons: [
        { title: 'مقدمة في محاسبة التكاليف', enTitle: 'Intro to Cost Accounting', duration: '14:20', sortOrder: 1 },
        { title: 'مراكز التكلفة', enTitle: 'Cost Centers', duration: '19:10', sortOrder: 2 },
        { title: 'تحليل الانحرافات', enTitle: 'Variance Analysis', duration: '16:35', sortOrder: 3 },
        { title: 'قرارات التسعير', enTitle: 'Pricing Decisions', duration: '21:00', sortOrder: 4 },
      ],
    },
    {
      code: 'EXCEL110',
      title: 'Excel للمحاسبين من الصفر للاحتراف',
      enTitle: 'Excel for Accountants: Zero to Pro',
      shortDesc: 'مهارات Excel الأساسية للمحاسب يوميًا.',
      enShortDesc: 'Core Excel skills accountants use daily.',
      longDesc: 'من الدوال الأساسية إلى Pivot Tables وتقارير المتابعة، ستتعلم بطريقة عملية وسريعة.',
      enLongDesc: 'From core formulas to pivot tables and reporting, you will learn in a fast, hands-on way.',
      duration: '15 ساعة',
      level: 'Beginner',
      price: 299,
      imageUrl: '/uploads/seed/course-excel110.svg',
      curriculumDetails: [
        { title: 'الدوال الأساسية', description: 'أهم الدوال التي يحتاجها المحاسب يوميًا مع أمثلة.' },
        { title: 'تنسيق البيانات', description: 'تنظيف البيانات وتنسيقها وتجهيزها للتحليل.' },
        { title: 'Pivot Tables', description: 'إنشاء جداول محورية لاستخراج التقارير بسرعة.' },
        { title: 'تقارير ولوحات متابعة', description: 'بناء تقارير ولوحات بسيطة لمتابعة الأداء.' },
      ],
      enCurriculumDetails: [
        { title: 'Core formulas', description: 'Essential formulas accountants use daily with examples.' },
        { title: 'Data formatting', description: 'Cleaning and preparing data for analysis.' },
        { title: 'Pivot tables', description: 'Build pivot tables to produce reports quickly.' },
        { title: 'Reports & dashboards', description: 'Create basic reports and lightweight dashboards.' },
      ],
      audience: ['الطلاب', 'المحاسبون المبتدئون', 'موظفو المالية'],
      enAudience: ['Students', 'Junior accountants', 'Finance staff'],
      certificateText: certificateAr,
      enCertificateText: certificateEn,
      lessons: [
        { title: 'الدوال الأساسية', enTitle: 'Core formulas', duration: '18:00', sortOrder: 1 },
        { title: 'Pivot Tables', enTitle: 'Pivot Tables', duration: '22:00', sortOrder: 2 },
      ],
    },
    {
      code: 'FIN301',
      title: 'تحليل القوائم المالية',
      enTitle: 'Financial Statements Analysis',
      shortDesc: 'اقرأ القوائم المالية واستخرج مؤشرات الأداء الأساسية.',
      enShortDesc: 'Read financial statements and extract key KPIs.',
      longDesc: 'ستتعلم تحليل قائمة الدخل والميزانية والتدفقات النقدية واستخراج النسب لاتخاذ قرارات أفضل.',
      enLongDesc: 'Learn to analyze the income statement, balance sheet, and cash flows and extract ratios for better decisions.',
      duration: '18 ساعة',
      level: 'Intermediate',
      price: 450,
      imageUrl: '/uploads/seed/course-fin301.svg',
      curriculumDetails: [
        { title: 'مقدمة في التحليل المالي', description: 'ما هو التحليل المالي ومتى نستخدمه.' },
        { title: 'نسب الربحية والسيولة', description: 'أهم النسب وكيفية قراءتها وربطها بالقرار.' },
        { title: 'تحليل التدفقات', description: 'تحليل التدفقات النقدية وتفسيرها.' },
        { title: 'دراسات حالة', description: 'حالات عملية لتطبيق التحليل على بيانات حقيقية.' },
      ],
      enCurriculumDetails: [
        { title: 'Intro to financial analysis', description: 'What analysis is and when to use it.' },
        { title: 'Profitability & liquidity ratios', description: 'Key ratios and how to interpret them.' },
        { title: 'Cash flow analysis', description: 'Understand and interpret cash flows.' },
        { title: 'Case studies', description: 'Apply analysis on real-like datasets.' },
      ],
      audience: ['محللو المالية', 'المحاسبون', 'رواد الأعمال'],
      enAudience: ['Financial analysts', 'Accountants', 'Entrepreneurs'],
      certificateText: certificateAr,
      enCertificateText: certificateEn,
      lessons: [
        { title: 'مدخل إلى التحليل المالي', enTitle: 'Intro to financial analysis', duration: '16:00', sortOrder: 1 },
        { title: 'نسب ومؤشرات الأداء', enTitle: 'Ratios & KPIs', duration: '20:00', sortOrder: 2 },
      ],
    },
    {
      code: 'ODOO210',
      title: 'Odoo للمحاسبة وإدارة المبيعات',
      enTitle: 'Odoo for Accounting & Sales',
      shortDesc: 'تطبيقات عملية على Odoo لإدارة الحسابات والمبيعات.',
      enShortDesc: 'Hands-on Odoo workflows for accounting and sales.',
      longDesc: 'تطبيق عملي خطوة بخطوة على إعدادات Odoo للمحاسبة والمبيعات، إنشاء الفواتير ومتابعة التحصيل والتقارير.',
      enLongDesc: 'Step-by-step Odoo setup for accounting and sales: invoices, collections, and reporting.',
      duration: '22 ساعة',
      level: 'Intermediate',
      price: 399,
      imageUrl: '/uploads/seed/course-odoo210.svg',
      curriculumDetails: [
        { title: 'إعداد النظام', description: 'تهيئة الحسابات والضرائب والإعدادات الأساسية.' },
        { title: 'المبيعات', description: 'إدارة عروض الأسعار والطلبات وسير العمل.' },
        { title: 'الفواتير', description: 'إنشاء الفواتير ومتابعة التحصيل.' },
        { title: 'التقارير', description: 'قراءة التقارير وربطها بالقرار.' },
      ],
      enCurriculumDetails: [
        { title: 'System setup', description: 'Configure accounts, taxes, and core settings.' },
        { title: 'Sales', description: 'Quotations, sales orders, and workflows.' },
        { title: 'Invoicing', description: 'Create invoices and track collections.' },
        { title: 'Reports', description: 'Read reports and use them for decisions.' },
      ],
      audience: ['مستخدمو Odoo', 'المحاسبون', 'فرق المبيعات'],
      enAudience: ['Odoo users', 'Accountants', 'Sales teams'],
      certificateText: certificateAr,
      enCertificateText: certificateEn,
      lessons: [
        { title: 'إعدادات Odoo الأساسية', enTitle: 'Core Odoo setup', duration: '19:00', sortOrder: 1 },
        { title: 'الفواتير والتحصيل', enTitle: 'Invoicing & collection', duration: '21:00', sortOrder: 2 },
      ],
    },
    {
      code: 'ODOO220',
      title: 'Odoo المخزون والمشتريات',
      enTitle: 'Odoo Inventory & Purchases',
      shortDesc: 'إدارة المخزون والمشتريات في Odoo خطوة بخطوة.',
      enShortDesc: 'Manage inventory and purchasing in Odoo step by step.',
      longDesc: 'تطبيق عملي على إعداد المنتجات والمستودعات وأوامر الشراء والاستلامات والتحويلات وربط ذلك بالتقارير.',
      enLongDesc: 'Hands-on setup for products, warehouses, purchase orders, receipts/transfers, and reporting.',
      duration: '20 ساعة',
      level: 'Intermediate',
      price: 379,
      imageUrl: '/uploads/seed/course-odoo220.svg',
      curriculumDetails: [
        { title: 'إعداد المستودعات', description: 'تهيئة المواقع والمسارات وسياسات المخزون.' },
        { title: 'المنتجات والتسعير', description: 'تعريف المنتجات ووحدات القياس والتسعير.' },
        { title: 'أوامر الشراء', description: 'إدارة الموردين وأوامر الشراء والاستلامات.' },
        { title: 'التقارير والتنبيهات', description: 'تقارير المخزون وتنبيهات إعادة الطلب.' },
      ],
      enCurriculumDetails: [
        { title: 'Warehouse setup', description: 'Locations, routes, and inventory policies.' },
        { title: 'Products & pricing', description: 'Products, units of measure, and pricing.' },
        { title: 'Purchase orders', description: 'Vendors, purchase orders, and receipts.' },
        { title: 'Reports & alerts', description: 'Inventory reports and reorder alerts.' },
      ],
      audience: ['مدراء المخزون', 'المحاسبون', 'مشرفو المشتريات'],
      enAudience: ['Inventory managers', 'Accountants', 'Purchasing supervisors'],
      certificateText: certificateAr,
      enCertificateText: certificateEn,
      lessons: [
        { title: 'إعداد المستودعات', enTitle: 'Warehouse setup', duration: '17:00', sortOrder: 1 },
        { title: 'أوامر الشراء والاستلام', enTitle: 'Purchases & receipts', duration: '20:00', sortOrder: 2 },
      ],
    },
    {
      code: 'BUD401',
      title: 'إعداد الميزانيات والتخطيط المالي',
      enTitle: 'Budgeting & Financial Planning',
      shortDesc: 'ابنِ ميزانية واقعية وراقب الانحرافات وقرارات التمويل.',
      enShortDesc: 'Build realistic budgets, track variances, and make financing decisions.',
      longDesc: 'يغطي هذا المساق إعداد الميزانيات التشغيلية والرأسمالية، أساليب التنبؤ، متابعة الانحرافات وبناء خطة مالية سنوية.',
      enLongDesc: 'Covers operating/capital budgeting, forecasting methods, variance tracking, and building an annual financial plan.',
      duration: '24 ساعة',
      level: 'Advanced',
      price: 520,
      imageUrl: '/uploads/seed/course-bud401.svg',
      curriculumDetails: [
        { title: 'مفاهيم الميزانيات', description: 'فهم أنواع الميزانيات وأهدافها.' },
        { title: 'التنبؤ المالي', description: 'طرق التنبؤ ومصادر البيانات اللازمة.' },
        { title: 'متابعة الانحرافات', description: 'قياس الانحرافات ومتابعتها وتحسين الأداء.' },
        { title: 'خطة مالية سنوية', description: 'بناء خطة سنوية واقعية مرتبطة بالأهداف.' },
      ],
      enCurriculumDetails: [
        { title: 'Budgeting concepts', description: 'Types of budgets and why they matter.' },
        { title: 'Financial forecasting', description: 'Forecasting methods and data sources.' },
        { title: 'Variance tracking', description: 'Measure and track variances to improve performance.' },
        { title: 'Annual financial plan', description: 'Build a realistic annual plan aligned with goals.' },
      ],
      audience: ['المدراء الماليون', 'رواد الأعمال', 'المحللون'],
      enAudience: ['Finance managers', 'Entrepreneurs', 'Analysts'],
      certificateText: certificateAr,
      enCertificateText: certificateEn,
      lessons: [
        { title: 'مفاهيم الميزانيات', enTitle: 'Budgeting concepts', duration: '20:00', sortOrder: 1 },
        { title: 'التنبؤ المالي', enTitle: 'Financial forecasting', duration: '22:00', sortOrder: 2 },
      ],
    },
    {
      code: 'ADV510',
      title: 'محاسبة الشركات والقيود المتقدمة',
      enTitle: 'Corporate Accounting & Advanced Entries',
      shortDesc: 'تعمّق في التسويات والإقفال والمعالجات المتقدمة.',
      enShortDesc: 'Go deeper into adjustments, closing, and advanced treatments.',
      longDesc: 'مساق يركز على المعالجات المتقدمة مثل الإهلاكات والمخصصات والإيرادات المؤجلة وتسويات نهاية الفترة والإقفال.',
      enLongDesc: 'Focuses on advanced treatments: depreciation, provisions, deferred revenue, period-end adjustments, and closing entries.',
      duration: '26 ساعة',
      level: 'Advanced',
      price: 549,
      imageUrl: '/uploads/seed/course-adv510.svg',
      curriculumDetails: [
        { title: 'تسويات نهاية الفترة', description: 'تسويات المصروفات والإيرادات والمخزون.' },
        { title: 'الإهلاكات والمخصصات', description: 'الإهلاك، المخصصات، والمعالجات الشائعة.' },
        { title: 'الإقفال', description: 'قيود الإقفال وترحيل النتائج.' },
        { title: 'حالات تطبيقية', description: 'تمارين وحالات واقعية على القيود المتقدمة.' },
      ],
      enCurriculumDetails: [
        { title: 'Period-end adjustments', description: 'Common period-end adjustments and why they matter.' },
        { title: 'Depreciation & provisions', description: 'Depreciation, provisions, and common treatments.' },
        { title: 'Closing entries', description: 'Closing entries and results transfer.' },
        { title: 'Practical cases', description: 'Hands-on exercises with advanced entries.' },
      ],
      audience: ['المحاسبون', 'الطلاب المتقدمون', 'المدققون الجدد'],
      enAudience: ['Accountants', 'Advanced students', 'Junior auditors'],
      certificateText: certificateAr,
      enCertificateText: certificateEn,
      lessons: [
        { title: 'تسويات نهاية الفترة', enTitle: 'Period-end adjustments', duration: '21:00', sortOrder: 1 },
        { title: 'الإقفال', enTitle: 'Closing entries', duration: '19:00', sortOrder: 2 },
      ],
    },
  ]

  const createdCourses = []

  function makeLessonsForCourse(course, count = 20) {
    const baseEmbed = 'https://www.youtube.com/embed/ysz5S6PUM-U'
    return Array.from({ length: count }).map((_, idx) => {
      const n = idx + 1
      const mm = String(8 + (idx % 12)).padStart(2, '0')
      return {
        title: `${course.title} - الدرس ${n}`,
        enTitle: `${course.enTitle || course.title} - Lesson ${n}`,
        duration: `00:${mm}:00`,
        videoUrl: `${baseEmbed}?start=${idx * 30}`,
        type: 'youtube',
        sortOrder: n,
      }
    })
  }

  function makeQuestions({ count, prefixAr, prefixEn }) {
    return Array.from({ length: count }).map((_, idx) => {
      const n = idx + 1
      const optionsAr = ['الإجابة 1', 'الإجابة 2', 'الإجابة 3', 'الإجابة 4']
      const optionsEn = ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4']
      const correctIndex = idx % 4
      return {
        text: `${prefixAr} ${n}`,
        textEn: `${prefixEn} ${n}`,
        options: JSON.stringify(optionsAr),
        optionsEn: JSON.stringify(optionsEn),
        correctIndex,
      }
    })
  }

  for (const c of coursesData) {
    const curriculumTitles = Array.isArray(c.curriculumDetails)
      ? c.curriculumDetails.map((m) => String(m?.title || '').trim()).filter(Boolean)
      : []
    const enCurriculumTitles = Array.isArray(c.enCurriculumDetails)
      ? c.enCurriculumDetails.map((m) => String(m?.title || '').trim()).filter(Boolean)
      : []

    const created = await prisma.course.create({
      data: {
        code: c.code,
        title: c.title,
        enTitle: c.enTitle,
        shortDesc: c.shortDesc,
        enShortDesc: c.enShortDesc,
        longDesc: c.longDesc,
        enLongDesc: c.enLongDesc,
        duration: c.duration,
        level: c.level,
        price: c.price,
        students: '0',
        imageUrl: c.imageUrl,
        curriculum: JSON.stringify(curriculumTitles),
        enCurriculum: JSON.stringify(enCurriculumTitles),
        curriculumDetails: JSON.stringify(c.curriculumDetails || []),
        enCurriculumDetails: JSON.stringify(c.enCurriculumDetails || []),
        audience: JSON.stringify(c.audience),
        enAudience: JSON.stringify(c.enAudience),
        certificateText: c.certificateText,
        enCertificateText: c.enCertificateText,
      },
    })
    createdCourses.push(created)

    // Create 20 lessons per course
    const lessonsData = makeLessonsForCourse(c, 20)
    const createdLessons = []
    for (const l of lessonsData) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: created.id,
          title: l.title,
          enTitle: l.enTitle,
          duration: l.duration,
          videoUrl: l.videoUrl,
          type: l.type,
          sortOrder: l.sortOrder,
        },
      })
      createdLessons.push(lesson)
    }

    // Create one quiz per lesson + questions
    for (const [idx, lesson] of createdLessons.entries()) {
      const quiz = await prisma.quiz.create({
        data: {
          lessonId: lesson.id,
          courseId: created.id,
          type: 'lesson',
          title: `اختبار الدرس ${idx + 1}`,
          enTitle: `Lesson ${idx + 1} Quiz`,
        },
      })
      const questions = makeQuestions({
        count: 5,
        prefixAr: `سؤال الدرس ${idx + 1}:`,
        prefixEn: `Lesson ${idx + 1} question:`,
      })
      for (const q of questions) {
        await prisma.question.create({
          data: {
            quizId: quiz.id,
            text: q.text,
            textEn: q.textEn,
            options: q.options,
            optionsEn: q.optionsEn,
            correctIndex: q.correctIndex,
          },
        })
      }
    }

    // Final quiz per course + questions
    const finalQuiz = await prisma.quiz.create({
      data: {
        courseId: created.id,
        lessonId: null,
        type: 'final',
        title: 'الاختبار النهائي',
        enTitle: 'Final Quiz',
      },
    })
    const finalQuestions = makeQuestions({
      count: 10,
      prefixAr: 'سؤال الاختبار النهائي:',
      prefixEn: 'Final quiz question:',
    })
    for (const q of finalQuestions) {
      await prisma.question.create({
        data: {
          quizId: finalQuiz.id,
          text: q.text,
          textEn: q.textEn,
          options: q.options,
          optionsEn: q.optionsEn,
          correctIndex: q.correctIndex,
        },
      })
    }
  }

  // 6. Coupons (global + per-course)
  await prisma.coupon.create({
    data: {
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20,
      courseId: null,
      isActive: true,
      usageLimit: 500,
    },
  })

  for (const course of createdCourses) {
    await prisma.coupon.create({
      data: {
        code: `${course.code}10`,
        discountType: 'percentage',
        discountValue: 10,
        courseId: course.id,
        isActive: true,
        usageLimit: 100,
      },
    })
    await prisma.coupon.create({
      data: {
        code: `${course.code}50`,
        discountType: 'fixed',
        discountValue: 50,
        courseId: course.id,
        isActive: true,
        usageLimit: 50,
      },
    })
  }

  // 7. Orders + enrollments + progress + some quiz results
  const allStudents = [studentUser, ...moreStudents]
  const takeCoursesForStudent = (idx) => {
    const a = createdCourses[idx % createdCourses.length]
    const b = createdCourses[(idx + 2) % createdCourses.length]
    return [a, b].filter(Boolean)
  }

  for (const [idx, stu] of allStudents.entries()) {
    const courses = takeCoursesForStudent(idx)
    for (const [j, course] of courses.entries()) {
      const paid = (idx + j) % 2 === 0
      const order = await prisma.order.create({
        data: {
          userId: stu.id,
          totalAmount: Math.max(0, Number(course.price || 0) - (paid ? 20 : 0)),
          status: paid ? 'paid' : 'pending',
          couponCode: paid ? 'WELCOME20' : null,
          transactions: paid
            ? {
                create: {
                  paymentMethod: 'bank_transfer',
                  amount: Math.max(0, Number(course.price || 0) - 20),
                  status: 'success',
                },
              }
            : undefined,
        },
      })

      await prisma.enrollment.create({
        data: {
          userId: stu.id,
          courseId: course.id,
          orderId: order.id,
        },
      })

      // Ensure progress row exists (some flows assume it exists)
      await prisma.progress.create({
        data: {
          userId: stu.id,
          courseId: course.id,
          completedLessons: '{}',
          quizScores: '{}',
        },
      })

      // Add one quiz result for first lesson quiz of the course
      const firstLesson = await prisma.lesson.findFirst({
        where: { courseId: course.id },
        orderBy: { sortOrder: 'asc' },
      })
      if (firstLesson) {
        const lessonQuiz = await prisma.quiz.findFirst({
          where: { lessonId: firstLesson.id },
        })
        if (lessonQuiz) {
          await prisma.quizResult.create({
            data: {
              userId: stu.id,
              quizId: lessonQuiz.id,
              score: paid ? 4 : 2,
              total: 5,
            },
          })
        }
      }
    }
  }

  // 8. Pages
  await prisma.about.create({
    data: {
      titleAr: 'عن SAH Academy',
      titleEn: 'About SAH Academy',
      contentAr: '<p>نحن منصة تعليمية متخصصة في المحاسبة والأنظمة المالية.</p>',
      contentEn: '<p>We are an educational platform specializing in accounting and financial systems.</p>',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  })

  await prisma.contactInfo.create({
    data: {
      email: 'info@sah-academy.com',
      phone: '+966 50 000 0000',
      address: 'الرياض، المملكة العربية السعودية',
      whatsapp: '966500000000',
      facebook: 'https://facebook.com/sah',
      linkedin: 'https://linkedin.com/company/sah'
    }
  })

  await prisma.contactMessage.create({
    data: {
      name: 'Ahmed Ali',
      email: 'ahmed@gmail.com',
      subject: 'Inquiry about Odoo Course',
      message: 'Hello, I want to know more about the Odoo ERP course.',
      isRead: false
    }
  })

  // 9. Home page (CMS)
  const featuresAr = [
    { title: 'تعلم بالذكاء الاصطناعي', desc: 'مساعدة ذكية لتسريع التعلم والإجابة عن أسئلتك.', iconUrl: null },
    { title: 'تدريب متخصص في Odoo', desc: 'محتوى عملي يركز على تطبيقات Odoo في الأعمال.', iconUrl: null },
    { title: 'مدربون متخصصون', desc: 'تعلم مع مدربين بخبرة عملية طويلة في المجال.', iconUrl: null },
    { title: 'شهادة إتمام معتمدة', desc: 'احصل على شهادة بعد إكمال الدورة واجتياز التقييم.', iconUrl: null },
  ]
  const featuresEn = [
    { title: 'AI-powered learning', desc: 'Smart help to accelerate learning and answer your questions.', iconUrl: null },
    { title: 'Specialized Odoo training', desc: 'Practical content focused on real Odoo business applications.', iconUrl: null },
    { title: 'Expert instructors', desc: 'Learn with instructors who have deep hands-on experience.', iconUrl: null },
    { title: 'Certified completion', desc: 'Get a certificate after completing the course and passing the evaluation.', iconUrl: null },
  ]

  const testimonialsAr = [
    { name: 'عبدالله محمود', role: 'مدير جديد', text: 'أفضل منصة تعليمية في مجال المحاسبة، المحتوى عملي والشهادة أضافت قيمة كبيرة لمسيرتي الذاتية.', rating: 5, avatarUrl: null },
    { name: 'سارة علي', role: 'محاسبة', text: 'شرح واضح وأمثلة عملية. قدرت أطبق اللي اتعلمته مباشرة في شغلي.', rating: 5, avatarUrl: null },
    { name: 'محمد حسن', role: 'محلل مالي', text: 'تنظيم ممتاز ودعم سريع. المحتوى محدث وسهل المتابعة خطوة بخطوة.', rating: 5, avatarUrl: null },
    { name: 'ريم الحربي', role: 'صاحبة مشروع', text: 'الدورات ساعدتني أفهم التقارير المالية وأحسّن قراراتي في إدارة المشروع.', rating: 5, avatarUrl: null },
    { name: 'أحمد سالم', role: 'مدقق مبتدئ', text: 'محتوى قوي وتمارين مفيدة، فرق معايا جدًا في فهم القيود والتسويات.', rating: 5, avatarUrl: null },
  ]
  const testimonialsEn = [
    { name: 'Abdullah Mahmoud', role: 'New manager', text: 'The best platform for accounting. Practical content and the certificate added real value to my profile.', rating: 5, avatarUrl: null },
    { name: 'Sara Ali', role: 'Accountant', text: 'Clear explanations and great examples. I was able to apply what I learned right away.', rating: 5, avatarUrl: null },
    { name: 'Mohammed Hassan', role: 'Finance analyst', text: 'Excellent structure and support. The course materials are updated and easy to follow.', rating: 5, avatarUrl: null },
    { name: 'Reem Alharbi', role: 'Business owner', text: 'The courses helped me understand financial reports and improve decision-making for my business.', rating: 5, avatarUrl: null },
    { name: 'Ahmed Salem', role: 'Junior auditor', text: 'Strong content with useful practice. It really improved my understanding of entries and adjustments.', rating: 5, avatarUrl: null },
  ]

  const stepsAr = [
    { number: '01', title: 'اختر الدورة', desc: 'اختر الدورة المناسبة لمستواك وهدفك المهني.' },
    { number: '02', title: 'ابدأ التعلم', desc: 'تابع الدروس وطبّق عملياً مع تمارين ومهام.' },
    { number: '03', title: 'احصل على الشهادة', desc: 'أكمل التقييم لتحصل على شهادة إتمام معتمدة.' },
  ]
  const stepsEn = [
    { number: '01', title: 'Choose a course', desc: 'Pick the right course for your level and goal.' },
    { number: '02', title: 'Start learning', desc: 'Watch lessons and practice with tasks.' },
    { number: '03', title: 'Get certified', desc: 'Complete the evaluation to earn a certificate.' },
  ]

  if (prisma.homePage) {
    try {
      await prisma.homePage.create({
        data: {
          heroTitleAr: 'مستقبل تعليم المحاسبة و {brand}',
          heroTitleEn: 'The future of Accounting & {brand} learning',
          heroBrand: 'Odoo',
          heroSubtitleAr: 'تعلم المحاسبة وإدارة الأعمال من مدربين متخصصين بخبرة تزيد عن 15 عاماً',
          heroSubtitleEn: 'Learn accounting and business from expert instructors with 15+ years of experience.',
          heroCtaLabelAr: 'ابدأ رحلتك للتعلم',
          heroCtaLabelEn: 'Start learning',
          heroCtaHref: '#courses',
          introVideoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
          heroImageUrl: null,
          featuresAr: JSON.stringify(featuresAr),
          featuresEn: JSON.stringify(featuresEn),
          testimonialsAr: JSON.stringify(testimonialsAr),
          testimonialsEn: JSON.stringify(testimonialsEn),
          stepsAr: JSON.stringify(stepsAr),
          stepsEn: JSON.stringify(stepsEn),
          ctaTitleAr: 'جاهز لتبدأ رحلتك التعليمية اليوم؟',
          ctaTitleEn: 'Ready to start learning today?',
          ctaSubAr: 'انضم إلى مئات الطلاب الذين طوروا مهاراتهم في المحاسبة وأنظمة Odoo',
          ctaSubEn: 'Join hundreds of students improving in accounting and Odoo.',
          ctaBtnAr: 'استكشف الدورات الآن',
          ctaBtnEn: 'Explore courses',
          ctaHref: '#courses',
        },
      })
    } catch (e) {
      console.warn('⚠️ Skipping homePage seed (did you run migrations?):', e?.code || e?.message || e)
    }
  }

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })