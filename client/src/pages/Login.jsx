import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });
      const { token, user } = response.data;
      login(user, token);
      if (user.role === 'donor') 
        navigate('/donor/dashboard', { replace: true });
      else if (user.role === 'hospital') 
        navigate('/hospital/dashboard', { replace: true });
      else if (user.role === 'admin') 
        navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0D0D',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#1A1A1A',
        border: '1px solid #2a2a2a',
        borderRadius: '20px',
        padding: '3rem',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 0 40px rgba(230,57,70,0.1)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🩸</div>
          <h1 style={{ 
            color: '#E63946', fontSize: '1.8rem', 
            fontWeight: 800, margin: '0.5rem 0 0.25rem' 
          }}>
            BloodConnect
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Welcome back. Sign in to continue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(230,57,70,0.15)',
            border: '1px solid #E63946',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            color: '#E63946',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              color: '#aaa', fontSize: '0.85rem', 
              fontWeight: 600, display: 'block', 
              marginBottom: '0.5rem' 
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%',
                background: '#242424',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              color: '#aaa', fontSize: '0.85rem', 
              fontWeight: 600, display: 'block', 
              marginBottom: '0.5rem' 
            }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: '#242424',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  padding: '0.85rem 3rem 0.85rem 1rem',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '1rem',
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: '#666', cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading 
                ? '#666' : 'linear-gradient(135deg,#E63946,#C1121F)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Register link */}
        <p style={{ 
          textAlign: 'center', marginTop: '1.5rem',
          color: '#666', fontSize: '0.9rem' 
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ 
            color: '#E63946', fontWeight: 600,
            textDecoration: 'none' 
          }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
