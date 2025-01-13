import { createEffect, createSignal, onMount, For, Accessor, Setter } from 'solid-js';
import './index.css';

export interface Button {
  text: string;
  class: string;
}

export interface PopupProps {
  message: string;
  buttons: Button[];
}

export function Popup(params: {
  out: Accessor<boolean>,
  setOut: Setter<boolean>,
  setOpen: Setter<boolean>,
} & PopupProps) {
  const [elements, setElements] = createSignal<NodeListOf<Element>>();
  const [root, setRoot] = createSignal<HTMLDivElement | null>(null);

  onMount(() => {
    setTimeout(() => setElements(root()?.querySelectorAll('.animate')), 100);
  });

  createEffect(() => {
    if (params.out()) {
      elements()?.forEach((el) => el.classList.add('hidden'));
    } else {
      elements()?.forEach((el) => el.classList.remove('hidden'));
    }
  });

  const closePopup = () => {
    params.setOut(true);
    setTimeout(() => {
      params.setOut(false);
      params.setOpen(false);
    }, 300);
  };

  return (
    <div class="popup" classList={{ out: params.out() }} ref={setRoot}>
      <div class="popup-background animate hidden" />
      <div class="popup-content animate hidden">
        <div class="text">
          <span>{params.message}</span>
        </div>
        <div class="popup-actions animate hidden">
          <For each={params.buttons}>
            {(button) => (
              <button
                class={`button ${button.class}`}
                onClick={closePopup}
              >
                {button.text}
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
