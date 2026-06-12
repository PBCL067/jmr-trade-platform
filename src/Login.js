import React, { useState } from 'react';
import { signIn } from './supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // onAuthChange in App.js will pick up the new session automatically
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0d1f3c'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 8, padding: 40, width: 340,
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22,
          color: '#0d1f3c', marginBottom: 4
        }}>
          JMR <span style={{ color: '#c8993a' }}>Intelligence</span>
        </div>
        <div style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>
          Partner access only
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 11, letterSpacing: '0.1em',
            color: '#718096', textTransform: 'uppercase', marginBottom: 6,
            fontFamily: 'IBM Plex Mono, monospace'
          }}>Email</label>
          <input
            type="email" value={email} required
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
              borderRadius: 6, fontSize: 15, background: '#f7f8fa', outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block', fontSize: 11, letterSpacing: '0.1em',
            color: '#718096', textTransform: 'uppercase', marginBottom: 6,
            fontFamily: 'IBM Plex Mono, monospace'
          }}>Password</label>
          <input
            type="password" value={password} required
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
              borderRadius: 6, fontSize: 15, background: '#f7f8fa', outline: 'none'
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#e74c3c', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          width: '100%', background: '#c8993a', color: '#fff', border: 'none',
          borderRadius: 6, padding: 14, fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 13, letterSpacing: '0.08em', fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>
    </div>
  );
}
