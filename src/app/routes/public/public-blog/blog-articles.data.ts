export interface IBlogArticle {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string
  excerpt: string
  publishedDate: string
  readTime: string
  sections: IBlogSection[]
}

export interface IBlogSection {
  heading?: string
  subheading?: string
  paragraphs?: string[]
  bullets?: string[]
  cta?: { text: string; route: string }
}

export const BLOG_ARTICLES: IBlogArticle[] = [
  {
    slug: 'how-to-earn-cne-points-online',
    title: 'How to Earn CNE Points Online in India',
    metaTitle: 'How to Earn CNE Points Online in India | Aastrika Sphere',
    metaDescription:
      'Learn how nurses and healthcare workers in India can earn CNE points online for free. Step-by-step guide to earning Continuing Nursing Education credits on Aastrika Sphere.',
    keywords:
      'CNE points online, earn CNE credits India, continuing nursing education, CNE certificate, INC CNE points, free CNE courses nurses',
    excerpt:
      'Continuing Nursing Education (CNE) points are mandatory for nurses in India to renew their INC registration. Here is a simple step-by-step guide to earning CNE credits online for free.',
    publishedDate: 'May 2026',
    readTime: '4 min read',
    sections: [
      {
        heading: 'What Are CNE Points?',
        paragraphs: [
          'Continuing Nursing Education (CNE) points are credits that nurses and midwives in India must earn to stay registered with the Indian Nursing Council (INC). They are a measure of ongoing professional development — ensuring that healthcare workers keep their clinical knowledge up to date.',
          'The INC requires nurses to accumulate CNE points periodically as part of their re-registration process. Failing to earn the required points can affect your professional licence.',
        ],
      },
      {
        heading: 'Who Needs CNE Points?',
        bullets: [
          'Registered Nurses (RN)',
          'General Nursing and Midwifery (GNM) graduates',
          'Auxiliary Nurse Midwives (ANM)',
          'Staff nurses working in government and private hospitals',
          'Community health officers (CHO)',
        ],
      },
      {
        heading: 'How to Earn CNE Points on Aastrika Sphere',
        paragraphs: [
          'Aastrika Sphere is a free digital learning platform designed specifically for healthcare workers in India. It offers INC-certified courses that award CNE points upon successful completion.',
        ],
        bullets: [
          'Step 1: Register on Aastrika Sphere at sphere.aastrika.org — it is completely free',
          'Step 2: Browse the course catalogue and select a course relevant to your area of practice',
          'Step 3: Complete all modules at your own pace — on mobile or desktop',
          'Step 4: Pass the assessment at the end of the course',
          'Step 5: Download your INC-certified certificate with CNE points',
        ],
      },
      {
        heading: 'Popular CNE Courses on Aastrika Sphere',
        paragraphs: [
          'Aastrika Sphere offers courses covering maternal health, newborn care, obstetric emergencies, infection prevention, and more. Each course is accredited by the Indian Nursing Council and awards CNE credits recognized across India.',
        ],
        cta: {
          text: 'Browse all CNE courses — free to enroll',
          route: '/public/home',
        },
      },
      {
        heading: 'How Many CNE Points Do You Need?',
        paragraphs: [
          'The exact number of CNE points required depends on your nursing category and INC guidelines. As a general rule, nurses are expected to earn a minimum number of CNE credits per re-registration cycle. Completing courses on Aastrika Sphere counts towards this requirement.',
          'Always verify the latest point requirements directly with the Indian Nursing Council or your state nursing council.',
        ],
      },
      {
        heading: 'Why Earn CNE Points Online?',
        bullets: [
          'Learn at your own pace — no need to travel to training centres',
          'Free of cost — no fees or subscriptions',
          'INC-certified certificates that count towards your re-registration',
          'Available on mobile — study during breaks or from home',
          'Courses in English and Hindi',
        ],
      },
    ],
  },
  {
    slug: 'inc-certification-guide-for-nurses',
    title: 'INC Certification Guide for Nurses and Midwives in India',
    metaTitle: 'INC Certification Guide for Nurses and Midwives | Aastrika Sphere',
    metaDescription:
      'A complete guide to Indian Nursing Council (INC) certification for nurses and midwives in India. Learn what INC certification means, how to get it, and how online courses help.',
    keywords:
      'INC certification nurses India, Indian Nursing Council certificate, INC registration renewal, nursing certificate India, INC accredited courses',
    excerpt:
      'The Indian Nursing Council (INC) sets the standards for nursing education and practice in India. This guide explains what INC certification means for your career and how online courses can help you meet INC requirements.',
    publishedDate: 'May 2026',
    readTime: '5 min read',
    sections: [
      {
        heading: 'What Is the Indian Nursing Council (INC)?',
        paragraphs: [
          'The Indian Nursing Council is the apex regulatory body for nursing education and practice in India, established under the Indian Nursing Council Act of 1947. It sets standards for nursing programmes, accredits institutions, and maintains a central register of qualified nurses across the country.',
          'INC certification on a course or training programme means it has been reviewed and approved by the Council as meeting the required standard for professional development in nursing.',
        ],
      },
      {
        heading: 'Why Does INC Certification Matter?',
        bullets: [
          'INC-certified courses award CNE points that count towards your registration renewal',
          'Certificates from INC-accredited programmes are recognised by hospitals, state governments, and international bodies',
          'Completing INC-certified training demonstrates professional commitment to employers',
          'Some government postings and promotions require evidence of continuing education',
        ],
      },
      {
        heading: 'INC-Certified Courses on Aastrika Sphere',
        paragraphs: [
          'All courses on Aastrika Sphere are INC-certified and designed in collaboration with clinical experts. The courses cover evidence-based clinical protocols and are regularly updated to reflect current guidelines.',
          'Upon completing a course and passing the assessment, you receive an INC-certified digital certificate that you can download, print, and submit as evidence of CNE credits.',
        ],
        cta: {
          text: 'Start an INC-certified course today — free',
          route: '/public/home',
        },
      },
      {
        heading: 'How to Get Your INC-Certified Certificate',
        bullets: [
          'Register for a free account on Aastrika Sphere',
          'Enrol in any course from the catalogue',
          'Complete all modules and pass the end-of-course assessment',
          'Download your certificate immediately from your profile',
          'Use the certificate for INC registration renewal or employer records',
        ],
      },
      {
        heading: 'INC Registration Renewal and CNE Points',
        paragraphs: [
          'Nurses registered with INC must renew their registration periodically. As part of the renewal process, evidence of continuing education — in the form of CNE points — is required. Completing INC-certified courses is one of the most accessible ways to earn these points, particularly through online platforms like Aastrika Sphere that are free and mobile-friendly.',
        ],
      },
    ],
  },
  {
    slug: 'free-courses-for-anm-gnm-staff-nurses',
    title: 'Free Online Courses for ANM, GNM and Staff Nurses in India',
    metaTitle: 'Free Online Courses for ANM, GNM and Staff Nurses | Aastrika Sphere',
    metaDescription:
      'Discover free INC-certified online courses for ANM, GNM, and staff nurses in India. Earn CNE points, get certified, and advance your healthcare career with Aastrika Sphere.',
    keywords:
      'free nursing courses India, free courses ANM GNM, staff nurse online courses, free healthcare training India, GNM online certificate, ANM training online',
    excerpt:
      'Healthcare workers across India — ANMs, GNMs, and staff nurses — can now access free, INC-certified professional development courses online. No fees, no travel, no fixed schedule.',
    publishedDate: 'May 2026',
    readTime: '4 min read',
    sections: [
      {
        heading: 'Why Free Online Courses Matter for Healthcare Workers',
        paragraphs: [
          'For most ANMs and GNMs working in primary health centres, sub-centres, and district hospitals across India, accessing quality training has historically required travel to urban centres or training institutes — often at personal expense and with significant time away from work and family.',
          'Free online training changes this equation entirely. With a smartphone and an internet connection, healthcare workers can now access the same quality of clinical education that was previously available only in large cities.',
        ],
      },
      {
        heading: 'Courses Available for ANM and GNM on Aastrika Sphere',
        paragraphs: [
          'Aastrika Sphere offers a growing catalogue of courses specifically designed for frontline healthcare workers. Topics include:',
        ],
        bullets: [
          'Normal labour, delivery, and AMTSL (Active Management of Third Stage of Labour)',
          'Newborn care and resuscitation',
          'Antenatal care and pregnancy monitoring',
          'Obstetric emergencies — PPH, pre-eclampsia, eclampsia',
          'Breastfeeding counselling and support',
          'Infection prevention and control',
          'Family planning counselling',
          'Maternal nutrition and anaemia management',
        ],
      },
      {
        heading: 'What You Get After Completing a Course',
        bullets: [
          'INC-certified digital certificate with your name and course details',
          'CNE points credited towards your registration renewal',
          'Knowledge and skills you can apply immediately in your practice',
          'A certificate you can share with employers or include in your professional records',
        ],
      },
      {
        heading: 'How to Get Started — It Takes 5 Minutes',
        bullets: [
          'Visit sphere.aastrika.org on your phone or computer',
          'Register with your name, mobile number, and email',
          'Browse courses and select one that matches your role',
          'Complete modules at your own pace — save your progress anytime',
          'Pass the assessment and download your certificate',
        ],
        cta: {
          text: 'Register free and start learning today',
          route: '/public/home',
        },
      },
      {
        heading: 'Available in Hindi and English',
        paragraphs: [
          'All courses on Aastrika Sphere are available in both Hindi and English, making them accessible to healthcare workers across every state in India. The platform is also optimised for low-bandwidth connections, so it works even in areas with limited internet speed.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-amtsl-guide-for-healthcare-workers',
    title: 'What Is AMTSL? A Complete Guide for Healthcare Workers',
    metaTitle: 'What Is AMTSL? A Complete Guide for Healthcare Workers | Aastrika Sphere',
    metaDescription:
      'AMTSL (Active Management of Third Stage of Labour) is a life-saving protocol for preventing postpartum haemorrhage. This guide explains what AMTSL is, why it matters, and how healthcare workers can get certified.',
    keywords:
      'AMTSL full form, active management third stage labour, AMTSL protocol nurses, postpartum haemorrhage prevention, PPH prevention India, AMTSL training online',
    excerpt:
      'Active Management of Third Stage of Labour (AMTSL) is one of the most important clinical skills for any nurse or midwife attending deliveries. It prevents postpartum haemorrhage — the leading cause of maternal death in India.',
    publishedDate: 'May 2026',
    readTime: '5 min read',
    sections: [
      {
        heading: 'What Does AMTSL Stand For?',
        paragraphs: [
          'AMTSL stands for Active Management of the Third Stage of Labour. The third stage of labour is the period after the baby is born and before the placenta is delivered. Without intervention, this stage carries the highest risk of postpartum haemorrhage (PPH) — excessive bleeding after delivery.',
          'AMTSL is a set of clinical steps that, when carried out correctly immediately after birth, significantly reduce the risk of PPH and maternal death.',
        ],
      },
      {
        heading: 'Why Is AMTSL Important in India?',
        paragraphs: [
          'Postpartum haemorrhage is the leading cause of maternal mortality in India, accounting for approximately 25–30% of all maternal deaths. Most of these deaths are preventable with timely and correct application of AMTSL protocols.',
          'For nurses, ANMs, GNMs, and staff nurses attending deliveries — in hospitals, health centres, or community settings — knowing and correctly applying AMTSL is a life-saving skill.',
        ],
      },
      {
        heading: 'The Key Steps of AMTSL',
        bullets: [
          '1. Uterotonic administration — Giving oxytocin (10 IU IM) within one minute of the baby\'s birth to stimulate uterine contractions',
          '2. Controlled cord traction — Gently pulling the umbilical cord while applying counter-pressure on the uterus to deliver the placenta',
        ],
      },
      {
        heading: 'AMTSL Training and Certification',
        paragraphs: [
          'Aastrika Sphere offers a dedicated course on Normal Labour and Birth including AMTSL, developed in collaboration with clinical experts and accredited by the Indian Nursing Council. The course covers the full protocol with step-by-step guidance, clinical videos, and a competency assessment.',
          'Completing the course earns you CNE points and an INC-certified certificate — recognised proof that you have been trained in evidence-based delivery care.',
        ],
        cta: {
          text: 'Take the AMTSL course — free and INC certified',
          route: '/public/home',
        },
      },
      {
        heading: 'Who Should Take an AMTSL Course?',
        bullets: [
          'Nurses and midwives attending institutional deliveries',
          'ANMs conducting deliveries at sub-centres or in communities',
          'GNM graduates preparing for hospital placements',
          'Staff nurses in labour rooms and obstetric wards',
          'CHOs managing deliveries at health and wellness centres',
        ],
      },
    ],
  },
  {
    slug: 'maternal-health-training-online-india',
    title: 'Maternal Health Training Online — A Guide for Nurses in India',
    metaTitle: 'Maternal Health Training Online for Nurses in India | Aastrika Sphere',
    metaDescription:
      'Free online maternal health training for nurses, ANMs, and midwives in India. INC-certified courses covering antenatal care, safe delivery, newborn care, and obstetric emergencies.',
    keywords:
      'maternal health training online India, maternal health courses nurses, antenatal care training, safe delivery training nurses, obstetric emergency training India',
    excerpt:
      'Improving maternal health outcomes in India requires well-trained frontline healthcare workers. Free online training on Aastrika Sphere gives nurses and ANMs access to evidence-based maternal health courses anytime, anywhere.',
    publishedDate: 'May 2026',
    readTime: '5 min read',
    sections: [
      {
        heading: 'The State of Maternal Health in India',
        paragraphs: [
          'India has made significant progress in reducing maternal mortality over the past two decades, but the Maternal Mortality Ratio (MMR) remains high in several states. Most maternal deaths are caused by preventable conditions — haemorrhage, hypertensive disorders, sepsis — that skilled healthcare workers are trained to prevent and manage.',
          'The quality of care provided by nurses, ANMs, and midwives at the point of delivery is one of the most critical factors in maternal survival. Ongoing training is essential.',
        ],
      },
      {
        heading: 'What Maternal Health Training Covers',
        paragraphs: [
          'Effective maternal health training for frontline workers covers the full continuum of care — from antenatal monitoring through safe delivery to postnatal follow-up. Key areas include:',
        ],
        bullets: [
          'Antenatal care — monitoring, nutrition, risk identification',
          'Safe labour and delivery — active management, complication recognition',
          'Postpartum haemorrhage (PPH) prevention and management',
          'Pre-eclampsia and eclampsia recognition and management',
          'Newborn resuscitation and essential newborn care',
          'Breastfeeding initiation and support',
          'Postnatal care for mother and newborn',
        ],
      },
      {
        heading: 'Online Training vs Traditional Classroom Training',
        paragraphs: [
          'Traditional in-person training programmes require nurses to travel, take time off work, and often pay for accommodation and study materials. For healthcare workers in rural and semi-urban areas, this creates a significant barrier to professional development.',
          'Online training through Aastrika Sphere removes these barriers completely. Courses are free, self-paced, and accessible on any smartphone. A nurse in a primary health centre in Bihar can complete the same INC-certified training as one in a tertiary hospital in Mumbai.',
        ],
      },
      {
        heading: 'Maternal Health Courses on Aastrika Sphere',
        paragraphs: [
          'Aastrika Sphere offers a comprehensive set of maternal health courses, each developed with input from clinical specialists and accredited by the Indian Nursing Council. Completing any course earns you CNE points and a downloadable INC-certified certificate.',
        ],
        cta: {
          text: 'Explore maternal health courses — free to enroll',
          route: '/public/home',
        },
      },
      {
        heading: 'How to Get Started',
        bullets: [
          'Register for free at sphere.aastrika.org',
          'Select a maternal health course from the catalogue',
          'Complete modules at your own pace — on mobile or desktop',
          'Pass the end-of-course assessment',
          'Download your INC-certified certificate with CNE points',
        ],
      },
    ],
  },
]
