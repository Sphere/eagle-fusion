/**
 * Content for the CNE hub at /public/cne-courses.
 *
 * Follows the same pattern as blog-articles.data.ts: the copy lives in a data file
 * in English rather than behind the translate pipe, because this page exists to rank
 * for English-language search queries ("cne online", "cne courses", "cne login") and
 * the wording is chosen to match them.
 *
 * This file holds only the explanatory prose. The course list lives in
 * cne-courses.generated.ts and is derived from the catalogue's `cneName` field —
 * never hand-maintain a course list here, or the page ends up claiming CNE credits
 * for courses that don't award any.
 */

export interface ICneSection {
  id: string
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface ICneFaq {
  question: string
  answer: string
}

export const CNE_INTRO =
  'CNE stands for Continuing Nursing Education — the structured, assessed learning the Indian ' +
  'Nursing Council requires registered nurses to complete in order to keep their knowledge current ' +
  'and maintain registration. Every CNE course on Aastrika Sphere is free, self-paced, works on any ' +
  'smartphone, and issues a certificate on completion.'

export const CNE_SECTIONS: ICneSection[] = [
  {
    id: 'what-is-cne',
    heading: 'What is CNE?',
    paragraphs: [
      'CNE — Continuing Nursing Education — is ongoing professional learning that nurses complete ' +
        'after qualifying. The Indian Nursing Council (INC) mandates it so that registered nurses keep ' +
        'their clinical knowledge current and maintain their registration.',
      'CNE credits are the unit it is measured in. One credit hour equals one hour of structured, ' +
        'assessed, INC-approved learning. Completing an INC-certified online course is the most ' +
        'straightforward way to earn them.',
    ],
  },
  {
    id: 'who-needs-cne',
    heading: 'Who needs CNE credits?',
    bullets: [
      'Registered Nurses (RN) renewing INC registration',
      'General Nursing and Midwifery (GNM) graduates',
      'Auxiliary Nurse Midwives (ANM)',
      'Staff nurses in government and private hospitals',
      'Community Health Officers (CHO)',
      'Multipurpose Workers (MPW) and ASHA workers taking accredited modules',
    ],
  },
  {
    id: 'how-many-credits',
    heading: 'How many CNE credits do you need?',
    paragraphs: [
      'The number of credit hours required for renewal is set by your state nursing council, and it ' +
        'differs from state to state. Check the requirement published by the council you are registered ' +
        'with before planning your courses.',
      'Courses on Aastrika Sphere carry different credit values, and each one below states exactly ' +
        'how many hours it awards — so you can pick a combination that meets your requirement.',
    ],
  },
]

export const CNE_STEPS: string[] = [
  'Register free at sphere.aastrika.org — you only need a mobile number.',
  'Pick a CNE course from the list above, or browse the full catalogue.',
  'Work through the modules at your own pace, on a phone or a computer.',
  'Pass the end-of-course assessment.',
  'Download your INC-certified certificate, showing the CNE credit hours earned.',
]

export const CNE_FAQS: ICneFaq[] = [
  {
    question: 'Are the CNE courses really free?',
    answer:
      'Yes. Every course on Aastrika Sphere is free to enroll and free to complete, including the ' +
      'certificate. There is no fee at any stage and no payment details are collected.',
  },
  {
    question: 'Do I get a certificate with CNE credits?',
    answer:
      'Yes. When you complete a course and pass its assessment, you receive an INC-certified digital ' +
      'certificate stating the CNE credit hours earned. You can download it, print it, and submit it ' +
      'as evidence for registration renewal.',
  },
  {
    question: 'How do I log in to my CNE courses?',
    answer:
      'Use the Login page on sphere.aastrika.org with the mobile number you registered with. Your ' +
      'course progress, completed modules and certificates are all kept in your account, so you can ' +
      'stop on one device and continue on another.',
  },
  {
    question: 'Is there a deadline to finish a course?',
    answer:
      'No. CNE courses run as open batches with no deadline, and they are self-paced. You can start ' +
      'today, pause, and pick the course up again whenever you have time.',
  },
  {
    question: 'Can I take CNE classes online on my phone?',
    answer:
      'Yes. Every course is built mobile-first and works on any smartphone browser, so you can study ' +
      'between shifts without needing a computer.',
  },
  {
    question: 'Are these CNE courses INC certified?',
    answer:
      'The courses marked INC-certified are accredited by the Indian Nursing Council and award INC CNE ' +
      'credit hours. Sphere also hosts courses from other bodies such as UNFPA and state nursing ' +
      'councils; each course page states who accredits it.',
  },
  {
    question: 'Are the courses available in Hindi?',
    answer:
      'Many are. Courses such as Care of Sick Newborn are offered in Hindi as well as English, and the ' +
      'platform interface itself can be switched between the two.',
  },
]
