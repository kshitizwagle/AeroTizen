import { useLayoutEffect } from 'preact/hooks';
import { useStore } from '../shared/hooks/useStore';
import { HeaderPlate } from './components/HeaderPlate';
import { HomeControl } from './components/HomeControl';
import type { HomeEnvironment } from './types';
import { AppCard } from './components/AppCard';
import { ContinueCard } from './components/ContinueCard';
import { TileMenu } from './components/TileMenu';
import { TopShelf } from './components/TopShelf';
export const Home = ({ env }: { env: HomeEnvironment }) => {
  const settings = useStore(env.settings), { page, active, draft } = useStore(env.state);
  const { apps, inputs, items, ready } = useStore(env.inventory);
  const home = draft || settings.home;
  const visibleHome = home.filter(id => id !== env.runtime.config.FIREPLACE_ID && (!ready || apps.some(app => app.id === id)));
  useLayoutEffect(() => { env.bridge.focus(); }, [env, page, apps, inputs, items, settings.home, draft]);
  useLayoutEffect(() => {
    const list = document.getElementById('continue-items');
    if (list) {
      const offset = Math.max(0, Math.min(Number(list.dataset.offset || 0), list.scrollWidth - list.clientWidth));
      list.dataset.offset = String(offset);
      list.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
    }
  }, [items]);
  const cards = (ids: readonly string[], shown: boolean) => ids.map(id => {
    const app = apps.find(app => app.id === id) || { id, name: id, icon: '' };
    return <AppCard key={id} env={env} app={app} active={active && shown} />;
  });
  return <>
    {/* Refraction for Liquid Glass surfaces: a soft noise field bends the blurred backdrop. */}
    <svg class="lg-defs" aria-hidden="true" focusable="false"><filter id="lg-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
      <feGaussianBlur in="noise" stdDeviation="2.5" result="soft" />
      <feDisplacementMap in="SourceGraphic" in2="soft" scale="22" xChannelSelector="R" yChannelSelector="G" />
    </filter></svg>
    <header class="topbar" aria-hidden={!active}><div class="topbar-left"><HeaderPlate env={env} />
      <HomeControl env={env} id="gear" controlKey="gear" className="icon-btn" preserveSelection title={env.translate('Settings')}>
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.9a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5A3.5 3.5 0 1 1 13 8.5a3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)" /></svg>
      </HomeControl>
      <HomeControl env={env} id="search" controlKey="search" className="icon-btn" preserveSelection title={env.translate('Search')}>
        <svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.3 15.3 20 20" /></svg>
      </HomeControl>
      {/* The network service owns this host's contents; the tvOS theme keeps it hidden. */}
      <svg id="network" class="status-icon" viewBox="0 0 24 24" aria-label="Network" />
    </div><nav class="view-tabs" aria-label="App views"><HeaderPlate env={env} tabs />
      <HomeControl env={env} id="home-tab" controlKey="home-tab" className={'view-tab' + (page === 'home' ? ' active' : '')} title={env.translate('Home')} pressed={page === 'home'}>{env.translate('Home')}</HomeControl>
      <HomeControl env={env} id="apps-tab" controlKey="apps-tab" className={'view-tab' + (page === 'apps' ? ' active' : '')} title={env.translate('All apps')} pressed={page === 'apps'}>{env.translate('All apps')}</HomeControl>
    </nav><div class="topbar-right"><div id="custom-clock-root" /><span id="weather" class="weather" hidden /><span id="date" class="date" /><span id="time" class="time" /></div></header>
    <div class="content-viewport" aria-hidden={!active}><div class="content-mask"><main id="rows" ref={env.rows}><div class="home-page-surface" data-page={page}>
      {page === 'home' ? <div class="top-shelf-spacer" /> : null}
      <div style={{ display: page === 'home' ? undefined : 'none' }} hidden={page !== 'home'} id={page === 'home' ? 'grid' : 'home-grid-parked'} class="app-grid tvos-grid" aria-label="Home apps">{cards(visibleHome, page === 'home')}</div>
      <div style={{ display: page === 'apps' ? undefined : 'none' }} hidden={page !== 'apps'} id={page === 'apps' ? 'grid' : 'apps-grid-parked'} class="app-grid tvos-grid" aria-label="All apps">{cards(apps.map(app => app.id), page === 'apps')}</div>
      <p id="apps-empty" class="apps-empty" hidden={page === 'home' || apps.length > 0}>{env.translate('No apps found.')}</p>
      <section id="continue-section" class="row-wrap" hidden={page !== 'home' || !settings.continueWatching || !items.length}><h2>{env.translate('Continue Watching')}</h2>
        <div class="continue-viewport"><div id="continue-items" class="row" aria-label="Continue Watching">{items.map(item => <ContinueCard key={item.key} env={env} item={item} />)}</div></div></section>
      <section id="inputs-section" class="row-wrap inputs-wrap" hidden={page !== 'home' || !inputs.length}><div id="inputs" class="app-grid tvos-grid tvos-inputs" aria-label="Inputs">
        {inputs.map(source => {
          const label = env.runtime.inputs.label(source), port = env.runtime.inputs.portName(source), logo = env.runtime.inputs.icon?.(source);
          const kind = source.type === 'TV' ? 'tv' : /xbox|playstation|ps\d|switch|nintendo|game|console/i.test(label) ? 'game' : /pc|computer|mac|laptop/i.test(label) ? 'pc' : /cable|box|roku|fire|apple|shield|chromecast|blu|dvd|satellite/i.test(label) ? 'box' : 'hdmi';
          const background = env.runtime.inputs.colour?.(source) || (source.type === 'TV' ? 'linear-gradient(135deg,#2d4a7a,#101a2e)' : 'linear-gradient(135deg,#3b404c,#16181e)');
          // Same card as an app: a logo fills the card; otherwise a glyph with the name and port.
          return <HomeControl key={port} env={env} controlKey={'input:' + source.type + ':' + source.number} className={'tile input-tile' + (logo ? ' has-logo' : '')} title={label} style={{ background }}>
            {logo ? <img class="input-logo" alt="" src={logo} /> : <div class="app-fallback">
              <span class="input-glyph" dangerouslySetInnerHTML={{ __html: (env.runtime.tiles as unknown as { ICONS: Record<string, string> }).ICONS[kind] }} />
              <div class="name">{label}{label !== port && source.type !== 'TV' ? <div class="sub">{port}</div> : null}</div>
            </div>}
          </HomeControl>;
        })}
      </div></section>
    </div></main></div></div>{page === 'home' ? <TopShelf env={env} /> : null}<TileMenu env={env} />
  </>;
};
