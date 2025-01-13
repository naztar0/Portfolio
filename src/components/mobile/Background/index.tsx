import { For, onMount, createEffect, createSignal, Accessor } from 'solid-js';
import Circle from '@/assets/shapes/circle.svg';
import Cross from '@/assets/shapes/cross.svg';
import Pentagon from '@/assets/shapes/pentagon.svg';
import Square from '@/assets/shapes/square.svg';
import Triangle from '@/assets/shapes/triangle.svg';
import './index.css';

const SHAPES = [Circle, Cross, Pentagon, Square, Triangle];

const ANIM_FRAMES = 400;
const ANIM_STEP = 4 * 100 / ANIM_FRAMES;
const TRANSITION_DURATION = 1000;

const XYFromIndex = (index: number) => {
  if (index <= ANIM_FRAMES / 4) {
    return [index * ANIM_STEP, 100 - index * ANIM_STEP, 0, 100];
  } else if (index < ANIM_FRAMES / 2) {
    return [100, 0, (index - ANIM_FRAMES / 4) * ANIM_STEP, 100 - (index - ANIM_FRAMES / 4) * ANIM_STEP];
  } else if (index <= ANIM_FRAMES * 3 / 4) {
    return [100 - (index - ANIM_FRAMES / 2) * ANIM_STEP, (index - ANIM_FRAMES / 2) * ANIM_STEP, 100, 0];
  } else {
    return [0, 100, 100 - (index - ANIM_FRAMES * 3 / 4) * ANIM_STEP, (index - ANIM_FRAMES * 3 / 4) * ANIM_STEP];
  }
};

const indexFromXY = (x1: number, y1: number) => {
  if (x1 >= 0 && y1 === 0) {
    return x1 / ANIM_STEP;
  } else if (x1 === 100 && y1 > 0) {
    return ANIM_FRAMES / 4 + y1 / ANIM_STEP;
  } else if (x1 < 100 && y1 === 100) {
    return ANIM_FRAMES / 2 + (100 - x1) / ANIM_STEP;
  } else {
    return ANIM_FRAMES * 3 / 4 + (100 - y1) / ANIM_STEP;
  }
};

export default function Background(params: { set: Accessor<number> }) {
  const [prevSet, setPrevSet] = createSignal(0);
  const [transition, setTransition] = createSignal(false);
  const [linearGradientRef, setLinearGradientRef] = createSignal<SVGLinearGradientElement | null>(null);

  onMount(() => {
    const linearGradient = linearGradientRef();
    if (!linearGradient) {
      return;
    }

    const animationFrame = () => {
      const index = indexFromXY(
        linearGradient.x1.baseVal.valueInSpecifiedUnits,
        linearGradient.y1.baseVal.valueInSpecifiedUnits,
      ) + 1;
      const [x1, x2, y1, y2] = XYFromIndex(index);
      linearGradient.setAttribute('x1', `${x1}%`);
      linearGradient.setAttribute('x2', `${x2}%`);
      linearGradient.setAttribute('y1', `${y1}%`);
      linearGradient.setAttribute('y2', `${y2}%`);
      requestAnimationFrame(animationFrame);
    };
    requestAnimationFrame(animationFrame);
  });

  createEffect(() => {
    if (prevSet() === params.set()) {
      return;
    }
    setPrevSet(params.set());
    setTransition(true);
    setTimeout(() => setTransition(false), TRANSITION_DURATION);
  });

  return (
    <div class="background">
      <svg width="0" height="0">
        <defs>
          <linearGradient
            id="bg-shape-gradient-animation"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            ref={setLinearGradientRef}
          >
            <stop offset="0%" stop-color="var(--gradient-color-1)"/>
            <stop offset="100%" stop-color="var(--gradient-color-2)"/>
          </linearGradient>
        </defs>
      </svg>
      <div id="bg-ellipse" class={`set-${params.set()}`}/>
      <div
        class={`bg-shapes set-${params.set()}`}
        classList={{transition: transition()}}
      >
        <For each={SHAPES}>
          {(shape, index) => (
            <div class="shape" id={`shape-${index() + 1}`}>
              {shape}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
