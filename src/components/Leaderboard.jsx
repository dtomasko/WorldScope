function Leaderboard({ countries, onCountryClick }) {
  const [metric, setMetric] = React.useState('population');
  const [order,  setOrder]  = React.useState('desc');
  const [rateMap, setRateMap] = React.useState({});
  const [animKey, setAnimKey] = React.useState(0);

  React.useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d.rates) setRateMap(d.rates); })
      .catch(() => {});
  }, []);

  const metrics = [
    { id: 'population',       label: 'Population' },
    { id: 'area',             label: 'Area' },
    { id: 'languages',        label: 'Languages' },
    { id: 'currencyStrength', label: 'Currency' },
  ];

  const getValue = (country) => {
    if (metric === 'population')       return country.population || 0;
    if (metric === 'area')             return country.area || 0;
    if (metric === 'languages')        return Object.keys(country.languages || {}).length;
    if (metric === 'currencyStrength') {
      const code = country.currencies ? Object.keys(country.currencies)[0] : null;
      const rate = code ? rateMap[code] : null;
      return rate ? (1 / rate) : 0;
    }
    return 0;
  };

const fmt = (country) => {
  const v = getValue(country);
  if (metric === 'population') {
    if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v/1e3).toFixed(0)}K`;
    return String(v);
  }
  if (metric === 'area') {
    return v >= 1e6 ? `${(v/1e6).toFixed(2)}M km²` : `${v.toLocaleString()} km²`;
  }
  if (metric === 'languages') {
    return `${v} language${v !== 1 ? 's' : ''}`;
  }
  if (metric === 'currencyStrength') {
    const code = country.currencies ? Object.keys(country.currencies)[0] : null;
    const name = country.currencies ? Object.values(country.currencies)[0]?.name : null;
    if (!code || !v) return '—';
    const usdEquiv = 1 / v;
    const display = v >= 1 ? `$${v.toFixed(2)}` : `$${v.toFixed(4)}`;
    return `${name || code} · 1 ${code} = ${display}`;
  }
  return '—';
};
  const medalColors = ['#f5c842', '#c0c8d8', '#cd8c52'];

  const sorted = [...countries]
    .filter(c => getValue(c) > 0)
    .sort((a, b) => order === 'desc' ? getValue(b) - getValue(a) : getValue(a) - getValue(b))
    .slice(0, 30);

  const maxVal = sorted.length > 0 ? getValue(sorted[0]) : 1;

  React.useEffect(() => { setAnimKey(k => k + 1); }, [metric, order]);

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', paddingBottom: '48px' }}>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          {metrics.map(m => (
            <button key={m.id} onClick={() => setMetric(m.id)}
              style={{
                padding: '9px 18px', borderRadius: '8px', border: '1px solid',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 180ms',
                fontFamily: 'Outfit, sans-serif',
                background: metric === m.id ? 'rgba(77,124,254,0.2)' : '#0f1525',
                borderColor: metric === m.id ? 'rgba(77,124,254,0.5)' : 'rgba(255,255,255,0.09)',
                color: metric === m.id ? '#a0c0ff' : '#8090b0',
              }}
            >{m.label}</button>
          ))}
        </div>
        <select value={order} onChange={e => setOrder(e.target.value)}
          style={{ padding: '9px 14px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', borderRadius: '8px', flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}>
          <option value="desc">Highest First</option>
          <option value="asc">Lowest First</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {sorted.map((country, i) => {
          const val = getValue(country);
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const medal = i < 3 ? medalColors[i] : null;
          const stagger = Math.min(i * 25, 500);

          return (
            <div key={country.cca2}
              onClick={() => onCountryClick(country)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', background: '#0d1422', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 180ms' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(77,124,254,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div
                key={`${animKey}-${country.cca2}`}
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`,
                  background: i === 0
                    ? 'rgba(245,200,66,0.14)'
                    : i === 1
                    ? 'rgba(192,200,216,0.11)'
                    : i === 2
                    ? 'rgba(205,140,82,0.11)'
                    : 'rgba(77,124,254,0.09)',
                  borderRight: i < 3 ? `2px solid ${medalColors[i]}30` : '2px solid rgba(77,124,254,0.18)',
                  animation: `barFill 700ms cubic-bezier(0.16,1,0.3,1) both`,
                  animationDelay: `${stagger}ms`,
                  pointerEvents: 'none',
                }}
              />

              <div style={{ width: '30px', textAlign: 'center', flexShrink: 0, zIndex: 1 }}>
                {medal ? (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: `${medal}18`, border: `1.5px solid ${medal}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: medal, margin: '0 auto', fontFamily: 'Outfit, sans-serif' }}>
                    {i + 1}
                  </div>
                ) : (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#3a4f6e', fontFamily: 'Outfit, sans-serif' }}>{i + 1}</span>
                )}
              </div>

              <img src={country.flags?.png} alt="" style={{ width: '32px', height: '22px', objectFit: 'cover', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0, zIndex: 1 }} />

              <span style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: '#ddeaff', fontFamily: 'Outfit, sans-serif', zIndex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {country.name.common}
              </span>

              <span style={{ fontSize: '15px', fontWeight: 700, color: '#a0b8d8', fontFamily: 'Outfit, sans-serif', flexShrink: 0, zIndex: 1, minWidth: '80px', textAlign: 'right' }}>
                {fmt(country)}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes barFill {
          from { width: 0 !important; }
        }
      `}</style>
    </div>
  );
}