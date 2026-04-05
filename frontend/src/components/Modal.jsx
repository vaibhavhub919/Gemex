const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 px-3 py-4 sm:px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-4 shadow-card sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-semibold text-ink sm:text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
