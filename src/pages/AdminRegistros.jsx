
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCheckins, getCheckouts, ocultarCheckin, ocultarCheckout, ocultarTodosCheckins, ocultarTodosCheckouts } from '../services/api'
import { erro, sucesso, confirmar } from '../utils/feedback'

export function AdminRegistros() {
  const [checkins, setCheckins] = useState([])
  const [checkouts, setCheckouts] = useState([])
  const [imagemAberta, setImagemAberta] = useState(null)
  const navigate = useNavigate()

  async function carregar() {
    try {
      const [c, o] = await Promise.all([getCheckins(), getCheckouts()])
      setCheckins(c || [])
      setCheckouts(o || [])
    } catch { erro('Erro ao carregar registros') }
  }

  useEffect(() => { carregar() }, [])

  async function handleOcultarCheckin(id) {
    const ok = await confirmar({ titulo: 'Ocultar checkin?', texto: 'Será removido da visualização.' })
    if (!ok) return
    try {
      await ocultarCheckin(id)
      setCheckins(prev => prev.filter(c => c.id !== id))
      sucesso('Ocultado')
    } catch { erro('Erro ao ocultar') }
  }

  async function handleOcultarCheckout(id) {
    const ok = await confirmar({ titulo: 'Ocultar checkout?', texto: 'Será removido da visualização.' })
    if (!ok) return
    try {
      await ocultarCheckout(id)
      setCheckouts(prev => prev.filter(c => c.id !== id))
      sucesso('Ocultado')
    } catch { erro('Erro ao ocultar') }
  }

  async function handleOcultarTodos() {
    const ok = await confirmar({ titulo: 'Ocultar tudo?', texto: 'Todos os checkins e checkouts serão removidos.', confirmText: 'Ocultar todos' })
    if (!ok) return
    try {
      await Promise.all([ocultarTodosCheckins(), ocultarTodosCheckouts()])
      setCheckins([]); setCheckouts([])
      sucesso('Todos ocultados')
    } catch { erro('Erro') }
  }

  return (
    <div className="ocean-bg scanlines min-h-screen">
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 12, maxWidth: 520, margin: '0 auto',
      }}>
        <button onClick={() => navigate('/postos')} style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.4)', cursor: 'pointer', padding: 4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Registros</h1>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0 }}>Checkins e checkouts</p>
        </div>
        <button className="btn-danger" onClick={handleOcultarTodos} style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}>
          Ocultar todos
        </button>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <GrupoRegistros titulo="Checkins" cor="#3b82f6" items={checkins} onOcultar={handleOcultarCheckin} onAbrirImagem={setImagemAberta} />
        <GrupoRegistros titulo="Checkouts" cor="#22c55e" items={checkouts} onOcultar={handleOcultarCheckout} onAbrirImagem={setImagemAberta} />
      </div>

      {imagemAberta && (
        <div onClick={() => setImagemAberta(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <img src={imagemAberta} style={{ maxWidth: '92%', maxHeight: '92%', borderRadius: 8 }} alt="" />
        </div>
      )}
    </div>
  )
}

function GrupoRegistros({ titulo, cor, items, onOcultar, onAbrirImagem }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: cor, marginBottom: 10 }}>{titulo}</p>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.3)', padding: '16px 0' }}>Nenhum registro</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <img
                src={item.foto}
                onClick={() => onAbrirImagem(item.foto)}
                style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                alt=""
              />
              <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', margin: 0 }}>
                {item.posto || item.postoId}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', margin: 0 }}>
                {item.horario ? new Date(item.horario).toLocaleString('pt-BR') : ''}
              </p>
              <button onClick={() => onOcultar(item.id)} style={{
                background: 'none', border: 'none', color: 'rgba(232,56,26,0.6)',
                fontSize: 11, cursor: 'pointer', textAlign: 'left', padding: 0,
              }}>
                ocultar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}