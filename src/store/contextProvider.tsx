import { createContext, ParentComponent, useContext } from 'solid-js';
import { ThemeService } from '@/store/services/themeService';
import { ViewTransitionService } from '@/store/services/viewTransitionService';

export type RootState = {
  themeService: ReturnType<typeof ThemeService>,
  viewTransitionService: ReturnType<typeof ViewTransitionService>,
}

const rootState: RootState = {
  themeService: ThemeService(),
  viewTransitionService: ViewTransitionService(),
};

const StoreContext = createContext<RootState>();

export const useAppSelector = () => useContext(StoreContext)!;

export const StoreProvider: ParentComponent = (props) => {
  return (
    <StoreContext.Provider value={rootState}>
      {props.children}
    </StoreContext.Provider>
  );
};
