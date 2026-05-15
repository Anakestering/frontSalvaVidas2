import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirmar } from '../utils/feedback'

const BASE_URL = 'http://localhost:8080'

function getToken() { return localStorage.getItem('token') }
function authHeaders() { return { Authorization: `Bearer ${getToken()}` } }
function authJsonHeaders() { return { ...authHeaders(), 'Content-Type': 'application/json' } }

// ── MÁSCARAS ──────────────────────────────────────────────────────────────────
function mascaraCpf(valor) {
  return valor.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14)
}

function mascaraTelefone(valor) {
  return valor.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

function formatarCpf(cpf) {
  const s = (cpf || '').replace(/\D/g, '')
  return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// ── API ───────────────────────────────────────────────────────────────────────
async function getUsuarios() {
  const res = await fetch(`${BASE_URL}/usuarios`, { headers: authHeaders() })
  if (!res.ok) throw new Error()
  return res.json()
}
async function criarUsuario(dados) {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    method: 'POST', headers: authJsonHeaders(), body: JSON.stringify(dados),
  })
  if (!res.ok) throw new Error()
  return res.json()
}
async function editarUsuario(id, dados) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'PUT', headers: authJsonHeaders(), body: JSON.stringify(dados),
  })
  if (!res.ok) throw new Error()
  return res.json()
}
async function deletarUsuario(id) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) throw new Error()
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export function AdminUsuarios() {
  const [usuarios, setUsuarios]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [busca, setBusca]           = useState('')
  const [modalCriar, setModalCriar] = useState(false)
  const [popup, setPopup]           = useState(null)   // usuário aberto no popup
  const [editando, setEditando]     = useState(false)  // toggle view/edit
  const [form, setForm]             = useState({ nome: '', cpf: '', email: '', telefone: '', nivelAcesso: 'PADRAO' })
  const navigate = useNavigate()

  async function carregar() {
    try {
      const data = await getUsuarios()
      setUsuarios(data)
    } catch { console.error('Erro ao carregar') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  // abre popup no modo visualização
  function abrirPopup(u) {
    setPopup(u)
    setEditando(false)
    setForm({
      nome:        u.nome        || '',
      cpf:         mascaraCpf(u.cpf || ''),
      email:       u.email       || '',
      telefone:    mascaraTelefone(u.telefone || ''),
      nivelAcesso: u.nivelAcesso || 'PADRAO',
    })
  }

  function fecharPopup() { setPopup(null); setEditando(false) }

  function abrirCriar() {
    setForm({ nome: '', cpf: '', email: '', telefone: '', nivelAcesso: 'PADRAO' })
    setModalCriar(true)
  }

  async function salvarCriar() {
    if (!form.nome.trim() || form.cpf.replace(/\D/g, '').length < 11) return
    const ok = await confirmar({
      titulo: 'Cadastrar usuário?',
      texto: 'A senha inicial será os 6 primeiros dígitos do CPF.',
      confirmText: 'Confirmar', cancelText: 'Cancelar',
    })
    if (!ok) return
    try {
      await criarUsuario({ ...form, cpf: form.cpf.replace(/\D/g, '') })
      setModalCriar(false)
      carregar()
    } catch { console.error('Erro ao criar') }
  }

  async function salvarEdicao() {
    if (!form.nome.trim()) return
    const ok = await confirmar({
      titulo: 'Salvar alterações?',
      texto: `As informações de ${form.nome} serão atualizadas.`,
      confirmText: 'Confirmar', cancelText: 'Cancelar',
    })
    if (!ok) return
    try {
      await editarUsuario(popup.id, { ...form, cpf: form.cpf.replace(/\D/g, '') })
      fecharPopup()
      carregar()
    } catch { console.error('Erro ao editar') }
  }

  async function handleDeletar() {
    const ok = await confirmar({
      titulo: `Deletar "${popup.nome}"?`,
      texto: 'Essa ação não pode ser desfeita.',
      confirmText: 'Deletar', cancelText: 'Cancelar',
    })
    if (!ok) return
    try {
      await deletarUsuario(popup.id)
      fecharPopup()
      carregar()
    } catch { console.error('Erro ao deletar') }
  }

const filtrados = usuarios.filter(u => {
  const cpfLimpo = u.cpf?.replace(/\D/g, '') || ''
  const buscaDigitos = busca.replace(/\D/g, '')
  return (
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    (buscaDigitos.length > 0 && cpfLimpo.includes(buscaDigitos))
  )
})
  

  return (
    <div className="ocean-bg scanlines min-h-screen">
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 32 }}>

        {/* HEADER */}
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => navigate('/postos')}
            style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.4)', cursor: 'pointer', padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Usuários</h1>
            <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0 }}>Gerenciamento de acesso</p>
          </div>
          <button className="btn-primary" onClick={abrirCriar}
            style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}>
            + Novo
          </button>
        </div>

        {/* BUSCA */}
<div style={{ padding: '16px 16px 8px' }}>
  <div style={{ position: 'relative' }}>
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="rgba(180,210,255,0.45)" strokeWidth="2"
      style={{
        position: 'absolute', left: 12, top: '50%',
        transform: 'translateY(-50%)', pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
    <input
      placeholder="Buscar por nome ou CPF..."
      value={busca}
      onChange={e => setBusca(e.target.value)}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        paddingLeft: 36,
        paddingRight: 12,
        paddingTop: 9,
        paddingBottom: 9,
        fontSize: 13,
        background: 'rgba(20, 50, 90, 0.55)',
        border: '1.5px solid rgba(0,0,0,0.7)',
        borderRadius: 8,
        color: 'rgba(220, 235, 255, 0.9)',
        outline: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
      }}
      onFocus={e => {
        e.target.style.background = 'rgba(30, 70, 130, 0.7)'
        e.target.style.borderColor = 'rgba(0,0,0,0.9)'
        e.target.style.boxShadow = '0 4px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
      }}
      onBlur={e => {
        e.target.style.background = 'rgba(20, 50, 90, 0.55)'
        e.target.style.borderColor = 'rgba(0,0,0,0.7)'
        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)'
      }}
      onMouseEnter={e => {
        if (document.activeElement !== e.target) {
          e.target.style.background = 'rgba(25, 60, 110, 0.65)'
          e.target.style.borderColor = 'rgba(0,0,0,0.8)'
        }
      }}
      onMouseLeave={e => {
        if (document.activeElement !== e.target) {
          e.target.style.background = 'rgba(20, 50, 90, 0.55)'
          e.target.style.borderColor = 'rgba(0,0,0,0.7)'
        }
      }}
    />
  </div>
</div>

        {/* LISTA — só nome e CPF */}
        <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'rgba(245,240,232,0.3)', padding: 40 }}>Carregando...</p>
          ) : filtrados.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(245,240,232,0.3)', padding: 40 }}>Nenhum usuário encontrado</p>
          ) : filtrados.map(u => (
            <div key={u.id} className="card" onClick={() => abrirPopup(u)}
              style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>

              {/* avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: u.nivelAcesso === 'ADMIN' ? 'rgba(232,56,26,0.12)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${u.nivelAcesso === 'ADMIN' ? 'rgba(232,56,26,0.25)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 600,
                color: u.nivelAcesso === 'ADMIN' ? 'rgba(232,56,26,0.8)' : 'rgba(245,240,232,0.5)',
              }}>
                {u.nome?.charAt(0).toUpperCase() || '?'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{u.nome}</p>
                <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0, marginTop: 2 }}>
                  {formatarCpf(u.cpf)}
                </p>
              </div>

              {u.nivelAcesso === 'ADMIN' && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 5, letterSpacing: 0.5,
                  background: 'rgba(232,56,26,0.12)', border: '1px solid rgba(232,56,26,0.3)',
                  color: 'rgba(232,56,26,0.85)',
                }}>ADMIN</span>
              )}

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="rgba(245,240,232,0.2)" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* ── POPUP DETALHES / EDIÇÃO ───────────────────────────────────────── */}
      {popup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 360, padding: 24 }}>

            {/* topo do popup */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>{popup.nome}</h3>
                <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0, marginTop: 2 }}>
                  {popup.nivelAcesso === 'ADMIN' ? 'Administrador' : 'Usuário padrão'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {/* deletar */}
                <IconBtn danger title="Deletar" onClick={handleDeletar}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                </IconBtn>

                {/* editar ↔ salvar */}
                {!editando ? (
                  <IconBtn title="Editar" onClick={() => setEditando(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </IconBtn>
                ) : (
                  <IconBtn save title="Salvar alterações" onClick={salvarEdicao}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                  </IconBtn>
                )}

                {/* fechar */}
                <button onClick={fecharPopup} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
                  color: 'rgba(245,240,232,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* campos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <Campo label="Nome completo">
                {editando
                  ? <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} autoFocus />
                  : <ValorTexto>{popup.nome}</ValorTexto>
                }
              </Campo>

              <Campo label="CPF">
                {editando
                  ? <input value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: mascaraCpf(e.target.value) }))} />
                  : <ValorTexto>{formatarCpf(popup.cpf)}</ValorTexto>
                }
              </Campo>

              <Campo label="Email">
                {editando
                  ? <input placeholder="email@exemplo.com" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  : <ValorTexto dim={!popup.email}>{popup.email || '—'}</ValorTexto>
                }
              </Campo>

              <Campo label="Telefone">
                {editando
                  ? <input placeholder="(00) 00000-0000" value={form.telefone}
                      onChange={e => setForm(p => ({ ...p, telefone: mascaraTelefone(e.target.value) }))} />
                  : <ValorTexto dim={!popup.telefone}>
                      {popup.telefone ? mascaraTelefone(popup.telefone) : '—'}
                    </ValorTexto>
                }
              </Campo>

              <Campo label="Nível de acesso">
                {editando
                  ? (
                    <select value={form.nivelAcesso} onChange={e => setForm(p => ({ ...p, nivelAcesso: e.target.value }))}>
                      <option value="PADRAO">Usuário</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  )
                  : <ValorTexto>{popup.nivelAcesso === 'ADMIN' ? 'Administrador' : 'Usuário padrão'}</ValorTexto>
                }
              </Campo>

            </div>

            {editando && (
              <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)', marginTop: 14, textAlign: 'center' }}>
                Clique no ícone de salvar para confirmar
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL CRIAR ──────────────────────────────────────────────────── */}
      {modalCriar && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 360, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Novo Usuário</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Campo label="Nome completo *">
                <input placeholder="Ex: João da Silva" value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} autoFocus />
              </Campo>
              <Campo label="CPF *">
                <input placeholder="000.000.000-00" value={form.cpf}
                  onChange={e => setForm(p => ({ ...p, cpf: mascaraCpf(e.target.value) }))} />
                <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)', marginTop: 4 }}>
                  A senha inicial será os 6 primeiros dígitos do CPF
                </p>
              </Campo>
              <Campo label="Email">
                <input placeholder="email@exemplo.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </Campo>
              <Campo label="Telefone">
                <input placeholder="(00) 00000-0000" value={form.telefone}
                  onChange={e => setForm(p => ({ ...p, telefone: mascaraTelefone(e.target.value) }))} />
              </Campo>
              <Campo label="Nível de acesso">
                <select value={form.nivelAcesso} onChange={e => setForm(p => ({ ...p, nivelAcesso: e.target.value }))}>
                  <option value="PADRAO">Usuário</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </Campo>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => setModalCriar(false)}>Cancelar</button>
              <button className="btn-primary" onClick={salvarCriar}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SUBCOMPONENTES ────────────────────────────────────────────────────────────

function Campo({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function ValorTexto({ children, dim }) {
  return (
    <p style={{
      margin: 0, fontSize: 14, padding: '6px 0',
      color: dim ? 'rgba(245,240,232,0.25)' : 'rgba(245,240,232,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      {children}
    </p>
  )
}

function IconBtn({ onClick, children, title, danger, save }) {
  const bg  = danger ? 'rgba(232,56,26,0.2)'   : save ? 'rgba(34,197,94,0.15)'  : 'rgba(255,255,255,0.08)'
  const bor = danger ? 'rgba(232,56,26,0.3)'   : save ? 'rgba(34,197,94,0.3)'   : 'rgba(255,255,255,0.1)'
  const col = danger ? '#ff5733'               : save ? '#4ade80'               : 'rgba(245,240,232,0.5)'
  return (
    <button onClick={onClick} title={title} style={{
      width: 28, height: 28, borderRadius: 6,
      background: bg, border: `1px solid ${bor}`,
      color: col, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </button>
  )
}

const labelStyle = {
  fontSize: 12, color: 'rgba(245,240,232,0.45)',
  display: 'block', marginBottom: 6,
}