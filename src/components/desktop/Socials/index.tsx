import { createEffect, createSignal, For, onMount, Accessor } from 'solid-js';
import Email from '@/assets/icons/email.svg';
import Github from '@/assets/icons/github.svg';
import Linkedin from '@/assets/icons/linkedin.svg';
import Telegram from '@/assets/icons/telegram.svg';
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
    <div class="socials">
      <For each={socials}>
        {({ icon, link }) => (
          <a href={link} target="_blank" class="animate hidden">
            {icon}
          </a>
        )}
      </For>
    </div>
  );
}
