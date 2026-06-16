import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import { AFRICA_PROCESSING } from './data/opportunityData';
import { generateTradeFlowReport, generateGapReport, generateDealsReport } from './ReportGenerator';
import IngredientFlow from './IngredientFlow';
import { fetchTable } from './supabase';

const LATAM = ['Argentina','Brazil','Uruguay','Chile','Colombia','Peru','Ecuador','Paraguay','Bolivia','Mexico'];


function QuotesPanel({ dealId }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTable('deal_quotes', { eq: ['deal_id', dealId] })
      .then(data => { setQuotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dealId]);

  const STATUS_COLOR = {
    'Active':      '#2ecc71',
    'Pending':     '#e8b84b',
    'Reference':   '#4a9eda',
    'Not Viable':  '#e74c3c',
    'Closed':      '#4a5a70',
  };

  if (loading) return <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading quotes...</div>;
  if (!quotes.length) return <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>No quotes yet</div>;

  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 8 }}>SUPPLIER QUOTES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quotes.map(q => {
          const color = STATUS_COLOR[q.status] || '#4a5a70';
          return (
            <div key={q.id} style={{ padding: '10px 14px', background: 'var(--bg-hover)',
              borderRadius: 4, borderLeft: '3px solid ' + color }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {q.supplier_name}
                </div>
                <span style={{ fontSize: 10, color, background: color + '18',
                  border: '1px solid ' + color + '40', padding: '2px 7px', borderRadius: 3,
                  fontFamily: 'var(--font-mono)' }}>{q.status.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
                {q.price_exw  && <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ExW: </span>
                  <span style={{ color: '#e8b84b', fontWeight: 600 }}>${q.price_exw}/MT</span>
                </div>}
                {q.price_fob  && <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>FOB: </span>
                  <span style={{ color: '#e8b84b', fontWeight: 600 }}>${q.price_fob}/MT</span>
                </div>}
                {q.price_cif_estimate && <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>CIF est: </span>
                  <span style={{ color: '#4a9eda', fontWeight: 600 }}>${q.price_cif_estimate}/MT</span>
                </div>}
                {q.price_cif_benchmark && <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Benchmark: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>${q.price_cif_benchmark}/MT</span>
                </div>}
              </div>
              {q.volume && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                Vol: {q.volume}
              </div>}
              {q.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{q.notes}</div>}
              {q.valid_date && <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                Quote date: {q.valid_date}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealCard({ deal }) {
  const STATUS_COLOR = { Pipeline: '#e8b84b', Research: '#4a9eda', Closed: '#4a5a70', Confirmed: '#2ecc71' };
  const color = STATUS_COLOR[deal.status] || '#4a5a70';
  const spec  = deal.spec ? (typeof deal.spec === 'string' ? JSON.parse(deal.spec) : deal.spec) : {};

  return (
    <div className="card" style={{ borderLeft: '3px solid ' + color, marginBottom: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
            {deal.title}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {deal.route_from && deal.route_to && (
              <span>{deal.route_from} → {deal.route_to}</span>
            )}
            {deal.hs_code && <span>HS {deal.hs_code}</span>}
            {deal.port_origin && deal.port_destination && (
              <span>⚓ {deal.port_origin} → {deal.port_destination}</span>
            )}
          </div>
        </div>
        <span style={{ flexShrink: 0, padding: '4px 14px', borderRadius: 4, fontSize: 11, fontWeight: 700,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
          color, background: color + '18', border: '1px solid ' + color + '40' }}>
          {(deal.status || '').toUpperCase()}
        </span>
      </div>

      {/* Spec tags */}
      {Object.keys(spec).length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {Object.entries(spec).map(([k, v]) => (
            <span key={k} style={{ fontSize: 10, fontFamily: 'var(--font-mono)',
              color: '#a855f7', background: 'rgba(168,85,247,0.1)',
              border: '1px solid rgba(168,85,247,0.3)', padding: '2px 8px', borderRadius: 3 }}>
              {k}: {Array.isArray(v) ? v.join(', ') : v}
            </span>
          ))}
        </div>
      )}

      {/* CIF Benchmark */}
      {deal.cif_benchmark && (
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginBottom: 10,
          padding: '6px 12px', background: 'var(--bg-hover)', borderRadius: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CIF BENCHMARK</span>
          <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#e8b84b' }}>
            ${deal.cif_benchmark.toLocaleString()}/MT
          </span>
          {deal.cif_benchmark_notes && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {deal.cif_benchmark_notes}</span>
          )}
        </div>
      )}

      {/* Notes */}
      {deal.notes && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
          padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 4, marginBottom: 14 }}>
          {deal.notes}
        </div>
      )}

      {/* Quotes */}
      <QuotesPanel dealId={deal.id} />

      {/* Next Action */}
      {deal.next_action && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(232,184,75,0.08)',
          border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: '#e8b84b', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em', marginBottom: 4 }}>NEXT ACTION</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{deal.next_action}</div>
          {deal.next_action_date && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              {deal.next_action_date}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Screener() {
  const [exporter, setExporter] = useState('Argentina');
  const [importer, setImporter] = useState('All Africa');
  const [layer, setLayer]       = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [tradeFlows, setTradeFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTable('trade_flows')
      .then(data => { setTradeFlows(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const AFRICA = [...new Set(tradeFlows.map(r => r.importer))].sort();

  const filtered = tradeFlows.filter(r => {
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

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading trade flows...</div>;

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
        <button onClick={() => generateTradeFlowReport({ flows: filtered, exporter, importer, layer })}
          style={{ padding:'6px 16px', background:'var(--gold)', border:'none', borderRadius:4,
            cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:11, color:'#fff',
            letterSpacing:'0.06em' }}>
          ⬇ GENERATE REPORT
        </button>
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
  const [tradeGaps,      setTradeGaps]      = React.useState([]);
  const [loading,        setLoading]        = React.useState(true);

  React.useEffect(() => {
    fetchTable('trade_gaps')
      .then(data => { setTradeGaps(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const exporters = ['All', ...new Set(tradeGaps.map(g => g.exporter))].sort();
  const labels    = ['All', 'UNTAPPED', 'NEAR UNTAPPED', 'UNDER-PROCESSED', 'PROCESSING'];

  const filtered = tradeGaps.filter(function(g) {
    if (filterExporter !== 'All' && g.exporter !== filterExporter) return false;
    if (filterLabel    !== 'All' && g.label    !== filterLabel)    return false;
    return true;
  });

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading gap analysis...</div>;

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

  const untappedCount = tradeGaps.filter(g => g.label === 'UNTAPPED' || g.label === 'NEAR UNTAPPED').length;

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
            {fmt(tradeGaps[0]?.l1_usd || 0)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tradeGaps[0]?.exporter} → {tradeGaps[0]?.importer}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 6 }}>TOTAL L1 FLOWING</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28 }}>
            {fmt(tradeGaps.reduce((s, g) => s + g.l1_usd, 0))}
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
        <button onClick={() => generateGapReport({ gaps: filtered, filterExporter, filterLabel })}
          style={{ padding:'6px 16px', background:'var(--gold)', border:'none', borderRadius:4,
            cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:11, color:'#fff',
            letterSpacing:'0.06em' }}>
          ⬇ GENERATE REPORT
        </button>
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
                {(typeof g.top_products === 'string' ? JSON.parse(g.top_products) : g.top_products).map(function(p) {
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

function DealsView() {
  const [deals,   setDeals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');

  useEffect(() => {
    fetchTable('deals', { order: 'created_at', asc: false })
      .then(data => { setDeals(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statuses = ['All', 'Pipeline', 'Research', 'Closed'];
  const filtered = filter === 'All' ? deals : deals.filter(d => d.status === filter);

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '6px 10px', cursor: 'pointer',
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading deals...</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={selectStyle}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => generateDealsReport({ deals: filtered, filter })}
          style={{ padding:'6px 16px', background:'var(--gold)', border:'none', borderRadius:4,
            cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:11, color:'#fff',
            letterSpacing:'0.06em' }}>
          ⬇ GENERATE REPORT
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} deals
        </span>
      </div>
      {filtered.map(deal => <DealCard key={deal.id} deal={deal} />)}
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
          <DealsView />
        </div>
      )}
      {view === 'screen' && <Screener />}
      {view === 'gaps' && <GapAnalysis />}
      {view === 'ingredients' && <IngredientFlow />}
    </div>
  );
}
