function CountryPanel({ country, onClose, allCountries }) {
  if (!country) return null;

  const { data: wiki, loading: wikiLoading } = useWikipedia(country.name.common);
  const [activeTab, setActiveTab] = React.useState('overview');
  React.useEffect(() => setActiveTab('overview'), [country?.cca2]);

  const fmt = n => n ? Number(n).toLocaleString() : '—';

  const regionMap = {
    'US':{'UTC-10:00':'Hawaii','UTC-09:00':'Alaska','UTC-08:00':'California, Washington','UTC-07:00':'Arizona, Colorado','UTC-06:00':'Texas, Illinois','UTC-05:00':'New York, Florida'},
    'CA':{'UTC-08:00':'British Columbia','UTC-07:00':'Alberta','UTC-06:00':'Saskatchewan','UTC-05:00':'Ontario, Quebec','UTC-04:00':'Nova Scotia','UTC-03:30':'Newfoundland'},
    'RU':{'UTC+02:00':'Kaliningrad','UTC+03:00':'Moscow','UTC+04:00':'Samara','UTC+05:00':'Yekaterinburg','UTC+06:00':'Omsk','UTC+07:00':'Krasnoyarsk','UTC+08:00':'Irkutsk','UTC+09:00':'Yakutsk','UTC+10:00':'Vladivostok','UTC+11:00':'Magadan','UTC+12:00':'Kamchatka'},
    'AU':{'UTC+08:00':'Western Australia','UTC+08:45':'Eucla','UTC+09:30':'Northern Territory, South Australia','UTC+10:00':'Queensland, NSW, Victoria','UTC+10:30':'Lord Howe Island','UTC+11:00':'Norfolk Island'},
    'BR':{'UTC-05:00':'Acre','UTC-04:00':'Amazonas, Mato Grosso','UTC-03:00':'São Paulo, Rio de Janeiro','UTC-02:00':'Fernando de Noronha'},
    'MX':{'UTC-08:00':'Baja California','UTC-07:00':'Sonora, Chihuahua','UTC-06:00':'Mexico City, Jalisco','UTC-05:00':'Quintana Roo'},
    'ID':{'UTC+07:00':'Java, Sumatra','UTC+08:00':'Bali, Kalimantan','UTC+09:00':'Papua, Maluku'},
  };

  const formatTimezones = () => {
    if (!country.timezones?.length) return '—';
    if (country.timezones.length === 1) return country.timezones[0];
    const zones = regionMap[country.cca2];
    return country.timezones.map(tz => {
      const region = zones?.[tz];
      return region ? `${tz} — ${region}` : tz;
    }).join('\n');
  };

  const stats = [
    { label: 'Population',   value: fmt(country.population) },
    { label: 'Area',         value: country.area ? `${fmt(Math.round(country.area))} km²` : '—' },
    { label: 'Capital',      value: country.capital?.[0] || '—' },
    { label: 'Region',       value: country.continents?.join(', ') || '—' },
    { label: 'Currency',     value: country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol||'?'})`).join(', ') : '—' },
    { label: 'Languages',    value: country.languages ? Object.values(country.languages).join(', ') : '—' },
    { label: 'Country Code', value: country.cca2 || '—' },
    { label: 'Timezones',    value: formatTimezones() },
  ];

  const links = [
    { label: 'Wikipedia',         url: wiki?.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(country.name.common)}` },
    { label: 'Google Maps',       url: `https://www.google.com/maps/search/${encodeURIComponent(country.name.common)}` },
    { label: 'CIA World Factbook',url: `https://www.cia.gov/the-world-factbook/countries/${country.name.common.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}/` },
    { label: 'World Bank',        url: `https://www.worldbank.org/en/search#?q=${encodeURIComponent(country.name.common)}` },
    { label: 'UN Data',           url: `https://data.un.org/en/iso/${country.cca2?.toLowerCase()}.html` },
    { label: 'Travel Info',       url: `https://www.lonelyplanet.com/search?q=${encodeURIComponent(country.name.common)}` },
  ];

  return (
    <div className="animate-slide-in country-panel-mobile" style={{ position: 'fixed', inset: '0 0 0 auto', width: '100%', maxWidth: '480px', background: '#080c15', borderLeft: '1px solid rgba(255,255,255,0.07)', zIndex: 200, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      <div style={{ position: 'relative', height: '200px', flexShrink: 0, overflow: 'hidden' }}>
        <img src={country.flags?.svg || country.flags?.png} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,12,21,0.1) 0%, rgba(8,12,21,0.85) 100%)' }} />

        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', width: '32px', height: '32px', borderRadius: '99px', background: 'rgba(8,12,21,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: '#b8c5e0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', backdropFilter: 'blur(8px)' }}>
          <Icon.Close />
        </button>

        <div style={{ position: 'absolute', bottom: '18px', left: '20px', right: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '5px' }}>
            <img src={country.flags?.png} alt="" style={{ width: '32px', height: '22px', objectFit: 'cover', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.25)' }} />
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.4px', fontFamily: 'Outfit, sans-serif' }}>{country.name.common}</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', paddingLeft: '44px' }}>{country.name.official}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,12,21,0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(20px)' }}>
        {['overview', 'charts', 'details'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '7px 18px', borderRadius: '99px', border: '1px solid', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 180ms', fontFamily: 'Outfit, sans-serif', textTransform: 'capitalize',
              background: activeTab === t ? 'rgba(77,124,254,0.18)' : 'transparent',
              borderColor: activeTab === t ? 'rgba(77,124,254,0.4)' : 'transparent',
              color: activeTab === t ? '#7fa4ff' : '#8090b0',
            }}
          >{t}</button>
        ))}
      </div>

      <div style={{ padding: '20px', flex: 1 }}>

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {stats.slice(0, 4).map(s => (
                <div key={s.label} style={{ background: '#141c2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#4d6080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#f0f4ff', lineHeight: 1.3, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {(wiki?.summary || wikiLoading) && (
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
                {wikiLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[100, 85, 92, 70].map((w, i) => (
                      <div key={i} style={{ height: '12px', borderRadius: '6px', background: 'var(--bg4)', width: `${w}%`, animation: 'pulse 1.5s ease infinite', animationDelay: `${i*0.1}s` }} />
                    ))}
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '14px', color: '#8090b0', lineHeight: 1.8, marginBottom: '14px' }}>
                      {wiki.summary?.slice(0, 400)}{wiki.summary?.length > 400 ? '...' : ''}
                    </p>
                    <a href={wiki.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4d7cfe', textDecoration: 'none', fontWeight: 500 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Read on Wikipedia
                    </a>
                  </>
                )}
              </div>
            )}

            <div>
              <div style={{ fontSize: '12px', color: '#4d6080', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Useful Links</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {links.map(l => (
                  <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="pill" style={{ fontSize: '13px', fontWeight: 500 }}>
                    <Icon.ExternalLink />
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            {wiki?.image && (
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                <img src={wiki.image} alt={country.name.common} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="animate-fade-in">
            <MiniChart country={country} allCountries={allCountries} />
          </div>
        )}

        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="animate-fade-in">
            {stats.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '14px 16px', background: '#141c2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px' }}>
                <div style={{ fontSize: '12px', color: '#4d6080', fontWeight: 600, minWidth: '110px', paddingTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
                <div style={{ fontSize: '15px', color: '#c8d8f0', fontWeight: 500, flex: 1, whiteSpace: 'pre-line', lineHeight: 1.65 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}