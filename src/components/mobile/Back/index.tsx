import { createEffect, createSignal, Accessor, Setter } from 'solid-js';
import ArrowBackIcon from '@/assets/icons/arrow_back.svg';
import './index.css';


export default function Back(params: {
  page: string,
  out: Accessor<boolean>
  show: Accessor<boolean>,
  setOut: Setter<boolean>,
}) {
  const [ref, setRef] = createSignal<Element>();

  createEffect(() => {
    if (params.out()) {
      ref()?.classList.add('hidden', 'out');
    } else {
      setTimeout(() => ref()?.classList.remove('hidden'), 100);
    }
  });

  createEffect(() => {
    if (params.show()) {
      ref()?.classList.remove('hidden');
    } else {
      ref()?.classList.add('hidden');
    }
  });

  const onClick = () => {
    ref()?.classList.add('hidden', 'out');
    params.setOut(true);
    setTimeout(() => {
      location.assign(params.page);
    }, 300);
  };

  return (
    <div class="page-back hidden" ref={setRef}>
      <button class="button" onClick={onClick}>
        <ArrowBackIcon />
      </button>
    </div>
  );
}
