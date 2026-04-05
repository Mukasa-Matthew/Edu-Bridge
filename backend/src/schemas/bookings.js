export const createBookingBody = {
  type: 'object',
  required: [
    'tutorId',
    'subject',
    'sessionType',
    'sessionMode',
    'scheduledAt',
    'durationMinutes',
    'amountStudentPays',
    'paymentMethod',
  ],
  properties: {
    tutorId: { type: 'string', format: 'uuid' },
    subject: { type: 'string', minLength: 1 },
    sessionType: { type: 'string', enum: ['group', 'one_on_one'] },
    sessionMode: { type: 'string', enum: ['online', 'in_person'] },
    scheduledAt: { type: 'string', minLength: 1 },
    durationMinutes: { type: 'integer', minimum: 1 },
    amountStudentPays: { type: 'integer', minimum: 1 },
    notes: { type: 'string' },
    meetingLink: { type: 'string' },
    paymentMethod: { type: 'string', enum: ['mtn_momo', 'airtel_money', 'bank_transfer'] },
    paymentReference: { type: 'string' },
  },
}

export const tutorResponseBody = {
  type: 'object',
  required: ['decision'],
  properties: {
    decision: { type: 'string', enum: ['accept', 'decline'] },
    declineReason: { type: 'string' },
  },
}

export const meetingLinkBody = {
  type: 'object',
  required: ['meetingLink'],
  properties: {
    meetingLink: { type: 'string', minLength: 1 },
  },
}

export const cancelBookingBody = {
  type: 'object',
  properties: {
    reason: { type: 'string' },
  },
}

export const reviewBody = {
  type: 'object',
  required: ['rating'],
  properties: {
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    comment: { type: 'string' },
  },
}
