import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCheckins, ocultarCheckin, ocultarTodosCheckins } from '../services/api'
import { erro, sucesso, confirmar } from '../utils/feedback'

/**
 * Verifica se um checkin está atrasado.
 * Regra: como o backend envia "dd/MM/yyyy HH:mm",
 * não podemos usar new Date(horario).
 */
function isAtrasado(horario) {
  if (!horario) return false

  // Extrai apenas a parte da hora de "01/05/2026 13:45"
  const partes = horario.split(' ')
  if (partes.length < 2) return false

  const horaCompleta = partes[1] // "13:45"
  const [horas, minutos] = horaCompleta.split(':').map(Number)

  if (Number.isNaN(horas) || Number.isNaN(minutos)) return false

  return horas > 7 || (horas === 7 && minutos > 30)
}

export function AdminCheckins() {
  const [checkins, setCheckins] = useState([])
  const [imagemAberta, setImagemAberta] = useState(null)
  const navigate = useNavigate()

  // Carrega checkins ao montar
  useEffect(() => { carregar() }, [])

  async function carregar() {
    try {
      const data = await getCheckins()
      setCheckins(data || [])
    } catch {
      erro('Erro ao carregar checkins')
    }
  }

  async function handleOcultar(id) {
    const ok = await confirmar({
      titulo: 'Ocultar checkin?',
      texto: 'Será removido da visualização.',
    })
    if (!ok) return

    try {
      await ocultarCheckin(id)
      setCheckins(prev => prev.filter(c => c.id !== id))
      sucesso('Ocultado')
    } catch {
      erro('Erro ao ocultar')
    }
  }

  async function handleOcultarTodos() {
    const ok = await confirmar({
      titulo: 'Ocultar todos os checkins?',
      texto: 'Todos serão removidos da visualização.',
      confirmText: 'Ocultar todos',
    })
    if (!ok) return

    try {
      await ocultarTodosCheckins()
      setCheckins([])
      sucesso('Todos ocultados')
    } catch {
      erro('Erro ao ocultar')
    }
  }

  return (
    <div className="ocean-bg scanlines min-h-screen">

      {/* HEADER */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 520,
        margin: '0 auto',
      }}>
        <button
          onClick={() => navigate('/admin/registros')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(245,240,232,0.4)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>
            Checkins
          </h1>
          <p
            style={{
              fontSize: 11,
              color: 'rgba(245,240,232,0.35)',
              margin: 0,
            }}
          >
            Registros de entrada
          </p>
        </div>

        <button
          className="btn-danger"
          onClick={handleOcultarTodos}
          style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}
        >
          Ocultar todos
        </button>
      </div>

      {/* LEGENDA */}
      <div style={{
        maxWidth: 520,
        margin: '12px auto 0',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
      </div>

      {/* GRID DE CHECKINS */}
      <div style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '16px 16px 32px',
      }}>
        {checkins.length === 0 ? (
          <p style={{
            fontSize: 13,
            color: 'rgba(245,240,232,0.3)',
            textAlign: 'center',
            padding: 40,
          }}>
            Nenhum checkin encontrado
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10,
          }}>
            {checkins.map(item => {
              const atrasado = isAtrasado(item.horario)

              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    border: atrasado
                      ? '1.5px solid rgba(239,68,68,0.8)'
                      : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                  }}
                >
                  <img
                    src={item.foto}
                    onClick={() => setImagemAberta(item.foto)}
                    style={{
                      width: '100%',
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    alt=""
                  />

                  {/* Badge de atraso */}
                  {atrasado && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: 'rgba(239,68,68,0.9)',
                      padding: '2px 0',
                    }}>
                      ● Atrasado
                    </span>
                  )}

                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgba(245,240,232,0.4)',
                      margin: 0,
                    }}
                  >
                    {item.posto || item.postoId}
                  </p>

                  {/* EXIBIR DIRETAMENTE O HORÁRIO */}
                  <p
                    style={{
                      fontSize: 10,
                      color: 'rgba(245,240,232,0.3)',
                      margin: 0,
                    }}
                  >
                    {item.horario || ''}
                  </p>

                  <button
                    onClick={() => handleOcultar(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(232,56,26,0.6)',
                      fontSize: 11,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                    }}
                  >
                    ocultar
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL DE IMAGEM */}
      {imagemAberta && (
        <div
          onClick={() => setImagemAberta(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <img
            src={imagemAberta}
            style={{
              maxWidth: '92%',
              maxHeight: '92%',
              borderRadius: 8,
            }}
            alt=""
          />
        </div>
      )}
    </div>
  )
}