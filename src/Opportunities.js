import React from 'react';

const DEALS = [
  {
    id: 'starch',
    status: 'CONFIRMED',
    title: 'Modified Starch',
    route: 'Argentina → South Africa',
    hs: 'HS 3505',
    buyer: 'Bragan / Solevo',
    supplier: 'Ingredion Argentina',
    fob: 0.61,
    landed: 0.80,
    market: 1.09,
    advantage: 0.29,
    sa_market_mt: 57799,
    sa_market_usd_m: 65.9,
    current_sa_suppliers: 'Thailand, Netherlands, Brazil',
    arg_exports_to_sa: 0,
    notes: 'Argentina currently exports zero modified starch to SA. Price advantage confirmed. Buyer identified.',
    nextSteps: [
      'Contact Ingredion Argentina export team (ingredion.com/sa/es-ar)',
      'Get SACU-Mercosur tariff rate for HS 3505',
      'Confirm food grade certification and MOQ with Ingredion',
      'Get freight quote Buenos Aires → Durban (20ft FCL)',
      'Present landed cost analysis to Bragan/Solevo contact',
    ],
  },
  {
    id: 'milk',
    status: 'PIPELINE',
    title: 'Full Cream Milk Powder',
    route: 'Argentina → South Africa',
    hs: 'HS 040221',
    buyer: 'TBC',
    supplier: 'SanCor / Mastellone',
    fob: 3.61,
    landed: 4.00,
    market: 4.11,
    advantage: 0.11,
    sa_market_mt: 4312,
    sa_market_usd_m: 17.7,
    current_sa_suppliers: 'New Zealand, Uruguay, France',
    arg_exports_to_sa: 0,
    notes: 'Uruguay already supplies SA at $3.53/kg CIF. Argentina FOB $3.61/kg is competitive. Smaller margin than starch but large volume opportunity.',
    nextSteps: [
      'Identify SA milk powder distributor / buyer',
      'Get SACU-Mercosur tariff for HS 040221',
      'Compare freight Buenos Aires → Durban vs Auckland → Durban',
      'Get MOQ and lead time from SanCor export team',
      'Survey retail and industrial pricing in SA',
    ],
  },
  {
    id: 'sunflower',
    status: 'RESEARCH',
    title: 'Sunflower Oil',
    route: 'Argentina → South Africa',
    hs: 'HS 151211',
    buyer: 'TBC',
    supplier: 'Multiple Argentine exporters',
    fob: 1.10,
    landed: null,
    market: null,
    advantage: null,
    sa_market_mt: 160000,
    sa_market_usd_m: null,
    current_sa_suppliers: 'Argentina already #2 supplier',
    arg_exports_to_sa: 1368,
    notes: 'Argentina already exports 1,368 MT/yr to SA. Large global export capacity (1.5M MT/yr). Need to identify specific SA buyers and assess whether we can add value vs existing flows.',
    nextSteps: [
      'Map existing Argentine sunflower oil exporters to SA',
      'Identify SA industrial buyers (food manufacturers)',
      'Assess tariff position',
      'Compare our potential margin vs commodity brokers',
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
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
            {deal.title}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            {deal.route} &nbsp;|&nbsp; {deal.hs}
          </div>
        </div>
        <div style={{ padding: '4px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
          color, background: bg, border: '1px solid ' + color + '40' }}>
          {deal.status}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Price Stack (USD/kg)</div>
          {[
            ['Argentina FOB',    deal.fob,       false],
            ['Est. Landed SA',   deal.landed,    false],
            ['SA Market Price',  deal.market,    true],
            ['Our Advantage',    deal.advantage, true],
          ].filter(r => r[1] != null).map(([label, val, highlight]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)',
                color: highlight ? color : 'var(--text-primary)',
                fontWeight: highlight ? 700 : 400 }}>
                ${val.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>SA Market</div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 4, marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>MARKET SIZE</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
              {deal.sa_market_mt.toLocaleString()} MT/yr
            </div>
            {deal.sa_market_usd_m && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>${deal.sa_market_usd_m}M market value</div>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current SA suppliers</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{deal.current_sa_suppliers}</div>
          {deal.arg_exports_to_sa === 0 && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(232,184,75,0.08)',
              border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4,
              fontSize: 12, color: '#e8b84b', fontFamily: 'var(--font-mono)' }}>
              ARG EXPORTS TO SA: ZERO — UNTAPPED
            </div>
          )}
        </div>
      </div>

      {deal.buyer !== 'TBC' && (
        <div style={{ marginBottom: 14, padding: '10px 14px',
          background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 4,
          display: 'flex', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Buyer</div>
            <div style={{ color: '#2ecc71', fontWeight: 600 }}>{deal.buyer}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Supplier</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{deal.supplier}</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
        padding: '10px 14px', background: 'var(--bg-hover)', borderRadius: 4, marginBottom: 14 }}>
        {deal.notes}
      </div>

      <div className="section-label" style={{ marginBottom: 8 }}>Next Steps</div>
      <ol style={{ paddingLeft: 18 }}>
        {deal.nextSteps.map((step, i) => (
          <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Opportunities() {
  return (
    <div>
      <div style={{ marginBottom: 24, padding: '12px 16px',
        background: 'rgba(200,153,58,0.06)', border: '1px solid rgba(200,153,58,0.2)', borderRadius: 6,
        fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold-bright)', letterSpacing: '0.04em' }}>
        FOCUS: Argentina → South Africa &nbsp;|&nbsp; Dry goods &amp; long-life food ingredients &nbsp;|&nbsp; Updated May 2026
      </div>
      {DEALS.map(deal => <DealCard key={deal.id} deal={deal} />)}
    </div>
  );
}
