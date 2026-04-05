/** Map frontend class/year labels to DB education_level enum */
export function mapEducationLevel(classLevel) {
  const m = {
    'S.1': 'S1',
    'S.2': 'S2',
    'S.3': 'S3',
    'S.4': 'S4',
    'S.5': 'S5',
    'S.6': 'S6',
    'Year 1': 'Year_1',
    'Year 2': 'Year_2',
    'Year 3': 'Year_3',
    'Year 4': 'Year_4',
    P1: 'P1',
    P2: 'P2',
    P3: 'P3',
    P4: 'P4',
    P5: 'P5',
    P6: 'P6',
    P7: 'P7',
  }
  const v = m[classLevel]
  if (!v) throw new Error(`Unsupported class level: ${classLevel}`)
  return v
}

export function levelCategoryFromClass(classLevel) {
  if (classLevel.startsWith('P') || /^P\d/.test(classLevel)) return 'Primary'
  if (classLevel.startsWith('S.') || classLevel.startsWith('S')) return 'Secondary'
  if (classLevel.startsWith('Year')) return 'University'
  return 'Secondary'
}

export function mapQualification(q) {
  const m = {
    Certificate: 'certificate',
    Diploma: 'diploma',
    "Bachelor's Degree": 'bachelor',
    "Master's Degree": 'master',
    PhD: 'phd',
    Other: 'other',
  }
  const v = m[q]
  if (!v) throw new Error(`Unsupported qualification: ${q}`)
  return v
}

export function mapExperience(exp) {
  const m = {
    'Less than 1 year': 'lt_1',
    '1–2 years': 'y1_2',
    '3–5 years': 'y3_5',
    '6–10 years': 'y6_10',
    '10+ years': 'y10_plus',
  }
  const v = m[exp]
  if (!v) throw new Error(`Unsupported experience: ${exp}`)
  return v
}

export function mapSessionMode(mode) {
  const m = { online: 'online', inperson: 'in_person', both: 'both' }
  const v = m[mode]
  if (!v) throw new Error(`Unsupported session mode: ${mode}`)
  return v
}

export function teachingLevelsFromFlags(levels) {
  const out = []
  if (levels.olevel) out.push('O-Level')
  if (levels.alevel) out.push('A-Level')
  if (levels.uni) out.push('University')
  return out
}

export function dashboardUrlForRole(role) {
  if (role === 'tutor') return '/dashboard/tutor'
  if (role === 'admin') return '/dashboard/admin'
  return '/dashboard/student'
}
