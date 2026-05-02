
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCheckinsHoje, getCheckoutsHoje, getRelatorioHoje } from '../services/api'
import { erro } from '../utils/feedback'

export function PostoAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [checkins, setCheckins] = useState([])
  const [checkouts, setCheckouts] = useState([])
  const [relatorio, setRelatorio] = useState(null)
  const [imagemAberta, setImagemAberta] = useState(null)
  const interval = useRef(null)

  async function carregar() {
    try {
      const [c, o, r] = await Promise.all([
        getCheckinsHoje(id),
        getCheckoutsHoje(id),
        getRelatorioHoje(id),
      ])
      setCheckins(c || [])
      setCheckouts(o || [])
      setRelatorio(r)
    } catch { erro('Erro ao carregar dados') }
  }

  useEffect(() => {
    carregar()
    interval.current = setInterval(carregar, 10000)
    return () => clearInterval(interval.current)
  }, [id])

  const finalizado = checkouts.length > 0

  return (
    <div className="ocean-bg scanlines min-h-screen">
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480, margin: '0 auto',
      }}>
        <button onClick={() => navigate('/postos')} style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.4)', cursor: 'pointer', padding: 4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Posto {id}</h1>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0 }}>Monitoramento em tempo real</p>
        </div>
        {finalizado
          ? <span className="badge-green">Finalizado</span>
          : checkins.length > 0
            ? <span className="badge-yellow">Em andamento</span>
            : <span className="badge-red">Sem atividade</span>
        }
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <AdminSection titulo="Checkins">
          {checkins.length === 0
            ? <Vazio msg="Nenhum checkin realizado hoje" />
            : <GaleriaFotos items={checkins} onAbrirImagem={setImagemAberta} />
          }
        </AdminSection>

        <AdminSection titulo="Relatório">
          {!relatorio
            ? <Vazio msg="Nenhum relatório enviado" />
            : <TabelaRelatorio relatorio={relatorio} />
          }
        </AdminSection>

        <AdminSection titulo="Checkouts">
          {checkouts.length === 0
            ? <Vazio msg="Nenhum checkout realizado hoje" />
            : <GaleriaFotos items={checkouts} onAbrirImagem={setImagemAberta} />
          }
        </AdminSection>
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

function AdminSection({ titulo, children }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: '#F5F0E8' }}>{titulo}</p>
      {children}
    </div>
  )
}

function Vazio({ msg }) {
  return <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.3)', textAlign: 'center', padding: '16px 0' }}>{msg}</p>
}

function GaleriaFotos({ items, onAbrirImagem }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <div key={item.id || i} style={{ textAlign: 'center' }}>
          <img
            src={item.foto}
            onClick={() => onAbrirImagem(item.foto)}
            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
            alt=""
            onError={e => e.target.style.display = 'none'}
          />
          <p style={{ fontSize: 9, color: 'rgba(245,240,232,0.3)', marginTop: 3 }}>
            {item.horario || ''}
          </p>
        </div>
      ))}
    </div>
  )
}

const thStyle = { padding: '8px 6px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'rgba(245,240,232,0.4)', borderBottom: '1px solid rgba(255,255,255,0.07)', textTransform: 'uppercase', letterSpacing: 1 }
const tdStyle = { padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }

function TabelaRelatorio({ relatorio }) {
  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={thStyle}>Período</th>
            <th style={thStyle}>Prevenções</th>
            <th style={thStyle}>Lesões</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>Manhã</td>
            <td style={tdStyle}>{relatorio.prevencoesManha ?? 0}</td>
            <td style={tdStyle}>{relatorio.ataquesManha ?? 0}</td>
          </tr>
          <tr>
            <td style={tdStyle}>Tarde</td>
            <td style={tdStyle}>{relatorio.prevencoesTarde ?? 0}</td>
            <td style={tdStyle}>{relatorio.ataquesTarde ?? 0}</td>
          </tr>
        </tbody>
      </table>

      {relatorio.observacoes && (
        <div style={{
          marginTop: 10, padding: '8px 10px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 6, border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginBottom: 3 }}>Observações</p>
          <p style={{ fontSize: 13, color: '#F5F0E8', margin: 0 }}>{relatorio.observacoes}</p>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', marginTop: 8 }}>Relatório já enviado</p>
    </div>
  )
}