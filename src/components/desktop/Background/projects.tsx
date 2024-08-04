import { createSignal, createEffect, For, Setter } from 'solid-js';
import Extension1 from '@/assets/shapes/tags/browser-extension/1.svg';
import Extension2 from '@/assets/shapes/tags/browser-extension/2.svg';
import Extension3 from '@/assets/shapes/tags/browser-extension/3.svg';
import Extension4 from '@/assets/shapes/tags/browser-extension/4.svg';
import Extension5 from '@/assets/shapes/tags/browser-extension/5.svg';
import Extension6 from '@/assets/shapes/tags/browser-extension/6.svg';
import Telegram1 from '@/assets/shapes/tags/telegram/1.svg';
import Telegram2 from '@/assets/shapes/tags/telegram/2.svg';
import Telegram3 from '@/assets/shapes/tags/telegram/3.svg';
import Telegram4 from '@/assets/shapes/tags/telegram/4.svg';
import WebApp1 from '@/assets/shapes/tags/web-app/1.svg';
import WebApp2 from '@/assets/shapes/tags/web-app/2.svg';
import WebApp3 from '@/assets/shapes/tags/web-app/3.svg';
import WebApp4 from '@/assets/shapes/tags/web-app/4.svg';
import WebApp5 from '@/assets/shapes/tags/web-app/5.svg';
import ConsoleApp1 from '@/assets/shapes/tags/console-app/1.svg';
import ConsoleApp2 from '@/assets/shapes/tags/console-app/2.svg';
import ConsoleApp3 from '@/assets/shapes/tags/console-app/3.svg';
import ConsoleApp4 from '@/assets/shapes/tags/console-app/4.svg';
import ConsoleApp5 from '@/assets/shapes/tags/console-app/5.svg';
import ConsoleApp6 from '@/assets/shapes/tags/console-app/6.svg';
import AndroidApp1 from '@/assets/shapes/tags/android-app/1.svg';
import AndroidApp2 from '@/assets/shapes/tags/android-app/2.svg';
import AndroidApp3 from '@/assets/shapes/tags/android-app/3.svg';
import AndroidApp4 from '@/assets/shapes/tags/android-app/4.svg';
import AndroidApp5 from '@/assets/shapes/tags/android-app/5.svg';
import AndroidApp6 from '@/assets/shapes/tags/android-app/6.svg';
import DesktopApp1 from '@/assets/shapes/tags/desktop-app/1.svg';
import DesktopApp2 from '@/assets/shapes/tags/desktop-app/2.svg';
import DesktopApp3 from '@/assets/shapes/tags/desktop-app/3.svg';
import DesktopApp4 from '@/assets/shapes/tags/desktop-app/4.svg';
import DesktopApp5 from '@/assets/shapes/tags/desktop-app/5.svg';
import DesktopApp6 from '@/assets/shapes/tags/desktop-app/6.svg';
import Library1 from '@/assets/shapes/tags/library/1.svg';
import Library2 from '@/assets/shapes/tags/library/2.svg';
import Library3 from '@/assets/shapes/tags/library/3.svg';
import Library4 from '@/assets/shapes/tags/library/4.svg';
import Library5 from '@/assets/shapes/tags/library/5.svg';
import Library6 from '@/assets/shapes/tags/library/6.svg';
import './projects.css';

const SHAPES = [
  [Extension1, Extension2, Extension3, Extension4, Extension5, Extension6],
  [Telegram1, Telegram2, Telegram3, Telegram1, Telegram3, Telegram4],
  [WebApp1, WebApp2, WebApp3, WebApp4, WebApp3, WebApp5],
  [ConsoleApp1, ConsoleApp2, ConsoleApp3, ConsoleApp4, ConsoleApp5, ConsoleApp6],
  [AndroidApp1, AndroidApp2, AndroidApp3, AndroidApp4, AndroidApp5, AndroidApp6],
  [DesktopApp1, DesktopApp2, DesktopApp3, DesktopApp4, DesktopApp5, DesktopApp6],
  [Library1, Library2, Library3, Library4, Library5, Library6],
];

export default function Projects(params: { set: () => number, setRef: Setter<HTMLElement | null> }) {
  const [currentSet, setCurrentSet] = createSignal(0);
  const [out, setOut] = createSignal(false);

  let ref: HTMLElement | null = null;
  let fallbackTimeoutId: number = 0;

  createEffect(() => {
    if (currentSet() === params.set()) {
      return;
    }
    setOut(true);
    ref?.addEventListener('transitionend', () => {
      setOut(false);
      setCurrentSet(params.set());
    }, { once: true });
    // fallback if transitionend event doesn't fire
    clearTimeout(fallbackTimeoutId);
    fallbackTimeoutId = setTimeout(() => {
      setOut(false);
      setCurrentSet(params.set());
    }, 200);
  });

  const setRef = (el: HTMLElement) => {
    ref = el;
    params.setRef(el);
  };

  return (
    <div class="background first" ref={setRef}>
      <div class="overlay" />
      <div
        class={`bg-shapes set-${currentSet() + 1}`}
        classList={{ out: out() }}
      >
        <For each={SHAPES[currentSet()]}>
          {(shape) => <div class="shape">{shape}</div>}
        </For>
      </div>
      <div class="bg-ellipse" />
      <div class="bg-ellipse-after" />
    </div>
  );
}
