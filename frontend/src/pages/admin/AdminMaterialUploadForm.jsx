import { useState } from 'react'
import { apiFormJson } from '../../api/client.js'
import { useToast } from '../../context/ToastContext.jsx'

const EDUCATION_LEVELS = [
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' },
  { value: 'P4', label: 'P4' },
  { value: 'P5', label: 'P5' },
  { value: 'P6', label: 'P6' },
  { value: 'P7', label: 'P7' },
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
  { value: 'S4', label: 'S4' },
  { value: 'S5', label: 'S5' },
  { value: 'S6', label: 'S6' },
  { value: 'Year_1', label: 'University Year 1' },
  { value: 'Year_2', label: 'University Year 2' },
  { value: 'Year_3', label: 'University Year 3' },
  { value: 'Year_4', label: 'University Year 4' },
]

const LEVEL_CATEGORIES = [
  { value: 'Primary', label: 'Primary' },
  { value: 'Secondary', label: 'Secondary' },
  { value: 'University', label: 'University' },
]

const MATERIAL_TYPES = [
  { value: 'past_paper', label: 'Past Paper' },
  { value: 'revision_notes', label: 'Revision Notes' },
  { value: 'practice_questions', label: 'Practice Questions' },
  { value: 'video_notes', label: 'Video Notes' },
  { value: 'textbook_summary', label: 'Textbook Summary' },
]

/**
 * Admin upload: files go live immediately (backend auto-approves admin uploads).
 * @param {{ onUploaded?: () => void }} props
 */
export default function AdminMaterialUploadForm({ onUploaded }) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [materialType, setMaterialType] = useState('revision_notes')
  const [educationLevel, setEducationLevel] = useState('S4')
  const [levelCategory, setLevelCategory] = useState('Secondary')
  const [year, setYear] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) {
      toast.error('Please choose a PDF, DOC, or DOCX file.')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', title.trim() || 'Untitled')
      if (description.trim()) fd.append('description', description.trim())
      fd.append('subject', subject.trim() || 'General')
      fd.append('materialType', materialType)
      fd.append('educationLevel', educationLevel)
      fd.append('levelCategory', levelCategory)
      if (year.trim()) fd.append('year', year.trim())
      fd.append('file', file)
      const res = await apiFormJson('/api/materials', fd)
      toast.success(res?.message || 'Material published successfully.')
      setTitle('')
      setDescription('')
      setSubject('')
      setYear('')
      setFile(null)
      onUploaded?.()
    } catch (err) {
      toast.error(err.message || 'Upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-white to-sky-50/40 p-6 shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-navy">Upload material (admin)</h2>
          <p className="mt-1 max-w-2xl font-sans text-sm text-mid">
            Files you upload are <strong className="text-emerald-700">published immediately</strong> for students. Tutor uploads still require approval.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 font-heading text-xs font-semibold text-emerald-800">
          Live on publish
        </span>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="font-heading text-xs font-semibold text-navy">Title</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. UNEB Mathematics 2023"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="font-heading text-xs font-semibold text-navy">Description (optional)</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="font-heading text-xs font-semibold text-navy">Subject</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Mathematics"
          />
        </div>
        <div>
          <label className="font-heading text-xs font-semibold text-navy">Material type</label>
          <select
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
          >
            {MATERIAL_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-heading text-xs font-semibold text-navy">Education level</label>
          <select
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
          >
            {EDUCATION_LEVELS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-heading text-xs font-semibold text-navy">Level category</label>
          <select
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={levelCategory}
            onChange={(e) => setLevelCategory(e.target.value)}
          >
            {LEVEL_CATEGORIES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-heading text-xs font-semibold text-navy">Year (optional)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            min={1990}
            max={2035}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="font-heading text-xs font-semibold text-navy">File (PDF, DOC, DOCX — max 10MB)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="mt-1 block w-full font-sans text-sm text-mid file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:font-heading file:text-sm file:font-semibold file:text-white"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-navy px-6 py-2.5 font-heading text-sm font-semibold text-white shadow-sm transition hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? 'Uploading…' : 'Publish material'}
          </button>
        </div>
      </form>
    </section>
  )
}
