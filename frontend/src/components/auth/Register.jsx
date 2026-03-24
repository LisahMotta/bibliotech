import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';

const EyeIcon = ({ open }) => (
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'librarian',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await authService.register(userData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db',
    borderRadius: '0.5rem', fontSize: '0.875rem', color: '#111827',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.875rem', fontWeight: '600',
    color: '#374151', marginBottom: '0.25rem',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
      }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
          Cadastrar usuário
        </h2>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>
            Entrar
          </Link>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="name" style={labelStyle}>Nome completo</label>
            <input
              id="name" name="name" type="text" required
              placeholder="Nome completo"
              value={formData.name} onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email" name="email" type="email" required
              placeholder="email@exemplo.com"
              value={formData.email} onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="role" style={labelStyle}>Perfil</label>
            <select
              id="role" name="role"
              value={formData.role} onChange={handleChange}
              style={inputStyle}
            >
              <option value="librarian">Bibliotecário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" name="password"
                type={showPassword ? 'text' : 'password'} required
                placeholder="Mínimo 6 caracteres"
                value={formData.password} onChange={handleChange}
                style={{ ...inputStyle, paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0', display: 'flex', alignItems: 'center' }}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>Confirmar senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword" name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'} required
                placeholder="Repita a senha"
                value={formData.confirmPassword} onChange={handleChange}
                style={{ ...inputStyle, paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0', display: 'flex', alignItems: 'center' }}>
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.625rem', background: '#4f46e5',
              color: 'white', border: 'none', borderRadius: '0.5rem',
              fontSize: '0.875rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, marginTop: '0.25rem',
            }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
