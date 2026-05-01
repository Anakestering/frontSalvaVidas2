
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPostos, deletarPosto, criarPosto, editarPosto } from '../services/api'
import { erro, sucesso, confirmar } from '../utils/feedback'

export function Postos() {
  const [postos, setPostos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | { modo: 'criar' | 'editar', posto?: {} }
  const [form, setForm] = useState({ nome: '' })
  const navigate = useNavigate()
  const tipo = localStorage.getItem('tipo')
  const isAdmin = tipo === 'admin'

  async function carregar() {
    try {
      const data = await getPostos()
      setPostos(data)
    } catch {
      erro('Erro ao carregar postos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function abrirCriar() {
    setForm({ nome: '' })
    setModal({ modo: 'criar' })
  }

  function abrirEditar(posto) {
    setForm({ nome: posto.nome })
    setModal({ modo: 'editar', posto })
  }

  async function salvarPosto() {
    if (!form.nome.trim()) return erro('Informe o nome do posto')
    try {
      if (modal.modo === 'criar') {
        await criarPosto({ nome: form.nome })
        sucesso('Posto criado')
      } else {
        await editarPosto(modal.posto.id, { nome: form.nome })
        sucesso('Posto atualizado')
      }
      setModal(null)
      carregar()
    } catch {
      erro('Erro ao salvar posto')
    }
  }

  async function handleDeletar(posto) {
    const ok = await confirmar({ titulo: 'Deletar posto?', texto: `"${posto.nome}" será removido permanentemente.`, confirmText: 'Deletar' })
    if (!ok) return
    try {
      await deletarPosto(posto.id)
      sucesso('Posto removido')
      carregar()
    } catch {
      erro('Erro ao deletar posto')
    }
  }

  function acessarPosto(id) {
    navigate(isAdmin ? `/admin/posto/${id}` : `/posto/${id}`)
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
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(232,56,26,0.15)', border: '1px solid rgba(232,56,26,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8381A" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span className="font-display" style={{ fontSize: 18, letterSpacing: 3, color: '#F5F0E8' }}>SALVAVIDAS</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <>
              <NavBtn onClick={() => navigate('/admin/registros')}>Registros</NavBtn>
              <NavBtn onClick={() => navigate('/admin/relatorios')}>Relatórios</NavBtn>
            </>
          )}
          <button onClick={logout} style={{
            background: 'transparent', border: 'none', color: 'rgba(245,240,232,0.4)',
            fontSize: 12, cursor: 'pointer', padding: '4px 8px',
          }}>Sair</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#F5F0E8' }}>Postos</h2>
            <p className="section-label" style={{ marginTop: 2 }}>
              {isAdmin ? 'Gerenciamento' : 'Selecione seu posto'}
            </p>
          </div>
          {isAdmin && (
            <button onClick={abrirCriar} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>
              + Novo Posto
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(245,240,232,0.3)', padding: 40, fontSize: 14 }}>
            Carregando...
          </div>
        ) : postos.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(245,240,232,0.3)', padding: 40, fontSize: 14 }}>
            Nenhum posto cadastrado
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {postos.map(posto => (
              <div key={posto.id} className="card" style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <button
                  onClick={() => acessarPosto(posto.id)}
                  style={{
                    background: 'none', border: 'none', color: '#F5F0E8',
                    textAlign: 'left', cursor: 'pointer', flex: 1,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(232,56,26,0.1)', border: '1px solid rgba(232,56,26,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8381A" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{posto.nome}</p>
                    <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0 }}>Toque para acessar</p>
                  </div>
                </button>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <IconBtn onClick={() => abrirEditar(posto)} title="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </IconBtn>
                    <IconBtn onClick={() => handleDeletar(posto)} title="Deletar" danger>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    </IconBtn>
                  </div>
                )}
              </div>
            ))}
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
            <label style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 6 }}>Nome</label>
            <input
              value={form.nome}
              onChange={e => setForm({ nome: e.target.value })}
              placeholder="Ex: Posto Central"
              style={{ marginBottom: 16 }}
              autoFocus
            />
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

function IconBtn({ onClick, children, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 30, height: 30, borderRadius: 6,
      background: danger ? 'rgba(232,56,26,0.1)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${danger ? 'rgba(232,56,26,0.2)' : 'rgba(255,255,255,0.08)'}`,
      color: danger ? '#ff5733' : 'rgba(245,240,232,0.5)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </button>
  )
}