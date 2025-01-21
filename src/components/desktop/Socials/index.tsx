import { createEffect, createSignal, For, onMount, Accessor } from 'solid-js';
import * as config from '@/config';
import Email from '@/assets/icons/email.svg';
import Github from '@/assets/icons/github.svg';
import Linkedin from '@/assets/icons/linkedin.svg';
import Telegram from '@/assets/icons/telegram.svg';
import './index.css';

const socials = [
  {
    icon: Linkedin,
    link: config.LINKEDIN_LINK,
  },
  {
    icon: Telegram,
    link: config.TELEGRAM_LINK,
  },
  {
    icon: Github,
    link: config.GITHUB_LINK,
  },
  {
    icon: Email,
    link: config.EMAIL_LINK,
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
