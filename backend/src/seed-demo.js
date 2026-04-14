/**
 * Presentation / demo seed: approved tutors and active students (@gmail.com).
 * --reset deletes only the fixed list of demo emails below (not other @gmail.com users).
 *
 * Usage:
 *   DEMO_SEED_ENABLED=true npm run seed:demo
 *   DEMO_SEED_ENABLED=true npm run seed:demo -- --reset   # remove demo users first
 *   DEMO_SEED_ENABLED=true npm run seed:demo -- --materials-only  # refresh demo library only (needs demo tutors in DB)
 *
 * Login — all demo accounts share the same password (DEMO_SEED_PASSWORD or default):
 *   Students: mary01@gmail.com, peter01@gmail.com, sarah01@gmail.com, james01@gmail.com, grace01@gmail.com
 *   Tutors:   david01@gmail.com, ruth01@gmail.com, samuel01@gmail.com, florence01@gmail.com, michael01@gmail.com
 *
 * Also seeds approved study materials (PDFs under UPLOAD_DIR + sample video links) tagged DEMO_SEED_MATERIAL.
 */
import 'dotenv/config'
import pg from 'pg'
import bcrypt from 'bcrypt'
import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

/** Minimal valid PDF (single empty page) for demo downloads */
const DEMO_PDF_BYTES = Buffer.from(
  'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUvNC9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjEzMAoJSUVPRg==',
  'base64'
)

const DEFAULT_PASSWORD = '1100211Matt.'

const students = [
  {
    email: 'mary01@gmail.com',
    phone: '+256771000101',
    fullName: 'Mary Nakato',
    school: "St. Mary's Secondary School",
    classLevel: 'S5',
    levelCategory: 'Secondary',
    educationLevel: 'S5',
    district: 'Kampala',
    address: 'Ntinda, Kampala',
    parentName: 'Jane Nakato',
    parentPhone: '+256772000101',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    subscriptionActive: true,
  },
  {
    email: 'peter01@gmail.com',
    phone: '+256771000102',
    fullName: 'Peter Ocen',
    school: 'Gulu High School',
    classLevel: 'S4',
    levelCategory: 'Secondary',
    educationLevel: 'S4',
    district: 'Gulu',
    address: 'Pece Division, Gulu',
    parentName: 'James Ocen',
    parentPhone: '+256772000102',
    subjects: ['English', 'History'],
    subscriptionActive: true,
  },
  {
    email: 'sarah01@gmail.com',
    phone: '+256771000103',
    fullName: 'Sarah Akello',
    school: 'Ntare School',
    classLevel: 'S6',
    levelCategory: 'Secondary',
    educationLevel: 'S6',
    district: 'Mbarara',
    address: 'Kakoba, Mbarara',
    parentName: 'Rose Akello',
    parentPhone: '+256772000103',
    subjects: ['Biology', 'Chemistry', 'Mathematics'],
    subscriptionActive: true,
  },
  {
    email: 'james01@gmail.com',
    phone: '+256771000104',
    fullName: 'James Kwikiriza',
    school: 'Uganda Christian University',
    classLevel: 'Year 2',
    levelCategory: 'University',
    educationLevel: 'Year_2',
    district: 'Mukono',
    address: 'UCU Main Campus',
    parentName: 'Paul Kwikiriza',
    parentPhone: '+256772000104',
    subjects: ['Economics', 'Computer Studies'],
    subscriptionActive: false,
  },
  {
    email: 'grace01@gmail.com',
    phone: '+256771000105',
    fullName: 'Grace Namutebi',
    school: 'Jinja Secondary School',
    classLevel: 'S3',
    levelCategory: 'Secondary',
    educationLevel: 'S3',
    district: 'Jinja',
    address: 'Nile Crescent, Jinja',
    parentName: 'Esther Namutebi',
    parentPhone: '+256772000105',
    subjects: ['Mathematics', 'English'],
    subscriptionActive: false,
  },
]

const tutors = [
  {
    email: 'david01@gmail.com',
    phone: '+256781000201',
    fullName: 'David Wasswa',
    nationalId: 'CM880011AA',
    bio: 'UNEB examiner and Maths teacher with 6+ years of classroom and online experience.',
    primarySubject: 'Mathematics',
    secondarySubject: 'Physics',
    teachingLevels: ['O-Level', 'A-Level'],
    sessionMode: 'both',
    groupRate: 12000,
    oneOnOne: 28000,
    district: 'Kampala',
    rating: 4.85,
    reviews: 24,
    studentsTaught: 18,
  },
  {
    email: 'ruth01@gmail.com',
    phone: '+256781000202',
    fullName: 'Ruth Nalubega',
    nationalId: 'CM880022BB',
    bio: 'Literature and language specialist; helps learners excel in UNEB English.',
    primarySubject: 'English',
    secondarySubject: 'English Literature',
    teachingLevels: ['O-Level', 'A-Level', 'University'],
    sessionMode: 'online',
    groupRate: 10000,
    oneOnOne: 25000,
    district: 'Entebbe',
    rating: 4.92,
    reviews: 31,
    studentsTaught: 22,
  },
  {
    email: 'samuel01@gmail.com',
    phone: '+256781000203',
    fullName: 'Samuel Mugabi',
    nationalId: 'CM880033CC',
    bio: 'Chemistry & Biology tutor; practical-focused revision for S4–S6.',
    primarySubject: 'Chemistry',
    secondarySubject: 'Biology',
    teachingLevels: ['O-Level', 'A-Level'],
    sessionMode: 'in_person',
    groupRate: 15000,
    oneOnOne: 32000,
    district: 'Mbarara',
    rating: 4.7,
    reviews: 16,
    studentsTaught: 14,
  },
  {
    email: 'florence01@gmail.com',
    phone: '+256781000204',
    fullName: 'Florence Aijuka',
    nationalId: 'CM880044DD',
    bio: 'Humanities teacher — History, Geography, and exam technique for UNEB.',
    primarySubject: 'History',
    secondarySubject: 'Geography',
    teachingLevels: ['O-Level', 'A-Level'],
    sessionMode: 'both',
    groupRate: 9000,
    oneOnOne: 22000,
    district: 'Fort Portal',
    rating: 4.65,
    reviews: 11,
    studentsTaught: 9,
  },
  {
    email: 'michael01@gmail.com',
    phone: '+256781000205',
    fullName: 'Michael Seka',
    nationalId: 'CM880055EE',
    bio: 'Software basics, ICT, and Computer Studies for O-Level and A-Level.',
    primarySubject: 'Computer Studies',
    secondarySubject: null,
    teachingLevels: ['O-Level', 'A-Level'],
    sessionMode: 'online',
    groupRate: 11000,
    oneOnOne: 26000,
    district: 'Kampala',
    rating: 4.78,
    reviews: 19,
    studentsTaught: 15,
  },
]

/** Demo library rows — descriptions end with DEMO_SEED_MATERIAL for idempotency and reset safety */
const demoMaterials = [
  {
    tutorEmail: 'david01@gmail.com',
    title: 'UNEB Mathematics S4 — Paper 2 style practice',
    description:
      'Worked examples covering sequences, quadratics, and coordinate geometry. Use for mock exam warm-up.\n\nDEMO_SEED_MATERIAL',
    material_type: 'past_paper',
    subject: 'Mathematics',
    education_level: 'S4',
    level_category: 'Secondary',
    year: 2024,
    kind: 'pdf',
    display_file_name: 'UNEB_Maths_S4_Paper2_Practice.pdf',
    downloads: 48,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Quadratic equations & graphs — revision pack',
    description:
      'Summary of completing the square, the quadratic formula, and sketching parabolas for O-Level.\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'Mathematics',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'Maths_Quadratics_Revision.pdf',
    downloads: 112,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Video: Introduction to trigonometry (S5 · with quadratics & graphs unit)',
    description:
      'YouTube lesson — play inside the app. Pairs with Mathematics S5 trigonometry topics.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Mathematics',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=PJhM2Kmj13s',
    downloads: 203,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Video: Solving quadratic equations (pairs with quadratics revision pack)',
    description:
      'Aligned with the quadratic equations & graphs revision pack for S5 Mathematics.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Mathematics',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=jwYN6jtGv8k',
    downloads: 142,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Video: Sequences & patterns for Paper 2 (pairs with S4 Maths practice)',
    description:
      'Supports sequences and coordinate-style thinking for the S4 Mathematics paper-style set.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Mathematics',
    education_level: 'S4',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=EadCr6mhssA',
    downloads: 96,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Mechanics & waves — S5 Physics formula sheet',
    description:
      'Equations for motion, energy, SHM, and sound — one-page reference for Paper 1 revision.\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'Physics',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'Physics_S5_Mechanics_Formula_Sheet.pdf',
    downloads: 86,
  },
  {
    tutorEmail: 'ruth01@gmail.com',
    title: 'Grammar & composition — S5 essentials',
    description:
      'Tenses, reported speech, and formal letter layout with annotated examples.\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'English',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'English_S5_Grammar_Composition.pdf',
    downloads: 134,
  },
  {
    tutorEmail: 'samuel01@gmail.com',
    title: 'Genetics & evolution — S5 Biology notes',
    description:
      'Mendel, variation, natural selection, and exam command words explained briefly.\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'Biology',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'Biology_S5_Genetics_Evolution.pdf',
    downloads: 62,
  },
  {
    tutorEmail: 'ruth01@gmail.com',
    title: 'English Paper 1 — comprehension & inference toolkit',
    description:
      "Structures for answering inference, tone, and writer's purpose questions in UNEB format.\n\nDEMO_SEED_MATERIAL",
    material_type: 'revision_notes',
    subject: 'English',
    education_level: 'S6',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'English_Paper1_Comprehension_Toolkit.pdf',
    downloads: 67,
  },
  {
    tutorEmail: 'ruth01@gmail.com',
    title: 'Poetry & prose — essay planning frame',
    description:
      'Paragraph-by-paragraph plan for comparing themes, imagery, and voice (A-Level literature).\n\nDEMO_SEED_MATERIAL',
    material_type: 'textbook_summary',
    subject: 'English Literature',
    education_level: 'S6',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'Literature_Essay_Planning_Frame.pdf',
    downloads: 39,
  },
  {
    tutorEmail: 'samuel01@gmail.com',
    title: 'Organic chemistry essentials (S5)',
    description:
      'Functional groups, nomenclature, and basic mechanisms — condensed notes for rapid revision.\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'Chemistry',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'Chemistry_Organic_Essentials_S5.pdf',
    downloads: 91,
  },
  {
    tutorEmail: 'samuel01@gmail.com',
    title: 'Cell biology — exam-style questions',
    description:
      'Transport across membranes, cell division, and microscopy — short answers with mark schemes.\n\nDEMO_SEED_MATERIAL',
    material_type: 'practice_questions',
    subject: 'Biology',
    education_level: 'S4',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'Biology_Cell_Structure_Practice.pdf',
    downloads: 54,
  },
  {
    tutorEmail: 'florence01@gmail.com',
    title: 'Cold War & decolonisation — A-Level essay plans',
    description:
      'Key dates, causation chains, and two-sided arguments for Paper 3–style essays.\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'History',
    education_level: 'S6',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'History_ColdWar_Essay_Plans.pdf',
    downloads: 28,
  },
  {
    tutorEmail: 'florence01@gmail.com',
    title: 'Climate & weather — map skills & past-paper drills',
    description:
      'Station models, rainfall graphs, and 6-mark “explain” templates for Geography candidates.\n\nDEMO_SEED_MATERIAL',
    material_type: 'practice_questions',
    subject: 'Geography',
    education_level: 'S5',
    level_category: 'Secondary',
    year: 2023,
    kind: 'pdf',
    display_file_name: 'Geography_Climate_Map_Skills.pdf',
    downloads: 41,
  },
  {
    tutorEmail: 'michael01@gmail.com',
    title: 'Pseudocode, flowcharts & trace tables',
    description:
      'O-Level Computer Studies — loops, decisions, and dry-running algorithms before the practical paper.\n\nDEMO_SEED_MATERIAL',
    material_type: 'practice_questions',
    subject: 'Computer Studies',
    education_level: 'S4',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'ComputerStudies_Pseudocode_Workbook.pdf',
    downloads: 156,
  },
  {
    tutorEmail: 'michael01@gmail.com',
    title: 'Digital safety & ethics — classroom summary',
    description:
      'Password hygiene, copyright, and responsible use — one-page handout for teachers and students.\n\nDEMO_SEED_MATERIAL',
    material_type: 'textbook_summary',
    subject: 'Computer Studies',
    education_level: 'S3',
    level_category: 'Secondary',
    year: null,
    kind: 'pdf',
    display_file_name: 'ICT_Digital_Safety_Summary.pdf',
    downloads: 73,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Video: Velocity & motion graphs (pairs with S5 Physics mechanics sheet)',
    description:
      'Complements the mechanics & waves formula sheet for S5 Physics.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Physics',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=kKKM8YDuUek',
    downloads: 88,
  },
  {
    tutorEmail: 'ruth01@gmail.com',
    title: 'Video: English grammar foundations (pairs with S5 grammar & composition)',
    description:
      'Core grammar concepts aligned with the S5 English essentials pack.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'English',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=n4EJHsiLeeI',
    downloads: 121,
  },
  {
    tutorEmail: 'ruth01@gmail.com',
    title: 'Video: Reading comprehension strategies (pairs with Paper 1 toolkit)',
    description:
      'Supports the English Paper 1 comprehension & inference toolkit for S6.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'English',
    education_level: 'S6',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=5mgMZtMoPVY',
    downloads: 74,
  },
  {
    tutorEmail: 'ruth01@gmail.com',
    title: 'Video: Analysing poetry (pairs with literature essay planning frame)',
    description:
      'Literary devices and close reading — use with the poetry & prose essay planning frame.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'English Literature',
    education_level: 'S6',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=jAUGBPVtgzY',
    downloads: 59,
  },
  {
    tutorEmail: 'samuel01@gmail.com',
    title: 'Video: Natural selection & evolution (pairs with S5 genetics notes)',
    description:
      'Evolution overview aligned with genetics & evolution notes for S5 Biology.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Biology',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=6WMjOwWx4yU',
    downloads: 67,
  },
  {
    tutorEmail: 'samuel01@gmail.com',
    title: 'Video: Cell structure refresher (pairs with S4 cell biology practice)',
    description:
      'Quick recap of organelles and transport — matches S4 cell biology exam-style questions.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Biology',
    education_level: 'S4',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=8IlvNdrOl_0',
    downloads: 103,
  },
  {
    tutorEmail: 'samuel01@gmail.com',
    title: 'Video: Atomic structure & bonding intro (pairs with organic chemistry essentials)',
    description:
      'Foundation for functional groups and nomenclature in S5 Chemistry.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Chemistry',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=yfP0VTKPNW4',
    downloads: 91,
  },
  {
    tutorEmail: 'florence01@gmail.com',
    title: 'Video: Cold War in context (pairs with A-Level essay plans)',
    description:
      'Broad narrative to support Cold War & decolonisation essay planning for S6 History.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'History',
    education_level: 'S6',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=16EHKBAdtsI',
    downloads: 44,
  },
  {
    tutorEmail: 'florence01@gmail.com',
    title: 'Video: Climate zones & rainfall (pairs with geography map skills pack)',
    description:
      'Supports climate & weather map skills and past-paper-style geography answers.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Geography',
    education_level: 'S5',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=JTGueWjdZu8',
    downloads: 52,
  },
  {
    tutorEmail: 'michael01@gmail.com',
    title: 'Video: Intro to algorithms (pairs with pseudocode & flowcharts workbook)',
    description:
      'High-level intro to algorithms for S4 Computer Studies before trace tables.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Computer Studies',
    education_level: 'S4',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=eWDBDEEVSM3',
    downloads: 178,
  },
  {
    tutorEmail: 'michael01@gmail.com',
    title: 'Video: Internet safety basics (pairs with digital safety summary)',
    description:
      'Short overview of safe online behaviour — complements the S3 ICT digital safety handout.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Computer Studies',
    education_level: 'S3',
    level_category: 'Secondary',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=HxySrSbSY7U',
    downloads: 65,
  },
  {
    tutorEmail: 'michael01@gmail.com',
    title: 'Relational databases & SQL — Year 2 essentials',
    description:
      'Normalization to 3NF, joins, and exam-style query problems for undergraduate CS and CIS.\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'Computer Studies',
    education_level: 'Year_2',
    level_category: 'University',
    year: null,
    kind: 'pdf',
    display_file_name: 'Uni_CS_Year2_SQL_Essentials.pdf',
    downloads: 64,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Statistics for economics — probability & sampling',
    description:
      'Confidence intervals, hypothesis testing intuition, and reading regression output (intro course).\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'Economics',
    education_level: 'Year_2',
    level_category: 'University',
    year: null,
    kind: 'pdf',
    display_file_name: 'Uni_Econometrics_Intro_Year2.pdf',
    downloads: 52,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Macroeconomics: GDP, inflation & policy tools',
    description:
      'Short notes linking AD–AS, monetary vs fiscal policy, and typical long-question plans.\n\nDEMO_SEED_MATERIAL',
    material_type: 'textbook_summary',
    subject: 'Economics',
    education_level: 'Year_2',
    level_category: 'University',
    year: null,
    kind: 'pdf',
    display_file_name: 'Uni_Macro_Policy_Summary_Year2.pdf',
    downloads: 41,
  },
  {
    tutorEmail: 'ruth01@gmail.com',
    title: 'Academic writing & integrity at university',
    description:
      'Paraphrasing, referencing styles, and avoiding plagiarism — starter pack for Year 1–2 coursework.\n\nDEMO_SEED_MATERIAL',
    material_type: 'revision_notes',
    subject: 'English',
    education_level: 'Year_2',
    level_category: 'University',
    year: null,
    kind: 'pdf',
    display_file_name: 'Uni_Academic_Writing_Integrity.pdf',
    downloads: 88,
  },
  {
    tutorEmail: 'michael01@gmail.com',
    title: 'Video: SQL for beginners (pairs with Year 2 databases & SQL notes)',
    description:
      'Screen tutorial style overview — complements relational databases & SQL essentials.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Computer Studies',
    education_level: 'Year_2',
    level_category: 'University',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    downloads: 72,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Video: Supply & demand crash course (pairs with macroeconomics policy summary)',
    description:
      'Market basics aligned with GDP, inflation & policy tools for Year 2 Economics.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Economics',
    education_level: 'Year_2',
    level_category: 'University',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=9YzHOGsUp0g',
    downloads: 58,
  },
  {
    tutorEmail: 'david01@gmail.com',
    title: 'Video: Statistics & probability intuition (pairs with econometrics intro notes)',
    description:
      'Supports probability, sampling, and reading charts for introductory econometrics.\n\nDEMO_SEED_MATERIAL',
    material_type: 'video_notes',
    subject: 'Economics',
    education_level: 'Year_2',
    level_category: 'University',
    year: null,
    kind: 'video_link',
    video_url: 'https://www.youtube.com/watch?v=sQ7_VNIJIxc',
    downloads: 49,
  },
]

const trafficSeedPages = [
  { path: '/', weight: 1.0 },
  { path: '/tutors', weight: 0.66 },
  { path: '/programs', weight: 0.5 },
  { path: '/login', weight: 0.45 },
  { path: '/register/student', weight: 0.33 },
  { path: '/register/tutor', weight: 0.22 },
]

function demoEmailList() {
  return [...students.map((s) => s.email), ...tutors.map((t) => t.email)]
}

async function resetDemoUsers(client) {
  await client.query(`DELETE FROM website_page_analytics_daily WHERE source = 'demo_seed'`)
  const emails = demoEmailList()
  await client.query(`DELETE FROM materials WHERE uploaded_by IN (SELECT id FROM users WHERE email = ANY($1::text[]))`, [
    emails,
  ])
  await client.query(
    `DELETE FROM reviews WHERE student_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))
       OR tutor_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))`,
    [emails]
  )
  await client.query(`DELETE FROM payments WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))`, [
    emails,
  ])
  await client.query(
    `DELETE FROM bookings WHERE student_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))
       OR tutor_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))`,
    [emails]
  )
  await client.query(`DELETE FROM subscriptions WHERE student_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))`, [
    emails,
  ])
  const { rowCount } = await client.query(`DELETE FROM users WHERE email = ANY($1::text[])`, [emails])
  console.log(`[seed-demo] Removed ${rowCount} demo user(s).`)
}

async function seedDemoWebsiteAnalytics(client) {
  const { rows: tableRows } = await client.query(
    `SELECT to_regclass('public.website_page_analytics_daily') AS table_name`
  )
  if (!tableRows[0]?.table_name) {
    console.log('[seed-demo] Skipping website analytics seed: migration 015 not applied yet.')
    return
  }

  await client.query(`DELETE FROM website_page_analytics_daily WHERE source = 'demo_seed'`)

  const days = 45
  let inserted = 0
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - i)
    const weekday = day.getDay()
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.15 : 1
    const recencyBoost = i <= 14 ? 1.25 : 1
    const baseline = 420 + Math.floor(Math.random() * 120)

    for (const page of trafficSeedPages) {
      const views = Math.max(
        18,
        Math.round((baseline * page.weight + Math.random() * 28) * weekendBoost * recencyBoost)
      )
      const visitors = Math.max(8, Math.round(views * (0.58 + Math.random() * 0.12)))
      const avgSessionSeconds = Math.round(95 + Math.random() * 130)
      const bounceRate = Math.min(92, Math.max(18, 35 + Math.random() * 28))

      await client.query(
        `INSERT INTO website_page_analytics_daily (
          day, page_path, page_views, unique_visitors, avg_session_seconds, bounce_rate_percent, source
        ) VALUES ($1::date, $2, $3, $4, $5, $6, 'demo_seed')`,
        [
          day.toISOString().slice(0, 10),
          page.path,
          views,
          visitors,
          avgSessionSeconds,
          Number(bounceRate.toFixed(2)),
        ]
      )
      inserted += 1
    }
  }

  console.log(`[seed-demo] Added ${inserted} website analytics row(s) for admin demo charts.`)
}

function resolveUploadRoot() {
  const uploadDir = process.env.UPLOAD_DIR || './uploads'
  return path.isAbsolute(uploadDir) ? uploadDir : path.resolve(process.cwd(), uploadDir)
}

async function seedDemoMaterials(client, { replace = false } = {}) {
  const expected = demoMaterials.length

  if (replace) {
    const del = await client.query(`DELETE FROM materials WHERE description LIKE '%DEMO_SEED_MATERIAL%'`)
    console.log(`[seed-demo] Cleared ${del.rowCount} demo-tagged material row(s) for refresh.`)
  } else {
    const {
      rows: [{ count }],
    } = await client.query(
      `SELECT count(*)::int AS count FROM materials WHERE description LIKE '%DEMO_SEED_MATERIAL%'`
    )
    if (count >= expected) {
      console.log('[seed-demo] Demo study materials already present, skipping.')
      return
    }
    if (count > 0) {
      const del = await client.query(`DELETE FROM materials WHERE description LIKE '%DEMO_SEED_MATERIAL%'`)
      console.log(
        `[seed-demo] Replacing ${del.rowCount} partial/outdated demo material row(s) (expected ${expected}, had ${count}).`
      )
    }
  }

  const tutorIds = new Map()
  for (const email of tutors.map((t) => t.email)) {
    const { rows } = await client.query(`SELECT id FROM users WHERE email = $1`, [email])
    if (rows.length) tutorIds.set(email, rows[0].id)
  }

  const missing = demoMaterials.map((m) => m.tutorEmail).filter((e) => !tutorIds.has(e))
  if (missing.length) {
    console.log('[seed-demo] Skipping materials: demo tutor account(s) not found:', [...new Set(missing)].join(', '))
    return
  }

  const root = resolveUploadRoot()
  const pdfDir = path.join(root, 'materials', 'pdf')
  await fs.mkdir(pdfDir, { recursive: true })

  let inserted = 0
  for (const m of demoMaterials) {
    const uploadedBy = tutorIds.get(m.tutorEmail)
    if (m.kind === 'video_link') {
      await client.query(
        `INSERT INTO materials (
          title, description, material_type, subject, education_level, level_category, year,
          file_type, file_url, video_url, file_size, file_name, uploaded_by, uploader_role,
          approval_status, download_count
        ) VALUES ($1, $2, $3::material_type, $4, $5::education_level, $6::level_category, $7,
          'video_link'::material_file_type, NULL, $8, NULL, NULL, $9, 'tutor'::user_role,
          'approved'::material_approval_status, $10)`,
        [
          m.title,
          m.description,
          m.material_type,
          m.subject,
          m.education_level,
          m.level_category,
          m.year,
          m.video_url,
          uploadedBy,
          m.downloads,
        ]
      )
      inserted += 1
      continue
    }

    const storedName = `demo-seed-${randomUUID()}.pdf`
    const relPath = `materials/pdf/${storedName}`
    const abs = path.join(pdfDir, storedName)
    await fs.writeFile(abs, DEMO_PDF_BYTES)

    await client.query(
      `INSERT INTO materials (
        title, description, material_type, subject, education_level, level_category, year,
        file_type, file_url, video_url, file_size, file_name, uploaded_by, uploader_role,
        approval_status, download_count
      ) VALUES ($1, $2, $3::material_type, $4, $5::education_level, $6::level_category, $7,
        'pdf'::material_file_type, $8, NULL, $9, $10, $11, 'tutor'::user_role,
        'approved'::material_approval_status, $12)`,
      [
        m.title,
        m.description,
        m.material_type,
        m.subject,
        m.education_level,
        m.level_category,
        m.year,
        relPath,
        DEMO_PDF_BYTES.length,
        m.display_file_name,
        uploadedBy,
        m.downloads,
      ]
    )
    inserted += 1
  }

  console.log(`[seed-demo] Added ${inserted} approved study material(s) with sample files.`)
}

async function seedStudents(client, passwordHash) {
  for (const s of students) {
    const { rows: existing } = await client.query(`SELECT id FROM users WHERE email = $1`, [s.email])
    if (existing.length) {
      console.log(`[seed-demo] Skip student (exists): ${s.email}`)
      continue
    }
    await client.query('BEGIN')
    try {
      const {
        rows: [u],
      } = await client.query(
        `INSERT INTO users (email, phone, password_hash, role, account_status, full_name, email_verified)
         VALUES ($1, $2, $3, 'student', 'active', $4, true)
         RETURNING id`,
        [s.email, s.phone, passwordHash, s.fullName]
      )
      const subExpires = s.subscriptionActive ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
      await client.query(
        `INSERT INTO student_profiles (
          user_id, school_name, class_level, level_category, district, physical_address,
          parent_guardian_name, parent_guardian_phone, subjects_of_interest, subscription_status, subscription_expires_at
        ) VALUES ($1, $2, $3::education_level, $4::level_category, $5, $6, $7, $8, $9, $10::subscription_status, $11)`,
        [
          u.id,
          s.school,
          s.educationLevel,
          s.levelCategory,
          s.district,
          s.address,
          s.parentName,
          s.parentPhone,
          s.subjects,
          s.subscriptionActive ? 'active' : 'inactive',
          subExpires,
        ]
      )
      if (s.subscriptionActive) {
        await client.query(
          `INSERT INTO subscriptions (student_id, amount_ugx, status, start_date, expiry_date, payment_method, payment_reference)
           VALUES ($1, 10000, 'active', now(), $2, 'mtn_momo', $3)`,
          [u.id, subExpires, `DEMO-SUB-${u.id.slice(0, 8)}`]
        )
      }
      await client.query('COMMIT')
      console.log(`[seed-demo] Student: ${s.fullName} <${s.email}>`)
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    }
  }
}

async function seedTutors(client, passwordHash) {
  for (const t of tutors) {
    const { rows: existing } = await client.query(`SELECT id FROM users WHERE email = $1`, [t.email])
    if (existing.length) {
      console.log(`[seed-demo] Skip tutor (exists): ${t.email}`)
      continue
    }
    await client.query('BEGIN')
    try {
      const {
        rows: [u],
      } = await client.query(
        `INSERT INTO users (email, phone, password_hash, role, account_status, full_name, email_verified)
         VALUES ($1, $2, $3, 'tutor', 'active', $4, true)
         RETURNING id`,
        [t.email, t.phone, passwordHash, t.fullName]
      )
      await client.query(
        `INSERT INTO tutor_profiles (
          user_id, national_id, highest_qualification, institution_attended, graduation_year,
          current_employer, years_experience, bio, primary_subject, secondary_subject,
          teaching_levels, session_mode, group_session_rate_ugx, one_on_one_rate_ugx, district,
          average_rating, total_reviews, total_students, tutor_status
        ) VALUES (
          $1, $2, 'bachelor'::qualification_level, 'Uganda Christian University', 2019,
          'EduBridge / Private tutoring', 'y3_5'::experience_band, $3, $4, $5,
          $6, $7::session_mode_type, $8, $9, $10,
          $11, $12, $13, 'approved'::tutor_approval_status
        )`,
        [
          u.id,
          t.nationalId,
          t.bio,
          t.primarySubject,
          t.secondarySubject,
          t.teachingLevels,
          t.sessionMode,
          t.groupRate,
          t.oneOnOne,
          t.district,
          t.rating,
          t.reviews,
          t.studentsTaught,
        ]
      )
      await client.query('COMMIT')
      console.log(`[seed-demo] Tutor: ${t.fullName} <${t.email}>`)
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    }
  }
}

async function seedSampleBookings(client) {
  const maryEmail = students[0].email
  const davidEmail = tutors[0].email
  const { rows: st } = await client.query(`SELECT u.id AS student_id FROM users u WHERE u.email = $1`, [maryEmail])
  const { rows: tu } = await client.query(`SELECT u.id AS tutor_id FROM users u WHERE u.email = $1`, [davidEmail])
  if (!st.length || !tu.length) return

  const studentId = st[0].student_id
  const tutorId = tu[0].tutor_id

  const { rows: existing } = await client.query(
    `SELECT 1 FROM bookings WHERE student_id = $1 AND tutor_id = $2 AND notes = 'DEMO_SEED_BOOKING' LIMIT 1`,
    [studentId, tutorId]
  )
  if (existing.length) {
    console.log('[seed-demo] Sample bookings already present, skipping.')
    return
  }

  const amount = 28000
  const fee = Math.floor((amount * 20) / 100)
  const tutorEarn = amount - fee
  const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  const future = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)

  await client.query(
    `INSERT INTO bookings (
      student_id, tutor_id, subject, session_type, session_mode, scheduled_at, duration_minutes,
      amount_student_pays, platform_fee, tutor_earnings, status, notes
    ) VALUES
      ($1, $2, 'Mathematics', 'one_on_one', 'online', $3, 60, $4, $5, $6, 'completed', 'DEMO_SEED_BOOKING'),
      ($1, $2, 'Mathematics', 'one_on_one', 'online', $7, 90, $4, $5, $6, 'accepted', 'DEMO_SEED_BOOKING')`,
    [studentId, tutorId, past, amount, fee, tutorEarn, future]
  )
  console.log('[seed-demo] Added sample bookings (completed + upcoming).')

  const { rows: done } = await client.query(
    `SELECT id, student_id, tutor_id FROM bookings WHERE notes = 'DEMO_SEED_BOOKING' AND status = 'completed' ORDER BY created_at ASC LIMIT 1`
  )
  if (done.length) {
    const { rows: hasRev } = await client.query(`SELECT 1 FROM reviews WHERE booking_id = $1`, [done[0].id])
    if (!hasRev.length) {
      await client.query(
        `INSERT INTO reviews (booking_id, student_id, tutor_id, rating, comment) VALUES ($1, $2, $3, 5, $4)`,
        [
          done[0].id,
          done[0].student_id,
          done[0].tutor_id,
          'Great tutor — helped me prepare for UNEB mocks.',
        ]
      )
      console.log('[seed-demo] Added sample review for completed demo booking.')
    }
  }
}

async function run() {
  if (process.env.DEMO_SEED_ENABLED !== 'true') {
    console.log('[seed-demo] Skipped: set DEMO_SEED_ENABLED=true in backend/.env')
    process.exit(0)
  }

  const plain = process.env.DEMO_SEED_PASSWORD || DEFAULT_PASSWORD
  const reset = process.argv.includes('--reset')
  const materialsOnly = process.argv.includes('--materials-only')

  const ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  const client = new pg.Client({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl,
  })

  await client.connect()
  console.log('[seed-demo] Connected.')

  try {
    if (materialsOnly) {
      await seedDemoMaterials(client, { replace: true })
      console.log('[seed-demo] Done (materials-only).')
      console.log('[seed-demo] Tip: log in as a Secondary student (e.g. grace01@gmail.com) to browse the library.')
      return
    }

    if (reset) await resetDemoUsers(client)

    const passwordHash = await bcrypt.hash(plain, 12)
    await seedStudents(client, passwordHash)
    await seedTutors(client, passwordHash)
    await seedDemoMaterials(client)
    await seedSampleBookings(client)
    await seedDemoWebsiteAnalytics(client)

    console.log('[seed-demo] Done.')
    console.log(`[seed-demo] Password for all demo accounts: ${plain}`)
    console.log('[seed-demo] Student logins:', students.map((s) => s.email).join(', '))
    console.log('[seed-demo] Tutor logins:', tutors.map((t) => t.email).join(', '))
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('[seed-demo] Fatal:', err)
  process.exit(1)
})
