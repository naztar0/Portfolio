import { Switch, Match, Setter, lazy } from 'solid-js';

const Home = lazy(() => import('./home'));
const Projects = lazy(() => import('./projects'));

type Props = {
  page: 'home';
  set: () => number;
  setRef?: Setter<HTMLElement | null>;
} | {
  page: 'projects';
  set: () => number;
  setRef: Setter<HTMLElement | null>;
};

export default function Background(params: Props) {
  return (
    <Switch>
      <Match when={params.page === 'home'}>
        <Home set={params.set} />
      </Match>
      <Match when={params.page === 'projects'}>
        <Projects set={params.set} setRef={params.setRef!} />
      </Match>
    </Switch>
  );
}
