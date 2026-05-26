import React, { useState, useEffect } from 'react';
import { fetchCollection, addDocument, updateDocument, deleteDocument } from './firebase';

const SPECIALITIES = [
  'All',
  'Modified Starch E1422',
  'Wheat Starch',
  'Modified Wheat Starch',
  'Cassava Starch',
  'Maize Starch',
  'Glucose Syrup',
  'Edible Oils',
  'Dairy / Milk Powder',
  'Gelatin',
  'Soy Protein',
  'Wheat Flour',
  'Corn Flour',
  'General Ingredients',
];

const COUNTRIES = ['All', 'Argentina', 'Brazil', 'Uruguay', 'Chile', 'Paraguay', 'Mexico',
  'Colombia', 'Ecuador', 'Peru', 'South Africa', 'Germany', 'UK', 'Other'];

const STATUS_COLOR = {
  'Active':    '#2ecc71',
  'Warm':      '#e8b84b',
  'Cold':      '#4a5a70',
  'No Fit':    '#e74c3c',
};

const EMPTY_FORM = {
  name: '', title: '', company: '', country: '',
  email: '', phone: '', whatsapp: '',
  specialities: [],
  last_contacted: '', contact_method: '',
  status: 'Active',
  notes: '',
};

// Seed contacts from today's outreach
const SEED_CONTACTS = [
  {
    name: 'Fausto Nibale',
    title: 'Commercial Manager',
    company: 'F&F Ingredients S.A.',
    country: 'Argentina',
    email: 'info@ffingredients.com.ar',
    phone: '+54 3329 439720',
    whatsapp: '+54 3329 439720',
    specialities: ['Wheat Starch', 'Modified Wheat Starch', 'Cassava Starch'],
    last_contacted: '2026-05-26',
    contact_method: 'Online contact form',
    status: 'Warm',
    notes: 'Responded same day. F&F distributes cassava E1422 (Brazil origin, non-GMO) and is strong in wheat starch / modified wheat starch via Semino. Not a fit for corn E1422 inquiry.',
  },
  {
    name: 'Santiago Cieza',
    title: 'Sales Representative',
    company: 'Tate & Lyle / Gemacom Tech',
    country: 'Argentina',
    email: 'Via Tate & Lyle contact form',
    phone: '',
    whatsapp: '',
    specialities: ['Modified Starch E1422', 'General Ingredients'],
    last_contacted: '2026-05-26',
    contact_method: 'Tate & Lyle contact form',
    status: 'Active',
    notes: 'Contacted via Tate & Lyle BA office contact form. Awaiting response re corn E1422 waxy for SA market.',
  },
];

function Tag({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontFamily: 'var(--font-mono)',
      color: '#3b82f6', background: 'rgba(59,130,246,0.1)',
      border: '1px solid rgba(59,130,246,0.3)',
      padding: '2px 8px', borderRadius: 3 }}>
      {label}
      {onRemove && (
        <span onClick={onRemove} style={{ cursor: 'pointer', color: 'var(--text-muted)',
          fontWeight: 700, marginLeft: 2 }}>×</span>
      )}
    </span>
  );
}

function ContactCard({ contact, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = STATUS_COLOR[contact.status] || '#4a5a70';

  return (
    <div className="card" style={{ borderLeft: '3px solid ' + statusColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div className="card-title" style={{ margin: 0 }}>{contact.name}</div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: statusColor,
              background: statusColor + '18', border: '1px solid ' + statusColor + '40',
              padding: '2px 7px', borderRadius: 3 }}>{(contact.status || 'Active').toUpperCase()}</span>
          </div>
          <div className="card-sub">{contact.title} &nbsp;·&nbsp; {contact.company} &nbsp;·&nbsp; {contact.country}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(contact)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4,
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10,
              padding: '3px 8px', cursor: 'pointer' }}>edit</button>
          <button onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4,
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10,
              padding: '3px 8px', cursor: 'pointer' }}>{expanded ? 'less' : 'more'}</button>
        </div>
      </div>

      {/* Specialities */}
      {contact.specialities && contact.specialities.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {contact.specialities.map(sp => <Tag key={sp} label={sp} />)}
        </div>
      )}

      {/* Contact details */}
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
        {contact.email && (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Email</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{contact.email}</span>
          </>
        )}
        {contact.phone && (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Phone</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{contact.phone}</span>
          </>
        )}
        {contact.whatsapp && contact.whatsapp !== contact.phone && (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>WhatsApp</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#2ecc71' }}>{contact.whatsapp}</span>
          </>
        )}
        {contact.last_contacted && (
          <>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last Contact</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              {contact.last_contacted} {contact.contact_method ? '· ' + contact.contact_method : ''}
            </span>
          </>
        )}
      </div>

      {/* Expanded notes */}
      {expanded && contact.notes && (
        <div style={{ marginTop: 10, padding: '8px 12px',
          background: 'var(--bg-hover)', border: '1px solid var(--border)',
          borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {contact.notes}
        </div>
      )}
    </div>
  );
}

function ContactForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSpeciality = (sp) => {
    if (sp && !form.specialities.includes(sp)) {
      set('specialities', [...form.specialities, sp]);
    }
  };
  const removeSpeciality = (sp) => set('specialities', form.specialities.filter(s => s !== sp));

  const handleSave = async () => {
    if (!form.name || !form.company) return alert('Name and company are required.');
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg-hover)', border: '1px solid var(--border)',
    borderRadius: 4, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
    fontSize: 12, padding: '6px 10px', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3, display: 'block',
  };

  return (
    <div className="card" style={{ borderColor: 'var(--blue)', marginBottom: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
        {initial?.id ? 'Edit Contact' : 'Add New Contact'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <span style={labelStyle}>Name *</span>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <span style={labelStyle}>Title</span>
          <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Job title" />
        </div>
        <div>
          <span style={labelStyle}>Company *</span>
          <input style={inputStyle} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company name" />
        </div>
        <div>
          <span style={labelStyle}>Country</span>
          <select style={inputStyle} value={form.country} onChange={e => set('country', e.target.value)}>
            <option value="">— Select —</option>
            {COUNTRIES.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Email</span>
          <input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@company.com" />
        </div>
        <div>
          <span style={labelStyle}>Phone</span>
          <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+54 11 1234 5678" />
        </div>
        <div>
          <span style={labelStyle}>WhatsApp</span>
          <input style={inputStyle} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+54 11 1234 5678" />
        </div>
        <div>
          <span style={labelStyle}>Status</span>
          <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
            {Object.keys(STATUS_COLOR).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Last Contacted</span>
          <input style={inputStyle} type="date" value={form.last_contacted} onChange={e => set('last_contacted', e.target.value)} />
        </div>
        <div>
          <span style={labelStyle}>Contact Method</span>
          <input style={inputStyle} value={form.contact_method} onChange={e => set('contact_method', e.target.value)} placeholder="Email / WhatsApp / Call" />
        </div>
      </div>

      {/* Specialities */}
      <div style={{ marginBottom: 12 }}>
        <span style={labelStyle}>Specialities</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          {form.specialities.map(sp => (
            <Tag key={sp} label={sp} onRemove={() => removeSpeciality(sp)} />
          ))}
        </div>
        <select style={{ ...inputStyle, width: 'auto' }}
          onChange={e => { addSpeciality(e.target.value); e.target.value = ''; }}>
          <option value="">+ Add speciality</option>
          {SPECIALITIES.slice(1).filter(s => !form.specialities.includes(s)).map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 16 }}>
        <span style={labelStyle}>Notes</span>
        <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Key notes, context, follow-up items..." />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} disabled={saving}
          style={{ background: '#3b82f6', border: 'none', borderRadius: 4,
            color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
            padding: '8px 20px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Contact'}
        </button>
        <button onClick={onCancel}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4,
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12,
            padding: '8px 16px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Contacts() {
  const [contacts, setContacts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [search, setSearch]           = useState('');
  const [filterCountry, setFilterCountry]       = useState('All');
  const [filterSpeciality, setFilterSpeciality] = useState('All');
  const [filterStatus, setFilterStatus]         = useState('All');
  const [seeded, setSeeded]           = useState(false);

  useEffect(() => { loadContacts(); }, []);

  async function loadContacts() {
    setLoading(true);
    try {
      const data = await fetchCollection('contacts');
      if (data.length === 0 && !seeded) {
        // Seed initial contacts
        for (const c of SEED_CONTACTS) {
          await addDocument('contacts', c);
        }
        setSeeded(true);
        const fresh = await fetchCollection('contacts');
        setContacts(fresh);
      } else {
        setContacts(data);
      }
    } catch (e) {
      console.error('Failed to load contacts:', e);
    }
    setLoading(false);
  }

  async function handleSave(form) {
    if (editContact?.id) {
      await updateDocument('contacts', editContact.id, form);
    } else {
      await addDocument('contacts', form);
    }
    setShowForm(false);
    setEditContact(null);
    await loadContacts();
  }

  function handleEdit(contact) {
    setEditContact(contact);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filtered = contacts.filter(c => {
    if (filterCountry !== 'All' && c.country !== filterCountry) return false;
    if (filterStatus !== 'All' && (c.status || 'Active') !== filterStatus) return false;
    if (filterSpeciality !== 'All') {
      if (!c.specialities || !c.specialities.includes(filterSpeciality)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const hay = ((c.name||'') + ' ' + (c.company||'') + ' ' + (c.title||'') + ' ' +
        (c.notes||'') + ' ' + (c.specialities||[]).join(' ')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    const order = { Active: 0, Warm: 1, Cold: 2, 'No Fit': 3 };
    return (order[a.status]||1) - (order[b.status]||1);
  });

  // Status summary counts
  const statusCounts = Object.keys(STATUS_COLOR).reduce((acc, st) => {
    acc[st] = contacts.filter(c => (c.status || 'Active') === st).length;
    return acc;
  }, {});

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '6px 10px', cursor: 'pointer',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <div>
      {/* Status summary bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Object.entries(STATUS_COLOR).map(([st, color]) => {
          const isActive = filterStatus === st;
          return (
            <div key={st} onClick={() => setFilterStatus(filterStatus === st ? 'All' : st)}
              className="card" style={{ padding: '8px 14px', cursor: 'pointer',
                flex: '1 1 auto', textAlign: 'center',
                borderColor: isActive ? color : color + '30',
                background: isActive ? color + '12' : undefined }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 22, color }}>{statusCounts[st] || 0}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)', marginTop: 2 }}>{st.toUpperCase()}</div>
            </div>
          );
        })}
        <div className="card" style={{ padding: '8px 14px', textAlign: 'center', flex: '1 1 auto' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 22, color: 'var(--text-primary)' }}>{contacts.length}</div>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)', marginTop: 2 }}>TOTAL</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <ContactForm
          initial={editContact}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditContact(null); }}
        />
      )}

      {/* Filters + Add button */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 160 }}>
          <span style={labelStyle}>Search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Name, company, product..."
            style={{ ...selectStyle, width: '100%' }} />
        </div>
        <div>
          <span style={labelStyle}>Country</span>
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={selectStyle}>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Speciality</span>
          <select value={filterSpeciality} onChange={e => setFilterSpeciality(e.target.value)} style={selectStyle}>
            {SPECIALITIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Status</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
            <option>All</option>
            {Object.keys(STATUS_COLOR).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {!showForm && (
          <button onClick={() => { setEditContact(null); setShowForm(true); }}
            style={{ background: '#3b82f6', border: 'none', borderRadius: 4,
              color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
              padding: '8px 16px', cursor: 'pointer', alignSelf: 'flex-end' }}>
            + Add Contact
          </button>
        )}
      </div>

      <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {filtered.length} of {contacts.length} contacts
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading contacts...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', fontSize: 12 }}>No contacts match your filters</div>
      ) : (
        <div className="card-grid card-grid--2">
          {filtered.map(c => <ContactCard key={c.id} contact={c} onEdit={handleEdit} />)}
        </div>
      )}
    </div>
  );
}
