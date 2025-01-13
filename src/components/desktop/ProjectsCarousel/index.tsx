import { createEffect, createSignal, For, Accessor, Setter } from 'solid-js';
import ProjectDetails from '@/components/desktop/ProjectDetails';
import { Project } from '@/pages/desktop/Projects';
import { pxToVw } from '@/services/utils';
import './index.css';

const cellSizePx = 360;
const visibleCells = 5;
const cellSpacing = 20;
const angle = 360 / visibleCells;
const opacity = ['1', '0.1', '0.02'];
const translateZ = Math.round((cellSizePx / 2) /  Math.tan(Math.PI / visibleCells));

export default function ProjectsCarousel(params: {
  projects: Project[],
  index: Accessor<number>,
  setIndex: Setter<number>,
  out: Accessor<boolean>,
  expanded: Accessor<boolean>,
  setPromoData: Setter<string[] | null>,
}) {
  const [carouselRef, setCarouselRef] = createSignal<HTMLElement | null>(null);
  const [projRefs, setProjRefs] = createSignal<HTMLElement[]>([]);
  const [updated, setUpdated] = createSignal(false);

  createEffect(() => {
    if (params.out() || params.expanded()) {
      carouselRef()?.classList.add('hidden');
    } else {
      setTimeout(() => carouselRef()?.classList.remove('hidden'), 100);
    }
  });

  createEffect(() => {
    const refs = projRefs();
    const index = params.index();
    if (refs.length > 0) {
      for (let i = 0; i < refs.length; i++) {
        const rotateX = (index - i) * angle;
        if (i >= index - 2 && i <= index + 2) {
          refs[i].classList.remove('hide');
          setTimeout(() => {
            refs[i].style.transform = `
            rotateX(${rotateX}deg)
            translateZ(${pxToVw(translateZ + cellSpacing)}vw)
          `;
            refs[i].style.opacity = opacity[Math.abs(index - i)];
            if (i === index) {
              refs[i].setAttribute('active', 'true');
            } else {
              refs[i].removeAttribute('active');
            }
            setUpdated((prev) => !prev);
          }, 100);
        } else {
          setTimeout(() => {
            refs[i].style.transform = `
            rotateX(${rotateX}deg)
            translateZ(${pxToVw(translateZ)}vw)
          `;
            refs[i].style.opacity = '0';
            refs[i].removeAttribute('active');
            setTimeout(() => refs[i].classList.add('hide'), 500);
          }, 100);
        }
      }
    }
  });

  const addRef = (el: HTMLDivElement, index: number) => {
    if (el) {
      setProjRefs((prev) => {
        const refs = prev.slice();
        refs[index] = el;
        return refs;
      });
    }
  };

  return (
    <div class="projects-carousel-scene hidden" classList={{ out: params.out() }} ref={setCarouselRef}>
      <div class="carousel">
        <For each={params.projects}>
          {(project, index) => (
            <ProjectDetails
              setPromoData={params.setPromoData}
              ref={(el: HTMLDivElement) => addRef(el, index())}
              project={project}
              updated={updated}
            />
          )}
        </For>
      </div>
    </div>
  );
}
