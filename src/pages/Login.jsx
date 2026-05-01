import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { erro } from '../utils/feedback'

export function Login() {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.senha) return erro('Preencha todos os campos')
    setLoading(true)
    try {
      const data = await login(form.email, form.senha)
      localStorage.setItem('token', data.token)
      localStorage.setItem('tipo', data.tipo?.toLowerCase())
      navigate('/postos')
    } catch {
      erro('Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ocean-bg scanlines min-h-screen flex items-center justify-center px-4">
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(232,56,26,0.12)',
            border: '2px solid rgba(232,56,26,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8381A" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, letterSpacing: 6, color: '#F5F0E8' }}>
            SALVAVIDAS
          </h1>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 6 }}>
            Sistema Operacional
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <p className="section-label" style={{ marginBottom: 20 }}>Identificação</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 6 }}>Email</label>
              <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} autoComplete="email" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 6 }}>Senha</label>
              <input name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handleChange} autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(245,240,232,0.18)', marginTop: 28, letterSpacing: 2, textTransform: 'uppercase' }}>
          Corpo de Bombeiros — Acesso Restrito
        </p>
      </div>
    </div>
  )
}