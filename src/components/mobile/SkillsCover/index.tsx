import { createEffect, createSignal, onMount, For, Show, Accessor, Setter } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Player } from 'lottie-solid';
import { Popup, PopupProps } from '@/components/mobile/Popup';
import { escapeFI } from '@/services/utils';
import * as dict from '@/locales/en/home.json';
import messages from '@/locales/en/skills.json';
import './index.css';

const illustrations = [
  '/lottie/laptop.json',
  '/lottie/trophy.json',
  '/lottie/art.json',
];

export default function SkillsCover(params: { out: Accessor<boolean>, setRef: Setter<HTMLDivElement | null> }) {
  const [elements, setElements] = createSignal<NodeListOf<Element>>();
  const [popupOpen, setPopupOpen] = createSignal(false);
  const [popupOut, setPopupOut] = createSignal(false);
  const [popupIndex, setPopupIndex] = createSignal(0);
  const [popupData, setPopupData] = createStore<PopupProps>({ message: '', buttons: [] });

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

  const openPopup = () => {
    setPopupData(messages[popupIndex()]);
    setPopupOpen(true);
    setPopupIndex((prev) => prev + 1);
  };

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
        <div
          class="actions animate hidden"
          classList={{ invisible: popupIndex() === messages.length && !popupOpen() }}
        >
          <button
            class="button btn-gradient"
            onClick={() => openPopup()}
          >
            {dict.skills.button}
          </button>
        </div>
      </div>
      <Show when={popupOpen()}>
        <Popup
          {...popupData}
          setOut={setPopupOut}
          out={popupOut}
          setOpen={setPopupOpen}
        />
      </Show>
    </div>
  );
}
