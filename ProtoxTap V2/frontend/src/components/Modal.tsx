import type { FormEvent, ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  function stopSubmit(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" onSubmit={stopSubmit}>
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">x</button>
        </div>
        {children}
      </section>
    </div>
  );
}