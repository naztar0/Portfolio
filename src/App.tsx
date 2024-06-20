import 'solid-devtools';
import { lazy } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { StoreProvider } from '@/store/contextProvider';
import AppInit from '@/components/common/AppInit';
import '@/styles/global.css';

const isMobile = window.innerWidth < 768;

const components = {
  Home: {
    desktop: lazy(() => import('@/pages/desktop/Home')),
    mobile: lazy(() => import('@/pages/mobile/Home')),
  },
  Projects: {
    desktop: lazy(() => import('@/pages/desktop/Projects')),
    mobile: lazy(() => import('@/pages/mobile/Projects')),
  },
};

const getComponent = (name: keyof typeof components) => {
  return isMobile ? components[name].mobile : components[name].desktop;
};

export default function App() {
  return (
    <StoreProvider>
      <AppInit />
      <Router>
        <Route path="/" component={getComponent('Home')} />
        <Route path="/projects" component={getComponent('Projects')} />
      </Router>
    </StoreProvider>
  );
}
