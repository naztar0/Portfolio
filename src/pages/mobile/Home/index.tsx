import { createSignal, onMount, Setter } from 'solid-js';
import Background from '@/components/mobile/Background';
import Socials from '@/components/mobile/Socials';
import Dots from '@/components/mobile/Dots';
import Theme from '@/components/mobile/Theme';
import Greetings from '@/components/mobile/Greetings';
import ProjectsCover from '@/components/mobile/ProjectsCover';
import SkillsCover from '@/components/mobile/SkillsCover';
import * as dict from '@/locales/en/home.json';
import './index.css';

const components = [Greetings, ProjectsCover, SkillsCover];

const OUT_DURATION = 350;
const SWIPE_BOUND_X = 40;
const SWIPE_BOUND_Y = 60;

export default function Home() {
  document.title = dict.title;

  const [set, setSet] = createSignal(0);
  const [out, setOut] = createSignal(false);
  const [outRoot, setOutRoot] = createSignal(false);
  const [componentRef, setComponentRef] = createSignal<HTMLDivElement | null>(null);
  const [rootRef, setRootRef] = createSignal<HTMLDivElement | null>(null);

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
    const component = componentRef()!;
    touchForceActive = false;
    touchForceCancel = false;
    const { clientX, clientY } = e.changedTouches[0];
    if ((!isTouchActive(clientX, clientY) && !touchForceActive) || touchForceCancel) {
      return;
    }
    rootRef()!.scrollTo({ top: 0, behavior: 'smooth' });
    if (clientX < touchStartX && set() < components.length) {
      changeSet({ type: 'next' });
    } else if (clientX > touchStartX && set() > 1) {
      changeSet({ type: 'prev' });
    }
    setTimeout(() => component.style.removeProperty('transform'), OUT_DURATION);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!touchForceCancel) {
      e.preventDefault();
    }
    const component = componentRef()!;
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
      clientX > touchStartX && set() === 1 ||
      clientX < touchStartX && set() === components.length
    ) {
      return;
    }
    const shift = (clientX - touchStartX + swipeShiftX) / 4;
    component.style.transform = `translateX(${shift}px)`;
  };

  onMount(() => {
    setTimeout(() => setSet(1), 200);
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
  });

  const changeSet = ({ type, value }: { type?: 'next' | 'prev', value?: number }) => {
    setOut(true);
    setTimeout(() => {
      setOut(false);
      setSet((prev) => value ?? (type === 'next' ? prev + 1 : prev - 1));
    }, OUT_DURATION);
  };

  const setOutAll: Setter<boolean> = (value: boolean | ((prev: boolean) => boolean)) => {
    setOutRoot(value);
    setOut(value);
  };

  return (
    <div class="home" ref={setRootRef}>
      <Background set={set} />
      {set() ? components[set() - 1]({ out, setOutAll, setRef: setComponentRef }) : null}
      <Dots pages={components.length} set={set} changeSet={changeSet} out={outRoot} />
      <Socials out={outRoot} />
      <Theme out={outRoot} setOut={setOutRoot} />
    </div>
  );
}
