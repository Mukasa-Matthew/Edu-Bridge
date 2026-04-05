/** Student profile PATCH — validated loosely in route; extend as needed. */
export const patchStudentProfileBody = {
  type: 'object',
  properties: {
    fullName: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    schoolName: { type: 'string' },
    classLevel: { type: 'string' },
    district: { type: 'string' },
    physicalAddress: { type: 'string' },
    parentGuardianName: { type: 'string' },
    parentGuardianPhone: { type: 'string' },
    subjectsOfInterest: { type: 'array', items: { type: 'string' } },
  },
}

export const subscriptionRenewBody = {
  type: 'object',
  required: ['paymentMethod'],
  properties: {
    paymentMethod: { type: 'string', enum: ['mtn_momo', 'airtel_money', 'bank_transfer'] },
    paymentReference: { type: 'string' },
    accountHint: { type: 'string' },
  },
}
