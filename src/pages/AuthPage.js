import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Zap, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPage.css';

export default function AuthPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | signup
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', displayName: '', username: '' });

  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (!form.username.trim()) { toast.error('Username required'); setLoading(false); return; }
        await signup(form.email, form.password, form.displayName, form.username);
        toast.success('Account created! Welcome to Meetly!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.message?.replace('Firebase: ', '').replace(/\(auth.*\)/, '') || 'An error occurred');
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
      toast.success('Welcome!');
    } catch (err) {
      toast.error('Google sign-in failed');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb1" />
        <div className="auth-bg-orb orb2" />
        <div className="auth-bg-orb orb3" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={24} /></div>
          <span className="auth-logo-text">Meetly</span>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>
            <LogIn size={16} /> Sign In
          </button>
          <button className={`auth-tab${mode === 'signup' ? ' active' : ''}`} onClick={() => setMode('signup')}>
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input className="input-field" name="displayName" placeholder="John Doe" value={form.displayName} onChange={onChange} required />
              </div>
              <div className="form-group">
                <label>Username</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">@</span>
                  <input className="input-field input-with-prefix" name="username" placeholder="johndoe" value={form.username} onChange={onChange} required />
                </div>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input className="input-field" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrap">
              <input
                className="input-field"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                value={form.password}
                onChange={onChange}
                required
                minLength={6}
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>

        <button className="btn btn-secondary btn-lg w-full google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button className="link-accent" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
