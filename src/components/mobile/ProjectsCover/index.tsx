import { createEffect, createSignal, onMount, For, Accessor, Setter } from 'solid-js';
import { Player } from 'lottie-solid';
import * as dict from '@/locales/en/home.json';
import './index.css';

const illustrations = [
  '/lottie/robot.json',
  '/lottie/phone.json',
  '/lottie/gamepad.json',
];

export default function ProjectsCover(params: {
  out: Accessor<boolean>,
  setOutAll: Setter<boolean>,
  setRef: Setter<HTMLDivElement | null>,
}) {
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
    params.setOutAll(true);
    elements()?.forEach((el) => el.classList.add('hidden'));
    setTimeout(() => {
        location.assign(page);
    }, 300);
  };

  return (
    <div class="projects-cover content" classList={{ out: params.out() }} ref={params.setRef}>
      <div class="illustrations animate hidden">
        <For each={illustrations}>
          {(illustration) => (
            <Player autoplay click src={illustration}/>
          )}
        </For>
      </div>
      <div class="text-actions">
        <div class="title animate hidden">
          <For each={dict.projects.title}>
            {(text) => <span>{text}</span>}
          </For>
        </div>
        <div class="text text-themed animate hidden">
          <p>{dict.projects.text}</p>
        </div>
        <div class="actions animate hidden">
          <button
            class="button btn-gradient"
            onClick={() => changePage('/projects')}
          >
            {dict.projects.button}
          </button>
        </div>
      </div>
    </div>
  );
}
