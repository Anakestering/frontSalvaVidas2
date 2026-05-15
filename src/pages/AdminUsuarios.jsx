import { useEffect, useState } from 'react'
import { confirmar } from '../utils/feedback'

const BASE_URL = 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`
  }
}

function authJsonHeaders() {
  return {
    ...authHeaders(),
    'Content-Type': 'application/json'
  }
}

async function getUsuarios() {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    headers: authHeaders()
  })

  if (!res.ok) throw new Error('Erro ao buscar usuários')

  return res.json()
}

async function criarUsuario(dados) {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(dados)
  })

  if (!res.ok) throw new Error('Erro ao criar usuário')

  return res.json()
}

async function editarUsuario(id, dados) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'PUT',
    headers: authJsonHeaders(),
    body: JSON.stringify(dados)
  })

  if (!res.ok) throw new Error('Erro ao editar usuário')

  return res.json()
}

async function deletarUsuario(id) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })

  if (!res.ok) throw new Error('Erro ao deletar usuário')
}

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(null)

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    nivelAcesso: 'PADRAO'
  })

  async function carregar() {
    try {
      const data = await getUsuarios()
      setUsuarios(data)
    } catch {
      console.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function abrirCriar() {
    setForm({
      nome: '',
      cpf: '',
      email: '',
      senha: '',
      nivelAcesso: 'PADRAO'
    })

    setModal({ modo: 'criar' })
  }

  function abrirEditar(usuario, e) {
    e.stopPropagation()

    setForm({
      nome: usuario.nome || '',
      cpf: usuario.cpf || '',
      email: usuario.email || '',
      senha: '',
      nivelAcesso: usuario.nivelAcesso || 'PADRAO'
    })

    setModal({
      modo: 'editar',
      usuario
    })
  }

  async function salvarUsuario() {
    try {
      if (modal.modo === 'criar') {
        await criarUsuario(form)
      } else {
        await editarUsuario(modal.usuario.id, form)
      }

      setModal(null)
      carregar()
    } catch {
      console.error('Erro ao salvar usuário')
    }
  }

  async function handleDeletar(usuario, e) {
    e.stopPropagation()

    const ok = await confirmar({
      titulo: `Deletar "${usuario.nome}"?`,
      texto: 'Essa ação não pode ser desfeita.',
      confirmText: 'Deletar',
      cancelText: 'Cancelar'
    })

    if (!ok) return

    try {
      await deletarUsuario(usuario.id)
      carregar()
    } catch {
      console.error('Erro ao deletar usuário')
    }
  }

  const usuariosFiltrados = usuarios.filter(usuario => {
    const termo = busca.toLowerCase()

    return (
      usuario.nome?.toLowerCase().includes(termo) ||
      usuario.email?.toLowerCase().includes(termo) ||
      usuario.cpf?.includes(termo)
    )
  })

  return (
    <div className="ocean-bg scanlines min-h-screen">
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '24px 20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 500 }}>
              Usuários
            </h2>

            <p className="section-label">
              Gerenciamento de usuários
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={abrirCriar}
            style={{
              width: 'auto',
              padding: '8px 16px'
            }}
          >
            + Novo Usuário
          </button>
        </div>

        <input
          placeholder="Pesquisar por nome, CPF ou email"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            {usuariosFiltrados.map(usuario => (
              <div
                key={usuario.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 500
                    }}
                  >
                    {usuario.nome || 'Sem nome'}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      opacity: 0.7
                    }}
                  >
                    {usuario.email}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      opacity: 0.5
                    }}
                  >
                    {usuario.cpf}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <IconBtn
                    onClick={e =>
                      abrirEditar(usuario, e)
                    }
                  >
                    ✏️
                  </IconBtn>

                  <IconBtn
                    danger
                    onClick={e =>
                      handleDeletar(usuario, e)
                    }
                  >
                    🗑
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 360,
              padding: 24
            }}
          >
            <h3 style={{ marginBottom: 16 }}>
              {modal.modo === 'criar'
                ? 'Novo Usuário'
                : 'Editar Usuário'}
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <input
                placeholder="Nome"
                value={form.nome}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    nome: e.target.value
                  }))
                }
              />

              <input
                placeholder="CPF"
                value={form.cpf}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    cpf: e.target.value
                  }))
                }
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    email: e.target.value
                  }))
                }
              />

              <input
                type="password"
                placeholder="Senha"
                value={form.senha}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    senha: e.target.value
                  }))
                }
              />

              <select
                value={form.nivelAcesso}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    nivelAcesso: e.target.value
                  }))
                }
              >
                <option value="PADRAO">
                  Usuário
                </option>

                <option value="ADMIN">
                  Admin
                </option>
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 16
              }}
            >
              <button
                className="btn-secondary"
                onClick={() => setModal(null)}
              >
                Cancelar
              </button>

              <button
                className="btn-primary"
                onClick={salvarUsuario}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IconBtn({
  onClick,
  children,
  danger
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        background: danger
          ? 'rgba(232,56,26,0.2)'
          : 'rgba(255,255,255,0.08)'
      }}
    >
      {children}
    </button>
  )
}