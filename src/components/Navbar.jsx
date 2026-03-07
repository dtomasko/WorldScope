// Icons
const Icon = {
  Globe: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Compare: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><line x1="12" y1="3" x2="12" y2="21"/>
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
};

function Navbar({ countries, onCountrySelect, activeTab, onTabChange }) {
  const [inputValue, setInputValue] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const inputRef = React.useRef(null);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (inputValue.length < 1) { setSuggestions([]); setShowDropdown(false); return; }
    const q = inputValue.toLowerCase();
    const r = countries.filter(c => c.name.common.toLowerCase().startsWith(q)).slice(0, 7);
    setSuggestions(r);
    setShowDropdown(r.length > 0);
  }, [inputValue, countries]);

  const select = (country) => {
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
    setMobileOpen(false);
    onCountrySelect(country);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) select(suggestions[0]);
    if (e.key === 'Escape') { setInputValue(''); setShowDropdown(false); }
  };

  React.useEffect(() => {
    const h = (e) => {
      if (!inputRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const tabs = [
    { id: 'map',         Icon: Icon.Globe,    label: 'World Map' },
    { id: 'leaderboard', Icon: Icon.BarChart, label: 'Leaderboard' },
    { id: 'compare',     Icon: Icon.Compare,  label: 'Compare' },
  ];

  const SearchDropdown = ({ ref: _ref }) => showDropdown ? (
    <div ref={dropdownRef} style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#0f1525', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', zIndex: 300 }}>
      {suggestions.map((c, i) => (
        <button key={c.cca2} onMouseDown={e => { e.preventDefault(); select(c); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', background: 'none', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', transition: 'background 150ms', fontFamily: 'Outfit, sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(77,124,254,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <img src={c.flags?.png} alt="" style={{ width: '26px', height: '18px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '14px', color: '#e8eeff', flex: 1, textAlign: 'left', fontWeight: 500 }}>{c.name.common}</span>
          <span style={{ fontSize: '12px', color: '#4d6080' }}>{c.continents?.[0]}</span>
          {i === 0 && <span style={{ fontSize: '11px', color: '#3a4f6e', marginLeft: '4px' }}>↵</span>}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <nav style={{ background: 'rgba(7,9,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0, marginRight: '4px' }}>
          <span style={{ color: '#4d7cfe' }}><Icon.Globe /></span>
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.4px', fontFamily: 'Outfit, sans-serif' }}>WorldScope</span>
        </div>

        <div className="hidden md:flex" style={{ flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '99px', padding: '4px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => onTabChange(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 20px', borderRadius: '99px', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 180ms ease', fontFamily: 'Outfit, sans-serif',
                  background: activeTab === t.id ? 'rgba(77,124,254,0.2)' : 'transparent',
                  color: activeTab === t.id ? '#7fa4ff' : '#8090b0',
                }}
              >
                <span style={{ opacity: activeTab === t.id ? 1 : 0.6 }}><t.Icon /></span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block" style={{ position: 'relative', width: '230px', flexShrink: 0 }}>
          <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#4d6080', pointerEvents: 'none' }}><Icon.Search /></span>
          <input ref={inputRef} type="text" placeholder="Search country..." value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKey}
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px', fontSize: '14px' }} />
          <SearchDropdown />
        </div>

        <button onClick={() => setMobileOpen(p => !p)} className="flex md:hidden"
          style={{ marginLeft: 'auto', width: '38px', height: '38px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#8090b0', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {mobileOpen ? <Icon.Close /> : <Icon.Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ background: 'rgba(7,9,15,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
          <div style={{ display: 'flex', gap: '6px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { onTabChange(t.id); setMobileOpen(false); }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 6px', borderRadius: '9px', border: '1px solid', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 180ms', fontFamily: 'Outfit, sans-serif',
                  background: activeTab === t.id ? 'rgba(77,124,254,0.15)' : 'rgba(255,255,255,0.03)',
                  borderColor: activeTab === t.id ? 'rgba(77,124,254,0.35)' : 'rgba(255,255,255,0.07)',
                  color: activeTab === t.id ? '#7fa4ff' : '#8090b0',
                }}
              >
                <t.Icon />{t.label}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#4d6080', pointerEvents: 'none' }}><Icon.Search /></span>
            <input type="text" placeholder="Search country..." value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKey}
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', fontSize: '15px' }} />
            {showDropdown && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#0f1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', zIndex: 200 }}>
                {suggestions.map((c, i) => (
                  <button key={c.cca2} onMouseDown={e => { e.preventDefault(); select(c); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', background: 'none', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                  >
                    <img src={c.flags?.png} alt="" style={{ width: '26px', height: '18px', objectFit: 'cover', borderRadius: '3px' }} />
                    <span style={{ fontSize: '15px', color: '#e8eeff' }}>{c.name.common}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}