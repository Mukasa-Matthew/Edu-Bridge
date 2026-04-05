/** Multipart fields for POST /api/materials — validated in route after parse. */
export const materialUploadFields = {
  title: { type: 'string' },
  description: { type: 'string' },
  materialType: { type: 'string' },
  subject: { type: 'string' },
  educationLevel: { type: 'string' },
  levelCategory: { type: 'string' },
  year: { type: 'string' },
}
