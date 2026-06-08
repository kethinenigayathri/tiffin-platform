export default function Modal({ title, onClose, children, footer, large }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${large ? "modal--lg" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{title}</h3>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}
