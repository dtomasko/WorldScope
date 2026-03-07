function useWorldBank(cca2) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!cca2) return;
    setData(null);
    setLoading(true);

    const base = `https://api.worldbank.org/v2/country/${cca2}/indicator`;
    const params = `?format=json&mrv=30`;

    Promise.all([
      fetch(`${base}/SP.POP.TOTL${params}`).then(r => r.json()),
      fetch(`${base}/NY.GDP.MKTP.CD${params}`).then(r => r.json()),
      fetch(`${base}/SP.DYN.CBRT.IN${params}`).then(r => r.json()),
      fetch(`${base}/SP.DYN.CDRT.IN${params}`).then(r => r.json()),
      fetch(`${base}/SE.ADT.LITR.ZS${params}`).then(r => r.json()),
    ])
    .then(([pop, gdp, birth, death, literacy]) => {
      const clean = (raw) => {
        if (!raw[1]) return [];
        return raw[1]
          .filter(e => e.value !== null)
          .sort((a, b) => a.date - b.date);
      };
      setData({
        population: clean(pop),
        gdp:        clean(gdp),
        birth:      clean(birth),
        death:      clean(death),
        literacy:   clean(literacy),
      });
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [cca2]);

  return { data, loading };
}