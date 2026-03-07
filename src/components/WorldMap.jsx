function WorldMap({ countries, onCountryClick, selectedCountry }) {
  const svgRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [tooltip, setTooltip] = React.useState(null);
  const [worldData, setWorldData] = React.useState(null);

  React.useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(data => setWorldData(data))
      .catch(() => console.error('failed to load world map'));
  }, []);

  React.useEffect(() => {
    if (!worldData || !svgRef.current || !countries.length) return;

    const width = containerRef.current?.offsetWidth || 800;
    const height = 520;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const nameMap = {};
    const cca2Map = {};
    countries.forEach(c => {
      nameMap[c.name.common.toLowerCase()] = c;
      if (c.cca2) cca2Map[c.cca2.toLowerCase()] = c;
    });

    const numericToCca2 = {
      4:'AF',8:'AL',12:'DZ',20:'AD',24:'AO',28:'AG',32:'AR',36:'AU',
      40:'AT',44:'BS',48:'BH',50:'BD',51:'AM',52:'BB',56:'BE',64:'BT',
      68:'BO',70:'BA',72:'BW',76:'BR',84:'BZ',90:'SB',96:'BN',100:'BG',
      104:'MM',108:'BI',112:'BY',116:'KH',120:'CM',124:'CA',132:'CV',
      140:'CF',144:'LK',148:'TD',152:'CL',156:'CN',170:'CO',174:'KM',
      178:'CG',180:'CD',188:'CR',191:'HR',192:'CU',196:'CY',203:'CZ',
      204:'BJ',208:'DK',212:'DM',214:'DO',218:'EC',222:'SV',226:'GQ',
      231:'ET',232:'ER',233:'EE',238:'FK',242:'FJ',246:'FI',250:'FR',
      258:'PF',262:'DJ',266:'GA',268:'GE',270:'GM',275:'PS',276:'DE',
      288:'GH',296:'KI',300:'GR',304:'GL',308:'GD',316:'GU',320:'GT',
      324:'GN',328:'GY',332:'HT',336:'VA',340:'HN',344:'HK',348:'HU',
      352:'IS',356:'IN',360:'ID',364:'IR',368:'IQ',372:'IE',376:'IL',
      380:'IT',384:'CI',388:'JM',392:'JP',398:'KZ',400:'JO',404:'KE',
      408:'KP',410:'KR',414:'KW',417:'KG',418:'LA',422:'LB',426:'LS',
      428:'LV',430:'LR',434:'LY',438:'LI',440:'LT',442:'LU',446:'MO',
      450:'MG',454:'MW',458:'MY',462:'MV',466:'ML',470:'MT',478:'MR',
      480:'MU',484:'MX',492:'MC',496:'MN',498:'MD',499:'ME',504:'MA',
      508:'MZ',516:'NA',520:'NR',524:'NP',528:'NL',540:'NC',548:'VU',
      554:'NZ',558:'NI',562:'NE',566:'NG',578:'NO',583:'FM',584:'MH',
      585:'PW',586:'PK',591:'PA',598:'PG',600:'PY',604:'PE',608:'PH',
      616:'PL',620:'PT',624:'GW',626:'TL',630:'PR',634:'QA',638:'RE',
      642:'RO',643:'RU',646:'RW',654:'SH',659:'KN',662:'LC',670:'VC',
      674:'SM',678:'ST',682:'SA',686:'SN',688:'RS',690:'SC',694:'SL',
      703:'SK',704:'VN',705:'SI',706:'SO',710:'ZA',716:'ZW',724:'ES',
      728:'SS',729:'SD',740:'SR',748:'SZ',752:'SE',756:'CH',760:'SY',
      762:'TJ',764:'TH',768:'TG',776:'TO',780:'TT',784:'AE',788:'TN',
      792:'TR',795:'TM',798:'TV',800:'UG',804:'UA',807:'MK',818:'EG',
      826:'GB',834:'TZ',840:'US',858:'UY',860:'UZ',862:'VE',882:'WS',
      887:'YE',894:'ZM',
    };

    function getCountry(feature) {
      const cca2 = numericToCca2[feature.id];
      if (cca2) {
        const found = cca2Map[cca2.toLowerCase()];
        if (found) return found;
      }
      if (feature.properties?.name) {
        const found = nameMap[feature.properties.name.toLowerCase()];
        if (found) return found;
      }
      return null;
    }

    const zoom = d3.zoom()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        g.selectAll('.country')
          .attr('stroke-width', 0.5 / event.transform.k);
        g.selectAll('.continent-label')
          .attr('font-size', d => `${d.size / event.transform.k}px`)
          .attr('opacity', event.transform.k > 3 ? 0 : 0.5);
      });

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f0f4f8');

    const g = svg.append('g');

    const graticule = d3.geoGraticule();
    g.append('path')
      .datum(graticule())
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(100,130,180,0.2)')
      .attr('stroke-width', 0.3);

    const countries110 = topojson.feature(worldData, worldData.objects.countries);

    g.selectAll('.country')
      .data(countries110.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', d => {
        const c = getCountry(d);
        if (!c) return '#d8e4f0';
        return c.cca2 === selectedCountry?.cca2 ? '#4d7cfe' : '#b8ccdf';
      })
      .attr('stroke', '#e8f0f8')
      .attr('stroke-width', 0.7)
      .style('cursor', d => getCountry(d) ? 'pointer' : 'default')
      .on('mouseenter', (event, d) => {
        const country = getCountry(d);
        if (!country) return;
        d3.select(event.currentTarget).attr('fill', '#7fa4ff');
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          name: country.name.common,
        });
      })
      .on('mousemove', (event) => {
        setTooltip(prev => prev ? { ...prev, x: event.offsetX, y: event.offsetY } : null);
      })
      .on('mouseleave', (event, d) => {
        const country = getCountry(d);
        if (!country) return;
        const isSelected = country.cca2 === selectedCountry?.cca2;
        d3.select(event.currentTarget).attr('fill', isSelected ? '#4d7cfe' : '#b8ccdf');
        setTooltip(null);
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        const country = getCountry(d);
        if (!country) return;
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const scale = Math.min(10, 0.85 / Math.max((x1-x0)/width, (y1-y0)/height, 0.001));
        const tx = width/2 - scale*((x0+x1)/2);
        const ty = height/2 - scale*((y0+y1)/2);
        svg.transition().duration(600).ease(d3.easeCubicInOut)
          .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
        onCountryClick(country);
      })
      .on('click', (event, d) => {
        const country = getCountry(d);
        if (!country) return;
        onCountryClick(country);
      });

    const continentLabels = [
      { name: 'North America', lat: 45,  lng: -100, size: 13 },
      { name: 'South America', lat: -15, lng: -60,  size: 13 },
      { name: 'Europe',        lat: 54,  lng: 15,   size: 11 },
      { name: 'Africa',        lat: 2,   lng: 20,   size: 13 },
      { name: 'Asia',          lat: 45,  lng: 90,   size: 15 },
      { name: 'Oceania',       lat: -25, lng: 134,  size: 11 },
      { name: 'Antarctica',    lat: -80, lng: 0,    size: 10 },
    ];

    g.selectAll('.continent-label')
      .data(continentLabels)
      .enter()
      .append('text')
      .attr('class', 'continent-label')
      .attr('transform', d => {
        const [x, y] = projection([d.lng, d.lat]);
        return `translate(${x},${y})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#4a6080')
      .attr('font-size', d => `${d.size}px`)
      .attr('font-family', 'Sora, sans-serif')
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .attr('opacity', 0.75)
      .attr('letter-spacing', '1.5px')
      .text(d => d.name.toUpperCase());

    svg.on('dblclick.zoom', null);
    svg.call(zoom);
    svgRef.current._zoom = zoom;

    window.__mapZoomTo = (country) => {
      const feature = countries110.features.find(f =>
        getCountry(f)?.cca2 === country.cca2
      );
      if (!feature) return;
      const [[x0, y0], [x1, y1]] = path.bounds(feature);
      const scale = Math.min(10, 0.85 / Math.max((x1-x0)/width, (y1-y0)/height, 0.001));
      const tx = width/2 - scale*((x0+x1)/2);
      const ty = height/2 - scale*((y0+y1)/2);
      svg.transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    };

    return () => { delete window.__mapZoomTo; };

  }, [worldData, countries, selectedCountry]);

  return (
    <div
    className="map-container"
      ref={containerRef}
      style={{ background: '#f0f4f8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', position: 'relative', width: '100%' }}
    >
      <svg ref={svgRef} />

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            left: tooltip.x + 14,
            top: tooltip.y - 36,
            background: 'rgba(7,9,15,0.92)',
            border: '1px solid rgba(77,124,254,0.3)',
            borderRadius: '8px',
            padding: '7px 13px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#f0f4ff',
            backdropFilter: 'blur(12px)',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.name}
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        {[
          { label: '+', action: 'in' },
          { label: '−', action: 'out' },
          { label: '⌂', action: 'reset' },
        ].map(btn => (
          <button
            key={btn.action}
            onClick={() => {
              const s = d3.select(svgRef.current);
              const z = svgRef.current._zoom;
              if (!z) return;
              if (btn.action === 'in') s.transition().duration(300).call(z.scaleBy, 1.5);
              if (btn.action === 'out') s.transition().duration(300).call(z.scaleBy, 0.67);
              if (btn.action === 'reset') s.transition().duration(500).ease(d3.easeCubicInOut).call(z.transform, d3.zoomIdentity);
            }}
            className="w-8 h-8 rounded-lg text-sm font-medium transition duration-200"
            style={{ background: 'rgba(8,13,20,0.9)', border: '1px solid rgba(99,179,237,0.15)', color: '#ffffff' }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '14px', left: '14px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(7,9,15,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', color: '#ffffff', backdropFilter: 'blur(8px)' }}>
        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#4d7cfe' }}></span> Selected
       
      </div>

      <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(7,9,15,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', color: '#ffffff', backdropFilter: 'blur(8px)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        Click to view stats · Double-click to zoom in
      </div>
    </div>
  );
}