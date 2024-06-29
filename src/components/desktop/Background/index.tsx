import { For, onMount, createEffect, createSignal } from 'solid-js';
import { BgEllipse } from './canvasEllipse';
import { BgHalftone } from './canvasHalftone';
import { useAppSelector } from '@/store/contextProvider';
import { getRenderingEngine } from '@/services/utils';
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

const DIMMED = getRenderingEngine() !== 'Blink';

const BG_ELLIPSES = [
  { x: 71, y: 50, radius: 0, blur: 13 },
  { x: 71, y: 50, radius: 19, blur: 13 },
  { x: 29, y: 50, radius: 19, blur: 13 },
  { x: 71, y: 50, radius: 19, blur: 13 },
  { x: 32, y: 50, radius: 25, blur: 16 },
];

const BG_HT_POINTS = [
  { x: 71, y: 50, size: 0 },
  { x: 71, y: 50, size: 1.4 },
  { x: 29, y: 50, size: 1.4 },
  { x: 71, y: 50, size: 1.4 },
  { x: 0, y: 0, size: 0 },
];

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

export default function Background(params: { set: () => number }) {
  const [prevSet, setPrevSet] = createSignal(0);
  const [transition, setTransition] = createSignal(false);
  const [canvasEllipseRef, setCanvasEllipseRef] = createSignal<HTMLCanvasElement | null>(null);
  const [canvasHalftoneRef, setCanvasHalftoneRef] = createSignal<HTMLCanvasElement | null>(null);
  const [linearGradientRef, setLinearGradientRef] = createSignal<SVGLinearGradientElement | null>(null);

  const { themeService } = useAppSelector();

  let bgEllipse: BgEllipse | null = null;
  let bgHalftone: BgHalftone | null = null;

  onMount(() => {
    const canvasEllipseElement = canvasEllipseRef();
    const canvasHalftoneElement = canvasHalftoneRef();
    const linearGradient = linearGradientRef();
    if (!linearGradient || !canvasEllipseElement || !canvasHalftoneElement) {
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

    bgEllipse = new BgEllipse(canvasEllipseElement);
    bgHalftone = new BgHalftone(canvasHalftoneElement);
    bgHalftone.drawDots();
  });

  createEffect(() => {
    if (bgEllipse?.ellipse.pos.x === -1) {
      const ellipse = BG_ELLIPSES[params.set()];
      bgEllipse.setEllipse(ellipse);
    }
    if (bgHalftone?.points.length === 0) {
      const point = BG_HT_POINTS[params.set()];
      bgHalftone.addPoint(point);
    }
    if (prevSet() === params.set()) {
      return;
    }
    if (bgEllipse) {
      const ellipse = BG_ELLIPSES[params.set()];
      bgEllipse.animateEllipse(ellipse.x, ellipse.y, ellipse.radius, TRANSITION_DURATION);
    }
    if (bgHalftone) {
      const point = BG_HT_POINTS[params.set()];
      bgHalftone.animatePoint(0, point.x, point.y, point.size, TRANSITION_DURATION);
    }
    setPrevSet(params.set());
    setTransition(true);
    setTimeout(() => setTransition(false), TRANSITION_DURATION);
  });

  createEffect(() => {
    if (themeService.theme.type !== undefined && bgHalftone) {
      bgHalftone.clear();
      bgHalftone.updateColor();
      bgHalftone.drawDots();
    }
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
      <div
        class={`bg-shapes set-${params.set()}`}
        classList={{ transition: transition() }}
      >
        <For each={SHAPES}>
          {(shape, index) => (
            <div class="shape" id={`shape-${index() + 1}`}>
              {shape}
            </div>
          )}
        </For>
      </div>
      <canvas id="bg-canvas-ellipse" classList={{ dimmed: DIMMED }} ref={setCanvasEllipseRef}/>
      <canvas id="bg-canvas-halftone" ref={setCanvasHalftoneRef} />
    </div>
  );
}
