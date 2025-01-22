import { createEffect, createSignal, onMount } from 'solid-js';
import { useAppSelector } from '@/store/contextProvider';
import { getSystemTheme } from '@/services/utils';
import { ThemeType } from '@/constants/theme';
import '@/components/common/EasterEggs/console';

declare global {
  namespace CSS {
    const paintWorklet: {
      addModule: (url: string) => void;
    };
  }

  // noinspection JSUnusedGlobalSymbols
  interface Window {
    paintWorklet: {
      addModule: (url: string) => void;
    };
  }
}

export default function AppInit() {
  const [rootRef, setRootRef] = createSignal<HTMLElement | null>(null);

  const { themeService, viewTransitionService } = useAppSelector();

  onMount(() => {
    setRootRef(document.getElementById('root'));
  });

  createEffect(() => {
    const themeType = themeService.theme.type === ThemeType.SYSTEM ? getSystemTheme() : themeService.theme.type;
    document.body.classList.remove('light-theme');
    document.body.classList.remove('dark-theme');
    if (themeType === ThemeType.LIGHT) {
      document.body.classList.add('light-theme');
    } else if (themeType === ThemeType.DARK) {
      document.body.classList.add('dark-theme');
    }
  });

  createEffect(() => {
    rootRef()?.setAttribute('view-transition', viewTransitionService.viewTransition.type.toString());
  });

  (CSS.paintWorklet || window.paintWorklet)?.addModule('/js/squircle.js');

  return null;
}
