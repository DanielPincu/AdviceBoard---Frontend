interface Props {
  isOpen: boolean
  editingId: string | null
  form: {
    title: string
    content: string
    anonymous: boolean
  }
  setForm: (v: { title: string; content: string; anonymous: boolean }) => void
  createError: string | null

  onCancel: () => void
  onSubmit: () => void
}

export default function AdviceModal({
  isOpen,
  editingId,
  form,
  setForm,
  createError,
  onCancel,
  onSubmit,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white/60 shadow-xl ring-1 ring-white/50 backdrop-blur-lg">
        <div className="rounded-t-xl bg-linear-to-r from-[#1f6feb] to-[#6ea8fe] px-4 py-2 text-sm font-semibold text-white shadow">
          {editingId ? 'Edit question or advice' : 'Ask question or give advice'}
        </div>
        <div className="p-6">
          <input
            className="mb-3 w-full rounded-md border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-3 py-2 text-base focus:outline-none"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="mb-3 w-full min-h-35 resize-y rounded-md border border-t-[#404040] border-l-[#404040] border-r-white border-b-white bg-white px-3 py-2 text-base focus:outline-none"
            placeholder="Content"
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />

          <label className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.anonymous}
              onChange={e => setForm({ ...form, anonymous: e.target.checked })}
            />
            Post anonymously
          </label>

          {createError && <p className="mb-3 text-sm text-red-600">{createError}</p>}

          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              className="rounded-md bg-linear-to-b from-[#eef5ff] to-[#cfe1ff] px-3 py-1.5 text-xs text-[#0b3d91] shadow ring-1 ring-white/50 hover:from-white hover:to-[#dbe9ff] active:translate-y-px"
            >
              {editingId ? 'Save changes' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}