function MiniChart({ country }) {
  const { data: wb, loading: wbLoading } = useWorldBank(country?.cca2);
  const { rates, loading: rateLoading } = useExchangeRate(country?.currencies);

  const popRef    = React.useRef(null);
  const gdpRef    = React.useRef(null);
  const birthRef  = React.useRef(null);

  const popChart   = React.useRef(null);
  const gdpChart   = React.useRef(null);
  const birthChart = React.useRef(null);
  const literacyRef   = React.useRef(null);
  const literacyChart = React.useRef(null);

  const fmtPop = v => {
    if (!v) return '—';
    if (v >= 1e9) return `${(v/1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v/1e3).toFixed(0)}K`;
    return Number(v).toLocaleString();
  };

  const fmtGdp = v => {
    if (!v) return '—';
    if (v >= 1e12) return `$${(v/1e12).toFixed(2)}T`;
    if (v >= 1e9)  return `$${(v/1e9).toFixed(1)}B`;
    if (v >= 1e6)  return `$${(v/1e6).toFixed(1)}M`;
    return `$${Number(v).toLocaleString()}`;
  };

  const pctChange = (arr) => {
    if (!arr?.length) return '—';
    const first = arr[0]?.value;
    const last  = arr[arr.length - 1]?.value;
    if (!first || !last) return '—';
    const pct = (((last - first) / first) * 100).toFixed(1);
    return `${pct > 0 ? '+' : ''}${pct}%`;
  };

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'Outfit', size: 12, weight: '500' }, color: '#8090b0', maxRotation: 0 },
      border: { color: 'rgba(255,255,255,0.06)' },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { font: { family: 'Outfit', size: 12, weight: '500' }, color: '#8090b0' },
      border: { color: 'rgba(255,255,255,0.06)' },
    }
  }
};
  React.useEffect(() => {
    if (!wb?.population?.length || !popRef.current) return;
    if (popChart.current) popChart.current.destroy();

    popChart.current = new Chart(popRef.current, {
      type: 'line',
      data: {
        labels: wb.population.map(e => e.date),
        datasets: [{
          data: wb.population.map(e => e.value),
          borderColor: '#4d7cfe',
          backgroundColor: 'rgba(79,70,229,0.07)',
          borderWidth: 2.5,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: '#4d7cfe',
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            callbacks: { label: ctx => ` ${fmtPop(ctx.raw)}` }
          }
        },
        scales: {
          ...chartDefaults.scales,
          y: {
            ...chartDefaults.scales.y,
            ticks: {
              ...chartDefaults.scales.y.ticks,
              callback: v => fmtPop(v),
            }
          }
        }
      }
    });
    return () => { if (popChart.current) popChart.current.destroy(); };
  }, [wb]);

  React.useEffect(() => {
    if (!wb?.gdp?.length || !gdpRef.current) return;
    if (gdpChart.current) gdpChart.current.destroy();

    gdpChart.current = new Chart(gdpRef.current, {
      type: 'bar',
      data: {
        labels: wb.gdp.map(e => e.date),
        datasets: [{
          data: wb.gdp.map(e => e.value),
          backgroundColor: wb.gdp.map((_, i) =>
            i === wb.gdp.length - 1 ? '#4f46e5' : '#c7d2fe'
          ),
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        ...chartDefaults,
        plugins: {
          ...chartDefaults.plugins,
          tooltip: {
            callbacks: { label: ctx => ` ${fmtGdp(ctx.raw)}` }
          }
        },
        scales: {
          ...chartDefaults.scales,
          y: {
            ...chartDefaults.scales.y,
            ticks: {
              ...chartDefaults.scales.y.ticks,
              callback: v => fmtGdp(v),
            }
          }
        }
      }
    });
    return () => { if (gdpChart.current) gdpChart.current.destroy(); };
  }, [wb]);

React.useEffect(() => {
  if (!wb?.literacy?.length || !literacyRef.current) return;
  if (literacyChart.current) literacyChart.current.destroy();

  literacyChart.current = new Chart(literacyRef.current, {
    type: 'line',
    data: {
      labels: wb.literacy.map(e => e.date),
      datasets: [{
        data: wb.literacy.map(e => e.value),
        borderColor: '#34d399',
        backgroundColor: 'rgba(16,185,129,0.07)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#34d399',
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      ...chartDefaults,
      plugins: {
        ...chartDefaults.plugins,
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.raw?.toFixed(1)}%` }
        }
      },
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          min: 0,
          max: 100,
          ticks: {
            ...chartDefaults.scales.y.ticks,
            callback: v => `${v}%`,
          }
        }
      }
    }
  });
  return () => { if (literacyChart.current) literacyChart.current.destroy(); };
}, [wb]);

React.useEffect(() => {
  if (!wb?.birth?.length || !wb?.death?.length || !birthRef.current) return;
  if (birthChart.current) birthChart.current.destroy();


  const birthYears = new Set(wb.birth.map(e => e.date));
  const deathYears = new Set(wb.death.map(e => e.date));
  const commonYears = [...birthYears].filter(y => deathYears.has(y)).sort();

  const birthAligned = commonYears.map(y => wb.birth.find(e => e.date === y)?.value);
  const deathAligned = commonYears.map(y => wb.death.find(e => e.date === y)?.value);

  birthChart.current = new Chart(birthRef.current, {
    type: 'line',
    data: {
      labels: commonYears,
      datasets: [
        {
          label: 'Birth rate',
          data: birthAligned,
          borderColor: '#4d7cfe',
          backgroundColor: 'rgba(99,102,241,0.08)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Death rate',
          data: deathAligned,
          borderColor: '#f87171',
          backgroundColor: 'rgba(244,63,94,0.06)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.4,
        }
      ]
    },
    options: {
      ...chartDefaults,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { family: 'DM Sans', size: 10 },
            color: '#6b7280',
            boxWidth: 12,
            padding: 12,
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.raw?.toFixed(1)} per 1,000`
          }
        }
      },
      scales: {
        ...chartDefaults.scales,
        y: {
          ...chartDefaults.scales.y,
          ticks: {
            ...chartDefaults.scales.y.ticks,
            callback: v => `${v}`
          }
        }
      }
    }
  });
  return () => { if (birthChart.current) birthChart.current.destroy(); };
}, [wb]);

  if (wbLoading || rateLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading data...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="space-y-5">

      <div className="rounded-xl p-4" style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', marginBottom: '0' }}>
        <div className="flex items-center justify-between mb-1">
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#c0d0e8' }} className="uppercase tracking-wider">Population — last 30 years</div>
          <span style={{ fontSize: '10px', color: '#4d7cfe', background: 'rgba(77,124,254,0.1)', border: '1px solid rgba(77,124,254,0.2)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>World Bank</span>
        </div>
        {wb?.population?.length ? (
          <>
            <div className="flex gap-4 text-xs text-gray-500 mb-3">
              <span><span className="font-semibold text-gray-800">{fmtPop(wb.population[wb.population.length-1]?.value)}</span> current</span>
              <span><span className="font-semibold text-gray-800">{pctChange(wb.population)}</span> since {wb.population[0]?.date}</span>
            </div>
            <div style={{ height: '200px' }}><canvas ref={popRef} /></div>
          </>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">No data available</p>
        )}
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', marginBottom: '0' }}>
        <div className="flex items-center justify-between mb-1">
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#c0d0e8' }} className="uppercase tracking-wider">GDP — last 30 years</div>
          <span style={{ fontSize: '10px', color: '#4d7cfe', background: 'rgba(77,124,254,0.1)', border: '1px solid rgba(77,124,254,0.2)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>World Bank</span>
        </div>
        {wb?.gdp?.length ? (
          <>
            <div className="flex gap-4 text-xs text-gray-500 mb-3">
              <span><span className="font-semibold text-gray-800">{fmtGdp(wb.gdp[wb.gdp.length-1]?.value)}</span> current</span>
              <span><span className="font-semibold text-gray-800">{pctChange(wb.gdp)}</span> since {wb.gdp[0]?.date}</span>
            </div>
            <div style={{ height: '200px' }}><canvas ref={gdpRef} /></div>
          </>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">No data available</p>
        )}
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', marginBottom: '0' }}>
        <div className="flex items-center justify-between mb-1">
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#c0d0e8' }} className="uppercase tracking-wider">Birth vs Death rate per 1,000</div>
          <span style={{ fontSize: '10px', color: '#4d7cfe', background: 'rgba(77,124,254,0.1)', border: '1px solid rgba(77,124,254,0.2)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>World Bank</span>
        </div>
        {wb?.birth?.length && wb?.death?.length ? (
          <>
            <div className="flex gap-4 text-xs text-gray-500 mb-3">
              <span>
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-1"></span>
                Birth: <span className="font-semibold text-gray-800">{wb.birth[wb.birth.length-1]?.value?.toFixed(1)}</span>
              </span>
              <span>
                <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1"></span>
                Death: <span className="font-semibold text-gray-800">{wb.death[wb.death.length-1]?.value?.toFixed(1)}</span>
              </span>
            </div>
            <div style={{ height: '200px' }}><canvas ref={birthRef} /></div>
          </>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">No data available</p>
        )}
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', marginBottom: '0' }}>
        <div className="flex items-center justify-between mb-3">
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#c0d0e8' }} className="uppercase tracking-wider">Exchange Rate vs USD</div>
          {rates && <span style={{ fontSize: '10px', color: '#4d7cfe', background: 'rgba(77,124,254,0.1)', border: '1px solid rgba(77,124,254,0.2)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>Live</span>}
        </div>
        {rateLoading && (
          <div className="h-24 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!rateLoading && !rates && (
          <p className="text-sm text-gray-400 py-4 text-center">No exchange rate data</p>
        )}
  {rates && (
    <div className="p-4 rounded-xl bg-white border border-indigo-100 text-center">
      <p className="text-3xl font-display font-bold text-gray-900">
        {rates.rate >= 1000
          ? Number(rates.rate.toFixed(0)).toLocaleString()
          : rates.rate < 0.01
          ? rates.rate.toFixed(4)
          : rates.rate.toFixed(2)}
        <span className="text-lg font-medium text-accent ml-2">{rates.code}</span>
      </p>
      <p className="text-xs text-gray-400 mt-1">= 1 US Dollar</p>
      {rates.name && (
        <p className="text-sm text-gray-500 mt-1 font-medium">
          {rates.name} {rates.symbol ? `(${rates.symbol})` : ''}
        </p>
      )}
    </div>
  )}
</div>

<div className="rounded-xl p-4" style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', marginBottom: '0' }}>
  <div className="flex items-center justify-between mb-1">
    <div style={{ fontSize: '15px', fontWeight: 600, color: '#c0d0e8' }} className="uppercase tracking-wider">Literacy Rate</div>
    <span style={{ fontSize: '10px', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>World Bank</span>
  </div>
  {wb?.literacy?.length ? (
    <>
      <div className="flex gap-4 text-xs text-gray-500 mb-3">
        <span>
          <span className="font-semibold text-gray-800">
            {wb.literacy[wb.literacy.length - 1]?.value?.toFixed(1)}%
          </span> latest
        </span>
        <span>
          <span className="font-semibold text-gray-800">
            {pctChange(wb.literacy)}
          </span> since {wb.literacy[0]?.date}
        </span>
      </div>
      <div style={{ height: '200px' }}><canvas ref={literacyRef} /></div>
    </>
  ) : (
   <div className="py-6 text-center">
  <p className="text-sm text-gray-400">No survey data reported</p>
  <p className="text-xs text-gray-300 mt-1">High-income countries typically exceed 99%</p>
</div>
  )}
</div>

      </div>
    </div>
  );
}