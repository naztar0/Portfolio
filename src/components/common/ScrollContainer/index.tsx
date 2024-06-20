import { ParentProps, children, createSignal, createEffect, onMount } from 'solid-js';
import { vwToPx } from '@/services/utils';
import './index.css';

export default function ScrollContainer(
  props: ParentProps & {
    drag?: boolean,
    scale?: boolean,
    gap?: number,
    unit?: 'px' | 'vw',
    onClick?: () => void,
    onDragEnd?: () => void,
  },
) {
  const resolved = children(() => props.children);

  const [maskWrapRef, setMaskWrapRef] = createSignal<HTMLElement | null>(null);
  const [dragging, setDragging] = createSignal(false);
  const [firstClickX, setFirstClickX] = createSignal(0);

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging()) {
      if (Math.abs(e.clientX - firstClickX()) < 20) {
        return;
      }
      setDragging(true);
    }
    const ref = maskWrapRef();
    if (ref) {
      ref.scrollLeft -= e.movementX;
      handleScroll(e);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    setFirstClickX(e.clientX);
    document.body.addEventListener('pointermove', onPointerMove);
    document.body.addEventListener('pointerup', onPointerUp);
  };

  const onPointerUp = () => {
    if (dragging()) {
      setDragging(false);
      props.onDragEnd?.();
    } else {
      props.onClick?.();
    }
    document.body.removeEventListener('pointermove', onPointerMove);
    document.body.removeEventListener('pointerup', onPointerUp);
  };

  const handleScroll = (e: any) => {
    let target = e.currentTarget as HTMLDivElement;
    if (!target.classList.contains('mask-overflow-wrap')) {
      target = target.closest('.mask-overflow-wrap') as HTMLDivElement;
      if (!target) {
        return;
      }
    }
    const startBoundPx = vwToPx(0.1);
    const { scrollWidth, clientWidth, scrollLeft } = e.currentTarget;
    const isStart = scrollLeft < startBoundPx;
    const isEnd = scrollWidth - clientWidth - scrollLeft < startBoundPx;
    if (isStart) {
      target.classList.add('start');
      target.classList.remove('end');
    } else if (isEnd) {
      target.classList.add('end');
      target.classList.remove('start');
    } else {
      target.classList.add('start');
      target.classList.add('end');
    }
    scaleBounds();
  };

  const scaleBounds = () => {
    const ref = maskWrapRef();
    if (!ref || !props.scale) {
      return;
    }

    const startLeftBoundPx = vwToPx(1);
    const startRightBoundPx = vwToPx(4);
    const boundsPercent = 0.1;
    const scaleLength = 3;
    const minScale = 0.4;

    const { scrollWidth, clientWidth, scrollLeft } = ref;
    const children = ref.children[0].children;
    const gap = props.unit === 'vw' ? vwToPx(props.gap || 0) : (props.gap || 0);
    const childWidth = children[0].clientWidth + gap;

    const isStart = scrollLeft < startLeftBoundPx;
    const isEnd = scrollWidth - clientWidth - scrollLeft < startRightBoundPx;
    const boundWidth = clientWidth * boundsPercent;

    const stretchScale = (scale: number) => (scaleLength - scale) / scaleLength;

    for (let i = 0; i < children.length; i++) {
      const el = children[i] as HTMLElement;
      const left = i * childWidth;
      const right = (i + 1) * childWidth;
      const leftBound = scrollLeft + boundWidth;
      const rightBound = scrollLeft + clientWidth - boundWidth;
      let scale = 1;

      if (left < leftBound && !isStart) {
        scale = stretchScale((leftBound - left) / childWidth);
      } else if (right > rightBound && !isEnd) {
        scale = stretchScale((right - rightBound) / childWidth);
      }

      scale = Math.max(minScale, scale);
      el.style.transform = `scale(${scale})`;
    }
  };

  createEffect(() => {
    let list = resolved.toArray();
    list.forEach((child ) => {
      (child as HTMLElement).classList.add('mask-overflow');
    });
  });

  createEffect(() => {
    maskWrapRef()?.addEventListener('pointerdown', onPointerDown);
  });

  onMount(() => {
    if (props.scale) {
      scaleBounds();
    }
  });

  return (
    <div
      class="mask-overflow-wrap start"
      ref={setMaskWrapRef}
      onScroll={handleScroll}
    >
      {resolved.toArray()}
    </div>
  );
}
