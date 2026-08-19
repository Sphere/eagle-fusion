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
    title: 'How to Earn INC CNE Credits Online — Free Courses for Nurses in India',
    metaTitle: 'How to Earn INC CNE Credits Online | Free Courses for Nurses | Aastrika Sphere',
    metaDescription:
      'Find out how to earn INC CNE credits online for free. Aastrika Sphere offers INC-certified courses worth 2.5–7.5 CNE hours each, with certificates issued on completion.',
    keywords:
      'CNE points online, earn CNE credits India, INC CNE credits, continuing nursing education, CNE certificate, INC CNE points, free CNE courses nurses, how to earn CNE credits online',
    excerpt:
      'Your INC licence renewal requires Continuing Nursing Education (CNE) credits. Here is how you can earn them online, for free, at your own pace — without leaving home or your workplace.',
    publishedDate: 'May 2026',
    readTime: '5 min read',
    sections: [
      {
        heading: 'What are INC CNE Credits?',
        paragraphs: [
          'The Indian Nursing Council (INC) mandates that registered nurses complete Continuing Nursing Education to keep their clinical knowledge current and maintain registration. CNE credits are the unit of measurement for this ongoing learning — each credit hour equals one hour of structured, assessed, INC-approved learning.',
          'Completing INC-certified courses is the most straightforward way to earn these points, particularly through online platforms that are free and available on any mobile device.',
        ],
      },
      {
        heading: 'Who Needs CNE Credits?',
        bullets: [
          'Registered Nurses (RN) renewing INC registration',
          'General Nursing and Midwifery (GNM) graduates',
          'Auxiliary Nurse Midwives (ANM)',
          'Staff nurses working in government and private hospitals',
          'Community Health Officers (CHO)',
        ],
      },
      {
        heading: 'INC-Certified Courses Available on Aastrika Sphere',
        paragraphs: [
          'Aastrika Sphere hosts INC-certified online courses that award CNE credit hours on successful completion. All courses are free to enroll, self-paced, and accessible on any smartphone.',
        ],
        // Credit hours below are the catalogue's `cneName` values — the same field the CNE hub
        // at /public/cne-courses is generated from. Do not edit a figure here without checking
        // it there; an earlier version of this list credited two courses that award none.
        bullets: [
          'Normal Labour and Birth and AMTSL — 7.5 CNE credits — Rated 4.74 out of 5 by over 56,000 learners',
          'Care of Sick Newborn — 7.5 CNE credits — Rated 4.7 out of 5 (also available in Hindi, rated 4.8)',
          'Hypertension in Pregnancy — 5 CNE credits — Rated 4.74 out of 5 by over 67,000 learners',
          'Post Partum Haemorrhage (PPH) — 5 CNE credits — Rated 4.75 out of 5 by over 63,000 learners',
          'Care of Newborn and Newborn Resuscitation — 5 CNE credits — Rated 4.7 out of 5',
          'Infection Prevention — 2.5 CNE credits — Rated 4.76 out of 5 by over 56,000 learners',
        ],
      },
      {
        heading: 'How to Enroll — Step by Step',
        bullets: [
          'Step 1: Go to sphere.aastrika.org — registration is completely free',
          'Step 2: Browse the Indian Nursing Council course page',
          'Step 3: Select a course and click Enroll',
          'Step 4: Complete all modules at your own pace — save your progress anytime',
          'Step 5: Pass the end-of-course assessment (75% pass mark required)',
          'Step 6: Download your INC certificate immediately from your profile',
        ],
      },
      {
        heading: 'Tips for Completing Your CNE Courses',
        bullets: [
          'Most INC courses on Aastrika Sphere are 4–12 hours of content — split across multiple sessions at your convenience',
          'If you do not pass the assessment on the first attempt, review the relevant module and re-attempt — there is no penalty',
          'Certificates are issued digitally and can be downloaded and printed anytime',
          'Your learning progress is saved automatically — you will not lose it if you close the app or browser',
        ],
      },
      {
        heading: 'About Aastrika Sphere',
        paragraphs: [
          'Aastrika Sphere is a free healthcare learning platform built for nurses, midwives, ASHA workers, ANMs, GNMs, and medical officers across India. Content is developed in partnership with the Indian Nursing Council, WHO, UNFPA, Fernandez Foundation, Jhpiego, and the Maternity Foundation. Over 15,000 healthcare workers have already enrolled on the platform.',
        ],
        cta: {
          text: 'Browse all INC courses — free to enroll',
          route: '/public/home',
        },
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
          'All INC courses on Aastrika Sphere are designed in collaboration with clinical experts and accredited by the Indian Nursing Council. The courses cover evidence-based clinical protocols and are regularly updated to reflect current guidelines from WHO and the Government of India.',
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
          'Register for a free account on Aastrika Sphere at sphere.aastrika.org',
          'Enrol in any INC course from the catalogue',
          'Complete all modules and pass the end-of-course assessment (75% pass mark)',
          'Download your certificate immediately from your profile',
          'Use the certificate for INC registration renewal or employer records',
        ],
      },
      {
        heading: 'INC Registration Renewal and CNE Points',
        paragraphs: [
          'Nurses registered with INC must renew their registration periodically. As part of the renewal process, evidence of continuing education — in the form of CNE points — is required. Completing INC-certified courses is one of the most accessible ways to earn these points, particularly through online platforms like Aastrika Sphere that are free and mobile-friendly.',
          'Always verify the latest point requirements directly with the Indian Nursing Council or your state nursing council for the most current renewal criteria.',
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
          'Register with your name, mobile number, and email — completely free',
          'Browse courses and select one that matches your role',
          'Complete modules at your own pace — save your progress anytime',
          'Pass the assessment and download your certificate immediately',
        ],
        cta: {
          text: 'Register free and start learning today',
          route: '/public/home',
        },
      },
      {
        heading: 'Available in Hindi and English',
        paragraphs: [
          'Courses on Aastrika Sphere are available in both Hindi and English, making them accessible to healthcare workers across every state in India. The platform is optimised for low-bandwidth connections, so it works even in areas with limited internet speed.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-amtsl-guide-for-healthcare-workers',
    title: 'What Is AMTSL? A Complete Guide for Nurses and Midwives',
    metaTitle: 'What Is AMTSL? A Complete Guide for Nurses and Midwives | Aastrika Sphere',
    metaDescription:
      'AMTSL (Active Management of Third Stage of Labour) is the gold standard for preventing postpartum haemorrhage. Learn the 3 steps, common mistakes, and how to get INC-certified online.',
    keywords:
      'AMTSL full form, active management third stage labour, AMTSL protocol nurses, postpartum haemorrhage prevention, PPH prevention India, AMTSL training online, AMTSL steps',
    excerpt:
      'Active Management of Third Stage of Labour (AMTSL) is one of the most important clinical skills for any nurse or midwife attending deliveries. It prevents postpartum haemorrhage — the leading cause of maternal death in India.',
    publishedDate: 'May 2026',
    readTime: '7 min read',
    sections: [
      {
        heading: 'What is the Third Stage of Labour?',
        paragraphs: [
          'Labour has four stages. The first is cervix dilation from 0 to 10 cm. The second is pushing and delivery of the baby. The third stage — delivery of the placenta — typically lasts 5 to 30 minutes. The fourth stage is the immediate postpartum recovery period in the first 1–2 hours.',
          'The third stage carries the highest risk of haemorrhage. Without active management, uterine atony — failure of the uterus to contract — is the most common cause of postpartum haemorrhage (PPH).',
        ],
      },
      {
        heading: 'What Does AMTSL Stand For?',
        paragraphs: [
          'AMTSL stands for Active Management of the Third Stage of Labour. It is a set of three evidence-based clinical steps performed immediately after the baby is born that together reduce the risk of PPH by up to 60% compared to expectant (passive) management.',
        ],
      },
      {
        heading: 'The Three Steps of AMTSL',
        bullets: [
          'Step 1 — Uterotonic administration: Give oxytocin 10 IU intramuscularly within ONE minute of the baby\'s birth. Oxytocin causes sustained uterine contraction and is the first-line recommendation by WHO and the Government of India. Where oxytocin is unavailable, misoprostol 600 mcg oral is the recommended alternative.',
          'Step 2 — Controlled cord traction (CCT): Apply gentle, steady traction on the umbilical cord while applying counter-pressure (guard) on the suprapubic area to stabilise the uterus. This is also called the Brandt-Andrews technique. Do not apply cord traction before the uterus contracts — wait for the uterotonic to take effect.',
          'Step 3 — Uterine massage: After the placenta is delivered, massage the uterine fundus to maintain tone and prevent atony. Check regularly over the next 15–30 minutes.',
        ],
      },
      {
        heading: 'Why Is AMTSL Important in India?',
        paragraphs: [
          'Postpartum haemorrhage — defined as blood loss of 500 ml or more within 24 hours of delivery — accounts for approximately 25–30% of all maternal deaths in India. Most are preventable with timely and correct application of AMTSL.',
          'AMTSL is recommended by the World Health Organization (WHO), the Government of India Ministry of Health and Family Welfare, the Indian Nursing Council (INC), and the International Confederation of Midwives (ICM). Every nurse, ANM, GNM, and midwife conducting deliveries must be competent in AMTSL.',
        ],
      },
      {
        heading: 'Key Points to Remember',
        bullets: [
          'Give oxytocin within 1 minute of birth — timing is critical',
          'Apply counter-pressure before cord traction — never pull the cord without uterine support',
          'After placenta delivery, check it for completeness — retained fragments cause haemorrhage',
          'Document blood loss accurately at every delivery',
          'If PPH occurs despite AMTSL, escalate immediately and follow your facility\'s obstetric emergency protocol',
        ],
      },
      {
        heading: 'Common Mistakes to Avoid',
        bullets: [
          'Delaying oxytocin administration beyond 1 minute after birth',
          'Applying aggressive cord traction before the uterotonic takes effect',
          'Skipping uterine massage after placenta delivery',
          'Failing to check the placenta for completeness',
          'Under-estimating blood loss by visual assessment alone',
        ],
      },
      {
        heading: 'Learn AMTSL Online — Free, INC Certified',
        paragraphs: [
          'The Normal Labour and Birth and AMTSL course on Aastrika Sphere covers all four stages of labour, normal vaginal delivery, and the full AMTSL protocol. It includes animated clinical films, video lectures, practical procedure guides, and case-based assessments. The course was developed by the Indian Nursing Council in collaboration with the Safe Delivery App curriculum.',
          'Duration: approximately 12 hours of self-paced learning. INC awards a certificate and 7.5 CNE credit hours on completion. The course is rated 4.74 out of 5 by over 56,000 learners and is free to enroll with no deadline.',
        ],
        cta: {
          text: 'Enroll free — Normal Labour and Birth and AMTSL',
          route: '/public/toc/overview/do_1134170689871134721450/normal-labour-and-birth-and-amtsl',
        },
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
          'Antenatal care — monitoring, nutrition, risk identification, high-risk pregnancy management',
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
          'Aastrika Sphere offers a comprehensive set of maternal health courses, each developed with input from clinical specialists and partners including the Indian Nursing Council, Fernandez Foundation, Jhpiego, WHO, and UNFPA. Completing any course earns you CNE points and a downloadable INC-certified certificate.',
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
  {
    slug: 'newborn-resuscitation-golden-minute-guide',
    title: 'The Golden Minute: Newborn Resuscitation Steps Every Healthcare Worker Must Know',
    metaTitle: 'Newborn Resuscitation — The Golden Minute Guide for Nurses | Aastrika Sphere',
    metaDescription:
      'Learn the newborn resuscitation steps every nurse must know. What to do in the Golden Minute after birth — dry, stimulate, bag and mask. Free course with 5 INC CNE credits.',
    keywords:
      'newborn resuscitation steps, golden minute newborn, neonatal resuscitation India, bag and mask ventilation newborn, newborn resuscitation nurses, NBR training India',
    excerpt:
      'About 10% of newborns need help to breathe at birth. Knowing what to do in the first 60 seconds — the Golden Minute — can prevent brain damage and save a life. Here is the complete step-by-step guide.',
    publishedDate: 'May 2026',
    readTime: '6 min read',
    sections: [
      {
        heading: 'Why is the First Minute So Critical?',
        paragraphs: [
          'About 90% of newborns breathe and cry spontaneously at birth. The remaining 10% need some level of assistance. Most respond to drying and stimulation alone. A smaller number need bag-and-mask ventilation. Without oxygen, brain damage begins within 4–6 minutes.',
          'The Golden Minute refers to the first 60 seconds after birth. Acting within this window prevents hypoxic injury and death. Every delivery — institutional or community — must have a person trained in newborn resuscitation present.',
        ],
      },
      {
        heading: 'Prepare Before Every Delivery',
        paragraphs: [
          'Preparation is the first step in successful newborn resuscitation. Before every delivery, ensure the following are ready:',
        ],
        bullets: [
          'Warm, dry towels — at least two',
          'A clean, flat, warm surface under a radiant warmer',
          'Functioning suction device (bulb syringe or mechanical)',
          'Self-inflating bag with correctly sized mask — size 0 for preterm, size 1 for term newborns',
          'A designated person assigned to the newborn at every delivery — not the person conducting the delivery',
        ],
      },
      {
        heading: 'Birth to 30 Seconds — Dry, Stimulate, Position',
        paragraphs: [
          'Immediately after birth, take these actions without delay:',
        ],
        bullets: [
          'Place the baby on a warm surface under a radiant warmer',
          'Dry vigorously with a warm dry cloth — the stimulation of drying often triggers breathing on its own',
          'Position the airway — place a small rolled cloth under the shoulders to slightly extend the neck into the neutral position (not hyperextended, not flexed)',
          'Clear the airway only if secretions are visible — suction the mouth first, then the nose',
          'Remove the wet cloth and replace with a dry one',
        ],
      },
      {
        heading: 'At 30 Seconds — Assess the Newborn',
        paragraphs: [
          'Pause at 30 seconds and assess three things:',
        ],
        bullets: [
          'Is the baby breathing or crying?',
          'Is the heart rate above 100 beats per minute?',
          'Is muscle tone improving — is the baby moving its limbs?',
        ],
      },
      {
        heading: 'If the Baby is Breathing — Routine Newborn Care',
        bullets: [
          'Skin-to-skin contact with the mother immediately',
          'Delayed cord clamping for at least 1–3 minutes',
          'Vitamin K 1 mg intramuscularly in the anterolateral thigh',
          'Eye care with tetracycline ointment',
          'Initiate breastfeeding within the first hour',
        ],
      },
      {
        heading: 'If the Baby is Not Breathing — Bag-and-Mask Ventilation',
        paragraphs: [
          'If the baby is not breathing after drying and stimulation, begin bag-and-mask ventilation immediately. Do not wait.',
        ],
        bullets: [
          'Use a correctly sized mask — it must cover the nose and mouth but not the eyes',
          'Achieve a good seal between the mask and face — no air leaks',
          'Give 40–60 ventilations per minute — approximately one breath every 1–1.5 seconds',
          'Watch for chest rise with each breath — this confirms correct technique',
          'If no chest rise: recheck mask seal, reposition the head, clear secretions',
        ],
      },
      {
        heading: 'End of the Golden Minute — Reassess at 60 Seconds',
        bullets: [
          'Heart rate above 100 and baby breathing: continue supportive care and monitor closely',
          'Heart rate 60–100 and improving: continue ventilation, reassess every 30 seconds',
          'Heart rate below 60: begin chest compressions and call for emergency support immediately — do not delay',
        ],
      },
      {
        heading: 'Vitamin K — Essential for Every Newborn',
        paragraphs: [
          'All newborns must receive Vitamin K 1 mg intramuscularly — in the anterolateral thigh — after birth to prevent Haemorrhagic Disease of the Newborn (HDN). This applies to all births regardless of gestation or mode of delivery. Do not skip this step.',
        ],
      },
      {
        heading: 'Kangaroo Mother Care for Low Birth Weight Babies',
        paragraphs: [
          'For babies born below 2.5 kg, Kangaroo Mother Care (KMC) — sustained skin-to-skin contact between the baby and mother — stabilises temperature without an incubator, supports breastfeeding, reduces infection risk, and improves weight gain. Begin KMC as early as possible, ideally within the first hour once the baby is stable.',
        ],
      },
      {
        heading: 'Learn Newborn Resuscitation Online — Free, with INC CNE Credits',
        paragraphs: [
          'The Care of New Born and Newborn Resuscitation course on Aastrika Sphere covers essential newborn care, step-by-step resuscitation technique, bag-and-mask ventilation, Vitamin K administration, and Kangaroo Mother Care. It was developed by the Indian Nursing Council and Maternity Foundation.',
          'Duration: approximately 4 hours of self-paced learning. Earns 5 INC CNE credit hours on completion. Rated 4.7 out of 5 by over 8,000 learners. Free to enroll — open batch with no deadline.',
        ],
        cta: {
          text: 'Enroll free — Care of New Born and Newborn Resuscitation',
          route: '/public/toc/overview/do_1136208573316628481954',
        },
      },
    ],
  },
  {
    slug: 'newborn-care-hindi-nurses-asha-guide',
    title: 'नवजात शिशु की देखभाल: हर नर्स को पता होनी चाहिए ये जरूरी बातें',
    metaTitle: 'नवजात शिशु की देखभाल — हर नर्स के लिए गाइड | Aastrika Sphere',
    metaDescription:
      'बीमार नवजात शिशु की देखभाल कैसे करें — नवजात पीलिया, सेप्सिस, KMC और खतरे के संकेत। INC से 7.5 CNE क्रेडिट के साथ हिंदी में फ्री कोर्स।',
    keywords:
      'नवजात शिशु देखभाल, बीमार नवजात लक्षण, नवजात पीलिया, नवजात सेप्सिस, KMC kangaroo mother care, newborn care Hindi nurses ANM',
    excerpt:
      'नवजात शिशु का जीवन का पहला महीना सबसे नाजुक होता है। बीमारी के लक्षण समय रहते न पहचाने जाएं तो स्थिति गंभीर हो सकती है। ANM, GNM और नर्सों के लिए यह पूरी गाइड।',
    publishedDate: 'May 2026',
    readTime: '5 min read',
    sections: [
      {
        heading: 'नवजात शिशु में खतरे के संकेत (Danger Signs)',
        paragraphs: [
          'नीचे दिए किसी भी लक्षण को देखते ही तुरंत चिकित्सक को सूचित करें:',
        ],
        bullets: [
          'सांस लेने में कठिनाई — श्वास दर 60 से अधिक या 30 से कम प्रति मिनट, या छाती का अंदर धंसना',
          'दूध न पीना — 8 घंटे से अधिक समय से फीडिंग बंद',
          'बुखार या हाइपोथर्मिया — तापमान 37.5°C से अधिक या 36°C से कम',
          'पीलापन — जन्म के 24 घंटे के अंदर दिखे, या हाथों-पैरों तक फैल जाए',
          'नाभि में लालिमा या मवाद — नाभि संक्रमण का संकेत',
          'झटके (Convulsions) — हाथ-पैरों का अनियंत्रित हिलना',
          'सुस्ती या बेहोशी — शिशु जागता नहीं, उत्तेजना पर प्रतिक्रिया नहीं देता',
        ],
      },
      {
        heading: 'नवजात पीलिया (Neonatal Jaundice)',
        paragraphs: [
          'पीलिया नवजातों में बहुत आम है — लेकिन हर पीलिया सामान्य नहीं होता।',
        ],
        bullets: [
          'सामान्य पीलिया: जन्म के 2–3 दिन बाद शुरू होता है, केवल चेहरे और छाती तक सीमित, 7–10 दिन में अपने आप ठीक हो जाता है',
          'खतरनाक पीलिया — तुरंत रेफर करें अगर: जन्म के 24 घंटे के अंदर दिखे',
          'खतरनाक पीलिया — तुरंत रेफर करें अगर: हाथों और तलवों तक फैल जाए',
          'खतरनाक पीलिया — तुरंत रेफर करें अगर: बच्चा दूध न पिए या बहुत सुस्त हो',
          'इन स्थितियों में तत्काल फोटोथेरेपी जरूरी है',
        ],
      },
      {
        heading: 'नवजात सेप्सिस (Neonatal Sepsis)',
        paragraphs: [
          'नवजात सेप्सिस — रक्त में संक्रमण — नवजात मृत्यु का एक प्रमुख कारण है। इसे जल्दी पहचानना जरूरी है।',
        ],
        bullets: [
          'शरीर का तापमान असामान्य — बहुत ऊंचा या बहुत कम',
          'दूध पीना बंद कर देना',
          'सांस लेने में तकलीफ या अनियमित सांस',
          'त्वचा का रंग पीला, नीला या धूसर होना',
          'पेट फूलना या पेट में कड़ापन',
        ],
      },
      {
        heading: 'सेप्सिस में आपकी भूमिका',
        bullets: [
          'लक्षण पहचानें — ऊपर दिए संकेतों को ध्यान से देखें',
          'चिकित्सक को तुरंत सूचित करें — देरी न करें',
          'IV एंटीबायोटिक जल्द से जल्द शुरू कराएं',
          'शिशु की श्वास दर, तापमान और फीडिंग पर नज़र रखें',
        ],
      },
      {
        heading: 'KMC — Kangaroo Mother Care: कम वजन के शिशुओं के लिए',
        paragraphs: [
          '2.5 kg से कम वजन के शिशु (LBW) को विशेष देखभाल चाहिए। KMC — माँ की छाती पर सीधे त्वचा से त्वचा का संपर्क — इसका सबसे प्रभावी तरीका है।',
        ],
        bullets: [
          'शरीर का तापमान स्थिर रहता है — इनक्यूबेटर की जरूरत कम होती है',
          'संक्रमण का खतरा कम होता है',
          'वजन तेजी से बढ़ता है',
          'स्तनपान आसान होता है',
          'माँ और शिशु का भावनात्मक बंधन मजबूत होता है',
        ],
      },
      {
        heading: 'EBM — Expressed Breast Milk: जब सीधा स्तनपान संभव न हो',
        bullets: [
          'माँ का दूध निकालकर (express करके) कप-स्पून से पिलाएं',
          'माँ का दूध कमरे के तापमान (25°C तक) पर 4 घंटे तक सुरक्षित रहता है',
          'बोतल से दूध न पिलाएं — इससे निप्पल कन्फ्यूजन होता है और स्तनपान छूट जाती है',
          'जितनी जल्दी हो सके सीधे स्तनपान की ओर लाएं',
        ],
      },
      {
        heading: 'ऑनलाइन सीखें — INC CNE क्रेडिट के साथ, बिल्कुल मुफ्त',
        paragraphs: [
          'केयर ऑफ़ सिक न्यू बोर्न कोर्स Aastrika Sphere पर हिंदी में उपलब्ध है। यह Indian Nursing Council (INC) द्वारा प्रमाणित है। विषय: नवजात सेप्सिस, पीलिया, LBW, KMC, EBM, खतरे के संकेत। अवधि: लगभग 4 घंटे, अपनी गति से। सफलतापूर्वक पूरा करने पर 7.5 INC CNE क्रेडिट मिलते हैं। रेटिंग: 4.8 में से 5। एनरोल: बिल्कुल मुफ्त।',
        ],
        cta: {
          text: 'अभी एनरोल करें — केयर ऑफ़ सिक न्यू बोर्न (हिंदी)',
          route: '/public/home',
        },
      },
    ],
  },
  {
    slug: 'integrated-sexual-reproductive-health-isrh-guide',
    title: 'Integrated Sexual and Reproductive Health (ISRH): A Complete Guide for Healthcare Workers',
    metaTitle: 'Integrated Sexual and Reproductive Health (ISRH) Guide | Aastrika Sphere',
    metaDescription:
      'A complete guide to Integrated Sexual and Reproductive Health (ISRH) for primary healthcare workers in India. Covers family planning, safe abortion, maternal health, and reproductive rights. Free UNFPA course with 7.5 CNE credits.',
    keywords:
      'ISRH integrated sexual reproductive health India, SRH training healthcare workers, family planning counselling nurses, safe abortion MTP act India, reproductive rights healthcare, UNFPA courses India',
    excerpt:
      'For nurses, midwives, doctors, and programme managers at the primary health care level, understanding the full spectrum of Integrated Sexual and Reproductive Health (ISRH) services is essential. This guide covers all five core components.',
    publishedDate: 'May 2026',
    readTime: '8 min read',
    sections: [
      {
        heading: 'What is ISRH?',
        paragraphs: [
          'ISRH stands for Integrated Sexual and Reproductive Health. It refers to the delivery of a comprehensive set of sexual and reproductive health services together, in a rights-based manner, rather than as separate vertical programmes.',
          'The integrated approach means a woman visiting a primary health centre for antenatal care also receives family planning counselling and STI screening — in one visit, by one provider. This is more efficient, reduces stigma, and improves outcomes.',
        ],
      },
      {
        heading: 'The Five Core Components of ISRH',
        bullets: [
          'Family Planning — counselling and provision of all contraceptive methods',
          'Safe Abortion — clinical management of induced abortion and post-abortion care',
          'Maternal Health — evidence-based antenatal and postpartum care',
          'Reproductive Rights — every person\'s right to make their own reproductive health decisions, free from coercion',
          'STI Prevention and Treatment — screening, counselling, and management of sexually transmitted infections',
        ],
      },
      {
        heading: 'Why ISRH Matters in India',
        bullets: [
          'Unmet need for family planning remains high — millions of women who wish to delay or limit pregnancies are not using any contraceptive method',
          'Unsafe abortion continues despite India\'s liberal MTP Act, largely due to provider knowledge gaps and facility-level barriers',
          'Fragmented service delivery — SRH programmes are often delivered separately, creating barriers and missed opportunities for patients',
          'Primary healthcare workers are the front line for closing these gaps',
        ],
      },
      {
        heading: 'Family Planning Counselling',
        paragraphs: [
          'Using the ALPAC counselling framework (Ask, Listen, Plan, Achieve, Clarify), a trained provider offers non-directive counselling on all contraceptive methods — oral pills, condoms, IUCD, injectables, implants, and sterilisation. Counselling must be tailored to the client\'s situation: postpartum women, adolescents, women with medical conditions.',
          'A rights-based approach means the client chooses freely. No method is pushed. Informed choice, not provider preference, drives the decision.',
        ],
      },
      {
        heading: 'Safe Abortion Services Under the MTP Act',
        paragraphs: [
          'Under the Medical Termination of Pregnancy (MTP) Act as amended in 2021, abortion is legal in India up to 20 weeks with one provider\'s approval, and up to 24 weeks for special categories including survivors of sexual assault, minors, and women with foetal anomalies.',
          'Medical abortion — mifepristone 200 mg followed by misoprostol 800 mcg — is the first-line treatment for early pregnancy termination up to 10 weeks. Post-abortion care and contraceptive counselling are essential follow-up services at every abortion visit.',
        ],
      },
      {
        heading: 'Evidence-Based Antenatal Care (ANC)',
        paragraphs: [
          'WHO and the Government of India recommend at least 8 ANC contacts during a normal pregnancy. The first contact should occur before 12 weeks and include haemoglobin testing, blood pressure monitoring, urine protein assessment, blood group, and HIV testing.',
        ],
        bullets: [
          'Iron-folic acid supplementation throughout pregnancy',
          'Tetanus toxoid (TT) vaccination',
          'High-Risk Pregnancy (HRP) identification — flag and refer early',
          'Birth planning and preparedness discussion at every visit',
          'Counsel on danger signs and when to seek care urgently',
        ],
      },
      {
        heading: 'Postpartum Care',
        bullets: [
          'Monitor for PPH, infection, and hypertension in the first 24 hours after delivery',
          'Counsel on Postpartum Family Planning (PPFP) — LAM, progestogen-only pill, IUCD',
          'Support exclusive breastfeeding for the first 6 months',
          'Screen for postpartum depression — ask, listen, refer if needed',
          'Ensure newborn care — Vitamin K, eye care, immunisation schedule',
        ],
      },
      {
        heading: 'Reproductive Rights in Practice',
        bullets: [
          'No coercion in family planning — the client decides which method to use, if any',
          'Full confidentiality for all patients, especially adolescents',
          'Practise Respectful Maternity Care (RMC) — no verbal abuse, no unnecessary procedures without consent',
          'Non-discrimination — every patient receives the same standard of care regardless of marital status, caste, or religion',
        ],
      },
      {
        heading: 'Learn ISRH Online — Free, Developed by UNFPA India',
        paragraphs: [
          'The Integrated Sexual and Reproductive Health (ISRH) course on Aastrika Sphere was developed by UNFPA India to provide a structured orientation on all five SRH components to primary healthcare providers. Content is based on WHO technical guidance documents, Government of India guidelines, and UNFPA India expertise.',
          'Duration: approximately 7.5 hours of self-paced learning. Earns 7.5 CNE credit hours on completion. Rated 4.69 out of 5 by over 600 learners. Free to enroll — open batch, no deadline. Note: this course provides foundational SRH knowledge and does not replace hands-on clinical training for specific procedures such as IUD insertion.',
        ],
        cta: {
          text: 'Enroll free — Integrated Sexual and Reproductive Health (ISRH)',
          route: '/public/toc/overview/do_11342648503935795211688/integrated-sexual-and-reproductive-health-isrh',
        },
      },
    ],
  },
]
