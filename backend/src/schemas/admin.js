export const listUsersQuery = {
  type: 'object',
  properties: {
    role: { type: 'string', enum: ['student', 'tutor', 'admin'] },
    status: { type: 'string', enum: ['active', 'pending', 'suspended'] },
  },
}
