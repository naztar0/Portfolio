import { JSX, Show, createSignal, createEffect, Switch, Match, Setter } from 'solid-js';
import { Project } from '@/pages/desktop/Projects';
import Stack from '@/components/desktop/Stack';
import { useAppSelector } from '@/store/contextProvider';
import { ViewTransitionType } from '@/constants/viewTransition';
import { pxToVw } from '@/services/utils';
import * as dict from '@/locales/en/projects.json';
import './index.css';

export default function ProjectDetails(params: {
  project: Project,
  updated: () => boolean,
  setPromoData: Setter<string[] | null>,
  style?: JSX.CSSProperties,
  ref?: (el: HTMLElement) => void,
}) {
  const [logoRef, setLogoRef] = createSignal<HTMLElement | null>(null);
  const [showStack, setShowStack] = createSignal(false);

  const { viewTransitionService } = useAppSelector();

  let projRef: HTMLElement | null = null;
  let animating = false;

  const logoAnimationFrame = (ref: HTMLElement) => {
    const value = Math.sin(Date.now() / 1000) * 0.5;
    ref.style.setProperty('--breath', value.toString());
    if (projRef!.getAttribute('active')) {
      requestAnimationFrame(() => logoAnimationFrame(ref));
    } else {
      animating = false;
    }
  };

  createEffect(() => {
    params.updated();
    const ref = logoRef();
    if (!ref) {
      return;
    }
    if (projRef?.getAttribute('active')) {
      if (!animating) {
        animating = true;
        requestAnimationFrame(() => logoAnimationFrame(ref));
      }
    } else {
      if (showStack()) {
        setShowStack(false);
      }
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

  const setProjRefs = (el: HTMLElement) => {
    projRef = el;
    if (params.ref) {
      params.ref(el);
    }
  };

  const fallbackLogo = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.src = '/projects/logo/default.png';
  };

  return (
    <div class="project hide" style={params.style} ref={setProjRefs}>
      <div class="logo stack" ref={setLogoRef}>
        <Switch>
          <Match when={showStack()}>
            <Stack stackData={params.project.stack} showStack={showStack} setShowStack={setShowStackTransition} />
          </Match>
          <Match when={!showStack()}>
            <img src={params.project.logo} alt={params.project.name} onError={fallbackLogo} />
          </Match>
        </Switch>
      </div>
      <div class="text-actions">
        <div class="title-tag">
          <div class="title text-themed">
            <span>{params.project.title}</span>
          </div>
          <div class="tag text-themed">
            <span>{(dict.tags as any)[params.project.tag]}</span>
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
