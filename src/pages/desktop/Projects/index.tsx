import { createSignal, onMount, onCleanup } from 'solid-js';
import Background from '@/components/desktop/Background';
import Socials from '@/components/desktop/Socials';
import Theme from '@/components/desktop/Theme';
import ProjectsHeader from '@/components/desktop/ProjectsHeader';
import ProjectsCarousel from '@/components/desktop/ProjectsCarousel';
import Back from '@/components/desktop/Back';
import PromoGallery from '@/components/desktop/PromoGallery';
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
  tag: string;
  fontSizePx: number;
}

const OUT_DURATION = 350;

const projects: Project[] = dict.projects;

export default function Projects() {
  document.title = dict.title;

  const [project, setProject] = createSignal(0);
  const [out, setOut] = createSignal(false);
  const [index, setIndex] = createSignal(0);
  const [expanded, setExpanded] = createSignal(false);
  const [promoData, setPromoData] = createSignal<string[] | null>(null);

  let wheelThrottleTime = 0;

  const onWheel = (e: WheelEvent) => {
    if (Date.now() - wheelThrottleTime < 1000 + OUT_DURATION) {
      return;
    }
    wheelThrottleTime = Date.now();
    if (e.deltaY > 0 && project() < projects.length) {
      changeProject({ type: 'next' });
    } else if (e.deltaY < 0 && project() > 1) {
      changeProject({ type: 'prev' });
    }
  };

  onMount(() => {
    setTimeout(() => setProject(1), 100);
    document.addEventListener('wheel', onWheel);
  });

  onCleanup(() => {
    document.removeEventListener('wheel', onWheel);
  });

  const changeProject = ({ type, value }: { type?: 'next' | 'prev', value?: number }) => {
    setTimeout(() => {
      setProject((prev) => value ?? (type === 'next' ? prev + 1 : prev - 1));
    }, OUT_DURATION);
  };

  return (
    <div class="projects">
      <Background set={() => 4}/>
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
