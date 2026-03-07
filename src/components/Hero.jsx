function Hero({ countriesCount }) {
  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '52px 24px 36px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '580px' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '99px', background: 'rgba(77,124,254,0.1)', border: '1px solid rgba(77,124,254,0.2)', width: 'fit-content' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4d7cfe', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          <span style={{ fontSize: '13px', color: '#7fa4ff', fontWeight: 600, letterSpacing: '0.2px' }}>Live · REST Countries API</span>
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: '#f0f4ff', lineHeight: 1.12, letterSpacing: '-0.6px', fontFamily: 'Outfit, sans-serif' }}>
          Explore every<br />
          <span style={{ color: '#4d7cfe' }}>nation on Earth</span>
        </h1>

        <p style={{ fontSize: '17px', color: '#8090b0', lineHeight: 1.75, maxWidth: '460px' }}>
          Search, compare, and visualize data for{' '}
          <span style={{ color: '#c8d8f0', fontWeight: 600 }}>{countriesCount || '250+'} countries</span>{' '}
          — population, GDP, languages, and more.
        </p>

        {countriesCount > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
            {[
              { v: countriesCount, l: 'Countries' },
              { v: '8',            l: 'Regions' },
              { v: '100+',         l: 'Languages' },
            ].map(s => (
              <div key={s.l} style={{ padding: '14px 24px', background: '#0f1525', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', textAlign: 'center', minWidth: '90px' }}>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#f0f4ff', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.5px' }}>{s.v}</div>
                <div style={{ fontSize: '12px', color: '#4d6080', marginTop: '3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
    </section>
  );
}