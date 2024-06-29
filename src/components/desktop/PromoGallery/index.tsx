import { createEffect, createSignal, Setter } from 'solid-js';
import ArrowBackIcon from '@/assets/icons/arrow_back.svg';
import CloseIcon from '@/assets/icons/close.svg';
import './index.css';

const CARD_THROTTLE = 500;

export default function PromoGallery(params: {
  promoData: () => string[] | null;
  setPromoData: Setter<string[] | null>;
}) {
  const [index, setIndex] = createSignal(0);
  const [frameRef, setFrameRef] = createSignal<HTMLElement | null>(null);
  const [cardRef, setCardRef] = createSignal<HTMLElement | null>(null);
  const [rootRef, setRootRef] = createSignal<HTMLElement | null>(null);

  let cardThrottleTime = 0;
  let clickStartX = 0;
  let swipeShiftX = 0;

  const checkThrottle = () => {
    if (Date.now() - cardThrottleTime < CARD_THROTTLE) {
      return false;
    }
    cardThrottleTime = Date.now();
    return true;
  };

  const changeCard = (type: 'prev' | 'next') => {
    const frame = frameRef();
    const front = frame?.querySelector('img.front') as HTMLImageElement;
    const back = frame?.querySelector('img.back') as HTMLImageElement;
    const promoData = params.promoData();
    if (!frame || !front || !back || !promoData?.length) {
      return;
    }
    frame.style.scale = '1';
    if (type === 'prev' && index() > 0) {
      setIndex((prev) => prev - 1);
    } else if (type === 'next' && index() < promoData.length - 1) {
      setIndex((prev) => prev + 1);
    }
    if (index() % 2 === 0) {
      front.src = promoData[index()];
    } else {
      back.src = promoData[index()];
    }
    setTimeout(() => {
      if (index() % 2 === 0) {
        back.src = promoData[index()];
      } else {
        front.src = promoData[index()];
      }
      front.className = 'back';
      back.className = 'front';
    }, 300);
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (!checkThrottle()) {
      return;
    }
    if (e.key === 'ArrowLeft') {
      changeCard('prev');
    } else if (e.key === 'ArrowRight') {
      changeCard('next');
    } else if (e.key === 'Escape') {
      close();
    }
  };

  const close = () => {
    const root = rootRef();
    if (!root) {
      return;
    }
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== root || e.propertyName !== 'opacity') {
        return;
      }
      root.classList.add('hidden');
      params.setPromoData(null);
      setIndex(0);
      root.removeEventListener('transitionend', onTransitionEnd);
    };
    root.classList.add('hide');
    root.addEventListener('transitionend', onTransitionEnd);
  };

  const onMouseMove = (e: MouseEvent) => {
    const frame = frameRef()!;
    const card = cardRef()!;

    frame.classList.add('drag');

    swipeShiftX = (e.clientX > clickStartX) ? -1 : 1;
    const shift = (e.clientX - clickStartX + swipeShiftX) / 20;
    card.style.transform = `rotateY(${index() * -180 + shift}deg)`;
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!checkThrottle()) {
      return;
    }
    const frame = frameRef()!;
    const card = cardRef()!;

    frame.classList.remove('drag');

    card.style.transform = `rotateY(${index() * -180}deg)`;
    card.classList.remove('drag');

    if (e.clientX - clickStartX > 10) {
      changeCard('prev');
    } else if (e.clientX - clickStartX < -10) {
      changeCard('next');
    }

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const onMouseDown = (e: MouseEvent) => {
    const card = cardRef()!;

    clickStartX = e.clientX;
    card.classList.add('drag');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onWheel = (e: WheelEvent) => {
    const frame = frameRef()!;
    const diff = e.deltaY > 0 ? -0.1 : 0.1;
    const scale = parseFloat(frame.style.scale) || 1;
    const newScale = scale + diff;
    if (newScale < 1 || newScale > 3) {
      return;
    }
    frame.style.scale = newScale.toString();
  };

  createEffect(() => {
    frameRef()?.addEventListener('mousedown', onMouseDown);
    frameRef()?.addEventListener('wheel', onWheel);
  });

  createEffect(() => {
    const front = frameRef()?.querySelector('img.front') as HTMLImageElement;
    const promoData = params.promoData();
    if (front && promoData?.length) {
      front.src = promoData[0];
    }
  });

  createEffect(() => {
    const promoData = params.promoData();
    if (promoData) {
      rootRef()?.classList.remove('hidden');
      setTimeout(() => rootRef()?.classList.remove('hide'), 0);
    }
    if (promoData && promoData.length > 1) {
      setTimeout(() => {
        document.querySelectorAll('.promo-gallery .button:not(.prev)')
          ?.forEach((el) => el.classList.remove('hidden'));
      }, 100);
    } else {
      document.querySelectorAll('.promo-gallery button').forEach((el) => el.classList.add('hidden'));
    }
  });

  document.addEventListener('keydown', onKeydown);

  return (
    <div class="promo-gallery hidden hide" ref={setRootRef}>
      <div class="promo-carousel-scene" ref={setFrameRef}>
        <div class="border left" />
        <div class="card" style={{ transform: `rotateY(${index() * -180}deg)`}} ref={setCardRef}>
          <img class="front" draggable="false" alt="" />
          <img class="back" draggable="false" alt="" />
        </div>
        <div class="border right"/>
      </div>
      <div class="counter">
        <span>
          {index() + 1} / {params.promoData()?.length}
        </span>
      </div>
      <button
        class="button prev"
        classList={{ hidden: index() === 0 }}
        onClick={() => changeCard('prev')}
      >
        <ArrowBackIcon />
      </button>
      <button
        class="button next"
        classList={{ hidden: index() === (params.promoData()?.length || 0) - 1 }}
        onClick={() => changeCard('next')}
      >
        <ArrowBackIcon />
      </button>
      <button class="button close hidden" onClick={close}>
        <CloseIcon />
      </button>
    </div>
  );
}
