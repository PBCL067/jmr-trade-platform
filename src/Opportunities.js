import React, { useState } from 'react';
import Tooltip from './Tooltip';
import { TRADE_FLOWS, AFRICA_PROCESSING, TRADE_GAPS } from './data/opportunityData';
import IngredientFlow from './IngredientFlow';

const LATAM = ['Argentina','Brazil','Uruguay','Chile','Colombia','Peru','Ecuador','Paraguay','Bolivia','Mexico'];

const AFRICA = [...new Set(TRADE_FLOWS.map(r => r.importer))].sort();

const DEALS = [
  {
    id: 'starch', status: 'PIPELINE', title: 'Modified Waxy Corn Starch E1422',
    route: 'Brazil → South Africa', hs: 'HS 3505',
    buyer: 'Bragan / Solevo (interested)', supplier: 'Horizonte Amidos (SuperCorp CFW)',
    fob: 0.91, landed: 1.05, market: 1.09, advantage: 0.04,
    sa_market_mt: 57799, sa_market_usd_m: 65.9,
    current_sa_suppliers: 'Thailand, Netherlands, Brazil',
    arg_exports_to_sa: -1,
    fob_label: 'Brazil Ex Works',
    notes: 'Supplier confirmed: Horizonte Amidos, Paraná Brazil. Product: SuperCorp CFW — Modified Waxy Corn Starch E1422, Non-GMO. Price: $910/MT Ex Works (est. FOB Paranaguá ~$950/MT). Viscosity 760-960 BU, Acetyl min 1.45%, pH 4.5-6.5, moisture max 14%. TDS and specs sent to buyer 2026-06-02. Awaiting buyer feedback.',
    nextSteps: [
      'Await buyer feedback on SuperCorp CFW specs',
      'Get FOB Paranaguá price from Jordani (currently Ex Works $910/MT)',
      'Get freight quote Paranaguá → Durban (20ft FCL)',
      'Confirm HS 3505 tariff rate with SARS',
      'Request CoA from recent batch from Horizonte',
      'Request Halal certification status from Horizonte',
    ],
  },
  {
    id: 'milk', status: 'PIPELINE', title: 'Full Cream Milk Powder',
    route: 'Argentina → South Africa', hs: 'HS 040221',
    buyer: 'TBC', supplier: 'SanCor / Mastellone',
    fob: 3.61, landed: 4.00, market: 4.11, advantage: 0.11,
    sa_market_mt: 4312, sa_market_usd_m: 17.7,
    current_sa_suppliers: 'New Zealand, Uruguay, France',
    arg_exports_to_sa: 0,
    notes: 'Uruguay already supplies SA at $3.53/kg CIF. Margin is tight and MFN dairy tariff (~15%) needs confirmation before proceeding. Need to find buyer first.',
    nextSteps: [
      'Confirm SA MFN import tariff for HS 040221 via SARS or customs broker',
      'Identify SA milk powder distributor or buyer',
      'Compare freight Buenos Aires → Durban vs Auckland → Durban',
      'Get MOQ and lead time from SanCor export team',
    ],
  },
  {
    id: 'sunflower', status: 'RESEARCH', title: 'Sunflower Oil',
    route: 'Argentina → South Africa', hs: 'HS 151211',
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
  {
    id: 'lecithin', status: 'RESEARCH', title: 'Soya Lecithin',
    route: 'Argentina → South Africa', hs: 'HS 292390',
    buyer: 'Bragan / Solevo (potential)', supplier: 'TBC - Argentina',
    fob: null, landed: null, market: null, advantage: null,
    sa_market_mt: null, sa_market_usd_m: 20.3,
    current_sa_suppliers: 'China (84%), India (4.5%), USA (4.3%)',
    arg_exports_to_sa: 0,
    notes: 'SA imports $20.3M of soya lecithin annually - 84% from China, zero from Mercosur. Argentina is the world largest soya lecithin producer (byproduct of Rosario soy crush corridor) yet has zero SA presence. Classic displacement opportunity. Bragan already carries soya lecithin. Source: UN Comtrade 2023.',
    nextSteps: [
      'Identify top Argentine soya lecithin exporters (Bunge, AGD, Molinos)',
      'Get FOB Buenos Aires / Rosario indicative pricing',
      'Confirm HS 292390 SACU-Mercosur tariff rate with SARS',
      'Contact Bragan to gauge interest and current supplier pricing',
      'Run landed cost analysis vs Chinese supplier price',
    ],
  },
  {
    id: 'soyoil', status: 'RESEARCH', title: 'Refined Soybean Oil',
    route: 'Argentina / Brazil → South Africa', hs: 'HS 150790',
    buyer: 'TBC', supplier: 'TBC - Argentina / Brazil',
    fob: null, landed: null, market: null, advantage: null,
    sa_market_mt: null, sa_market_usd_m: 23.1,
    current_sa_suppliers: 'Netherlands (79%), Brazil (21%)',
    arg_exports_to_sa: 0,
    notes: 'SA imports $23.1M refined soybean oil - Netherlands dominates at 79% likely re-exporting Argentine/Brazilian origin oil. Brazil already at 21% direct. Opportunity to displace Dutch middleman and supply direct from Argentina or Brazil.',
    nextSteps: [
      'Identify Argentine/Brazilian refined soybean oil exporters',
      'Establish Netherlands landed cost vs direct Mercosur landed cost',
      'Confirm HS 150790 SACU-Mercosur tariff rate with SARS',
      'Identify SA industrial buyers of refined soybean oil',
      'Check if Bragan carries refined soybean oil',
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
          {[[deal.fob_label || 'Argentina FOB', deal.fob, false], ['Est. Landed SA', deal.landed, false],
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
              {deal.sa_market_mt ? deal.sa_market_mt.toLocaleString() + ' MT/yr' : 'Market sizing TBC'}
            </div>
            {deal.sa_market_usd_m && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>${deal.sa_market_usd_m}M market value</div>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current SA suppliers</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{deal.current_sa_suppliers}</div>
          {deal.arg_exports_to_sa === 0 && deal.arg_exports_to_sa !== -1 && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(232,184,75,0.08)',
              border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4, fontSize: 12, color: '#e8b84b', fontFamily: 'var(--font-mono)' }}>
              ARG EXPORTS TO SA: ZERO — UNTAPPED
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

function Screener() {
  const [exporter, setExporter] = useState('Argentina');
  const [importer, setImporter] = useState('All Africa');
  const [layer, setLayer]       = useState('ALL');
  const [selected, setSelected] = useState(null);

  const filtered = TRADE_FLOWS.filter(r => {
    if (r.exporter !== exporter) return false;
    if (importer !== 'All Africa' && r.importer !== importer) return false;
    if (layer !== 'ALL' && r.layer !== layer) return false;
    return true;
  }).sort((a, b) => b.fob_usd - a.fob_usd);

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 10px', cursor: 'pointer',
  };

  const fmt = (n) => n >= 1e9 ? '$' + (n/1e9).toFixed(1) + 'B' : n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + (n/1e3).toFixed(0) + 'K' : '$' + n.toFixed(0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FROM</div>
        <select value={exporter} onChange={e => { setExporter(e.target.value); setSelected(null); }} style={selectStyle}>
          {LATAM.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ color: 'var(--gold-bright)', fontSize: 18 }}>→</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TO</div>
        <select value={importer} onChange={e => { setImporter(e.target.value); setSelected(null); }} style={selectStyle}>
          <option>All Africa</option>
          {AFRICA.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={layer} onChange={e => { setLayer(e.target.value); setSelected(null); }} style={selectStyle}>
          <option value="ALL">L1 + L2</option>
          <option value="L1">L1 Raw Only</option>
          <option value="L2">L2 By-Products Only</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} flows
        </span>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          No trade flows found for this selection
        </div>
      )}

      {filtered.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th><th>To</th><th>Layer<Tooltip text="L1 = raw commodity (e.g. raw corn, soybeans). L2 = processed by-product (e.g. soybean meal, corn starch). L2 flows are higher value and more relevant to JMR." /></th>
                <th>FOB Value<Tooltip text="Free On Board value — total trade value at the export port, before freight and insurance. Source: UN Comtrade." /></th><th>Volume (MT)</th><th>$/kg</th><th>Processor?<Tooltip text="YES means the importing country re-exports processed by-products — they are an active food manufacturer, not just a consumer. Higher value opportunity." /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(function(row, i) {
                const isSelected = selected && selected.product === row.product && selected.importer === row.importer;
                return (
                  <tr key={i} onClick={() => setSelected(isSelected ? null : row)}
                    style={{ cursor: 'pointer', background: isSelected ? 'var(--bg-hover)' : 'transparent' }}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.product}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.importer}</td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: 3, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                        color: row.layer === 'L1' ? '#4a9eda' : '#e8b84b',
                        background: row.layer === 'L1' ? 'rgba(74,158,218,0.1)' : 'rgba(232,184,75,0.1)',
                        border: '1px solid ' + (row.layer === 'L1' ? 'rgba(74,158,218,0.3)' : 'rgba(232,184,75,0.3)') }}>
                        {row.layer}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(row.fob_usd)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.volume_mt > 0 ? row.volume_mt.toLocaleString(undefined, {maximumFractionDigits:0}) : '-'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{row.price_per_kg > 0 ? '$' + row.price_per_kg.toFixed(2) : '-'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12,
                      color: row.importer_is_processor ? '#e8b84b' : 'var(--text-muted)' }}>
                      {row.importer_is_processor ? 'YES ⚡' : '-'}
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
            {selected.product} → {selected.importer}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              ['FOB Value', fmt(selected.fob_usd)],
              ['Volume', selected.volume_mt > 0 ? selected.volume_mt.toLocaleString(undefined, {maximumFractionDigits:0}) + ' MT' : '-'],
              ['Price/kg', selected.price_per_kg > 0 ? '$' + selected.price_per_kg.toFixed(3) : '-'],
              ['Processing Ratio', selected.importer_processing_ratio > 0 ? selected.importer_processing_ratio.toFixed(2) + 'x' : '-'],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
          {selected.importer_is_processor && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(232,184,75,0.08)',
              border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4, fontSize: 12, color: '#e8b84b', fontFamily: 'var(--font-mono)' }}>
              ⚡ {selected.importer} is an active processor — exports ${(selected.importer_l2_exports/1e6).toFixed(1)}M of by-products to world markets
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GapAnalysis() {
  const [filterExporter, setFilterExporter] = React.useState('All');
  const [filterLabel,    setFilterLabel]    = React.useState('All');

  const exporters = ['All', ...new Set(TRADE_GAPS.map(g => g.exporter))].sort();
  const labels    = ['All', 'UNTAPPED', 'NEAR UNTAPPED', 'UNDER-PROCESSED', 'PROCESSING'];

  const filtered = TRADE_GAPS.filter(function(g) {
    if (filterExporter !== 'All' && g.exporter !== filterExporter) return false;
    if (filterLabel    !== 'All' && g.label    !== filterLabel)    return false;
    return true;
  });

  const LABEL_COLOR = {
    'UNTAPPED':        '#e74c3c',
    'NEAR UNTAPPED':   '#e74c3c',
    'UNDER-PROCESSED': '#e8b84b',
    'PROCESSING':      '#2ecc71',
  };

  const fmt = (n) => n >= 1e9 ? '$' + (n/1e9).toFixed(1) + 'B' : n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + (n/1e3).toFixed(0) + 'K' : '$' + n.toFixed(0);

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '6px 10px', cursor: 'pointer',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  const untappedCount = TRADE_GAPS.filter(g => g.label === 'UNTAPPED' || g.label === 'NEAR UNTAPPED').length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ borderColor: '#e74c3c40' }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 6 }}>UNTAPPED PAIRS</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: '#e74c3c' }}>{untappedCount}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>country pairs buying raw, not processed</div>
        </div>
        <div className="card" style={{ borderColor: '#e8b84b40' }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 6 }}>LARGEST UNTAPPED</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: '#e8b84b' }}>
            {fmt(TRADE_GAPS[0]?.l1_usd || 0)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{TRADE_GAPS[0]?.exporter} → {TRADE_GAPS[0]?.importer}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 6 }}>TOTAL L1 FLOWING</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28 }}>
            {fmt(TRADE_GAPS.reduce((s, g) => s + g.l1_usd, 0))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>raw commodities Latam → Africa</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
        <div>
          <span style={labelStyle}>Exporter</span>
          <select value={filterExporter} onChange={e => setFilterExporter(e.target.value)} style={selectStyle}>
            {exporters.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Signal</span>
          <select value={filterLabel} onChange={e => setFilterLabel(e.target.value)} style={selectStyle}>
            {labels.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingBottom: 8 }}>
          {filtered.length} pairs
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(function(g, i) {
          const color = LABEL_COLOR[g.label] || '#4a5a70';
          return (
            <div key={i} className="card" style={{ borderLeft: '3px solid ' + color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                    {g.exporter} → {g.importer}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
                    {g.description}
                  </div>
                </div>
                <span style={{ marginLeft: 16, flexShrink: 0, padding: '3px 10px', borderRadius: 3, fontSize: 11,
                  fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em',
                  color, background: color + '18', border: '1px solid ' + color + '40' }}>
                  {g.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ padding: '6px 12px', background: 'var(--bg-hover)', borderRadius: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Raw bought </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(g.l1_usd)}</span>
                </div>
                <div style={{ padding: '6px 12px', background: 'var(--bg-hover)', borderRadius: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Processed bought </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: g.l2_usd > 0 ? '#e8b84b' : '#e74c3c' }}>
                    {g.l2_usd > 0 ? fmt(g.l2_usd) : 'ZERO'}
                  </span>
                </div>
                {g.top_products.map(function(p) {
                  return (
                    <span key={p.product} style={{ padding: '4px 10px', background: 'var(--bg-card)',
                      border: '1px solid var(--border)', borderRadius: 3,
                      fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {p.product} {fmt(p.fob_usd)}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Opportunities() {
  const [view, setView] = useState('deals');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['deals','Active Deals'],['screen','Trade Flows'],['gaps','Gap Analysis'],['ingredients','Ingredient Flow']].map(([id, label]) => (
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
            FOCUS: Argentina → South Africa &nbsp;|&nbsp; Dry goods &amp; long-life food ingredients &nbsp;|&nbsp; Updated May 2026
          </div>
          {DEALS.map(deal => <DealCard key={deal.id} deal={deal} />)}
        </div>
      )}
      {view === 'screen' && <Screener />}
      {view === 'gaps' && <GapAnalysis />}
      {view === 'ingredients' && <IngredientFlow />}
    </div>
  );
}
