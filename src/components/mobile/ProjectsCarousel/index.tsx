import { createEffect, Setter } from 'solid-js';
import ProjectDetails from '@/components/mobile/ProjectDetails';
import { Project } from '@/pages/mobile/Projects';
import './index.css';

export default function ProjectsCarousel(params: {
  projects: Project[],
  index: () => number,
  out: () => boolean,
  expanded: () => boolean,
  showStack: () => boolean,
  setShowStack: Setter<boolean>,
  setPromoData: Setter<string[] | null>,
  setProjectRef: Setter<HTMLDivElement | null>,
  carouselRef: () => HTMLDivElement | null,
  setCarouselRef: Setter<HTMLDivElement | null>,
}) {
  createEffect(() => {
    const element = params.carouselRef();
    if (!element) {
      return;
    }
    if (params.out() || params.expanded()) {
      element.classList.add('hidden');
      setTimeout(() => element.classList.add('hide'), 500);
    } else {
      element.classList.remove('hide');
      setTimeout(() => element.classList.remove('hidden'), 100);
    }
  });

  return (
    <div class="projects-carousel-scene hidden" classList={{ out: params.out() }} ref={params.setCarouselRef}>
      <ProjectDetails
        showStack={params.showStack}
        setShowStack={params.setShowStack}
        setPromoData={params.setPromoData}
        setRef={params.setProjectRef}
        project={params.projects[params.index()]}
      />
    </div>
  );
}
