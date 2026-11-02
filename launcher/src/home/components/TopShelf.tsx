import { useRef } from 'preact/hooks';
import { useStore } from '../../shared/hooks/useStore';
import { AppLogoIcon } from '../../shared/icons/AppLogoIcon';
import type { HomeEnvironment } from '../types';

// Large header for the focused app or input. Header controls keep the last shelf,
// so moving up to the tabs does not blank the screen.
export const TopShelf = ({ env }: { env: HomeEnvironment }) => {
  const { selected } = useStore(env.state), { apps, inputs } = useStore(env.inventory);
  // Input names come from settings, so re-render when they change.
  useStore(env.settings);
  const subject = (() => {
    if (selected.startsWith('app:')) {
      const app = apps.find(item => item.id === selected.slice(4));
      if (app) {
        const brand = env.describe(app);
        return { key: selected, title: brand.title, background: brand.background, logo: brand.logoPath, hint: env.translate('Press OK to open') };
      }
    }
    if (selected.startsWith('input:')) {
      const source = inputs.find(item => 'input:' + item.type + ':' + item.number === selected);
      if (source) {
        const label = env.runtime.inputs.label(source), port = env.runtime.inputs.portName(source);
        return { key: selected, title: label, background: 'linear-gradient(135deg,#2b3a55,#0d1320)', logo: null,
          hint: source.type === 'TV' ? 'HDMI 1' : label !== port ? port : env.translate('Input') };
      }
    }
    return null;
  })();
  const last = useRef(subject);
  if (subject) { last.current = subject; }
  const shown = last.current;
  return <section class="top-shelf" aria-hidden="true">
    {shown ? <div key={shown.key} class="top-shelf-item">
      <div class="top-shelf-wash" style={{ background: shown.background }} />
      <div class="top-shelf-copy">
        {shown.logo ? <div class="top-shelf-logo"><AppLogoIcon path={shown.logo} colour="#fff" /></div> : null}
        <h1 class="top-shelf-title">{shown.title}</h1>
        <p class="top-shelf-hint">{shown.hint}</p>
      </div>
    </div> : null}
  </section>;
};
