import { createEffect, createSignal, onMount, For, Accessor, Setter } from 'solid-js';
import { Player } from 'lottie-solid';
import { escapeFI } from '@/services/utils';
import * as dict from '@/locales/en/home.json';
import './index.css';

const illustrations = [
  '/lottie/laptop.json',
  '/lottie/trophy.json',
  '/lottie/art.json',
];

export default function SkillsCover(params: { out: Accessor<boolean>, setOutAll: Setter<boolean> }) {
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

  const changePage = (page: string) => {
    document.body.classList.add('out-up');
    setTimeout(() => {
      location.assign(page);
    }, 500);
  };

  return (
    <div class="skills-cover content left" classList={{ out: params.out() }}>
      <div class="text-actions" style={{ width: '58%' }}>
        <div class="title animate hidden">
          <For each={dict.skills.title}>
            {(text) => escapeFI(<span>{text}</span>)}
          </For>
        </div>
        <div class="text text-themed animate hidden">
          <p>{dict.skills.text}</p>
        </div>
        <div
          class="actions animate hidden"
          onClick={() => changePage('/skills')}
        >
          <button class="button btn-gradient">{dict.skills.button}</button>
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
