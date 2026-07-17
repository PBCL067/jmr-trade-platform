import React, { useState, useEffect } from 'react';
import { fetchTable, insertRow, updateRow, deleteRow } from './supabase';

const SPECIALITIES = [
  'All', 'Modified Starch E1422', 'Wheat Starch', 'Modified Wheat Starch',
  'Cassava Starch', 'Maize Starch', 'Glucose Syrup', 'Edible Oils',
  'Dairy / Milk Powder', 'Milk Powder FCMP', 'Gelatin', 'Soy Protein',
  'Wheat Flour', 'Corn Flour', 'General Ingredients', 'Lemon Concentrate',
];

const COUNTRIES = ['All', 'Argentina', 'Brazil', 'Uruguay', 'Chile', 'Paraguay',
  'Mexico', 'Colombia', 'Ecuador', 'Peru', 'South Africa', 'Germany', 'UK', 'Other'];

const STATUS_COLOR = {
  'Active':    '#2ecc71',
  'Warm':      '#e8b84b',
  'Qualified': '#3b82f6',
  'Cold':      '#4a5a70',
  'No Fit':    '#e74c3c',
};

const EMPTY_FORM = {
  name: '', title: '', company: '', country: '',
  email: '', phone: '', whatsapp: '',
  specialities: [],
  last_contacted: '', contact_method: '',
  status: 'Active', notes: '', supplier_id: '',
};

function Tag({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontFamily: 'var(--font-mono)',
      color: '#3b82f6', background: 'rgba(59,130,246,0.1)',
      border: '1px solid rgba(59,130,246,0.3)',
      padding: '2px 8px', borderRadius: 3 }}>
      {label}
      {onRemove && <span onClick={onRemove} style={{ cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 700, marginLeft: 2 }}>×</span>}
    </span>
  );
}

function ContactCard({ contact, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = STATUS_COLOR[contact.status] || '#4a5a70';
  const specs = typeof contact.specialities === 'string' ? JSON.parse(contact.specialities) : (contact.specialities || []);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 6, padding: 16, borderLeft: '3px solid ' + statusColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {contact.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            {contact.title} · {contact.company}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {contact.country}{contact.last_contacted ? ` · Last contact: ${contact.last_contacted}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: statusColor,
            background: statusColor + '18', border: '1px solid ' + statusColor + '40',
            padding: '2px 7px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>
            {(contact.status || '').toUpperCase()}
          </span>
          <button onClick={() => onEdit(contact)} style={{ background: 'none', border: '1px solid var(--border)',
            borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11,
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Edit</button>
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: '1px solid var(--border)',
            borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11,
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{expanded ? '▲' : '▼'}</button>
        </div>
      </div>

      {specs.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {specs.map(s => <Tag key={s} label={s} />)}
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            {contact.email    && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>📧 {contact.email}</div>}
            {contact.phone    && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>📞 {contact.phone}</div>}
            {contact.whatsapp && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>💬 {contact.whatsapp}</div>}
            {contact.contact_method && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>📋 {contact.contact_method}</div>}
          </div>
          {contact.notes && <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{contact.notes}</p>}
          {contact.next_action && (
            <div style={{ padding: '6px 10px', background: 'rgba(232,184,75,0.08)',
              border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4, marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#e8b84b', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>NEXT ACTION</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{contact.next_action}</div>
              {contact.next_action_date && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{contact.next_action_date}</div>}
            </div>
          )}
          {contact.contact_outcome && (
            <div style={{ padding: '6px 10px', background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#3b82f6', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>OUTCOME</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{contact.contact_outcome}</div>
            </div>
          )}
          <button onClick={() => onDelete(contact.id)}
            style={{ marginTop: 10, background: 'none', border: '1px solid rgba(231,76,60,0.3)',
              borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11,
              color: '#e74c3c', fontFamily: 'var(--font-mono)' }}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default function Contacts() {
  const [contacts,  setContacts]  = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter,  setStatusFilter]  = useState('All');
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [c, s] = await Promise.all([
        fetchTable('contacts', { order: 'updated_at', asc: false }),
        fetchTable('suppliers', { order: 'name', asc: true }),
      ]);
      setContacts(c);
      setSuppliers(s);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = contacts.filter(c => {
    const specs = typeof c.specialities === 'string' ? JSON.parse(c.specialities) : (c.specialities || []);
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !(c.company || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (specFilter !== 'All' && !specs.includes(specFilter)) return false;
    if (countryFilter !== 'All' && c.country !== countryFilter) return false;
    if (statusFilter  !== 'All' && c.status  !== statusFilter)  return false;
    return true;
  });

  function startEdit(contact) {
    const specs = typeof contact.specialities === 'string' ? JSON.parse(contact.specialities) : (contact.specialities || []);
    setForm({ ...EMPTY_FORM, ...contact, specialities: specs });
    setEditingId(contact.id);
    setShowForm(true);
  }

  function startNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form, specialities: JSON.stringify(form.specialities) };
      if (editingId) {
        await updateRow('contacts', editingId, payload);
      } else {
        await insertRow('contacts', payload);
      }
      await load();
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch(e) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await deleteRow('contacts', id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch(e) {
      alert('Delete failed: ' + e.message);
    }
  }

  const selStyle = (val, cur) => ({
    background: val === cur ? 'var(--bg-hover)' : 'none',
    border: '1px solid ' + (val === cur ? 'var(--border-bright)' : 'var(--border)'),
    borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
    color: val === cur ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'nowrap',
  });

  const inputStyle = {
    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 4, padding: '6px 10px', color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)', fontSize: 12, boxSizing: 'border-box',
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading contacts...</div>;
  if (error)   return <div style={{ padding: 40, color: '#e74c3c', fontFamily: 'var(--font-mono)' }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts..."
            style={{ ...inputStyle, flex: 1, minWidth: 180, width: 'auto' }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
            <option value="All">Status: All</option>
            {['Active', 'Warm', 'Qualified', 'Cold', 'No Fit'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} style={inputStyle}>
            <option value="All">Country: All</option>
            {COUNTRIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={startNew}
          style={{ marginLeft: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 4, padding: '7px 16px', cursor: 'pointer', fontSize: 12,
            color: '#3b82f6', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          + New Contact
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: 220 }}>
          {SPECIALITIES.map(s => <option key={s} value={s}>{s === 'All' ? 'Speciality: All' : s}</option>)}
        </select>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
          borderRadius: 6, padding: 20, marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
            color: 'var(--text-primary)', marginBottom: 16 }}>
            {editingId ? 'Edit Contact' : 'New Contact'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['name','Name *'],['title','Title'],['country','Country'],
              ['email','Email'],['phone','Phone'],['whatsapp','WhatsApp'],['contact_method','Contact Method'],
              ['last_contacted','Last Contacted (YYYY-MM-DD)'],['next_action_date','Next Action Date']].map(([k, label]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{label}</div>
                <input value={form[k] || ''} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={inputStyle} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>Status</div>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} style={inputStyle}>
                {['Active','Warm','Qualified','Cold','No Fit'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>Supplier</div>
              <select value={form.supplier_id || ''} onChange={e => {
                const sup = suppliers.find(s => s.id === e.target.value);
                setForm(f => ({...f, supplier_id: e.target.value, company: sup ? sup.name : f.company }));
              }} style={inputStyle}>
                <option value="">— None —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>Notes</div>
            <textarea value={form.notes || ''} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>Next Action</div>
            <textarea value={form.next_action || ''} onChange={e => setForm(f => ({...f, next_action: e.target.value}))}
              rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Specialities</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
              {form.specialities.map(s => <Tag key={s} label={s} onRemove={() => setForm(f => ({...f, specialities: f.specialities.filter(x => x !== s)}))} />)}
            </div>
            <select onChange={e => { const v = e.target.value; if (v && !form.specialities.includes(v)) setForm(f => ({...f, specialities: [...f.specialities, v]})); e.target.value=''; }} style={inputStyle}>
              <option value="">+ Add speciality</option>
              {SPECIALITIES.filter(s => s !== 'All' && !form.specialities.includes(s)).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)',
                borderRadius: 4, padding: '7px 20px', cursor: 'pointer', fontSize: 12,
                color: '#2ecc71', fontFamily: 'var(--font-mono)' }}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditingId(null); }}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4,
                padding: '7px 20px', cursor: 'pointer', fontSize: 12,
                color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
        {filtered.length} contacts
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
        {filtered.map(c => (
          <ContactCard key={c.id} contact={c} onEdit={startEdit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
