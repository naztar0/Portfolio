import { JSX, Show, createSignal, createEffect, Switch, Match, For, Accessor, Setter } from 'solid-js';
import { Project, COLORS } from '@/pages/desktop/Projects';
import Stack from '@/components/desktop/Stack';
import { LogoSquircle } from '@/components/common/ProjectDetails/canvas';
import { useAppSelector } from '@/store/contextProvider';
import { ViewTransitionType } from '@/constants/viewTransition';
import { pxToVw } from '@/services/utils';
import * as dict from '@/locales/en/projects.json';
import './index.css';

export default function ProjectDetails(params: {
  project: Project,
  updated: Accessor<boolean>,
  setPromoData: Setter<string[] | null>,
  style?: JSX.CSSProperties,
  ref?: (el: HTMLDivElement) => void,
}) {
  const [showStack, setShowStack] = createSignal(false);
  const [logoCanvasRef, setLogoCanvasRef] = createSignal<HTMLCanvasElement | null>(null);
  const [color, setColor] = createSignal('');

  const { viewTransitionService } = useAppSelector();

  let logoSquircle: LogoSquircle | null = null;
  let projRef: HTMLElement | null = null;
  let animating = false;

  const logoAnimationFrame = (currentTime: number) => {
    logoSquircle?.animate(currentTime);
    if (projRef!.getAttribute('active')) {
      requestAnimationFrame(logoAnimationFrame);
    } else {
      animating = false;
    }
  };

  createEffect(() => {
    setColor(COLORS[params.project.tags[0] as string]);
  });

  createEffect(() => {
    params.updated();
    if (projRef?.getAttribute('active')) {
      if (!animating) {
        animating = true;
        requestAnimationFrame(logoAnimationFrame);
      }
    } else {
      if (showStack()) {
        setShowStack(false);
      }
    }
  });

  createEffect(() => {
    const canvas = logoCanvasRef();
    if (!canvas) {
      return;
    }
    if (!showStack()) {
      const image = new Image();
      image.addEventListener('load', (event) => {
        logoSquircle = new LogoSquircle({ canvas, color: color(), image: event.target as HTMLImageElement });
        logoSquircle.shot();
      });
      image.src = params.project.logo;
    } else {
      logoSquircle = new LogoSquircle({ canvas, color: color() });
      logoSquircle.shot();
    }
  });

  const setShowStackTransition = (show: boolean) => {
    if (!document.startViewTransition) {
      setShowStack(show);
      return;
    }
    viewTransitionService.updateViewTransitionType(ViewTransitionType.PROJECT_STACK);
    const transition = document.startViewTransition(() => {
      setShowStack(show);
    });
    transition.finished.then(() => viewTransitionService.updateViewTransitionType(ViewTransitionType.NONE));
  };

  const setProjRefs = (el: HTMLDivElement) => {
    projRef = el;
    if (params.ref) {
      params.ref(el);
    }
  };

  return (
    <div class="project hide" style={params.style} ref={setProjRefs}>
      <div class="logo-stack">
        <Switch>
          <Match when={showStack()}>
            <canvas ref={setLogoCanvasRef} />
            <Stack stackData={params.project.stack} showStack={showStack} setShowStack={setShowStackTransition} />
          </Match>
          <Match when={!showStack()}>
            <canvas ref={setLogoCanvasRef} />
          </Match>
        </Switch>
      </div>
      <div class="text-actions">
        <div class="title-tags">
          <div class="title text-themed">
            <span>{params.project.title}</span>
          </div>
          <div class="tags text-themed">
            <For each={params.project.tags}>
              {(tag) => <span class="tag">{(dict.tags as any)[tag]}</span>}
            </For>
          </div>
        </div>
        <div class="description text-themed" style={{ 'font-size': `${pxToVw(params.project.fontSizePx)}vw` }}>
          <p>{params.project.description}</p>
        </div>
        <div class="actions">
          <Show when={params.project.demo}>
            <button
              class="button btn-gradient-border text-themed"
              onClick={() => window.open(params.project.demo, '_blank')}
            >
              {dict.buttons.demo}
            </button>
          </Show>
          <Show when={params.project.promo.length}>
            <button
              class="button text-themed"
              onClick={() => params.setPromoData(params.project.promo as string[])}
            >
              {dict.buttons.promo}
            </button>
          </Show>
          <Show when={params.project.stack.length}>
            <button
              class="button text-themed"
              onClick={() => !showStack() && setShowStackTransition(true)}
            >
              {dict.buttons.stack}
            </button>
          </Show>
          <Show when={params.project.source}>
            <button
              class="button text-themed"
              onClick={() => window.open(params.project.source, '_blank')}
            >
              {dict.buttons.source}
            </button>
          </Show>
        </div>
      </div>
    </div>
  );
}
