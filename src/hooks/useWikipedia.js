function useWikipedia(countryName) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!countryName) return;
    setData(null);
    setLoading(true);

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        setData({
          summary: d.extract,
          image: d.thumbnail?.source || d.originalimage?.source || null,
          url: d.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [countryName]);

  return { data, loading };
}