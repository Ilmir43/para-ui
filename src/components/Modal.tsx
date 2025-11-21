import { JSX, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";

interface ModalProps {
  title?: string;
  onClose: () => void;
  children: JSX.Element;
}

export default function Modal(props: ModalProps) {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      props.onClose();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeydown);
  });

  return (
    <Portal>
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal" role="document">
          <div class="modal__header">
            <div class="modal__title">{props.title}</div>
            <button class="btn-text" type="button" aria-label="Закрыть" onClick={props.onClose}>
              ×
            </button>
          </div>
          <div class="modal__body">{props.children}</div>
        </div>
        <button class="modal-backdrop__overlay" type="button" aria-label="Закрыть" onClick={props.onClose} />
      </div>
    </Portal>
  );
}
