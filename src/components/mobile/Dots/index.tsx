import { createEffect, createSignal, For, onMount } from 'solid-js';
import './index.css';


export default function Dots(
  params: { pages: number, set: () => number, changeSet: ({ value }: { value: number }) => void, out: () => boolean },
) {
  const [elements, setElements] = createSignal<NodeListOf<Element>>();

  onMount(() => {
    setTimeout(() => setElements(document.querySelectorAll('.animate')), 100);
  });

  createEffect(() => {
    if (params.out()) {
      elements()?.forEach((el) => el.classList.add('hidden', 'out'));
    } else {
      elements()?.forEach((el) => el.classList.remove('hidden'));
    }
  });

  return (
    <div class="dots">
      <For each={Array(params.pages).fill(0)}>
        {(_, index) => (
          <div
            class="dot animate hidden"
            classList={{ active: params.set() === index() + 1 }}
            onClick={() => params.changeSet({ value: index() + 1 })}
          />
        )}
      </For>
    </div>
  );
}
