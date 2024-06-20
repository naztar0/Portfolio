import { JSX, Show, Switch, Match, Setter } from 'solid-js';
import { Project } from '@/pages/mobile/Projects';
import Stack from '@/components/mobile/Stack';
import { useAppSelector } from '@/store/contextProvider';
import { ViewTransitionType } from '@/constants/viewTransition';
import * as dict from '@/locales/en/projects.json';
import './index.css';

export default function ProjectDetails(params: {
  project: Project,
  showStack: () => boolean,
  setShowStack: Setter<boolean>,
  setPromoData: Setter<string[] | null>,
  style?: JSX.CSSProperties,
  setRef?: (el: HTMLElement) => void,
}) {
  const { viewTransitionService } = useAppSelector();

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

  const fallbackLogo = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.src = '/projects/logo/default.png';
  };

  return (
    <div class="project" style={params.style} ref={params.setRef}>
      <div class="logo stack">
        <Switch>
          <Match when={params.showStack()}>
            <Stack
              stackData={params.project.stack}
              showStack={params.showStack}
              setShowStack={setShowStackTransition}
            />
          </Match>
          <Match when={!params.showStack()}>
            <img
              src={params.project.logo}
              alt={params.project.name}
              onError={fallbackLogo}
            />
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
