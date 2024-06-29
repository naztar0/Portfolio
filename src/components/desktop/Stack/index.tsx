import { createEffect, createSignal, For, onCleanup } from 'solid-js';
import './index.css';

export default function Stack(params: {
  stackData: string[],
  showStack: () => boolean,
  setShowStack: (show: boolean) => void,
}) {
  const [rootRef, setRootRef] = createSignal<HTMLElement | null>(null);

  const onClick = (e: MouseEvent) => {
    const ref = rootRef();
    if (ref && !ref.contains(e.target as Node)) {
      params.setShowStack(false);
      document.removeEventListener('click', onClick);
    }
  };

  createEffect(() => {
    if (params.showStack()) {
      document.addEventListener('click', onClick);
    } else {
      document.removeEventListener('click', onClick);
    }
  });

  onCleanup(() => {
    document.removeEventListener('click', onClick);
  });

  const parseItem = (item: string) => {
    const index = item.indexOf('href=');
    if (index === -1) {
      return <span>{item}</span>;
    } else {
      return <a href={item.slice(index + 5)} target="_blank">{item.slice(0, index - 1)}</a>;
    }
  };

  return (
    <div class="box" ref={setRootRef}>
      <For each={params.stackData}>
        {(item) => (
          <div class="item">{parseItem(item)}</div>
        )}
      </For>
    </div>
  );
}
