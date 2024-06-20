import { onMount, createEffect, createSignal, For } from 'solid-js';
import { calculateAge } from '@/services/utils';
import { Player } from 'lottie-solid';
import * as dict from '@/locales/en/home.json';
import './index.css';

const age = calculateAge(new Date(2002, 8, 17));

const illustrations = [
  '/lottie/technologist.json',
];

export default function Greetings(params: { out: () => boolean }) {
  const [elements, setElements] = createSignal<NodeListOf<Element>>();

  onMount(() => {
    setTimeout(() => setElements(document.querySelectorAll('.animate')), 100);
  });

  createEffect(() => {
    if (params.out()) {
      elements()?.forEach((el) => el.classList.add('hidden'));
    } else {
      elements()?.forEach((el) => el.classList.remove('hidden'));
    }
  });

  return (
    <div class="greetings content left" classList={{ out: params.out() }}>
      <div class="text-actions" style={{ width: '62%' }}>
        <div class="title animate hidden">
          <For each={dict.greetings.title}>
            {(text) => <span>{text}</span>}
          </For>
        </div>
        <div class="text text-themed animate hidden">
          <For each={dict.greetings.text}>
            {(text) => <p>{text.replace('{age}', age.toString())}</p>}
          </For>
        </div>
      </div>
      <div class="illustrations animate hidden">
        <For each={illustrations}>
          {(illustration) => (
            <Player autoplay click src={illustration} />
          )}
        </For>
      </div>
    </div>
  );
}
