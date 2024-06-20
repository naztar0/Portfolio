import { createStore } from 'solid-js/store';
import { ViewTransitionType } from '@/constants/viewTransition';
import { ViewTransition } from '@/types/viewTransition';

const initViewTransitionConf: ViewTransition = {
  type: ViewTransitionType.NONE,
};

export const ViewTransitionService = () => {
  const [viewTransition, setViewTransition] = createStore<ViewTransition>(initViewTransitionConf);


  const updateViewTransitionType = (type: ViewTransitionType) => {
    setViewTransition('type', type);
  };

  return {
    viewTransition,
    updateViewTransitionType,
  };
};
