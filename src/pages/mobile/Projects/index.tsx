import { createSignal, onMount } from 'solid-js';
import Background from '@/components/mobile/Background';
import ProjectsHeader from '@/components/mobile/ProjectsHeader';
import ProjectsCarousel from '@/components/mobile/ProjectsCarousel';
import Back from '@/components/mobile/Back';
import PromoGallery from '@/components/mobile/PromoGallery';
import SwipeHint from '@/components/mobile/SwipeHint';
import { useAppSelector } from '@/store/contextProvider';
import { ViewTransitionType } from '@/constants/viewTransition';
import * as dict from '@/locales/en/projects.json';
import './index.css';

export interface Project {
  name: string;
  title: string;
  logo: string;
  description: string;
  demo: string;
  source: string;
  promo: string | string[];
  stack: string[];
  tags: string[];
  fontSizePx: number;
}

const SWIPE_BOUND_X = 40;
const SWIPE_BOUND_Y = 60;

const projects: Project[] = dict.projects;

export default function Projects() {
  document.title = dict.title;

  const [project, setProject] = createSignal(0);
  const [out, setOut] = createSignal(false);
  const [expanded, setExpanded] = createSignal(false);
  const [showBack, setShowBack] = createSignal(true);
  const [showStack, setShowStack] = createSignal(false);
  const [promoData, setPromoData] = createSignal<string[] | null>(null);
  const [componentRef, setComponentRef] = createSignal<HTMLDivElement | null>(null);
  const [rootRef, setRootRef] = createSignal<HTMLDivElement | null>(null);
  const [carouselRef, setCarouselRef] = createSignal<HTMLDivElement | null>(null);
  const [swipeHintEnabled, setSwipeHintEnabled] = createSignal(!localStorage.getItem('swipeHintProjects'));

  const { viewTransitionService } = useAppSelector();

  let touchStartX = 0;
  let touchStartY = 0;
  let swipeShiftX = 0;
  let touchForceActive = false;
  let touchForceCancel = false;

  const isTouchActive = (clientX: number, clientY: number) => {
    return (
      Math.abs(clientX - touchStartX) > SWIPE_BOUND_X &&
      Math.abs(clientY - touchStartY) < SWIPE_BOUND_Y
    );
  };

  const onTouchStart = (e: TouchEvent) => {
    const { clientX, clientY } = e.touches[0];
    touchStartX = clientX;
    touchStartY = clientY;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const root = rootRef()!;
    const component = componentRef()!;
    touchForceActive = false;
    touchForceCancel = false;
    root.classList.remove('no-scroll');
    const { clientX, clientY } = e.changedTouches[0];
    if ((!isTouchActive(clientX, clientY) && !touchForceActive) || touchForceCancel) {
      component.style.removeProperty('transform');
      return;
    }
    root.scrollTo({ top: 0, behavior: 'smooth' });
    if (!showBack()) {
      setShowBack(true);
    }
    if (clientX < touchStartX && project() < projects.length - 1) {
      changeProject({ type: 'next' });
      disableSwipeHint();
    } else if (clientX > touchStartX && project() > 0) {
      changeProject({ type: 'prev' });
      disableSwipeHint();
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    const root = rootRef()!;
    if (!touchForceActive) {
      root.classList.remove('no-scroll');
    } else {
      root.classList.add('no-scroll');
    }
    const component = componentRef()!;
    if (root.scrollTop === 0 && !showBack() && !expanded()) {
      setShowBack(true);
    } else if (root.scrollTop > 0 && showBack()) {
      setShowBack(false);
    }
    const { clientX, clientY } = e.touches[0];
    if ((!isTouchActive(clientX, clientY) && !touchForceActive) || touchForceCancel) {
      if (Math.abs(clientY - touchStartY) > SWIPE_BOUND_Y) {
        touchForceCancel = true;
      }
      component.style.removeProperty('transform');
      return;
    } else if (!touchForceActive) {
      swipeShiftX = SWIPE_BOUND_X * (clientX > touchStartX ? -1 : 1);
      touchForceActive = true;
    }
    if (
      clientX > touchStartX && project() === 0 ||
      clientX < touchStartX && project() === projects.length - 1
    ) {
      return;
    }
    const shift = (clientX - touchStartX + swipeShiftX) / 4;
    component.style.transform = `translateX(${shift}px)`;
  };

  const onScrollEnd = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.scrollTop === 0 && !showBack() && !expanded()) {
      setShowBack(true);
    } else if (target.scrollTop > 0 && showBack()) {
      setShowBack(false);
    }
  };

  const disableSwipeHint = () => {
    setSwipeHintEnabled(false);
    localStorage.setItem('swipeHintProjects', '1');
  };

  onMount(() => {
    const component = componentRef()!;
    const root = rootRef()!;
    component.addEventListener('touchstart', onTouchStart);
    component.addEventListener('touchend', onTouchEnd);
    component.addEventListener('touchmove', onTouchMove);
    root.addEventListener('scrollend', onScrollEnd);
  });

  const changeProject = ({ type, value }: { type?: 'next' | 'prev', value?: number }) => {
    const component = componentRef()!;
    const carousel = carouselRef()!;
    if (showStack()) {
      setShowStack(false);
    }
    if (!document.startViewTransition) {
      setProject((prev) => value ?? (type === 'next' ? prev + 1 : prev - 1));
      component.style.removeProperty('transform');
      return;
    }
    carousel.classList.remove('left', 'right');
    carousel.classList.add(type === 'next' ? 'right' : 'left');
    viewTransitionService.updateViewTransitionType(ViewTransitionType.PROJECT_CAROUSEL);
    const transition = document.startViewTransition(() => {
      setProject((prev) => value ?? (type === 'next' ? prev + 1 : prev - 1));
      component.style.removeProperty('transform');
    });
    transition.finished.then(() => viewTransitionService.updateViewTransitionType(ViewTransitionType.NONE));
  };

  return (
    <div class="projects" ref={setRootRef}>
      <Background set={() => 4} />
      <ProjectsHeader
        projects={projects}
        index={project}
        setIndex={setProject}
        out={out}
        expanded={expanded}
        setExpanded={setExpanded}
        setShowBack={setShowBack}
      />
      <ProjectsCarousel
        projects={projects}
        index={project}
        out={out}
        expanded={expanded}
        showStack={showStack}
        setShowStack={setShowStack}
        setPromoData={setPromoData}
        setProjectRef={setComponentRef}
        carouselRef={carouselRef}
        setCarouselRef={setCarouselRef}
      />
      <PromoGallery
        promoData={promoData}
        setPromoData={setPromoData}
      />
      <Back
        page="/"
        out={out}
        show={showBack}
        setOut={setOut}
      />
      <SwipeHint enabled={swipeHintEnabled} />
    </div>
  );
}
