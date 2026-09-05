import Modal from '../common/Modal'

function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} width="max-w-sm">
      <p className="text-sm leading-relaxed text-neutral-500">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmModal