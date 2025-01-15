import { createSignal, onMount, Accessor } from 'solid-js';
import HandIcon from '@/assets/icons/hand.svg';
import './index.css';

const TIMEOUT = 6e3;

export default function SwipeHint(params: { enabled: Accessor<boolean> }) {
  const [show, setShow] = createSignal(false);

  onMount(() => {
    setTimeout(() => setShow(true), TIMEOUT);
  });

  return (
    <div
      class="swipe-hint"
      classList={{ show: show() && params.enabled() }}
      onPointerDown={() => setShow(false)}
    >
      <div class="swipe-hint-box">
        <div class="path" />
        <div class="hand">
          <HandIcon />
        </div>
      </div>
    </div>
  );
}
