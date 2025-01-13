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

export default function SkillsCover(params: { out: Accessor<boolean>, setRef: Setter<HTMLDivElement | null> }) {
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
    <div class="skills-cover content" classList={{ out: params.out() }} ref={params.setRef}>
      <div class="illustrations animate hidden">
        <For each={illustrations}>
          {(illustration) => (
            <Player autoplay click src={illustration}/>
          )}
        </For>
      </div>
      <div class="text-actions">
        <div class="title animate hidden">
          <For each={dict.skills.title}>
            {(text) => escapeFI(<span>{text}</span>)}
          </For>
        </div>
        <div class="text text-themed animate hidden">
          <p>{dict.skills.text}</p>
        </div>
        <div class="actions animate hidden">
          <button class="button btn-gradient">{dict.skills.button}</button>
        </div>
      </div>
    </div>
  );
}
