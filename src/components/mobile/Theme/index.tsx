import { createEffect, createSignal, Switch, Match, Accessor, Setter } from 'solid-js';
import { useAppSelector } from '@/store/contextProvider';
import { ThemeType } from '@/constants/theme';
import { getSystemTheme } from '@/services/utils';
import { ViewTransitionType } from '@/constants/viewTransition';
import LightMode from '@/assets/icons/light_mode.svg';
import DarkMode from '@/assets/icons/dark_mode.svg';
import './index.css';


export default function Theme(params: { out: Accessor<boolean>, setOut: Setter<boolean> }) {
  const [theme, setTheme] = createSignal<ThemeType>(ThemeType.SYSTEM);
  const [ref, setRef] = createSignal<Element>();

  const { themeService, viewTransitionService } = useAppSelector();

  createEffect(() => {
    if (params.out()) {
      ref()?.classList.add('hidden', 'out');
    } else {
      setTimeout(() => ref()?.classList.remove('hidden'), 100);
    }
  });

  createEffect(() => {
    setTheme(themeService.theme.type === ThemeType.SYSTEM ? getSystemTheme() : themeService.theme.type);
  });

  const onClick = (e: MouseEvent) => {
    const newTheme = theme() === ThemeType.LIGHT ? ThemeType.DARK : ThemeType.LIGHT;
    const updateDOM = () => {
      setTheme(newTheme);
      themeService.updateThemeType(newTheme);
    };

    if (!document.startViewTransition) {
      updateDOM();
      return;
    }

    viewTransitionService.updateViewTransitionType(ViewTransitionType.ROOT_THEME);

    const x = e.clientX ?? innerWidth / 2;
    const y = e.clientY ?? innerHeight / 2;

    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );

    const transition = document.startViewTransition(updateDOM);

    transition.ready.then(() => {
      const clipPath = [
        `circle(0 at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      if (newTheme === ThemeType.LIGHT) {
        clipPath.reverse();
      }

      document.documentElement.style.setProperty(
        '--view-transition-z-index',
        newTheme === ThemeType.LIGHT ? '1' : '0',
      );

      document.documentElement.animate(
        { clipPath },
        {
          duration: 500,
          easing: 'ease-in',
          pseudoElement: `::view-transition-${newTheme === ThemeType.LIGHT ? 'old' : 'new'}(root-theme)`,
        }
      );
    });

    transition.finished.then(() => {
      viewTransitionService.updateViewTransitionType(ViewTransitionType.NONE);
    });
  };

  return (
    <div class="page-theme hidden" ref={setRef}>
      <button class="button" onClick={onClick}>
        <Switch>
          <Match when={theme() === ThemeType.LIGHT}>
            <DarkMode />
          </Match>
          <Match when={theme() === ThemeType.DARK}>
            <LightMode />
          </Match>
        </Switch>
      </button>
    </div>
  );
}
