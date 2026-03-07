function useExchangeRate(currencies) {
  const [rates, setRates] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!currencies) return;
    const currencyCode = Object.keys(currencies)[0];
    if (!currencyCode || currencyCode === 'USD') {
      setRates({ code: 'USD', rate: 1, symbol: '$' });
      return;
    }

    setRates(null);
    setLoading(true);

    fetch(`https://open.er-api.com/v6/latest/USD`)
      .then(r => r.json())
      .then(data => {
        const rate = data.rates?.[currencyCode];
        const symbol = Object.values(currencies)[0]?.symbol || currencyCode;
        const name = Object.values(currencies)[0]?.name || currencyCode;
        setRates(rate ? { code: currencyCode, rate, symbol, name } : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currencies ? Object.keys(currencies)[0] : null]);

  return { rates, loading };
}