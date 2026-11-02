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
        return { key: selected, title: brand.title, background: brand.background, logo: brand.logoPath, image: '', hint: env.translate('Press OK to open') };
      }
    }
    if (selected.startsWith('input:')) {
      const source = inputs.find(item => 'input:' + item.type + ':' + item.number === selected);
      if (source) {
        // Live TV opens HDMI 1, so it borrows that port's name, logo and colour.
        const shown = source.type === 'TV' ? inputs.find(item => item.type === 'HDMI' && Number(item.number) === 1) || source : source;
        const label = env.runtime.inputs.label(source), port = env.runtime.inputs.portName(shown);
        const colour = env.runtime.inputs.colour?.(shown) || '';
        return { key: selected, title: label, background: colour || 'linear-gradient(135deg,#2b3a55,#0d1320)', logo: null,
          image: env.runtime.inputs.icon?.(shown) || '',
          hint: source.type === 'TV' ? env.runtime.inputs.label(shown) + ' · ' + port : label !== port ? port : env.translate('Input') };
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
        {shown.image ? <div class="top-shelf-logo"><img class="logo top-shelf-image" alt="" src={shown.image} /></div> :
          shown.logo ? <div class="top-shelf-logo"><AppLogoIcon path={shown.logo} colour="#fff" /></div> : null}
        <h1 class="top-shelf-title">{shown.title}</h1>
        <p class="top-shelf-hint">{shown.hint}</p>
      </div>
    </div> : null}
  </section>;
};
