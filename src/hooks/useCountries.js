function useCountries() {
  const [countries, setCountries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const cached = sessionStorage.getItem('ws_countries');
    if (cached) {
      setCountries(JSON.parse(cached));
      setLoading(false);
      return;
    }
    fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2,capital,timezones,population,area,languages,currencies,continents')
      .then(r => r.json())
      .then(data => {
        const sorted = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        sessionStorage.setItem('ws_countries', JSON.stringify(sorted));
        setCountries(sorted);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { countries, loading, error };
}