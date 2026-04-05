export const patchTutorProfileBody = {
  type: 'object',
  properties: {
    fullName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    bio: { type: 'string' },
    primarySubject: { type: 'string' },
    secondarySubject: { type: 'string' },
    groupRateUgx: { type: 'integer', minimum: 1 },
    oneOnOneRateUgx: { type: 'integer', minimum: 1 },
    district: { type: 'string' },
    teachingLevels: { type: 'array', items: { type: 'string' } },
    sessionMode: { type: 'string', enum: ['online', 'in_person', 'both'] },
    qualification: { type: 'string' },
    institution: { type: 'string' },
    graduationYear: { type: 'integer' },
    currentEmployer: { type: 'string' },
    yearsExperience: { type: 'string' },
  },
}

export const withdrawalBody = {
  type: 'object',
  required: ['amountUgx', 'method', 'accountDetail'],
  properties: {
    amountUgx: { type: 'integer', minimum: 1 },
    method: { type: 'string', enum: ['mtn_momo', 'airtel_money', 'bank_transfer'] },
    accountDetail: { type: 'string', minLength: 5 },
  },
}
