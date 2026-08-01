import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ onClose }) {
  const navigate = useNavigate();
  const { login, register, playAsGuest } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      onClose();
      navigate('/hub');
    } catch (err) {
      setError(err.response?.data?.error || 'Connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box cyber-corner" style={{ position: 'relative' }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, fontFamily: 'var(--font-mono)' }}
        >✕</button>

        <div style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--accent-green)', letterSpacing: 4, marginBottom: 16 }}>
          [ OPERATIVE AUTHENTICATION ]
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {[['login', 'LOGIN'], ['register', 'REGISTER']].map(([t, l]) => (
            <button key={t} className={`modal-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setError(''); }}>
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="cyber-input-label">OPERATIVE NAME</label>
              <input className="cyber-input" name="name" value={form.name} onChange={handleChange} placeholder="Enter callsign" required autoFocus />
            </div>
          )}
          <div className="form-group">
            <label className="cyber-input-label">EMAIL</label>
            <input className="cyber-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="operative@command.mil" required autoFocus={tab === 'login'} />
          </div>
          <div className="form-group">
            <label className="cyber-input-label">ACCESS CODE</label>
            <input className="cyber-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}

          <button
            className={`cyber-btn w-full ${loading ? '' : ''}`}
            data-text={tab === 'login' ? 'ACCESS GRANTED' : 'DEPLOY OPERATIVE'}
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
          >
            {loading ? '[ AUTHENTICATING... ]' : tab === 'login' ? '⚡ ACCESS GRANTED' : '⚡ DEPLOY OPERATIVE'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(252,238,9,0.1)' }}>
          <button
            className="cyber-btn-outline"
            onClick={() => { playAsGuest(); onClose(); navigate('/hub'); }}
            style={{ fontSize: 12, padding: '7px 20px' }}
          >
            CONTINUE AS GUEST
          </button>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
            Scores will not be saved in guest mode
          </p>
        </div>
      </div>
    </div>
  );
}
