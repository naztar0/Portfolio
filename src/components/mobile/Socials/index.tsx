import { createEffect, createSignal, For, Show, Accessor } from 'solid-js';
import Email from '@/assets/icons/email.svg';
import Github from '@/assets/icons/github.svg';
import Linkedin from '@/assets/icons/linkedin.svg';
import Telegram from '@/assets/icons/telegram.svg';
import Tag from '@/assets/icons/tag.svg';
import './index.css';

const socials = [
  {
    icon: Linkedin,
    link: 'https://linkedin.com/in/neulen/',
  },
  {
    icon: Telegram,
    link: 'https://t.me/NrTrN/',
  },
  {
    icon: Github,
    link: 'https://github.com/naztar0/',
  },
  {
    icon: Email,
    link: 'mailto:hello@neulen.dev',
  },
];

export default function Socials(params: { out: Accessor<boolean> }) {
  const [hide, setHide] = createSignal(true);
  const [show, setShow] = createSignal(false);
  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement | null>(null);
  const [rootRef, setRootRef] = createSignal<HTMLDivElement | null>(null);

  createEffect(() => {
    const root = rootRef();
    const button = buttonRef();

    if (params.out()) {
      button?.classList.add('hidden', 'out');
    } else {
      setTimeout(() => button?.classList.remove('hidden'), 100);
    }
    if (params.out() || hide()) {
      root?.classList.add('hidden');
      root?.querySelectorAll('.animate').forEach((el) => el.classList.add('hidden'));
      setTimeout(() => setShow(false), 500);
    } else {
      setShow(true);
      setTimeout(() => {
        root?.classList.remove('hidden');
        root?.querySelectorAll('.animate').forEach((el) => el.classList.remove('hidden'));
      }, 100);
    }
  });

  return (
    <>
      <button
        class="socials-button hidden"
        onClick={() => setHide((prev) => !prev)}
        ref={setButtonRef}
      >
        <Tag />
      </button>
      <Show when={show()}>
        <div
          class="socials hidden"
          onTouchEnd={() => setHide((prev) => !prev)}
          ref={setRootRef}
        >
          <div class="grid">
            <For each={socials}>
              {({ icon, link }) => (
                <a href={link} target="_blank" class="animate hidden">
                  {icon}
                </a>
              )}
            </For>
          </div>
        </div>
      </Show>
    </>
  );
}
