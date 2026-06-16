import React, { useState, useEffect } from 'react';
import { fetchTable, updateRow, insertRow } from './supabase';
import { uploadSpec, getSupplierSpecs } from './firebase';

const COUNTRIES  = ['All', 'Argentina', 'Brazil', 'Uruguay', 'Chile', 'Paraguay', 'Mexico', 'Colombia', 'Ecuador', 'Peru', 'South Africa'];
const CATEGORIES = ['All', 'Modified Starch', 'Dairy', 'Edible Oils', 'Wheat Flour', 'Gelatin', 'Soy Protein', 'Soya Lecithin', 'Milk Protein Concentrate', 'Tapioca Starch', 'Oleochemicals', 'Food Ingredients Distribution'];
const ROLES      = ['All', 'Manufacturer/Exporter', 'Domestic Producer', 'Buyer/Distributor', 'Buyer / Food Manufacturer', 'Buyer / Dairy Manufacturer'];
const SIZES      = ['All', 'Large', 'Medium', 'Small'];
const CONTACT_STATUSES = ['All', 'Not Contacted', 'Awaiting Response', 'Qualified', 'No Fit'];

const ROLE_COLOR = {
  'Manufacturer/Exporter':          '#3b82f6',
  'Manufacturer':                   '#3b82f6',
  'Exporter':                       '#3b82f6',
  'Export Authority / Cooperative': '#3b82f6',
  'Grain Trader/Exporter':          '#3b82f6',
  'Buyer/Distributor':              '#2ecc71',
  'Buyer / Food Manufacturer':      '#2ecc71',
  'Buyer / Dairy Manufacturer':     '#2ecc71',
  'Domestic Producer':              '#4a5a70',
};

const ROLE_TYPE = {
  'Manufacturer/Exporter':          'Supplier',
  'Manufacturer':                   'Supplier',
  'Exporter':                       'Supplier',
  'Export Authority / Cooperative': 'Supplier',
  'Grain Trader/Exporter':          'Supplier',
  'Buyer/Distributor':              'Buyer',
  'Buyer / Food Manufacturer':      'Buyer',
  'Buyer / Dairy Manufacturer':     'Buyer',
  'Domestic Producer':              'Competitive Intel',
};

const SIZE_COLOR = { Large: '#e8b84b', Medium: '#4a9eda', Small: '#2ecc71' };

const CONTACT_STATUS_COLOR = {
  'Not Contacted':     '#4a5a70',
  'Awaiting Response': '#e8b84b',
  'Qualified':         '#2ecc71',
  'No Fit':            '#e74c3c',
};

function getContactStatus(s) {
  if (!s.contacted) return 'Not Contacted';
  const outcome = (s.contact_outcome || '').toLowerCase();
  const next    = (s.next_action    || '').toLowerCase();
  if (next.includes('no fit') || outcome.includes('no fit') || outcome.includes('wheat only') || outcome.includes('cassava only')) return 'No Fit';
  if (next.includes('qualif') || outcome.includes('qualif')) return 'Qualified';
  return 'Awaiting Response';
}

function ContactBadge({ s }) {
  const status = getContactStatus(s);
  const color  = CONTACT_STATUS_COLOR[status];
  return (
    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color,
      background: color + '18', border: '1px solid ' + color + '40',
      padding: '2px 7px', borderRadius: 3 }}>
      {status.toUpperCase()}
    </span>
  );
}


const AFRICA_COUNTRIES = ['South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Ghana',
  'Ethiopia', 'Tanzania', 'Uganda', 'Morocco', 'Algeria', 'Tunisia',
  'Ivory Coast', 'Senegal', 'Zambia', 'Zimbabwe', 'Mozambique', 'Angola'];

function getMatchedBuyers(supplier) {
  const products = (supplier.products || []).map(p => p.toLowerCase());
  const category = (supplier.product_category || '').toLowerCase();
  return BUYERS.filter(b => {
    if (!AFRICA_COUNTRIES.includes(b.country)) return false;
    return b.ingredient_needs.some(need => {
      const n = need.toLowerCase();
      return products.some(p => p.includes(n) || n.includes(p)) ||
             category.includes(n) || n.includes(category);
    });
  });
}

function getMatchedBuyersDynamic(supplier, buyers) {
  const products = (supplier.products || []).map(p => p.toLowerCase());
  const category = (supplier.product_category || '').toLowerCase();
  return buyers.filter(b => {
    if (!AFRICA_COUNTRIES.includes(b.country)) return false;
    return (b.ingredient_needs || []).some(need => {
      const n = need.toLowerCase();
      return products.some(p => p.includes(n) || n.includes(p)) ||
             category.includes(n) || n.includes(category);
    });
  });
}

function SupplierCard({ s, buyers }) {
  const [expanded,    setExpanded]    = React.useState(false);
  const [specs,       setSpecs]       = React.useState([]);
  const [specsLoaded, setSpecsLoaded] = React.useState(false);
  const [uploading,   setUploading]   = React.useState(false);
  const [showSpecs,   setShowSpecs]   = React.useState(false);
  const fileInputRef = React.useRef();

  async function loadSpecs() {
    if (specsLoaded) return;
    const data = await getSupplierSpecs(s.id);
    setSpecs(data);
    setSpecsLoaded(true);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const spec = await uploadSpec(s.id, file);
      setSpecs(prev => [...prev, spec]);
      alert('Upload successful: ' + file.name);
    } catch(err) {
      console.error('Upload error full:', err);
      alert('Upload failed: ' + (err.code || '') + ' ' + (err.message || JSON.stringify(err)));
    }
    setUploading(false);
  }

  function toggleSpecs() {
    if (!showSpecs) loadSpecs();
    setShowSpecs(!showSpecs);
  }

  const role     = s.role || 'Supplier';
  const color    = ROLE_COLOR[role] || '#4a5a70';
  const roleType = ROLE_TYPE[role] || 'Supplier';
  const products = Array.isArray(s.products) ? s.products : [];
  const hasWarning = s.notes && s.notes.startsWith('WARNING');
  const contactStatus = getContactStatus(s);

  return (
    <div className="card" style={{ borderLeft: '3px solid ' + color }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
          <div className="card-title">{s.name}</div>
          <div className="card-sub">{s.city || s.country} &nbsp;&middot;&nbsp; {role}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
            <button onClick={() => setExpanded(!expanded)}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4,
                color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10,
                padding: '3px 8px', cursor: 'pointer' }}>{expanded ? 'less' : 'more'}</button>
          </div>
          {s.size && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)',
              color: SIZE_COLOR[s.size] || '#4a5a70',
              background: (SIZE_COLOR[s.size] || '#4a5a70') + '18',
              border: '1px solid ' + (SIZE_COLOR[s.size] || '#4a5a70') + '40',
              padding: '2px 7px', borderRadius: 3 }}>{s.size.toUpperCase()}</span>
          )}
          {s.verified && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2ecc71',
              background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)',
              padding: '2px 7px', borderRadius: 3 }}>VERIFIED</span>
          )}
          {s.priority === 1 && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#e8b84b',
              background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.2)',
              padding: '2px 7px', borderRadius: 3 }}>PRIORITY 1</span>
          )}
          {roleType === 'Competitive Intel' && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#4a5a70',
              background: 'rgba(74,90,112,0.1)', border: '1px solid rgba(74,90,112,0.2)',
              padding: '2px 7px', borderRadius: 3 }}>INTEL</span>
          )}
          <ContactBadge s={s} />
        </div>
      </div>

      {products.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {products.slice(0, 4).map(p => (
            <span key={p} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-hover)',
              border: '1px solid var(--border)', padding: '2px 7px', borderRadius: 3,
              fontFamily: 'var(--font-mono)' }}>{p}</span>
          ))}
          {products.length > 4 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 4px' }}>+{products.length - 4} more</span>
          )}
        </div>
      )}

      <div>
        {s.annual_capacity_mt && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Annual Capacity</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.annual_capacity_mt} MT</span>
          </div>
        )}
        {s.fobPriceRange && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>FOB Price</span>
            <span className="val val--gold">{s.fobPriceRange}</span>
          </div>
        )}
        {s.parent_company && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Parent</span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.parent_company}</span>
          </div>
        )}
        {s.website && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Website</span>
            <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.website}</span>
          </div>
        )}
        {s.nearest_port && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Nearest Export Port</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textAlign: 'right' }}>
              {s.nearest_port}
              {s.port_distance_km > 0 && (
                <span style={{ color: s.port_distance_km < 200 ? '#2ecc71' : s.port_distance_km < 600 ? '#e8b84b' : '#e74c3c', marginLeft: 8 }}>
                  {s.port_distance_km} km
                </span>
              )}
            </span>
          </div>
        )}
        {s.contact_approach && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Contact</span>
            <span style={{ color: 'var(--text-secondary)', textAlign: 'right', maxWidth: '65%' }}>{s.contact_approach}</span>
          </div>
        )}

        {/* Contact Log Section */}
        {s.contacted && (
          <div style={{ marginTop: 10, padding: '10px 12px',
            background: CONTACT_STATUS_COLOR[contactStatus] + '0a',
            border: '1px solid ' + CONTACT_STATUS_COLOR[contactStatus] + '30',
            borderRadius: 4 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Contact Log
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
              {s.contact_date && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Date</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.contact_date}</span>
                </>
              )}
              {s.contact_method && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Method</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.contact_method}</span>
                </>
              )}
              {s.contact_outcome && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Outcome</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', gridColumn: 'span 1' }}>{s.contact_outcome}</span>
                </>
              )}
              {s.next_action && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Next Action</span>
                  <span style={{ fontSize: 11, color: CONTACT_STATUS_COLOR[contactStatus] }}>{s.next_action}</span>
                </>
              )}
              {s.next_action_date && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Follow Up</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{s.next_action_date}</span>
                </>
              )}
              {s.export_agent_whatsapp && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>WhatsApp</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#2ecc71' }}>{s.export_agent_whatsapp}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {hasWarning && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(231,76,60,0.08)',
          border: '1px solid rgba(231,76,60,0.3)', borderRadius: 4,
          fontSize: 12, color: '#e74c3c', lineHeight: 1.5 }}>{s.notes}</div>
      )}
      {!hasWarning && s.notes && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>{s.notes}</div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 10 }}>
          <div style={{ padding: '10px 12px', background: 'var(--bg-hover)',
            border: '1px solid var(--border)', borderRadius: 4,
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
            {s.notes || 'No additional details.'}
          </div>
          {(() => {
            const matched = getMatchedBuyersDynamic(s, buyers || []);
            if (matched.length === 0) return null;
            return (
              <div style={{ padding: '10px 12px', background: 'rgba(74,158,218,0.05)',
                border: '1px solid rgba(74,158,218,0.2)', borderRadius: 4 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#4a9eda',
                  letterSpacing: '0.08em', marginBottom: 8 }}>
                  MATCHED BUYERS ({matched.length})
                </div>
                {matched.map(b => (
                  <div key={b.id} style={{ marginBottom: 8, paddingBottom: 8,
                    borderBottom: '1px solid rgba(74,158,218,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {b.city}, {b.country} · {b.category}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3,
                        fontFamily: 'var(--font-mono)', color: '#4a9eda',
                        border: '1px solid rgba(74,158,218,0.3)',
                        background: 'rgba(74,158,218,0.08)', flexShrink: 0, marginLeft: 8 }}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                      {b.ingredient_needs.filter(need => {
                        const n = need.toLowerCase();
                        const prods = (s.products || []).map(p => p.toLowerCase());
                        const cat = (s.product_category || '').toLowerCase();
                        return prods.some(p => p.includes(n) || n.includes(p)) || cat.includes(n) || n.includes(cat);
                      }).map(need => (
                        <span key={need} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3,
                          background: 'rgba(232,184,75,0.1)', color: '#e8b84b',
                          border: '1px solid rgba(232,184,75,0.2)', fontFamily: 'var(--font-mono)' }}>
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Specs section */}
      <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={toggleSpecs}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
              padding: 0, letterSpacing: '0.08em' }}>
            {showSpecs ? '▾' : '▸'} PRODUCT SPECS {specsLoaded ? `(${specs.length})` : ''}
          </button>
          <button onClick={() => fileInputRef.current.click()} disabled={uploading}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 3,
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10,
              padding: '2px 8px', cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}>
            {uploading ? 'uploading...' : '+ upload spec'}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xlsx"
            style={{ display: 'none' }} onChange={handleUpload} />
        </div>
        {showSpecs && (
          <div style={{ marginTop: 8 }}>
            {specs.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No specs uploaded yet
              </div>
            ) : specs.map(spec => (
              <a key={spec.path} href={spec.url} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                  fontSize: 11, color: 'var(--blue)', fontFamily: 'var(--font-mono)',
                  textDecoration: 'none' }}>
                📄 {spec.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function generateWeeklyReport(suppliers) {
  const today = new Date();
  const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
  const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const contacted = suppliers.filter(s => s.contacted && s.contact_date >= weekAgo.toISOString().slice(0,10));
  const awaiting  = suppliers.filter(s => getContactStatus(s) === 'Awaiting Response');
  const qualified = suppliers.filter(s => getContactStatus(s) === 'Qualified');
  const nofit     = suppliers.filter(s => getContactStatus(s) === 'No Fit');

  const rows = (list, showOutcome = false) => list.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.country}</td>
      <td>${s.product_category || ''}</td>
      <td>${s.contact_date || ''}</td>
      <td>${s.contact_method || ''}</td>
      ${showOutcome ? `<td>${s.contact_outcome || ''}</td>` : ''}
      <td>${s.next_action || ''}</td>
      <td>${s.next_action_date || ''}</td>
    </tr>`).join('');

  const tableStyle = `border-collapse:collapse;width:100%;margin-bottom:24px;font-size:11px`;
  const thStyle    = `background:#1a3a5c;color:#fff;padding:6px 10px;text-align:left;font-weight:600`;
  const tdStyle    = `padding:6px 10px;border-bottom:1px solid #e0e0e0;vertical-align:top`;
  const h2Style    = `color:#1a3a5c;margin:24px 0 8px;font-size:14px;border-bottom:2px solid #1a3a5c;padding-bottom:4px`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>JMR Global — Weekly Supplier Outreach Report</title>
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 40px; font-size: 12px; }
        h1 { color: #1a3a5c; font-size: 20px; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 12px; margin-bottom: 32px; }
        .summary { display: flex; gap: 16px; margin-bottom: 32px; }
        .summary-box { border: 2px solid; padding: 12px 20px; border-radius: 4px; text-align: center; min-width: 100px; }
        .num { font-size: 28px; font-weight: 700; }
        .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
        table { ${tableStyle} }
        th { ${thStyle} }
        td { ${tdStyle} }
        tr:hover td { background: #f9f9f9; }
        .footer { margin-top: 40px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body>
      <h1>JMR Global — Weekly Supplier Outreach Report</h1>
      <div class="subtitle">Generated: ${fmtDate(today)} &nbsp;|&nbsp; Period: ${fmtDate(weekAgo)} to ${fmtDate(today)} &nbsp;|&nbsp; Prepared by: Matt Callcott-Stevens</div>

      <div class="summary">
        <div class="summary-box" style="border-color:#3b82f6;color:#3b82f6">
          <div class="num">${contacted.length}</div><div class="lbl">Contacted This Week</div>
        </div>
        <div class="summary-box" style="border-color:#e8b84b;color:#e8b84b">
          <div class="num">${awaiting.length}</div><div class="lbl">Awaiting Response</div>
        </div>
        <div class="summary-box" style="border-color:#2ecc71;color:#2ecc71">
          <div class="num">${qualified.length}</div><div class="lbl">Qualified</div>
        </div>
        <div class="summary-box" style="border-color:#e74c3c;color:#e74c3c">
          <div class="num">${nofit.length}</div><div class="lbl">No Fit</div>
        </div>
        <div class="summary-box" style="border-color:#4a5a70;color:#4a5a70">
          <div class="num">${suppliers.filter(s => !s.contacted).length}</div><div class="lbl">Not Yet Contacted</div>
        </div>
      </div>

      <h2 style="${h2Style}">Contacted This Week (${contacted.length})</h2>
      ${contacted.length > 0 ? `
      <table>
        <thead><tr>
          <th>Supplier</th><th>Country</th><th>Category</th>
          <th>Date</th><th>Method</th><th>Outcome</th><th>Next Action</th><th>Follow Up</th>
        </tr></thead>
        <tbody>${rows(contacted, true)}</tbody>
      </table>` : '<p style="color:#999;font-style:italic">No contacts made this week.</p>'}

      <h2 style="${h2Style}">Awaiting Response (${awaiting.length})</h2>
      ${awaiting.length > 0 ? `
      <table>
        <thead><tr>
          <th>Supplier</th><th>Country</th><th>Category</th>
          <th>Date</th><th>Method</th><th>Next Action</th><th>Follow Up</th>
        </tr></thead>
        <tbody>${rows(awaiting)}</tbody>
      </table>` : '<p style="color:#999;font-style:italic">None awaiting response.</p>'}

      ${qualified.length > 0 ? `
      <h2 style="${h2Style}">Qualified Leads (${qualified.length})</h2>
      <table>
        <thead><tr>
          <th>Supplier</th><th>Country</th><th>Category</th>
          <th>Date</th><th>Method</th><th>Outcome</th><th>Next Action</th><th>Follow Up</th>
        </tr></thead>
        <tbody>${rows(qualified, true)}</tbody>
      </table>` : ''}

      <h2 style="${h2Style}">No Fit (${nofit.length})</h2>
      ${nofit.length > 0 ? `
      <table>
        <thead><tr>
          <th>Supplier</th><th>Country</th><th>Category</th>
          <th>Date</th><th>Method</th><th>Outcome</th><th>Next Action</th><th>Follow Up</th>
        </tr></thead>
        <tbody>${rows(nofit, true)}</tbody>
      </table>` : '<p style="color:#999;font-style:italic">None.</p>'}

      ${(() => {
        const withDocs = suppliers.filter(s => s.docs_received && s.docs_received.length > 0);
        if (withDocs.length === 0) return '';
        return `
        <h2 style="${h2Style}">Documentation Received (${withDocs.length} suppliers)</h2>
        <table>
          <thead><tr>
            <th>Supplier</th><th>Country</th><th>Type</th><th>Date</th><th>Filename</th><th>Notes</th>
          </tr></thead>
          <tbody>
            ${withDocs.map(s => s.docs_received.map(d => `
              <tr>
                <td>${s.name}</td>
                <td>${s.country}</td>
                <td>${d.type || ''}</td>
                <td>${d.date || ''}</td>
                <td style="font-family:monospace;font-size:10px">${d.filename || ''}</td>
                <td>${d.notes || ''}</td>
              </tr>`).join('')).join('')}
          </tbody>
        </table>`;
      })()}

      <div class="footer">
        JMR Global Trade Intelligence Platform &nbsp;|&nbsp; ${fmtDate(today)} &nbsp;|&nbsp; Confidential
      </div>
    </body>
    </html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}


const EMPTY_SUPPLIER = {
  name: '', country: 'Argentina', city: '',
  role: 'Manufacturer/Exporter', product_category: 'Modified Starch',
  size: 'Medium', priority: 2, website: '', nearest_port: '',
  fob_price_range: '', annual_capacity_mt: '', notes: '', next_action: '',
  products: '[]', certifications: '[]', docs_received: '[]',
  food_grade: true, export_experience: true, verified: false,
  contacted: false, status: '',
};

const inputStyle = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 4, padding: '6px 10px', color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)', fontSize: 12, boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
};

export default function Suppliers() {
  const [suppliers,     setSuppliers]     = useState([]);
  const [buyers,        setBuyers]        = useState([]);
  const [country,       setCountry]       = useState('All');
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_SUPPLIER);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    Promise.all([
      fetchTable('suppliers', { order: 'priority', asc: true }),
      fetchTable('buyers'),
    ]).then(([s, b]) => {
      setSuppliers(s.map(r => ({
        ...r,
        products: typeof r.products === 'string' ? JSON.parse(r.products || '[]') : (r.products || []),
        certifications: typeof r.certifications === 'string' ? JSON.parse(r.certifications || '[]') : (r.certifications || []),
        ingredient_needs: typeof r.ingredient_needs === 'string' ? JSON.parse(r.ingredient_needs || '[]') : (r.ingredient_needs || []),
      })));
      setBuyers(b.map(r => ({
        ...r,
        ingredient_needs: typeof r.ingredient_needs === 'string' ? JSON.parse(r.ingredient_needs || '[]') : (r.ingredient_needs || []),
      })));
    }).catch(e => console.error(e));
  }, []);

  function startNew() { setForm(EMPTY_SUPPLIER); setEditingId(null); setShowForm(true); }
  function startEdit(sup) { setForm({...EMPTY_SUPPLIER, ...sup}); setEditingId(sup.id); setShowForm(true); }

  async function handleSave() {
    if (!form.name.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      const autoId = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g,'');
      const payload = { ...form, id: editingId || autoId };
      if (editingId) {
        await updateRow('suppliers', editingId, payload);
      } else {
        await insertRow('suppliers', payload);
      }
      const fresh = await fetchTable('suppliers', { order: 'priority', asc: true });
      setSuppliers(fresh);
      setShowForm(false);
      setForm(EMPTY_SUPPLIER);
      setEditingId(null);
    } catch(e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  }
  const [category,      setCategory]      = useState('All');
  const [role,          setRole]          = useState('All');
  const [size,          setSize]          = useState('All');
  const [contactStatus, setContactStatus] = useState('All');
  const [search,        setSearch]        = useState('');

  const filtered = suppliers.filter(function(s) {
    if (country  !== 'All' && s.country !== country) return false;
    if (size     !== 'All' && s.size    !== size)    return false;
    if (category !== 'All') {
      const cat  = (s.product_category || '').toLowerCase();
      const prod = (Array.isArray(s.products) ? s.products.join(' ') : '').toLowerCase();
      if (!cat.includes(category.toLowerCase()) && !prod.includes(category.toLowerCase())) return false;
    }
    if (role !== 'All') {
      const rt = ROLE_TYPE[s.role] || 'Supplier';
      if (rt !== role) return false;
    }
    if (contactStatus !== 'All') {
      if (getContactStatus(s) !== contactStatus) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const haystack = ((s.name||'') + ' ' + (s.country||'') + ' ' +
        (Array.isArray(s.products) ? s.products.join(' ') : '') + ' ' + (s.notes||'')).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  }).sort(function(a, b) {
    if ((a.priority||99) !== (b.priority||99)) return (a.priority||99) - (b.priority||99);
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return (a.name||'').localeCompare(b.name||'');
  });

  const supplierCards = filtered.filter(s => (ROLE_TYPE[s.role]||'Supplier') === 'Supplier');
  const buyerCards    = filtered.filter(s => (ROLE_TYPE[s.role]||'') === 'Buyer');
  const intelCards    = filtered.filter(s => (ROLE_TYPE[s.role]||'') === 'Competitive Intel');

  // Contact status summary counts — reflects active filters
  const statusCounts = CONTACT_STATUSES.slice(1).reduce((acc, st) => {
    acc[st] = filtered.filter(s => getContactStatus(s) === st).length;
    return acc;
  }, {});

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '6px 10px', cursor: 'pointer', width: '100%',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <div>
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,
          display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'var(--bg-panel)',borderRadius:8,padding:32,width:600,
            maxHeight:'85vh',overflowY:'auto',border:'1px solid var(--border)'}}>
            <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:18,marginBottom:20}}>
              {editingId ? 'Edit Supplier' : 'Add Supplier'}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div style={{gridColumn:'1/-1'}}>
                <label style={labelStyle}>Company Name *</label>
                <input style={inputStyle} value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              </div>
              <div><label style={labelStyle}>Country</label>
                <select style={inputStyle} value={form.country}
                  onChange={e => setForm(p => ({...p, country: e.target.value}))}>
                  {COUNTRIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div><label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.city || ''}
                  onChange={e => setForm(p => ({...p, city: e.target.value}))} /></div>
              <div><label style={labelStyle}>Product Category</label>
                <select style={inputStyle} value={form.product_category}
                  onChange={e => setForm(p => ({...p, product_category: e.target.value}))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div><label style={labelStyle}>Role</label>
                <select style={inputStyle} value={form.role}
                  onChange={e => setForm(p => ({...p, role: e.target.value}))}>
                  {ROLES.filter(r => r !== 'All').map(r => <option key={r}>{r}</option>)}
                </select></div>
              <div><label style={labelStyle}>Size</label>
                <select style={inputStyle} value={form.size}
                  onChange={e => setForm(p => ({...p, size: e.target.value}))}>
                  {['Large','Medium','Small'].map(s => <option key={s}>{s}</option>)}
                </select></div>
              <div><label style={labelStyle}>Priority</label>
                <select style={inputStyle} value={form.priority}
                  onChange={e => setForm(p => ({...p, priority: parseInt(e.target.value)}))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>P{n}</option>)}
                </select></div>
              <div><label style={labelStyle}>Website</label>
                <input style={inputStyle} value={form.website || ''}
                  onChange={e => setForm(p => ({...p, website: e.target.value}))} /></div>
              <div><label style={labelStyle}>Nearest Port</label>
                <input style={inputStyle} value={form.nearest_port || ''}
                  onChange={e => setForm(p => ({...p, nearest_port: e.target.value}))} /></div>
              <div><label style={labelStyle}>FOB Price Range</label>
                <input style={inputStyle} value={form.fob_price_range || ''}
                  placeholder="e.g. $0.65-0.75/kg FOB"
                  onChange={e => setForm(p => ({...p, fob_price_range: e.target.value}))} /></div>
              <div><label style={labelStyle}>Annual Capacity (MT)</label>
                <input style={inputStyle} value={form.annual_capacity_mt || ''}
                  placeholder="e.g. >50,000"
                  onChange={e => setForm(p => ({...p, annual_capacity_mt: e.target.value}))} /></div>
            </div>
            <div style={{marginBottom:12}}><label style={labelStyle}>Products (comma separated)</label>
              <input style={inputStyle}
                value={(() => { try { return JSON.parse(form.products||'[]').join(', '); } catch { return ''; } })()}
                placeholder="e.g. Modified Starch, Native Starch"
                onChange={e => setForm(p => ({...p, products: JSON.stringify(e.target.value.split(',').map(x=>x.trim()).filter(Boolean))}))} /></div>
            <div style={{marginBottom:12}}><label style={labelStyle}>Certifications (comma separated)</label>
              <input style={inputStyle}
                value={(() => { try { return JSON.parse(form.certifications||'[]').join(', '); } catch { return ''; } })()}
                placeholder="e.g. ISO 9001, FSSC 22000, Halal"
                onChange={e => setForm(p => ({...p, certifications: JSON.stringify(e.target.value.split(',').map(x=>x.trim()).filter(Boolean))}))} /></div>
            <div style={{marginBottom:12}}><label style={labelStyle}>Next Action</label>
              <input style={inputStyle} value={form.next_action || ''}
                onChange={e => setForm(p => ({...p, next_action: e.target.value}))} /></div>
            <div style={{marginBottom:16}}><label style={labelStyle}>Notes</label>
              <textarea style={{...inputStyle,height:80,resize:'vertical'}} value={form.notes || ''}
                onChange={e => setForm(p => ({...p, notes: e.target.value}))} /></div>
            <div style={{display:'flex',gap:16,marginBottom:20}}>
              {[['food_grade','Food Grade'],['export_experience','Export Experience'],['verified','Verified']].map(([k,l]) => (
                <label key={k} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,
                  fontFamily:'var(--font-mono)',color:'var(--text-muted)',cursor:'pointer'}}>
                  <input type="checkbox" checked={!!form[k]}
                    onChange={e => setForm(p => ({...p, [k]: e.target.checked}))} />{l}
                </label>
              ))}
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={() => setShowForm(false)} style={{padding:'8px 18px',
                background:'none',border:'1px solid var(--border)',borderRadius:4,
                cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--text-muted)'}}>
                Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{padding:'8px 18px',
                background:'var(--gold)',border:'none',borderRadius:4,cursor:'pointer',
                fontFamily:'var(--font-mono)',fontSize:12,color:'#fff',opacity:saving?0.7:1}}>
                {saving ? 'Saving...' : 'Save Supplier'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Contact Status Summary Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {CONTACT_STATUSES.slice(1).map(st => {
          const color = CONTACT_STATUS_COLOR[st];
          const isActive = contactStatus === st;
          return (
            <div key={st} onClick={() => setContactStatus(contactStatus === st ? 'All' : st)}
              className="card" style={{ padding: '8px 14px', cursor: 'pointer', flex: '1 1 auto',
                minWidth: 100, textAlign: 'center',
                borderColor: isActive ? color : color + '30',
                background: isActive ? color + '12' : undefined }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 22, color }}>{statusCounts[st]}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)', marginTop: 2 }}>{st.toUpperCase()}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={startNew} style={{padding:'6px 16px',background:'var(--gold)',
          border:'none',borderRadius:4,cursor:'pointer',fontFamily:'var(--font-mono)',
          fontSize:11,color:'#fff',letterSpacing:'0.06em'}}>+ ADD SUPPLIER</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16, alignItems: 'end' }}>
        <div>
          <span style={labelStyle}>Search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Name, product, country..."
            style={{ ...selectStyle }} />
        </div>
        <div>
          <span style={labelStyle}>Country</span>
          <select value={country} onChange={e => setCountry(e.target.value)} style={selectStyle}>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Category</span>
          <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Size</span>
          <select value={size} onChange={e => setSize(e.target.value)} style={selectStyle}>
            {SIZES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Role</span>
          <select value={role} onChange={e => setRole(e.target.value)} style={selectStyle}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Contact Status</span>
          <select value={contactStatus} onChange={e => setContactStatus(e.target.value)} style={selectStyle}>
            {CONTACT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} of {suppliers.length} suppliers
        </span>
        <button onClick={() => generateWeeklyReport(suppliers)}
          style={{ background: '#1a3a5c', border: 'none', borderRadius: 4,
            color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11,
            padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          ⬇ Weekly Report PDF
        </button>
      </div>

      {supplierCards.length > 0 && (
        <div className="page-section">
          <div className="section-label" style={{ marginBottom: 12 }}>Suppliers ({supplierCards.length})</div>
          <div className="card-grid card-grid--2">
            {supplierCards.map(s => <SupplierCard key={s.id} s={s} buyers={buyers} />)}
          </div>
        </div>
      )}
      {buyerCards.length > 0 && (
        <div className="page-section">
          <div className="section-label" style={{ marginBottom: 12 }}>Buyers ({buyerCards.length})</div>
          <div className="card-grid card-grid--2">
            {buyerCards.map(s => <SupplierCard key={s.id} s={s} buyers={buyers} />)}
          </div>
        </div>
      )}
      {intelCards.length > 0 && (
        <div className="page-section">
          <div className="section-label" style={{ marginBottom: 12 }}>Competitive Intel ({intelCards.length})</div>
          <div className="card-grid card-grid--2">
            {intelCards.map(s => <SupplierCard key={s.id} s={s} buyers={buyers} />)}
          </div>
        </div>
      )}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          No suppliers match your filters
        </div>
      )}
    </div>
  );
}
