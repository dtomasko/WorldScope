function App() {
  const { countries, loading, error } = useCountries();
  const [activeTab, setActiveTab] = React.useState('map');
  const [selectedCountry, setSelectedCountry] = React.useState(null);

  const handleCountryClick = (country) => {
    if (activeTab === 'compare') {
      if (window.__compareAddCountry) window.__compareAddCountry(country);
    } else {
      setSelectedCountry(country);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07090f', fontFamily: 'Inter, sans-serif' }}>
      <Navbar
        countries={countries}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCountrySelect={(country) => {
          setActiveTab('map');
          setSelectedCountry(country);
          setTimeout(() => { if (window.__mapZoomTo) window.__mapZoomTo(country); }, 100);
        }}
      />

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '65px 20px 60px' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '12px', color: '#3a4f6e', fontSize: '14px' }}>
            <div style={{ width: '18px', height: '18px', border: '2px solid #4d7cfe', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            Loading countries...
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#f87171', fontSize: '14px' }}>Failed to load: {error}</div>
        )}
        {!loading && !error && (
          <div>
            {activeTab === 'map' && (
              <WorldMap countries={countries} onCountryClick={handleCountryClick} selectedCountry={selectedCountry} />
            )}
            {activeTab === 'compare' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(77,124,254,0.15)' }}>
                  <div style={{ background: 'rgba(77,124,254,0.08)', padding: '12px 20px', borderBottom: '1px solid rgba(77,124,254,0.12)', fontSize: '15px', fontWeight: 700, color: '#7fa4ff', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.2px' }}>
  Click up to 3 countries on the map to compare, or use the search below
</div>
                  <WorldMap countries={countries} onCountryClick={handleCountryClick} selectedCountry={null} />
                </div>
                <CompareView countries={countries} onCountryClick={handleCountryClick} />
              </div>
            )}
            {activeTab === 'leaderboard' && (
  <Leaderboard
    key={Date.now()}
    countries={countries}
    onCountryClick={setSelectedCountry}
  />
)}
          </div>
        )}
      </main>

      <CountryPanel country={selectedCountry} onClose={() => setSelectedCountry(null)} allCountries={countries} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>


      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '150px', padding: '32px 20px', textAlign: 'center' }}>
  <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#4d7cfe' }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b80a0', fontFamily: 'Outfit, sans-serif' }}>WorldScope</span>
    </div>
    <p style={{ fontSize: '12px', color: '#3a4f6e', lineHeight: 1.6, maxWidth: '420px' }}>
      Data sourced from <a href="https://restcountries.com" target="_blank" rel="noopener noreferrer" style={{ color: '#4d7cfe', textDecoration: 'none' }}>REST Countries</a>,{' '}
      <a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer" style={{ color: '#4d7cfe', textDecoration: 'none' }}>World Bank</a>, and{' '}
      <a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer" style={{ color: '#4d7cfe', textDecoration: 'none' }}>Wikipedia</a>.
      For educational purposes only.
    </p>
    <p style={{ fontSize: '11px', color: '#3a4f6e' }}>© {new Date().getFullYear()} WorldScope</p>
  </div>
</footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);