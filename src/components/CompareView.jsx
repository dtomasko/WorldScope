function CompareView({ countries }) {
  const [selected, setSelected] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);

  const popRef       = React.useRef(null);
  const areaRef      = React.useRef(null);
  const popInstance  = React.useRef(null);
  const areaInstance = React.useRef(null);

  const MAX    = 3;
  const COLORS = ['#4d7cfe', '#34d399', '#f59e0b'];
  const LIGHT  = ['rgba(77,124,254,0.12)', 'rgba(52,211,153,0.12)', 'rgba(245,158,11,0.12)'];

  React.useEffect(() => {
    if (searchQuery.length < 1) { setSuggestions([]); return; }
    const q = searchQuery.toLowerCase();
    setSuggestions(
      countries.filter(c => c.name.common.toLowerCase().includes(q) && !selected.find(s => s.cca2 === c.cca2)).slice(0, 6)
    );
  }, [searchQuery, selected]);

  const addCountry = (country) => {
    if (selected.length >= MAX || selected.find(s => s.cca2 === country.cca2)) return;
    setSelected(prev => [...prev, country]);
    setSearchQuery('');
    setSuggestions([]);
  };

  const removeCountry = (cca2) => setSelected(prev => prev.filter(c => c.cca2 !== cca2));

  React.useEffect(() => {
    window.__compareAddCountry = addCountry;
    return () => { delete window.__compareAddCountry; };
  }, [selected]);

  const chartOpts = (fmtLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${fmtLabel(ctx.raw)}` } }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Outfit', size: 14, weight: '600' }, color: '#8090b0' },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { font: { family: 'Outfit', size: 13, weight: '500' }, color: '#8090b0' },
        border: { color: 'rgba(255,255,255,0.06)' },
      }
    }
  });

  React.useEffect(() => {
    if (!popRef.current || selected.length < 2) return;
    if (popInstance.current) popInstance.current.destroy();
    popInstance.current = new Chart(popRef.current, {
      type: 'bar',
      data: {
        labels: selected.map(c => c.name.common),
        datasets: [{ data: selected.map(c => c.population || 0), backgroundColor: selected.map((_, i) => COLORS[i]), borderRadius: 8, borderSkipped: false }]
      },
      options: chartOpts(v => {
        if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
        if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
        if (v >= 1e3) return `${(v/1e3).toFixed(0)}K`;
        return Number(v).toLocaleString();
      })
    });
    return () => { if (popInstance.current) popInstance.current.destroy(); };
  }, [selected]);

  React.useEffect(() => {
    if (!areaRef.current || selected.length < 2) return;
    if (areaInstance.current) areaInstance.current.destroy();
    areaInstance.current = new Chart(areaRef.current, {
      type: 'bar',
      data: {
        labels: selected.map(c => c.name.common),
        datasets: [{ data: selected.map(c => c.area || 0), backgroundColor: selected.map((_, i) => COLORS[i]), borderRadius: 8, borderSkipped: false }]
      },
      options: chartOpts(v => {
        if (v >= 1e6) return `${(v/1e6).toFixed(1)}M km²`;
        if (v >= 1e3) return `${(v/1e3).toFixed(0)}K km²`;
        return `${v.toLocaleString()} km²`;
      })
    });
    return () => { if (areaInstance.current) areaInstance.current.destroy(); };
  }, [selected]);

  const fmt     = n => n ? Number(n).toLocaleString() : '—';
  const fmtArea = n => n ? `${Number(Math.round(n)).toLocaleString()} km²` : '—';

  const statRows = [
    { label: 'Population', getValue: c => c.population || 0, format: c => fmt(c.population) },
    { label: 'Area',       getValue: c => c.area || 0,       format: c => fmtArea(c.area) },
    { label: 'Capital',    getValue: null, format: c => c.capital?.[0] || '—' },
    { label: 'Continent',  getValue: null, format: c => c.continents?.join(', ') || '—' },
    {
      label: 'Currency',
      getValue: (c) => {
        const code = c.currencies ? Object.keys(c.currencies)[0] : null;
        if (!code) return 0;
        const rates = {
          'KWD':0.31,'BHD':0.38,'OMR':0.38,'JOD':0.71,'GBP':0.79,'GIP':0.79,
          'EUR':0.92,'CHF':0.90,'CAD':1.36,'AUD':1.53,'NZD':1.63,'SGD':1.34,
          'USD':1.00,'HKD':7.82,'NOK':10.6,'SEK':10.4,'DKK':6.89,'BND':1.34,
          'MYR':4.7,'QAR':3.64,'SAR':3.75,'AED':3.67,'ILS':3.7,
          'CNY':7.24,'TWD':32,'JPY':149,'KRW':1330,'INR':83,'BRL':5.0,
          'MXN':17.2,'ZAR':18.6,'TRY':32,'RUB':91,'NGN':1500,'EGP':49,
        };
        const rate = rates[code];
        return rate ? (1 / rate) : 0;
      },
      format: c => c.currencies
        ? Object.values(c.currencies).map(x => `${x.name} (${x.symbol || '?'})`).join(', ')
        : '—',
    },
    { label: 'Languages', getValue: null, format: c => c.languages ? Object.values(c.languages).join(', ') : '—' },
  ];

  const card = { background: '#0f1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ ...card, padding: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 700, color: '#f0f4ff', marginBottom: '6px' }}>Compare Countries</h2>
        <p style={{ fontSize: '15px', fontWeight: 500, color: '#6b80a0', marginBottom: '20px' }}>
          Select up to {MAX} countries to compare side-by-side.
        </p>

        {selected.length < MAX && (
          <div style={{ position: 'relative', maxWidth: '480px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#3a4f6e', pointerEvents: 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder={`Add country ${selected.length + 1} of ${MAX}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', fontSize: '15px' }}
            />
            {suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#0f1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', zIndex: 50 }}>
                {suggestions.map((c, i) => (
                  <button key={c.cca2} onClick={() => addCountry(c)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'none', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(77,124,254,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <img src={c.flags?.png} alt="" style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: '#b8c5e0', flex: 1, textAlign: 'left' }}>{c.name.common}</span>
                    <span style={{ fontSize: '12px', color: '#3a4f6e' }}>{c.continents?.[0]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selected.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {selected.map((c, i) => (
              <div key={c.cca2} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '99px', border: `1px solid ${COLORS[i]}60`, background: LIGHT[i] }}>
                <img src={c.flags?.png} alt="" style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS[i], fontFamily: 'Outfit, sans-serif' }}>{c.name.common}</span>
                <button onClick={() => removeCountry(c.cca2)} style={{ background: 'none', border: 'none', color: COLORS[i], cursor: 'pointer', fontSize: '14px', opacity: 0.6, lineHeight: 1, padding: '0 2px' }}>×</button>
              </div>
            ))}
            {selected.length > 1 && (
              <button onClick={() => setSelected([])}
                style={{ padding: '6px 14px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#6b80a0', fontSize: '13px', cursor: 'pointer' }}>
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {selected.length === 0 && (
        <div style={{ ...card, padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, color: '#b8c5e0', marginBottom: '8px' }}>No countries selected</p>
          <p style={{ fontSize: '14px', color: '#3a4f6e' }}>Search above or click countries on the map</p>
        </div>
      )}
      {selected.length === 1 && (
        <div style={{ ...card, padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: '#6b80a0' }}>Add at least one more country to compare</p>
        </div>
      )}

      {selected.length >= 2 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selected.length}, 1fr)`, gap: '12px' }}>
            {selected.map((c, i) => (
              <div key={c.cca2} style={{ ...card, overflow: 'hidden', borderTop: `3px solid ${COLORS[i]}` }}>
                <img src={c.flags?.svg || c.flags?.png} alt={c.name.common} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '14px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 700, color: '#f0f4ff', marginBottom: '3px' }}>{c.name.common}</p>
                  <p style={{ fontSize: '12px', color: '#3a4f6e' }}>{c.continents?.[0]}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: 700, color: '#f0f4ff' }}>Side-by-side Stats</h3>
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: `${120 + selected.length * 160}px` }}>
                {statRows.map((row, ri) => {
                  let winnerCca2 = null;
                  if (row.getValue) {
                    const vals = selected.map(c => ({ cca2: c.cca2, val: row.getValue(c) }));
                    const max = Math.max(...vals.map(v => v.val));
                    if (max > 0) winnerCca2 = vals.find(v => v.val === max)?.cca2;
                  }
                  return (
                    <div key={row.label} style={{ display: 'grid', gridTemplateColumns: `120px repeat(${selected.length}, 1fr)`, gap: '8px', padding: '12px 20px', borderBottom: ri < statRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b80a0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{row.label}</div>
                      {selected.map((c, i) => {
                        const isWinner = winnerCca2 === c.cca2;
                        return (
                          <div key={c.cca2} style={{ fontSize: '14px', fontWeight: 600, padding: '8px 12px', borderRadius: '8px', color: isWinner ? '#fff' : '#b8c5e0', background: isWinner ? COLORS[i] : 'rgba(255,255,255,0.04)', wordBreak: 'break-word' }}>
                            {row.format(c)}
                            {isWinner && <span style={{ marginLeft: '6px', fontSize: '12px', opacity: 0.8 }}></span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: '22px' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: 700, color: '#c0d0e8', marginBottom: '4px' }}>Population</h3>
            <p style={{ fontSize: '13px', color: '#3a4f6e', marginBottom: '16px' }}>Total population per country</p>
            <div style={{ height: '240px' }}><canvas ref={popRef} /></div>
          </div>

          <div style={{ ...card, padding: '22px' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: 700, color: '#c0d0e8', marginBottom: '4px' }}>Land Area</h3>
            <p style={{ fontSize: '13px', color: '#3a4f6e', marginBottom: '16px' }}>Total land area in km²</p>
            <div style={{ height: '240px' }}><canvas ref={areaRef} /></div>
          </div>
        </>
      )}
    </div>
  );
}