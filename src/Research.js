import React, { useState } from 'react';

const REPORTS = [
  {
    id: 'macro',
    title: 'Macro Overview',
    description: 'Master dashboard and combined macro signals across all tracked commodities.',
    charts: [
      { file: 'master_dashboard.png',        label: 'Master Dashboard',          caption: 'Combined overview — all commodity signals, trade flows and market sizing in one view.' },
      { file: 'combined_macro_dashboard.png', label: 'Combined Macro Dashboard',  caption: 'Macro-level signal summary across coffee, wheat, corn, soybeans and oils.' },
    ],
  },
  {
    id: 'signals',
    title: 'Signal Dashboards',
    description: 'Full signal model outputs for Coffee Arabica and Wheat HRW — momentum, sentiment, forecast surprise and seasonal components.',
    charts: [
      { file: 'coffee_signal_dashboard_v3.png', label: 'Coffee Arabica Signal Dashboard', caption: 'Model A + sentiment + forecast surprise combined signal. BUY threshold: combined score > 0.5.' },
      { file: 'wheat_signal_dashboard_v3.png',  label: 'Wheat HRW Signal Dashboard',      caption: 'Wheat signal model — momentum, trend, seasonal adjustment and 5yr percentile rank.' },
    ],
  },
  {
    id: 'trade',
    title: 'Trade Flow Analysis',
    description: 'Where commodities flow from Latin America to Africa — origin, destination, volume and value.',
    charts: [
      { file: 'trade_flow_analysis.png',        label: 'Latam → Africa Trade Flows',      caption: 'All major Latam-to-Africa commodity flows by value and volume. Source: UN Comtrade 2023.' },
      { file: 'egypt_wheat_sourcing_v2.png',    label: 'Egypt Wheat Sourcing',            caption: "Egypt is the world's largest wheat importer. This chart maps its sourcing origins and Argentina's opportunity." },
      { file: 'indonesia_coffee_exports_v2.png',label: 'Indonesia Coffee Exports',        caption: 'Indonesia is the 3rd largest coffee producer. Export flow analysis by destination and product type.' },
    ],
  },
  {
    id: 'market',
    title: 'SA Market Analysis',
    description: 'South Africa import market sizing, price sensitivity and seasonal patterns.',
    charts: [
      { file: 'sa_market_sizing.png',           label: 'SA Market Sizing',                caption: 'SA import market size by ingredient category — modified starch, milk powder, starches and oils.' },
      { file: 'price_sensitivity_analysis.png', label: 'Price Sensitivity Analysis',      caption: '120+ countries ranked by exposure to wheat and coffee price movements.' },
      { file: 'seasonal_patterns.png',          label: 'Seasonal Patterns',               caption: '66 years of monthly return data — seasonal price patterns for wheat and coffee.' },
    ],
  },
  {
    id: 'valuechains',
    title: 'Value Chain Analysis',
    description: 'How raw commodities move through processing into finished food ingredients.',
    charts: [
      { file: 'value_chain_analysis_v2.png',    label: 'Value Chain Overview',            caption: 'Full value chain map — raw commodity to finished ingredient across key product categories.' },
      { file: 'coffee_value_chain_NL_DE.png',   label: 'Coffee Value Chain — NL & DE',    caption: 'Netherlands and Germany as the dominant coffee processing hubs in Europe.' },
      { file: 'wheat_value_chain_IT_EG.png',    label: 'Wheat Value Chain — IT & EG',     caption: 'Italy (pasta) and Egypt (flour) as the two largest wheat processing destinations.' },
      { file: 'wheat_flour_supply_chains.png',  label: 'Wheat Flour Supply Chains',       caption: 'Global wheat flour supply chain map — key exporters, processors and end markets.' },
    ],
  },
  {
    id: 'enduse',
    title: 'End Use & Consumption',
    description: 'How coffee and wheat are consumed globally — end use breakdown and consumption growth trends.',
    charts: [
      { file: 'coffee_enduse_breakdown.png',    label: 'Coffee End Use Breakdown',        caption: 'Global coffee consumption by end use — roasted, instant, capsules, foodservice.' },
      { file: 'coffee_enduse_trends.png',       label: 'Coffee End Use Trends',           caption: 'How coffee consumption patterns are shifting — capsules and cold brew growing fastest.' },
      { file: 'wheat_enduse_breakdown_v2.png',  label: 'Wheat End Use Breakdown',         caption: 'Global wheat end use — bread, pasta, feed, starch, ethanol and other industrial uses.' },
    ],
  },
,
  {
    id: 'sars',
    title: 'SARS Import Trends',
    description: 'SA import trends from Mercosur by commodity section. Source: SARS Cumulative Bilateral Trade 2023-2026. Note: 2026 = Jan-Apr annualised.',
    charts: [],
    tables: [
      {
        label: 'SA Imports from Mercosur 2023-2026',
        caption: 'Source: SARS Bilateral Trade Reports. 2026 annualised (Jan-Apr x3). Values in ZAR billions.',
        headers: ['Commodity Section', '2023', '2024', '2025', '2026 (ann)', 'Trend'],
        rows: [
          ['Dairy / MPC', 'R5.34B', 'R6.08B', 'R5.29B', 'R6.57B', '+24% ↑'],
          ['Starches', 'R2.30B', 'R4.77B', 'R4.11B', 'R4.72B', '+15% ↑'],
          ['Oils', 'R0.84B', 'R0.73B', 'R1.54B', 'R1.39B', '-10% ↓'],
          ['Prepared Foods / Mod Starch', 'R1.84B', 'R2.61B', 'R2.61B', 'R1.10B', 'Watch ⚠'],
          ['Chemicals / Lecithin', 'R1.98B', 'R1.98B', 'R2.05B', 'R2.35B', '+15% ↑'],
        ],
        insights: [
          'Starch imports from Mercosur nearly doubled 2023-2025 (+79%) — validates modified starch opportunity.',
          'Dairy accelerating sharply in 2026 (+24% annualised) — FCMP timing is perfect.',
          'Lecithin market growing steadily but Mercosur share of actual lecithin near zero — displacement play vs China.',
          'Argentina dominates oils (85% of 2025) — limited JMR add-value in sunflower oil.',
        ],
      },
    ],
  }];

export default function Research() {
  const [activeReport, setActiveReport] = useState('macro');
  const [lightbox, setLightbox]         = useState(null);

  const report = REPORTS.find(r => r.id === activeReport);

  const btnStyle = (id) => ({
    background: activeReport === id ? 'var(--bg-hover)' : 'none',
    border: '1px solid ' + (activeReport === id ? 'var(--border-bright)' : 'var(--border)'),
    borderRadius: 4, padding: '6px 14px', cursor: 'pointer',
    color: activeReport === id ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em', whiteSpace: 'nowrap',
  });

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <style>{`
        @media print {
          .sidebar, .top-bar, .research-nav, .research-print-btn, .research-lightbox { display: none !important; }
          .page-body { padding: 0 !important; overflow: visible !important; }
          .research-report { break-inside: avoid; }
          .research-chart-card { break-inside: avoid; page-break-inside: avoid; margin-bottom: 32px; }
          .research-chart-img { max-width: 100% !important; width: 100% !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>

      {/* Nav */}
      <div className="research-nav" style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {REPORTS.map(r => (
          <button key={r.id} style={btnStyle(r.id)} onClick={() => setActiveReport(r.id)}>{r.title}</button>
        ))}
        <button className="research-print-btn" onClick={handlePrint} style={{
          marginLeft: 'auto', background: 'rgba(200,153,58,0.1)',
          border: '1px solid rgba(200,153,58,0.3)', borderRadius: 4,
          padding: '6px 16px', cursor: 'pointer', color: 'var(--gold-bright)',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
        }}>⬇ PRINT / SAVE PDF</button>
      </div>

      {/* Report header */}
      <div style={{ marginBottom: 24, padding: '14px 18px',
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
          {report.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {report.description}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {report.charts.map(chart => (
          <div key={chart.file} className="card research-chart-card"
            style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                  {chart.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>
                  {chart.caption}
                </div>
              </div>
              <button onClick={() => setLightbox(chart)}
                style={{ flexShrink: 0, marginLeft: 16, background: 'var(--bg-hover)',
                  border: '1px solid var(--border)', borderRadius: 4, padding: '5px 12px',
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11,
                  cursor: 'pointer', letterSpacing: '0.04em' }}>
                EXPAND
              </button>
            </div>
            <img
              className="research-chart-img"
              src={'/research/' + chart.file}
              alt={chart.label}
              style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
              onClick={() => setLightbox(chart)}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="research-lightbox"
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, cursor: 'zoom-out' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ maxWidth: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
              background: 'var(--bg-panel)', borderRadius: 8, overflow: 'hidden',
              border: '1px solid var(--border-bright)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                {lightbox.label}
              </div>
              <button onClick={() => setLightbox(null)}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4,
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11,
                  padding: '3px 10px', cursor: 'pointer' }}>close</button>
            </div>
            <img src={'/research/' + lightbox.file} alt={lightbox.label}
              style={{ maxWidth: '95vw', maxHeight: 'calc(92vh - 60px)', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Source: UN Comtrade, World Bank Pink Sheet, USDA PSD, Google Trends | Analysis: JMR Global 2026
      </div>
    </div>
  );
}
