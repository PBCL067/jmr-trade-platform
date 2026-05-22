import React, { useState, useEffect } from 'react';
import { fetchCollection } from './firebase';

const STATIC_SUPPLIERS = [
  {
    id: 'ingredion-arg', name: 'Ingredion Argentina', country: 'Argentina',
    commodity: 'Modified Starch', hsCode: '3505', type: 'Manufacturer', status: 'TARGET',
    website: 'ingredion.com/sa/es-ar', contact: 'Export team - via website',
    notes: 'Global starch leader. Local production in Argentina.',
    certifications: ['Food Grade', 'ISO 9001'], fobPriceRange: '$0.58-0.65/kg',
  },
  {
    id: 'bragan-sa', name: 'Bragan / Solevo', country: 'South Africa',
    commodity: 'Modified Starch', hsCode: '3505', type: 'Buyer / Distributor', status: 'CONFIRMED',
    website: '', contact: 'Direct contact confirmed',
    notes: 'Confirmed buyer for SA market. Current procurement price ~$1.09/kg.',
    certifications: [], fobPriceRange: null,
  },
  {
    id: 'gasc', name: 'GASC', country: 'Egypt',
    commodity: 'Wheat HRW', hsCode: '1001', type: 'State Buyer', status: 'RESEARCH',
    website: 'gasc.gov.eg', contact: 'Tender-based procurement',
    notes: "World's largest wheat importer. Purchases via regular international tenders.",
    certifications: [], fobPriceRange: null,
  },
  {
    id: 'indonesia-coffee', name: 'Indonesia Coffee Exporters', country: 'Indonesia',
    commodity: 'Coffee Arabica', hsCode: '0901', type: 'Exporter Group', status: 'RESEARCH',
    website: '', contact: 'AEKI (Association of Indonesian Coffee Exporters)',
    notes: '4th largest coffee producer. Strong Arabica from Sumatra.',
    certifications: [], fobPriceRange: null,
  },
];

const STATUS_CLS = { CONFIRMED: 'badge--buy', TARGET: 'badge--hold', RESEARCH: 'badge--low', ACTIVE: 'badge--buy' };

function SupplierCard({ s }) {
  const certs = Array.isArray(s.certifications) ? s.certifications : [];
  const status = s.status || 'RESEARCH';
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div className="card-title">{s.name}</div>
          <div className="card-sub">{s.country} &nbsp;&middot;&nbsp; {s.type}</div>
        </div>
        <span className={'badge ' + (STATUS_CLS[status] || 'badge--low')}>{status}</span>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>Commodity</span>
          <span style={{ color: 'var(--text-secondary)' }}>{s.commodity} (HS {s.hsCode})</span>
        </div>
        {s.fobPriceRange && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>FOB Price</span>
            <span className="val val--gold">{s.fobPriceRange}</span>
          </div>
        )}
        {s.website && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Website</span>
            <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.website}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>Contact</span>
          <span style={{ color: 'var(--text-secondary)', textAlign: 'right', maxWidth: '60%' }}>{s.contact}</span>
        </div>
      </div>
      {certs.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {certs.map(function(c) {
            return <span key={c} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-hover)', border: '1px solid var(--border)', padding: '2px 7px', borderRadius: 3 }}>{c}</span>;
          })}
        </div>
      )}
      {s.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>{s.notes}</div>}
    </div>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(STATIC_SUPPLIERS);
  const [view, setView] = useState('cards');
  const [loading, setLoading] = useState(false);

  useEffect(function() {
    (async function() {
      try {
        setLoading(true);
        const data = await fetchCollection('suppliers');
        const valid = data && data.filter(function(d) { return d.name && d.commodity; });
        if (valid && valid.length > 0) setSuppliers(valid);
      } catch (e) {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading">Loading suppliers</div>;

  return (
    <div>
      <div className="page-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>Verified Suppliers &amp; Buyers</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['cards', 'table'].map(function(v) {
              return (
                <button key={v} onClick={function() { setView(v); }} style={{
                  background: view === v ? 'var(--bg-hover)' : 'none',
                  border: '1px solid ' + (view === v ? 'var(--border-bright)' : 'var(--border)'),
                  borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
                  color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{v}</button>
              );
            })}
          </div>
        </div>
        {view === 'cards' ? (
          <div className="card-grid card-grid--2">
            {suppliers.map(function(s) { return <SupplierCard key={s.id} s={s} />; })}
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Country</th><th>Commodity</th><th>HS</th><th>Type</th><th>Status</th><th>FOB</th></tr></thead>
              <tbody>
                {suppliers.map(function(s) {
                  const status = s.status || 'RESEARCH';
                  return (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                      <td>{s.country}</td><td>{s.commodity}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.hsCode}</td>
                      <td>{s.type}</td>
                      <td><span className={'badge ' + (STATUS_CLS[status] || 'badge--low')}>{status}</span></td>
                      <td className="val val--gold" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.fobPriceRange || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
