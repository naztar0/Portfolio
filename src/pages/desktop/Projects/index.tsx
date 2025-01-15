import {createEffect, createSignal, onCleanup, onMount} from 'solid-js';
import Background from '@/components/desktop/Background';
import Socials from '@/components/desktop/Socials';
import Theme from '@/components/desktop/Theme';
import ProjectsHeader from '@/components/desktop/ProjectsHeader';
import ProjectsCarousel from '@/components/desktop/ProjectsCarousel';
import Back from '@/components/desktop/Back';
import PromoGallery from '@/components/desktop/PromoGallery';
import { useAppSelector } from '@/store/contextProvider';
import { getSystemTheme, generateGradientColor } from '@/services/utils';
import { ThemeType } from '@/constants/theme';
import * as dict from '@/locales/en/projects.json';
import './index.css';

export interface Project {
  name: string;
  title: string;
  logo: string;
  description: string;
  demo: string;
  source: string;
  promo: string[];
  stack: string[];
  tags: (keyof typeof TAGS)[];
  fontSizePx: number;
}

const WHEEL_THROTTLE = 400;

const TAGS = [
  'browser-extension',
  'telegram-bot',
  'web-app',
  'console-app',
  'android-app',
  'desktop-app',
  'library',
];

export const COLORS = {
    [TAGS[0]]: '#5324ff',
    [TAGS[1]]: '#2479ff',
    [TAGS[2]]: '#7c24ff',
    [TAGS[3]]: '#c27a1c',
    [TAGS[4]]: '#0dc774',
    [TAGS[5]]: '#2450ff',
    [TAGS[6]]: '#2479ff',
};

const projects: Project[] = dict.projects as Project[];

export default function Projects() {
  document.title = dict.title;

  const [out, setOut] = createSignal(false);
  const [index, setIndex] = createSignal(0);
  const [tagIndex, setTagIndex] = createSignal(0);
  const [expanded, setExpanded] = createSignal(false);
  const [promoData, setPromoData] = createSignal<string[] | null>(null);
  const [backgroundRef, setBackgroundRef] = createSignal<HTMLElement | null>(null);

  const { themeService } = useAppSelector();

  let wheelThrottleTime = 0;
  let fallbackTimeoutId: number = 0;

  const onWheel = (e: WheelEvent) => {
    if (promoData() || Date.now() - wheelThrottleTime < WHEEL_THROTTLE) {
      return;
    }
    wheelThrottleTime = Date.now();
    if (e.deltaY > 0 && index() < projects.length - 1) {
      changeProject({ type: 'next' });
    } else if (e.deltaY < 0 && index() > 0) {
      changeProject({ type: 'prev' });
    }
  };

  onMount(() => {
    document.addEventListener('wheel', onWheel);
    const style = getComputedStyle(document.documentElement);
    const theme = themeService.theme.type === ThemeType.SYSTEM ? getSystemTheme() : themeService.theme.type;
    document.documentElement.style.setProperty(
      '--custom-color-1',
      theme === ThemeType.LIGHT
        ? style.getPropertyValue('--bg-root-light')
        : style.getPropertyValue('--bg-root-dark')
    );
  });

  onCleanup(() => {
    document.removeEventListener('wheel', onWheel);
  });

  createEffect(() => {
    const background = backgroundRef();
    if (!background) {
      return;
    }
    const tagColor = COLORS[projects[index()].tags[0] as keyof typeof COLORS];
    const currentColor = document.documentElement.style.getPropertyValue('--custom-color-1');
    if (currentColor !== tagColor) {
      document.documentElement.style.setProperty('--custom-color-2', tagColor);
      document.documentElement.style.setProperty('--custom-color-3', generateGradientColor(tagColor, 60));
      background.addEventListener('transitionend', () => {
        document.documentElement.style.setProperty('--custom-color-1', tagColor);
        background.classList.remove('transition', 'first');
      }, { once: true });
      setTimeout(() => background.classList.add('transition'), 100);
    }
    // fallback if transitionend event doesn't fire
    clearTimeout(fallbackTimeoutId);
    fallbackTimeoutId = setTimeout(() => {
      const tagColor = COLORS[projects[index()].tags[0] as keyof typeof COLORS];
      document.documentElement.style.setProperty('--custom-color-1', tagColor);
      document.documentElement.style.setProperty('--custom-color-2', tagColor);
      document.documentElement.style.setProperty('--custom-color-3', generateGradientColor(tagColor, 60));
      background.classList.remove('transition');
    }, 1000);
  });

  createEffect(() => {
    setTagIndex(TAGS.indexOf(projects[index()].tags[0] as string));
  });

  const changeProject = ({ type, value }: { type?: 'next' | 'prev', value?: number }) => {
    setIndex((prev) => value ?? (type === 'next' ? prev + 1 : prev - 1));
  };

  return (
    <div class="projects">
      <Background page='projects' set={tagIndex} setRef={setBackgroundRef} />
      <div class="content">
        <ProjectsHeader
          projects={projects}
          index={index}
          setIndex={setIndex}
          out={out}
          expanded={expanded}
          setExpanded={setExpanded}
        />
        <ProjectsCarousel
          projects={projects}
          index={index}
          setIndex={setIndex}
          out={out}
          expanded={expanded}
          setPromoData={setPromoData}
        />
      </div>
      <PromoGallery
        promoData={promoData}
        setPromoData={setPromoData}
      />
      <Back page="/" out={out} setOut={setOut}/>
      <Socials out={out}/>
      <Theme out={out} setOut={setOut}/>
    </div>
  );
}
