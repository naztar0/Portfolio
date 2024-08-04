import { JSX, Show, createSignal, createEffect, Switch, Match, For, Setter } from 'solid-js';
import { Project } from '@/pages/mobile/Projects';
import Stack from '@/components/mobile/Stack';
import { LogoSquircle } from '@/components/common/ProjectDetails/canvas';
import { useAppSelector } from '@/store/contextProvider';
import { ViewTransitionType } from '@/constants/viewTransition';
import * as dict from '@/locales/en/projects.json';
import './index.css';

const paintWorklet = !!(CSS.paintWorklet || window.paintWorklet);

export default function ProjectDetails(params: {
  project: Project,
  showStack: () => boolean,
  setShowStack: Setter<boolean>,
  setPromoData: Setter<string[] | null>,
  style?: JSX.CSSProperties,
  setRef?: (el: HTMLElement) => void,
}) {
  const [logoCanvasRef, setLogoCanvasRef] = createSignal<HTMLCanvasElement | null>(null);

  const { viewTransitionService } = useAppSelector();

  let logoSquircle: LogoSquircle | null = null;

  const setShowStackTransition = (show: boolean) => {
    if (!document.startViewTransition) {
      params.setShowStack(show);
      return;
    }
    viewTransitionService.updateViewTransitionType(ViewTransitionType.PROJECT_STACK);
    const transition = document.startViewTransition(() => {
      params.setShowStack(show);
    });
    transition.finished.then(() => viewTransitionService.updateViewTransitionType(ViewTransitionType.NONE));
  };

  createEffect(() => {
    const canvas = logoCanvasRef();
    if (!canvas) {
      return;
    }
    if (!params.showStack()) {
      const image = new Image();
      image.addEventListener('load', (event) => {
        logoSquircle = new LogoSquircle({ canvas, image: event.target as HTMLImageElement });
        logoSquircle.shot();
      });
      image.src = params.project.logo;
    } else {
      logoSquircle = new LogoSquircle({ canvas });
      logoSquircle.shot();
    }
  });

  const fallbackLogo = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.src = '/projects/logo/default.png';
  };

  return (
    <div class="project" style={params.style} ref={params.setRef}>
      <div class="logo-stack">
        <Switch>
          <Match when={params.showStack()}>
            <Show when={!paintWorklet}>
              <canvas ref={setLogoCanvasRef} />
            </Show>
            <Stack
              stackData={params.project.stack}
              showStack={params.showStack}
              setShowStack={setShowStackTransition}
            />
          </Match>
          <Match when={!params.showStack()}>
            <Switch>
              <Match when={paintWorklet}>
                <img src={params.project.logo} alt={params.project.name} onError={fallbackLogo}/>
              </Match>
              <Match when={!paintWorklet}>
                <canvas ref={setLogoCanvasRef} />
              </Match>
            </Switch>
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
        <div class="description text-themed" style={{ 'font-size': `${params.project.fontSizePx}px` }}>
          <p>{params.project.description}</p>
        </div>
        <div class="actions-wrapper">
          <div class="actions">
            <Show when={params.project.demo}>
              <button
                class="button text-themed btn-gradient-border"
                onClick={() => window.open(params.project.demo, '_blank')}
              >
                {dict.buttons.demo}
              </button>
            </Show>
          </div>
          <div class="actions">
            <Show when={typeof params.project.promo === 'string' && params.project.promo.length}>
              <button
                class="button text-themed"
                onClick={() => window.open(params.project.promo as string, '_blank')}
              >
                {dict.buttons.promo}
              </button>
            </Show>
            <Show when={Array.isArray(params.project.promo) && params.project.promo.length}>
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
                onClick={() => !params.showStack() && setShowStackTransition(true)}
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
    </div>
  );
}
