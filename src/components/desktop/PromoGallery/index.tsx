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

  const setChild = (parent: HTMLElement, child: HTMLElement) => {
    if (parent.firstElementChild) {
      parent.replaceChild(child, parent.firstElementChild);
    } else {
      parent.appendChild(child);
    }
  };

  const getElement = (data: string) => {
    let element;
    if (data[0] === 'y') {
      element = document.createElement('iframe');
      element.src = 'https://www.youtube.com/embed' + data.slice(1) + '?loop=1&autoplay=1';
      element.allowFullscreen = true;
      element.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      element.draggable = false;
    } else {
      element = document.createElement('img');
      element.draggable = false;
      element.src = data;
    }
    return element;
  };

  const changeCard = (type: 'prev' | 'next') => {
    const frame = frameRef();
    const front = frame?.getElementsByClassName('front')[0] as HTMLImageElement;
    const back = frame?.getElementsByClassName('back')[0] as HTMLImageElement;
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

    const data = promoData[index()];
    const element = getElement(data);

    if (index() % 2 === 0) {
      setChild(front, element);
    } else {
      setChild(back, element);
    }
    setTimeout(() => {
      if (index() % 2 === 0) {
        setChild(back, element.cloneNode() as HTMLElement);
      } else {
        setChild(front, element.cloneNode() as HTMLElement);
      }
      front.classList.replace('front', 'back');
      back.classList.replace('back', 'front');
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
    const front = frameRef()?.getElementsByClassName('front')[0] as HTMLImageElement;
    const back = frameRef()?.getElementsByClassName('back')[0] as HTMLImageElement;
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
      if (front.firstElementChild) {
        front.removeChild(front.firstElementChild);
      }
      if (back.firstElementChild) {
        back.removeChild(back.firstElementChild);
      }
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
    const front = frameRef()?.getElementsByClassName('front')[0] as HTMLImageElement;
    const promoData = params.promoData();
    if (front && promoData?.length && !front.firstElementChild) {
      setChild(front, getElement(promoData[index()]));
    }
  });

  createEffect(() => {
    const promoData = params.promoData();
    if (promoData) {
      rootRef()?.classList.remove('hidden');
      setTimeout(() => rootRef()?.classList.remove('hide'), 0);
    }
    if (promoData && promoData.length > 0) {
      setTimeout(() => {
        const selector = promoData.length > 1
          ? '.promo-gallery .button:not(.prev)'
          : '.promo-gallery .button:not(.prev):not(.next)';
        document.querySelectorAll(selector)
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
          <div class="frame front" />
          <div class="frame back" />
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
