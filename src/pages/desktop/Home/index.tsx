import { createSignal, onMount, onCleanup, Setter } from 'solid-js';
import Background from '@/components/desktop/Background';
import Socials from '@/components/desktop/Socials';
import Dots from '@/components/desktop/Dots';
import Theme from '@/components/desktop/Theme';
import Greetings from '@/components/desktop/Greetings';
import ProjectsCover from '@/components/desktop/ProjectsCover';
import SkillsCover from '@/components/desktop/SkillsCover';
import * as dict from '@/locales/en/home.json';
import './index.css';

const components = [Greetings, ProjectsCover, SkillsCover];

const OUT_DURATION = 350;

export default function Home() {
  document.title = dict.title;

  const [set, setSet] = createSignal(0);
  const [out, setOut] = createSignal(false);
  const [outRoot, setOutRoot] = createSignal(false);

  let wheelThrottleTime = 0;

  const onWheel = (e: WheelEvent) => {
    if (Date.now() - wheelThrottleTime < 1000 + OUT_DURATION) {
      return;
    }
    wheelThrottleTime = Date.now();
    if (e.deltaY > 0 && set() < components.length) {
      changeSet({ type: 'next' });
    } else if (e.deltaY < 0 && set() > 1) {
      changeSet({ type: 'prev' });
    }
  };

  onMount(() => {
    setTimeout(() => setSet(1), 200);
    document.addEventListener('wheel', onWheel);
  });

  onCleanup(() => {
    document.removeEventListener('wheel', onWheel);
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
    <div class="home">
      <Background page='home' set={set} />
      {set() ? components[set() - 1]({ out, setOutAll }) : null}
      <Dots pages={components.length} set={set} changeSet={changeSet} out={outRoot} />
      <Socials out={outRoot} />
      <Theme out={outRoot} setOut={setOutRoot} />
    </div>
  );
}
