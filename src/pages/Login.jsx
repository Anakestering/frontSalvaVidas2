import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { erro } from '../utils/feedback'
import logo from '../assets/Logo1.png'
import { Eye, EyeOff } from "lucide-react";

export function Login() {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
          <img src={logo} alt="Brasão" style={{ width: 130, height: 130, margin: '0 auto 5px', display: 'block' }} />
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 38, letterSpacing: 6, color: '#F5F0E8' }}>
            GUARDAVIDAS
          </h1>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 6 }}>
            Sistema Operacional
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <p className="section-label" style={{ marginBottom: 20 }}>
            Identificação
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div >
              <label style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} autoComplete="email" />
            </div>
            <div >
              <label style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 6 }}>
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <input
                  name="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{
                    paddingRight: "40px",
                    width: "100%",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {mostrarSenha ? (
                    <EyeOff size={18} color="#aaa" />
                  ) : (
                    <Eye size={18} color="#aaa" />
                  )}
                </button>
              </div>
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