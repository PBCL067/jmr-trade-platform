import React, { useState, useEffect } from 'react';
import { fetchTable } from './supabase';
import { insertRow } from './supabase';

const CATEGORIES = ['All', 'Distributor', 'Confectionery', 'Dairy', 'Bakery',
                    'Food Manufacturer', 'Edible Oils & Fats', 'Instant Food'];
const COUNTRIES  = ['All', 'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Ghana', 'Morocco', 'Ethiopia', 'Tanzania', 'Zambia', 'Zimbabwe'];
const STATUS_COLOR = {
  'Priority Target': '#e8b84b',
  'Prospect':        '#4a9eda',
  'Contacted':       '#2ecc71',
  'Active':          '#2ecc71',
};


const EMPTY_BUYER = {
  id: '', name: '', country: 'South Africa', city: '',
  category: 'Food Manufacturer', website: '', email: '',
  size: 'Medium', status: 'Target', contacted: false,
  notes: '', ingredient_needs: '[]', manufactures: '[]', distributes: '[]',
};

const inputStyleB = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 4, padding: '6px 10px', color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)', fontSize: 12, boxSizing: 'border-box',
};

const labelStyleB = {
  fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
};

export default function Buyers() {
  const [buyers,   setBuyers]   = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [category,  setCategory]  = useState('All');
  const [country,   setCountry]   = useState('All');
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState(null);
  const [ingFilter, setIngFilter] = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_BUYER);
  const [saving,    setSaving]    = useState(false);

  function startNew() { setForm(EMPTY_BUYER); setEditingId(null); setShowForm(true); }
  function startEdit(b) { setForm({ ...EMPTY_BUYER, ...b }); setEditingId(b.id); setShowForm(true); }

  async function handleSave() {
    if (!form.name.trim()) { alert('Name is required'); return; }
    if (!form.id.trim())   { alert('ID is required (lowercase, underscores)'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId) {
        await updateRow('buyers', editingId, payload);
      } else {
        await insertRow('buyers', payload);
      }
      const fresh = await fetchTable('buyers', { order: 'name', asc: true });
      setBuyers(fresh);
      setShowForm(false);
      setForm(EMPTY_BUYER);
      setEditingId(null);
    } catch(e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  }

  useEffect(() => {
    async function load() {
      try {
        const [b, s] = await Promise.all([
          fetchTable('buyers'),
          fetchTable('suppliers'),
        ]);
        setBuyers(b);
        setSuppliers(s);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = buyers.filter(b => {
    if (category !== 'All' && b.category !== category) return false;
    if (country  !== 'All' && b.country  !== country)  return false;
    const needs = typeof b.ingredient_needs === 'string' ? JSON.parse(b.ingredient_needs) : (b.ingredient_needs || []);
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) &&
        !needs.some(i => i.toLowerCase().includes(search.toLowerCase()))) return false;
    if (ingFilter && !needs.some(i => i.toLowerCase().includes(ingFilter.toLowerCase()))) return false;
    return true;
  });

  const selStyle = (val, cur) => ({
    background: val === cur ? 'var(--bg-hover)' : 'none',
    border: '1px solid ' + (val === cur ? 'var(--border-bright)' : 'var(--border)'),
    borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
    color: val === cur ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  });

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading buyers...</div>;
  if (error)   return <div style={{ padding: 40, color: '#e74c3c', fontFamily: 'var(--font-mono)' }}>Error: {error}</div>;

  return (
    <div>
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'var(--bg-panel)', borderRadius:8, padding:32, width:520,
            maxHeight:'85vh', overflowY:'auto', border:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18,
              marginBottom:20 }}>{editingId ? 'Edit Buyer' : 'Add Buyer'}</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label style={labelStyleB}>ID (unique, no spaces)</label>
                <input style={inputStyleB} value={form.id} disabled={!!editingId}
                  onChange={e => setForm(p => ({...p, id: e.target.value.toLowerCase().replace(/ /g,'_')}))} /></div>
              <div><label style={labelStyleB}>Company Name</label>
                <input style={inputStyleB} value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))} /></div>
              <div><label style={labelStyleB}>Country</label>
                <input style={inputStyleB} value={form.country}
                  onChange={e => setForm(p => ({...p, country: e.target.value}))} /></div>
              <div><label style={labelStyleB}>City</label>
                <input style={inputStyleB} value={form.city || ''}
                  onChange={e => setForm(p => ({...p, city: e.target.value}))} /></div>
              <div><label style={labelStyleB}>Category</label>
                <input style={inputStyleB} value={form.category || ''}
                  onChange={e => setForm(p => ({...p, category: e.target.value}))} /></div>
              <div><label style={labelStyleB}>Size</label>
                <select style={inputStyleB} value={form.size}
                  onChange={e => setForm(p => ({...p, size: e.target.value}))}>
                  {['Large','Medium','Small'].map(s => <option key={s}>{s}</option>)}
                </select></div>
              <div><label style={labelStyleB}>Website</label>
                <input style={inputStyleB} value={form.website || ''}
                  onChange={e => setForm(p => ({...p, website: e.target.value}))} /></div>
              <div><label style={labelStyleB}>Email</label>
                <input style={inputStyleB} value={form.email || ''}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))} /></div>
              <div><label style={labelStyleB}>Status</label>
                <select style={inputStyleB} value={form.status || 'Target'}
                  onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                  {['Target','Priority Target','Active','Watch','Contacted','No Fit'].map(s => <option key={s}>{s}</option>)}
                </select></div>
            </div>

            <div style={{ marginBottom:12 }}><label style={labelStyleB}>Ingredient Needs (comma separated)</label>
              <input style={inputStyleB} value={
                (() => { try { const v = JSON.parse(form.ingredient_needs); return Array.isArray(v) ? v.join(', ') : form.ingredient_needs; } catch { return form.ingredient_needs || ''; } })()
              } onChange={e => setForm(p => ({...p, ingredient_needs: JSON.stringify(e.target.value.split(',').map(x => x.trim()).filter(Boolean))}))} /></div>

            <div style={{ marginBottom:20 }}><label style={labelStyleB}>Notes</label>
              <textarea style={{...inputStyleB, height:80, resize:'vertical'}} value={form.notes || ''}
                onChange={e => setForm(p => ({...p, notes: e.target.value}))} /></div>

            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding:'8px 18px',
                background:'none', border:'1px solid var(--border)', borderRadius:4,
                cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:12,
                color:'var(--text-muted)' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding:'8px 18px',
                background:'var(--gold)', border:'none', borderRadius:4, cursor:'pointer',
                fontFamily:'var(--font-mono)', fontSize:12, color:'#fff',
                opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Buyer'}</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={startNew} style={{ marginLeft:'auto', padding:'6px 16px',
          background:'var(--gold)', border:'none', borderRadius:4, cursor:'pointer',
          fontFamily:'var(--font-mono)', fontSize:11, color:'#fff', letterSpacing:'0.06em' }}>
          + ADD BUYER
        </button>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search buyer or ingredient..."
          style={{ flex: 1, minWidth: 200, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 4, padding: '6px 12px',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        <input value={ingFilter} onChange={e => setIngFilter(e.target.value)}
          placeholder="Filter by ingredient need..."
          style={{ flex: 1, minWidth: 200, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 4, padding: '6px 12px',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          [CATEGORIES, category, setCategory, 'Category'],
          [COUNTRIES,  country,  setCountry,  'Country'],
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
        {filtered.map(b => {
          const needs = typeof b.ingredient_needs === 'string' ? JSON.parse(b.ingredient_needs) : (b.ingredient_needs || []);
          const mfg   = typeof b.manufactures === 'string' ? JSON.parse(b.manufactures) : (b.manufactures || []);
          const dist  = typeof b.distributes  === 'string' ? JSON.parse(b.distributes)  : (b.distributes  || []);
          const isSelected = selected?.id === b.id;

          const matchingSuppliers = suppliers.filter(s =>
            needs.some(need =>
              (s.product_category || '').toLowerCase().includes(need.toLowerCase()) ||
              need.toLowerCase().includes((s.product_category || '').toLowerCase())
            )
          ).slice(0, 3);

          return (
            <div key={b.id}
              onClick={() => setSelected(isSelected ? null : b)}
              style={{ background: 'var(--bg-card)',
                border: '1px solid ' + (isSelected ? 'var(--border-bright)' : 'var(--border)'),
                borderRadius: 6, padding: 16, cursor: 'pointer',
                borderLeft: '3px solid ' + (STATUS_COLOR[b.status] || '#4a5a70') }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {b.name}
                </div>
                <span style={{ fontSize: 10, color: STATUS_COLOR[b.status] || '#4a5a70',
                  background: (STATUS_COLOR[b.status] || '#4a5a70') + '18',
                  border: '1px solid ' + (STATUS_COLOR[b.status] || '#4a5a70') + '40',
                  padding: '2px 7px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>
                  {(b.status || 'PROSPECT').toUpperCase()}
                </span>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                {b.city ? `${b.city}, ` : ''}{b.country} · {b.category}
                {b.revenue_usd_m ? ` · $${b.revenue_usd_m}M` : ''}
              </div>

              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                {needs.slice(0, 4).map(i => (
                  <span key={i} style={{ fontSize: 10, color: '#e8b84b', background: 'rgba(232,184,75,0.1)',
                    border: '1px solid rgba(232,184,75,0.3)', padding: '2px 6px', borderRadius: 3,
                    fontFamily: 'var(--font-mono)' }}>{i}</span>
                ))}
                {needs.length > 4 && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>+{needs.length - 4} more</span>}
              </div>

              {isSelected && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {b.notes && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{b.notes}</p>}

                  {b.website && <a href={'https://' + b.website} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'block', fontSize: 11, color: '#4a9eda', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                    🌐 {b.website}
                  </a>}

                  {mfg.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>MANUFACTURES</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {mfg.map(m => <span key={m} style={{ fontSize: 10, color: '#4a9eda',
                          background: 'rgba(74,158,218,0.1)', border: '1px solid rgba(74,158,218,0.3)',
                          padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>{m}</span>)}
                      </div>
                    </div>
                  )}

                  {dist.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>DISTRIBUTES</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {dist.map(d => <span key={d} style={{ fontSize: 10, color: '#2ecc71',
                          background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)',
                          padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>{d}</span>)}
                      </div>
                    </div>
                  )}

                  {matchingSuppliers.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>MATCHING SUPPLIERS</div>
                      {matchingSuppliers.map(s => (
                        <div key={s.id} style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                          padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
                          {s.name} · {s.country}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
