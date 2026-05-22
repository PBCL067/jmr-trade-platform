import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const LATAM = ['Argentina','Brazil','Uruguay','Chile','Colombia','Peru','Ecuador','Paraguay','Bolivia','Mexico'];
const AFRICA = [
  'South Africa','Nigeria','Egypt','Kenya','Ethiopia','Ghana','Tanzania','Uganda',
  'Mozambique','Zambia','Zimbabwe','Angola','Cameroon','Morocco','Tunisia','Algeria',
  'Sudan','Senegal','Namibia','Botswana','Rwanda','Madagascar'
];

const DEALS = [
  {
    id: 'starch', status: 'PIPELINE', title: 'Modified Starch',
    route: 'Argentina \u2192 South Africa', hs: 'HS 3505',
    buyer: 'Bragan / Solevo (interested)', supplier: 'Ingredion Argentina (to confirm)',
    fob: 0.61, landed: 0.80, market: 1.09, advantage: 0.29,
    sa_market_mt: 57799, sa_market_usd_m: 65.9,
    current_sa_suppliers: 'Thailand, Netherlands, Brazil',
    arg_exports_to_sa: 0,
    notes: 'Buyer is interested. Supplier not yet confirmed. Argentina is the lowest-cost global exporter at $0.69/kg FOB. Landing at $0.80/kg undercuts all current SA suppliers.',
    nextSteps: [
      'Contact Ingredion Argentina export team (ingredion.com/sa/es-ar)',
      'Get SACU-Mercosur tariff rate for HS 3505 from SARS',
      'Confirm food grade certification and MOQ with Ingredion',
      'Get freight quote Buenos Aires \u2192 Durban (20ft FCL)',
      'Present landed cost analysis to Bragan/Solevo contact',
    ],
  },
  {
    id: 'milk', status: 'PIPELINE', title: 'Full Cream Milk Powder',
    route: 'Argentina \u2192 South Africa', hs: 'HS 040221',
    buyer: 'TBC', supplier: 'SanCor / Mastellone',
    fob: 3.61, landed: 4.00, market: 4.11, advantage: 0.11,
    sa_market_mt: 4312, sa_market_usd_m: 17.7,
    current_sa_suppliers: 'New Zealand, Uruguay, France',
    arg_exports_to_sa: 0,
    notes: 'Uruguay already supplies SA at $3.53/kg CIF. Margin is tight and MFN dairy tariff (~15%) needs confirmation before proceeding. Need to find buyer first.',
    nextSteps: [
      'Confirm SA MFN import tariff for HS 040221 via SARS or customs broker',
      'Identify SA milk powder distributor or buyer',
      'Compare freight Buenos Aires \u2192 Durban vs Auckland \u2192 Durban',
      'Get MOQ and lead time from SanCor export team',
    ],
  },
  {
    id: 'sunflower', status: 'RESEARCH', title: 'Sunflower Oil',
    route: 'Argentina \u2192 South Africa', hs: 'HS 151211',
    buyer: 'TBC', supplier: 'AGD / Molinos',
    fob: 1.10, landed: null, market: null, advantage: null,
    sa_market_mt: 160000, sa_market_usd_m: null,
    current_sa_suppliers: 'Argentina already #2 supplier',
    arg_exports_to_sa: 1368,
    notes: 'Argentina already exports 1,368 MT/yr to SA. Need to identify specific SA buyers and assess whether we can add value vs existing commodity flows.',
    nextSteps: [
      'Map existing Argentine sunflower oil exporters to SA',
      'Identify SA industrial buyers (food manufacturers)',
      'Assess tariff position under SACU-Mercosur',
    ],
  },
];

const STATUS_COLOR = { CONFIRMED: '#2ecc71', PIPELINE: '#e8b84b', RESEARCH: '#4a5a70' };
const STATUS_BG    = { CONFIRMED: 'rgba(46,204,113,0.08)', PIPELINE: 'rgba(232,184,75,0.08)', RESEARCH: 'rgba(74,90,112,0.08)' };

function DealCard({ deal }) {
  const color = STATUS_COLOR[deal.status];
  const bg    = STATUS_BG[deal.status];
  return (
    <div className="card" style={{ borderColor: color + '40', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{deal.title}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {deal.route} &nbsp;|&nbsp; {deal.hs}
          </div>
        </div>
        <div style={{ padding: '4px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color, background: bg, border: '1px solid ' + color + '40' }}>
          {deal.status}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Price Stack (USD/kg)</div>
          {[['Argentina FOB', deal.fob, false], ['Est. Landed SA', deal.landed, false],
            ['SA Market Price', deal.market, true], ['Our Advantage', deal.advantage, true]]
            .filter(r => r[1] != null).map(([label, val, highlight]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: highlight ? color : 'var(--text-primary)', fontWeight: highlight ? 700 : 400 }}>
                ${val.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>SA Market</div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 4, marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>MARKET SIZE</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>
              {deal.sa_market_mt.toLocaleString()} MT/yr
            </div>
            {deal.sa_market_usd_m && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>${deal.sa_market_usd_m}M market value</div>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current SA suppliers</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{deal.current_sa_suppliers}</div>
          {deal.arg_exports_to_sa === 0 && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(232,184,75,0.08)',
              border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4, fontSize: 12, color: '#e8b84b', fontFamily: 'var(--font-mono)' }}>
              ARG EXPORTS TO SA: ZERO \u2014 UNTAPPED
            </div>
          )}
        </div>
      </div>
      <div style={{ marginBottom: 14, padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 4, display: 'flex', gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Buyer</div>
          <div style={{ color: deal.buyer === 'TBC' ? 'var(--text-muted)' : color, fontWeight: 500 }}>{deal.buyer}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Supplier</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{deal.supplier}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 4, marginBottom: 14 }}>{deal.notes}</div>
      <div className="section-label" style={{ marginBottom: 8 }}>Next Steps</div>
      <ol style={{ paddingLeft: 18 }}>
        {deal.nextSteps.map((step, i) => (
          <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function TrendArrow({ trend }) {
  if (trend === 'Growing')   return <span style={{ color: '#2ecc71' }}>&#8599;</span>;
  if (trend === 'Declining') return <span style={{ color: '#e74c3c' }}>&#8600;</span>;
  return <span style={{ color: '#4a5a70' }}>&#8594;</span>;
}

function Screener() {
  const [exporter, setExporter] = useState('Argentina');
  const [importer, setImporter] = useState('All Africa');
  const [opps, setOpps]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(function() {
    async function load() {
      setLoading(true);
      setSelected(null);
      try {
        let q;
        if (importer === 'All Africa') {
          q = query(collection(db, 'global_opportunities'),
            where('exporter', '==', exporter),
            where('importer', 'in', AFRICA.slice(0, 10)),
            orderBy('opportunity_score', 'desc'),
            limit(50));
        } else {
          q = query(collection(db, 'global_opportunities'),
            where('exporter', '==', exporter),
            where('importer', '==', importer),
            orderBy('opportunity_score', 'desc'),
            limit(50));
        }
        const snap = await getDocs(q);
        setOpps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) { console.error(e); setOpps([]); }
      finally { setLoading(false); }
    }
    load();
  }, [exporter, importer]);

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 10px', cursor: 'pointer',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FROM</div>
        <select value={exporter} onChange={e => setExporter(e.target.value)} style={selectStyle}>
          {LATAM.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ color: 'var(--gold-bright)', fontSize: 18 }}>&#8594;</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TO</div>
        <select value={importer} onChange={e => setImporter(e.target.value)} style={selectStyle}>
          <option>All Africa</option>
          {AFRICA.map(c => <option key={c}>{c}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {opps.length} commodities
        </span>
      </div>

      {loading && <div className="loading">Loading</div>}

      {!loading && opps.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Commodity</th><th>To</th><th>Trend</th>
                <th>Supply (MT/yr)</th><th>Demand (MT/yr)</th><th>Score</th>
              </tr>
            </thead>
            <tbody>
              {opps.map(function(row) {
                return (
                  <tr key={row.id} onClick={() => setSelected(selected?.id === row.id ? null : row)}
                    style={{ cursor: 'pointer', background: selected?.id === row.id ? 'var(--bg-hover)' : 'transparent' }}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.commodity}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.importer}</td>
                    <td><TrendArrow trend={row.trend} /></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {row.avg_export_mt ? (row.avg_export_mt/1000).toFixed(0) + 'k' : '-'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {row.avg_import_mt ? (row.avg_import_mt/1000).toFixed(0) + 'k' : '-'}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
                        color: row.opportunity_score > 80 ? '#2ecc71' : row.opportunity_score > 50 ? '#e8b84b' : '#4a5a70' }}>
                        {Math.round(row.opportunity_score)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="card" style={{ marginTop: 14, borderColor: 'var(--border-bright)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
            {selected.commodity} &nbsp;&#8594;&nbsp; {selected.importer}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              ['Avg Export', selected.avg_export_mt ? (selected.avg_export_mt/1000).toFixed(1) + 'k MT/yr' : '-'],
              ['Avg Import', selected.avg_import_mt ? (selected.avg_import_mt/1000).toFixed(1) + 'k MT/yr' : '-'],
              ['Import growth', selected.import_growth_pct != null ? selected.import_growth_pct.toFixed(1) + '%' : '-'],
              ['Opp. Score', Math.round(selected.opportunity_score)],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Opportunities() {
  const [view, setView] = useState('deals');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['deals', 'Active Deals'], ['screen', 'Market Screener']].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} style={{
            background: view === id ? 'var(--bg-hover)' : 'none',
            border: '1px solid ' + (view === id ? 'var(--border-bright)' : 'var(--border)'),
            borderRadius: 4, padding: '6px 16px', cursor: 'pointer',
            color: view === id ? 'var(--text-primary)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em',
          }}>{label}</button>
        ))}
      </div>

      {view === 'deals' && (
        <div>
          <div style={{ marginBottom: 20, padding: '10px 14px',
            background: 'rgba(200,153,58,0.06)', border: '1px solid rgba(200,153,58,0.2)', borderRadius: 6,
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold-bright)', letterSpacing: '0.04em' }}>
            FOCUS: Argentina \u2192 South Africa &nbsp;|&nbsp; Dry goods &amp; long-life food ingredients &nbsp;|&nbsp; Updated May 2026
          </div>
          {DEALS.map(deal => <DealCard key={deal.id} deal={deal} />)}
        </div>
      )}

      {view === 'screen' && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Screen any Latam exporter against any African market. Data from USDA PSD 2020-2026.
            Score = log(supply) x log(demand). Higher = bigger opportunity.
          </div>
          <Screener />
        </div>
      )}
    </div>
  );
}
