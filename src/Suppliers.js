import React, { useState } from 'react';
import { SUPPLIERS } from './data/supplierData';
import { uploadSpec, getSupplierSpecs } from './firebase';

const COUNTRIES  = ['All', 'Argentina', 'Brazil', 'Uruguay', 'Chile', 'Paraguay', 'Mexico', 'Colombia', 'Ecuador', 'Peru', 'South Africa'];
const CATEGORIES = ['All', 'Modified Starch', 'Dairy', 'Edible Oils', 'Wheat Flour', 'Gelatin', 'Soy Protein', 'Food Ingredients Distribution'];
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

function SupplierCard({ s }) {
  const [specs, setSpecs] = React.useState([]);
  const [specsLoaded, setSpecsLoaded] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [showSpecs, setShowSpecs] = React.useState(false);
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
    } catch(err) {
      alert('Upload failed: ' + err.message);
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

export default function Suppliers() {
  const [country,       setCountry]       = useState('All');
  const [category,      setCategory]      = useState('All');
  const [role,          setRole]          = useState('All');
  const [size,          setSize]          = useState('All');
  const [contactStatus, setContactStatus] = useState('All');
  const [search,        setSearch]        = useState('');

  const filtered = SUPPLIERS.filter(function(s) {
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
          {filtered.length} of {SUPPLIERS.length} suppliers
        </span>
        <button onClick={() => generateWeeklyReport(SUPPLIERS)}
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
            {supplierCards.map(s => <SupplierCard key={s.id} s={s} />)}
          </div>
        </div>
      )}
      {buyerCards.length > 0 && (
        <div className="page-section">
          <div className="section-label" style={{ marginBottom: 12 }}>Buyers ({buyerCards.length})</div>
          <div className="card-grid card-grid--2">
            {buyerCards.map(s => <SupplierCard key={s.id} s={s} />)}
          </div>
        </div>
      )}
      {intelCards.length > 0 && (
        <div className="page-section">
          <div className="section-label" style={{ marginBottom: 12 }}>Competitive Intel ({intelCards.length})</div>
          <div className="card-grid card-grid--2">
            {intelCards.map(s => <SupplierCard key={s.id} s={s} />)}
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
