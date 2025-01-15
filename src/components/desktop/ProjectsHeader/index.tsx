import { createEffect, createSignal, For, Switch, Match, Accessor, Setter } from 'solid-js';
import { Project } from '@/pages/desktop/Projects';
import ScrollContainer from '@/components/common/ScrollContainer';
import ExpandMoreIcon from '@/assets/icons/expand_more.svg';
import './index.css';

export default function ProjectsHeader(params: {
  projects: Project[],
  index: Accessor<number>,
  setIndex: Setter<number>,
  out: Accessor<boolean>,
  expanded: Accessor<boolean>,
  setExpanded: Setter<boolean>,
}) {
  const [initialHeight, setInitialHeight] = createSignal(0);
  const [rootRef, setRootRef] = createSignal<HTMLElement | null>(null);
  const [appsRef, setAppsRef] = createSignal<HTMLElement | null>(null);
  const [expandedAppsRef, setExpandedAppsRef] = createSignal<HTMLElement | null>(null);
  const [isDragged, setIsDragged] = createSignal(false);

  createEffect(() => {
    if (params.out()) {
      rootRef()?.classList.add('hidden');
    } else {
      setTimeout(() => rootRef()?.classList.remove('hidden'), 100);
    }
  });

  createEffect(() => {
    const ref = appsRef();
    if (ref) {
      setInitialHeight(ref.clientHeight);
    }
  });

  const expand = () => {
    params.setExpanded(true);
    const ref = expandedAppsRef();
    if (!ref) {
      return;
    }

    for (let i = 0; i < ref.children.length; i++) {
      const el = ref.children[i] as HTMLElement;
      el.style.transitionDelay = i * 0.02 + 's';
    }

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'height') {
        ref.style.height = 'auto';
        ref.style.overflow = 'visible';
        ref.classList.add('show');
        ref.removeEventListener('transitionend', onTransitionEnd);
      }
    };

    ref.style.height = initialHeight() + 'px';

    ref.addEventListener('transitionend', onTransitionEnd);

    setTimeout(() => {
      ref.style.height = ref.scrollHeight + 'px';
      ref.classList.remove('hide');
    }, 0);
  };

  const collapse = () => {
    const ref = expandedAppsRef();
    if (!ref) {
      return;
    }

    for (let i = 0; i < ref.children.length; i++) {
      const el = ref.children[i] as HTMLElement;
      el.style.transitionDelay = (ref.children.length - i) * 0.0125 + 's';
    }

    ref.style.height = ref.scrollHeight + 'px';
    ref.style.overflow = 'hidden';

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'height') {
        params.setExpanded(false);
        ref.style.height = 'auto';
        ref.classList.remove('collapse');
        ref.removeEventListener('transitionend', onTransitionEnd);
      }
    };

    ref.addEventListener('transitionend', onTransitionEnd, { capture: true });

    setTimeout(() => {
      ref.style.height = initialHeight() + 'px';
      ref.classList.remove('show');
      ref.classList.add('hide', 'collapse');
    }, 0);
  };

  const fallbackLogo = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.src = '/projects/logo/default.png';
  };

  const onProjectClick = (i: number) => {
    if (isDragged()) {
      return;
    }
    params.setIndex(i);
    if (params.expanded()) {
      collapse();
    }
  };

  const Projects = () => (
    <For each={params.projects}>
      {(project, i) => (
        <div
          class="app"
          classList={{ active: i() === params.index() }}
          onClick={() => onProjectClick(i())}
        >
          <div class="icon-wrapper">
            <img class="icon" src={project.logo} alt={project.name} draggable="false" onError={fallbackLogo} />
          </div>
          <div class="name">{project.name}</div>
        </div>
      )}
    </For>
  );

  const onDragEnd = () => {
    setIsDragged(true);
    setTimeout(() => setIsDragged(false), 100);
  };

  return (
    <div class="header hidden" classList={{ out: params.out() }} ref={setRootRef}>
      <Switch>
        <Match when={!params.expanded()}>
          <div class="mask-overflow-container">
            <ScrollContainer drag scale gap={16} onDragEnd={onDragEnd}>
              <div class="apps mask-overflow" ref={setAppsRef}>
                <Projects />
              </div>
            </ScrollContainer>
          </div>
          <button class="expand" onClick={expand}>
            <ExpandMoreIcon />
          </button>
        </Match>
        <Match when={params.expanded()}>
          <div class="apps expanded hide" ref={setExpandedAppsRef}>
            <Projects />
          </div>
        </Match>
      </Switch>
    </div>
  );
}
