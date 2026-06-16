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
  'Ethiopia', 'Tanzania', 'Uganda', 'Morocco', 'Algeria', 'Tunisia', 'Ivory Coast'];


const EMPTY_SUPPLIER = {
  id: '', name: '', country: 'Argentina', city: '', role: 'Manufacturer/Exporter',
  product_category: 'Modified Starch', website: '', notes: '',
  food_grade: true, export_experience: true, verified: false,
  size: 'Medium', status: '', contacted: false,
  next_action: '', fob_price_range: '', nearest_port: '',
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
  const [suppliers, setSuppliers] = useState([]);
  const [buyers,    setBuyers]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [country,  setCountry]  = useState('All');
  const [category, setCategory] = useState('All');
  const [role,     setRole]     = useState('All');
  const [size,     setSize]     = useState('All');
  const [contactStatus, setContactStatus] = useState('All');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [specs,    setSpecs]    = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_SUPPLIER);
  const [saving,    setSaving]    = useState(false);

  function startNew() { setForm(EMPTY_SUPPLIER); setEditingId(null); setShowForm(true); }
  function startEdit(s) { setForm({ ...EMPTY_SUPPLIER, ...s }); setEditingId(s.id); setShowForm(true); }

  async function handleSave() {
    if (!form.name.trim()) { alert('Name is required'); return; }
    if (!form.id.trim())   { alert('ID is required (lowercase, underscores)'); return; }
    setSaving(true);
    try {
      const payload = { ...form,
        products: JSON.stringify([]),
        certifications: JSON.stringify([]),
        docs_received: JSON.stringify([]),
      };
      if (editingId) {
        await updateRow('suppliers', editingId, payload);
      } else {
        await insertRow('suppliers', payload);
      }
      const fresh = await fetchTable('suppliers', { order: 'name', asc: true });
      setSuppliers(fresh);
      setShowForm(false);
      setForm(EMPTY_SUPPLIER);
      setEditingId(null);
    } catch(e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  }
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [s, b] = await Promise.all([
          fetchTable('suppliers', { order: 'priority', asc: true }),
          fetchTable('buyers'),
        ]);
        setSuppliers(s);
        setBuyers(b);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    getSupplierSpecs(selected.id).then(setSpecs);
  }, [selected]);

  const filtered = suppliers.filter(s => {
    if (country  !== 'All' && s.country           !== country)   return false;
    if (category !== 'All' && s.product_category  !== category)  return false;
    if (role     !== 'All' && s.role              !== role)      return false;
    if (size     !== 'All' && s.size              !== size)      return false;
    if (contactStatus !== 'All' && getContactStatus(s) !== contactStatus) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !(s.product_category || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const africaBuyers = buyers.filter(b => AFRICA_COUNTRIES.includes(b.country));

  const selStyle = (val, cur) => ({
    background: val === cur ? 'var(--bg-hover)' : 'none',
    border: '1px solid ' + (val === cur ? 'var(--border-bright)' : 'var(--border)'),
    borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
    color: val === cur ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  });

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file || !selected) return;
    setUploading(true);
    try {
      await uploadSpec(selected.id, file);
      const updated = await getSupplierSpecs(selected.id);
      setSpecs(updated);
    } catch(err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function markContacted(supplier) {
    try {
      await updateRow('suppliers', supplier.id, { contacted: true });
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? { ...s, contacted: true } : s));
    } catch(err) {
      alert('Update failed: ' + err.message);
    }
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading suppliers...</div>;
  if (error)   return <div style={{ padding: 40, color: '#e74c3c', fontFamily: 'var(--font-mono)' }}>Error: {error}</div>;

  return (
    <div>
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'var(--bg-panel)', borderRadius:8, padding:32, width:560,
            maxHeight:'85vh', overflowY:'auto', border:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
              marginBottom:20 }}>{editingId ? 'Edit Supplier' : 'Add Supplier'}</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label style={labelStyle}>ID (unique, no spaces)</label>
                <input style={inputStyle} value={form.id} disabled={!!editingId}
                  onChange={e => setForm(p => ({...p, id: e.target.value.toLowerCase().replace(/\s/g,'_')}))} /></div>
              <div><label style={labelStyle}>Name</label>
                <input style={inputStyle} value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))} /></div>
              <div><label style={labelStyle}>Country</label>
                <select style={inputStyle} value={form.country}
                  onChange={e => setForm(p => ({...p, country: e.target.value}))}>
                  {COUNTRIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div><label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.city || ''}
                  onChange={e => setForm(p => ({...p, city: e.target.value}))} /></div>
              <div><label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.product_category}
                  onChange={e => setForm(p => ({...p, product_category: e.target.value}))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div><label style={labelStyle}>Size</label>
                <select style={inputStyle} value={form.size}
                  onChange={e => setForm(p => ({...p, size: e.target.value}))}>
                  {['Large','Medium','Small'].map(s => <option key={s}>{s}</option>)}
                </select></div>
              <div><label style={labelStyle}>Website</label>
                <input style={inputStyle} value={form.website || ''}
                  onChange={e => setForm(p => ({...p, website: e.target.value}))} /></div>
              <div><label style={labelStyle}>Nearest Port</label>
                <input style={inputStyle} value={form.nearest_port || ''}
                  onChange={e => setForm(p => ({...p, nearest_port: e.target.value}))} /></div>
              <div><label style={labelStyle}>FOB Price Range</label>
                <input style={inputStyle} value={form.fob_price_range || ''}
                  onChange={e => setForm(p => ({...p, fob_price_range: e.target.value}))} /></div>
              <div><label style={labelStyle}>Status</label>
                <input style={inputStyle} value={form.status || ''}
                  onChange={e => setForm(p => ({...p, status: e.target.value}))} /></div>
            </div>

            <div style={{ marginBottom:12 }}><label style={labelStyle}>Next Action</label>
              <input style={inputStyle} value={form.next_action || ''}
                onChange={e => setForm(p => ({...p, next_action: e.target.value}))} /></div>

            <div style={{ marginBottom:20 }}><label style={labelStyle}>Notes</label>
              <textarea style={{...inputStyle, height:80, resize:'vertical'}} value={form.notes || ''}
                onChange={e => setForm(p => ({...p, notes: e.target.value}))} /></div>

            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding:'8px 18px',
                background:'none', border:'1px solid var(--border)', borderRadius:4,
                cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:12,
                color:'var(--text-muted)' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding:'8px 18px',
                background:'var(--gold)', border:'none', borderRadius:4, cursor:'pointer',
                fontFamily:'var(--font-mono)', fontSize:12, color:'#fff',
                opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Supplier'}</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          style={{ flex: 1, minWidth: 200, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 4, padding: '6px 12px',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {filtered.length} / {suppliers.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          [COUNTRIES,        country,       setCountry,       'Country'],
          [CATEGORIES,       category,      setCategory,      'Category'],
          [ROLES,            role,          setRole,          'Role'],
          [SIZES,            size,          setSize,          'Size'],
          [CONTACT_STATUSES, contactStatus, setContactStatus, 'Contact Status'],
        ].map(([opts, val, setter, label]) => (
          <select key={label} value={val} onChange={e => setter(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 4, padding: '6px 10px', color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}>
            {opts.map(o => <option key={o} value={o}>{o === 'All' ? label + ': All' : o}</option>)}
          </select>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
        {filtered.map(s => (
          <div key={s.id}
            onClick={() => setSelected(selected?.id === s.id ? null : s)}
            style={{ background: 'var(--bg-card)', border: '1px solid ' + (selected?.id === s.id ? 'var(--border-bright)' : 'var(--border)'),
              borderRadius: 6, padding: 16, cursor: 'pointer',
              borderLeft: '3px solid ' + (ROLE_COLOR[s.role] || '#4a5a70') }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {s.name}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {s.size && <span style={{ fontSize: 10, color: SIZE_COLOR[s.size] || '#4a9eda',
                  background: (SIZE_COLOR[s.size] || '#4a9eda') + '18',
                  border: '1px solid ' + (SIZE_COLOR[s.size] || '#4a9eda') + '40',
                  padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>{s.size}</span>}
                <ContactBadge s={s} />
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              {s.city ? `${s.city}, ` : ''}{s.country} · {s.product_category}
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: ROLE_COLOR[s.role] || '#4a5a70',
                background: (ROLE_COLOR[s.role] || '#4a5a70') + '18',
                border: '1px solid ' + (ROLE_COLOR[s.role] || '#4a5a70') + '40',
                padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>
                {ROLE_TYPE[s.role] || s.role}
              </span>
              {s.priority && <span style={{ fontSize: 10, color: '#a855f7',
                background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
                padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>
                P{s.priority}
              </span>}
              {s.verified && <span style={{ fontSize: 10, color: '#2ecc71',
                background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)',
                padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>✓ VERIFIED</span>}
            </div>

            {selected?.id === s.id && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {s.notes && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{s.notes}</p>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                  {s.website && <a href={'https://' + s.website} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, color: '#4a9eda', fontFamily: 'var(--font-mono)' }}
                    onClick={e => e.stopPropagation()}>🌐 {s.website}</a>}
                  {s.nearest_port && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ⚓ {s.nearest_port} {s.port_distance_km ? `(${s.port_distance_km}km)` : ''}</span>}
                  {s.fob_price_range && <span style={{ fontSize: 11, color: '#e8b84b', fontFamily: 'var(--font-mono)' }}>
                    💲 {s.fob_price_range}</span>}
                  {s.contact_approach && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', gridColumn: '1/-1' }}>
                    📋 {s.contact_approach}</span>}
                </div>

                {s.products && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>PRODUCTS</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(typeof s.products === 'string' ? JSON.parse(s.products) : s.products).map(p => (
                        <span key={p} style={{ fontSize: 10, color: '#e8b84b', background: 'rgba(232,184,75,0.1)',
                          border: '1px solid rgba(232,184,75,0.3)', padding: '2px 6px', borderRadius: 3,
                          fontFamily: 'var(--font-mono)' }}>{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {s.certifications && (typeof s.certifications === 'string' ? JSON.parse(s.certifications) : s.certifications).length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>CERTIFICATIONS</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(typeof s.certifications === 'string' ? JSON.parse(s.certifications) : s.certifications).map(c => (
                        <span key={c} style={{ fontSize: 10, color: '#2ecc71', background: 'rgba(46,204,113,0.1)',
                          border: '1px solid rgba(46,204,113,0.3)', padding: '2px 6px', borderRadius: 3,
                          fontFamily: 'var(--font-mono)' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {s.next_action && (
                  <div style={{ marginBottom: 8, padding: '6px 10px', background: 'rgba(232,184,75,0.08)',
                    border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4 }}>
                    <div style={{ fontSize: 10, color: '#e8b84b', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>NEXT ACTION</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.next_action}</div>
                    {s.next_action_date && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.next_action_date}</div>}
                  </div>
                )}

                {specs.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>SPEC SHEETS</div>
                    {specs.map(sp => (
                      <a key={sp.name} href={sp.url} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ display: 'block', fontSize: 11, color: '#4a9eda', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                        📄 {sp.name}
                      </a>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }} onClick={e => e.stopPropagation()}>
                  <label style={{ fontSize: 11, color: '#4a9eda', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    border: '1px solid rgba(74,158,218,0.3)', padding: '4px 10px', borderRadius: 4 }}>
                    {uploading ? 'Uploading...' : '+ Spec Sheet'}
                    <input type="file" accept=".pdf,.xlsx,.xls,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                  {!s.contacted && (
                    <button onClick={() => markContacted(s)}
                      style={{ fontSize: 11, color: '#2ecc71', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                        border: '1px solid rgba(46,204,113,0.3)', padding: '4px 10px', borderRadius: 4,
                        background: 'none' }}>
                      ✓ Mark Contacted
                    </button>
                  )}
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>POTENTIAL BUYERS</div>
                  {africaBuyers.filter(b => b.ingredient_needs &&
                    (typeof b.ingredient_needs === 'string' ? JSON.parse(b.ingredient_needs) : b.ingredient_needs)
                      .some(need => (s.product_category || '').toLowerCase().includes(need.toLowerCase()) ||
                        need.toLowerCase().includes((s.product_category || '').toLowerCase()))
                  ).slice(0, 3).map(b => (
                    <div key={b.id} style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                      padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
                      {b.name} · {b.country}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
