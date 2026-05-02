import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCheckinsHoje, getCheckoutsHoje } from '../services/api'
import { confirmar } from '../utils/feedback'
import logo from '../assets/Logo1.png'

const BASE_URL = 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  return { 'Authorization': `Bearer ${getToken()}` }
}

function authJsonHeaders() {
  return { ...authHeaders(), 'Content-Type': 'application/json' }
}

async function getPostosOrdenados() {
  const res = await fetch(`${BASE_URL}/postos/ordenados`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar postos')
  return res.json()
}

async function criarPosto(dados) {
  const res = await fetch(`${BASE_URL}/postos`, {
    method: 'POST', headers: authJsonHeaders(), body: JSON.stringify(dados),
  })
  if (!res.ok) throw new Error('Erro ao criar posto')
  return res.json()
}

async function editarPosto(id, dados) {
  const res = await fetch(`${BASE_URL}/postos/${id}`, {
    method: 'PUT', headers: authJsonHeaders(), body: JSON.stringify(dados),
  })
  if (!res.ok) throw new Error('Erro ao editar posto')
  return res.json()
}

async function deletarPosto(id) {
  const res = await fetch(`${BASE_URL}/postos/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro ao deletar posto')
}

async function alternarAtivo(id) {
  const res = await fetch(`${BASE_URL}/postos/${id}/ativo`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro ao alterar status')
  return res.json()
}

export function Postos() {
  const [postos, setPostos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ nome: '', descricao: '' })
  const [status, setStatus] = useState({})
  const navigate = useNavigate()
  const tipo = localStorage.getItem('tipo')
  const isAdmin = tipo === 'admin'

  async function carregar() {
    try {
      const data = await getPostosOrdenados()
      setPostos(data)
      carregarStatus(data)
    } catch {
      console.error('Erro ao carregar postos')
    } finally {
      setLoading(false)
    }
  }

  async function carregarStatus(lista) {
    const ativos = lista.filter(p => p.ativo)
    const resultados = await Promise.allSettled(
      ativos.map(async (p) => {
        const [checkins, checkouts] = await Promise.all([
          getCheckinsHoje(p.id),
          getCheckoutsHoje(p.id),
        ])
        return {
          id: p.id,
          checkins: checkins?.length || 0,
          checkouts: checkouts?.length || 0,
        }
      })
    )
    const map = {}
    resultados.forEach(r => {
      if (r.status === 'fulfilled') {
        map[r.value.id] = r.value
      }
    })
    setStatus(map)
  }

  useEffect(() => { carregar() }, [])

  function getStatusPosto(posto) {
    const s = status[posto.id]
    if (!s) return null
    if (s.checkouts > 0) return 'finalizado'
    if (s.checkins > 0) return 'andamento'
    return 'aguardando'
  }

  function abrirCriar() {
    setForm({ nome: '', descricao: '' })
    setModal({ modo: 'criar' })
  }

  function abrirEditar(posto, e) {
    e.stopPropagation()
    setForm({ nome: posto.nome, descricao: posto.descricao || '' })
    setModal({ modo: 'editar', posto })
  }

  async function salvarPosto() {
    if (!form.nome.trim()) return
    try {
      if (modal.modo === 'criar') {
        await criarPosto(form)
      } else {
        await editarPosto(modal.posto.id, form)
      }
      setModal(null)
      carregar()
    } catch {
      console.error('Erro ao salvar posto')
    }
  }


  async function handleDeletar(posto, e) {
  e.stopPropagation()
  const ok = await confirmar({
    titulo: `Deletar "${posto.nome}"?`,
    texto: 'Essa ação não pode ser desfeita.',
    confirmText: 'Deletar',
    cancelText: 'Cancelar'
  })
  if (!ok) return
  try {
    await deletarPosto(posto.id)
    carregar()
  } catch {
    console.error('Erro ao deletar')
  }
}

  async function handleAlternarAtivo(posto, e) {
    e.stopPropagation()
    try {
      await alternarAtivo(posto.id)
      carregar()
    } catch {
      console.error('Erro ao alterar status')
    }
  }

  function acessarPosto(posto) {
    if (!posto.ativo) return
    navigate(isAdmin ? `/admin/posto/${posto.id}` : `/posto/${posto.id}`)
  }

  function logout() {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="ocean-bg scanlines min-h-screen">
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 480, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="Brasão" style={{ width: 60, height: 60 }} />
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, letterSpacing: 3 }}>SALVAVIDAS</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isAdmin && (
            <>
              <NavBtn onClick={() => navigate('/admin/registros')}>Registros</NavBtn>
              <NavBtn onClick={() => navigate('/admin/relatorios')}>Relatórios</NavBtn>
            </>
          )}
          <button onClick={logout} style={{
            background: 'transparent', border: 'none',
            color: 'rgba(245,240,232,0.35)', fontSize: 12, cursor: 'pointer',
          }}>Sair</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500 }}>Postos</h2>
            <p className="section-label" style={{ marginTop: 2 }}>
              {isAdmin ? 'Gerenciamento' : 'Selecione seu posto'}
            </p>
          </div>
          {isAdmin && (
            <button onClick={abrirCriar} className="btn-primary"
              style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>
              + Novo Posto
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(245,240,232,0.3)', padding: 40 }}>Carregando...</p>
        ) : postos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(245,240,232,0.3)', padding: 40 }}>Nenhum posto cadastrado</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {postos.map(posto => {
              const st = getStatusPosto(posto)
              const inativo = !posto.ativo
              return (
                <div
                  key={posto.id}
                  onClick={() => acessarPosto(posto)}
                  className="card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: inativo ? 'default' : 'pointer',
                    opacity: inativo ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {/* Ícone */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: inativo ? 'rgba(255,255,255,0.05)' : 'rgba(232,56,26,0.1)',
                    border: `1px solid ${inativo ? 'rgba(255,255,255,0.08)' : 'rgba(232,56,26,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke={inativo ? 'rgba(245,240,232,0.3)' : '#E8381A'} strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{posto.nome}</p>
                    {posto.descricao && (
                      <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', margin: 0, marginTop: 2 }}>
                        {posto.descricao}
                      </p>
                    )}
                  </div>

                  {/* Status do dia */}
                  {!inativo && st && (
                    <span className={
                      st === 'finalizado' ? 'badge-green' :
                      st === 'andamento' ? 'badge-yellow' : 'badge-red'
                    }>
                      {st === 'finalizado' ? 'Finalizado' :
                       st === 'andamento' ? 'Em andamento' : 'Aguardando'}
                    </span>
                  )}

                  {inativo && (
                    <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.25)' }}>Inativo</span>
                  )}

                  {/* Botões admin */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <IconBtn onClick={e => abrirEditar(posto, e)} title="Editar">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </IconBtn>
                      <IconBtn onClick={e => handleAlternarAtivo(posto, e)}
                        title={posto.ativo ? 'Desativar' : 'Ativar'} warning>
                        {posto.ativo ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18.36 6.64A9 9 0 0 1 20.77 15M6.16 6.16a9 9 0 1 0 12.68 12.68M2 2l20 20"/>
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                          </svg>
                        )}
                      </IconBtn>
                      <IconBtn onClick={e => handleDeletar(posto, e)} title="Deletar" danger>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </IconBtn>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 360, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
              {modal.modo === 'criar' ? 'Novo Posto' : 'Editar Posto'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 6 }}>
                  Nome
                </label>
                <input
                  value={form.nome}
                  onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Posto 2"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 6 }}>
                  Complemento (opcional)
                </label>
                <input
                  value={form.descricao}
                  onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Ex: Praia dos Golfinhos"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={salvarPosto}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6, color: '#F5F0E8', fontSize: 12, padding: '5px 12px', cursor: 'pointer',
    }}>
      {children}
    </button>
  )
}

function IconBtn({ onClick, children, title, danger, warning }) {
  const color = danger ? 'rgba(232,56,26,0.2)' : warning ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.08)'
  const textColor = danger ? '#ff5733' : warning ? '#facc15' : 'rgba(245,240,232,0.5)'
  return (
    <button onClick={onClick} title={title} style={{
      width: 28, height: 28, borderRadius: 6,
      background: color, border: `1px solid ${color}`,
      color: textColor, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </button>
  )
}