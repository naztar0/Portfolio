import { createEffect, createSignal, Accessor, Setter } from 'solid-js';
import ArrowBackIcon from '@/assets/icons/arrow_back.svg';
import CloseIcon from '@/assets/icons/close.svg';
import './index.css';

const CARD_THROTTLE = 500;

export default function PromoGallery(params: {
  promoData: Accessor<string[] | null>;
  setPromoData: Setter<string[] | null>;
}) {
  const [index, setIndex] = createSignal(0);
  const [rootRef, setRootRef] = createSignal<HTMLElement | null>(null);
  const [frameRef, setFrameRef] = createSignal<HTMLElement | null>(null);
  const [cardRef, setCardRef] = createSignal<HTMLElement | null>(null);

  let cardThrottleTime = 0;
  let doubleTouch = false;
  let lastScale = 1;
  let touchStartX = 0;
  let touchesVectorLength = 0;
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

  const onTouchMove = (e: TouchEvent) => {
    const frame = frameRef()!;
    const card = cardRef()!;

    if (doubleTouch) {
      const diff = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      ) - touchesVectorLength;
      const newScale = diff / 100 + lastScale;
      if (newScale < 1 || newScale > 3) {
        return;
      }
      frame.style.scale = newScale.toString();
    } else {
      swipeShiftX = e.touches[0].clientX > touchStartX ? -1 : 1;
      const shift = (e.touches[0].clientX - touchStartX + swipeShiftX) / 10;
      card.style.transform = `rotateY(${index() * -180 + shift}deg)`;
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    const frame = frameRef()!;
    const card = cardRef()!;
    if (doubleTouch) {
      touchesVectorLength = 0;
      lastScale = parseFloat(frame.style.scale) || 1;
      if (e.touches.length === 0) {
        doubleTouch = false;
      }
      return;
    }
    if (!checkThrottle()) {
      return;
    }

    card.style.transform = `rotateY(${index() * -180}deg)`;
    card.classList.remove('drag');

    const touch = e.changedTouches[0];

    if (touch.clientX - touchStartX > 10) {
      changeCard('prev');
    } else if (touch.clientX - touchStartX < -10) {
      changeCard('next');
    }

    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  const onTouchStart = (e: TouchEvent) => {
    const card = cardRef()!;

    touchStartX = e.touches[0].clientX;
    if (e.touches.length > 1) {
      touchesVectorLength = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      doubleTouch = true;
    } else {
      doubleTouch = false;
      card.classList.add('drag');
    }
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
  };

  createEffect(() => {
    frameRef()?.addEventListener('touchstart', onTouchStart);
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

  return (
    <div class="promo-gallery hidden hide" ref={setRootRef}>
      <div class="promo-carousel-scene" ref={setFrameRef}>
        <div class="border left" />
        <div class="card" style={{ transform: `rotateY(${index() * -180}deg)` }} ref={setCardRef}>
          <div class="frame front" />
          <div class="frame back" />
        </div>
        <div class="border right" />
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
