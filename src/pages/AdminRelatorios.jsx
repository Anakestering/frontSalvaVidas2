import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRelatorios, ocultarRelatorio, ocultarTodosRelatorios } from '../services/api'
import { erro, sucesso, confirmar, loading, loadingErro, loadingSucesso } from '../utils/feedback'
import { exportarRelatorios } from "../services/api";

export function AdminRelatorios() {
  const [relatorios, setRelatorios] = useState([])
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const navigate = useNavigate()

  async function carregar() {
    try {
      const data = await getRelatorios()
      setRelatorios(data || [])
    } catch { erro('Erro ao carregar relatórios') }
  }

  useEffect(() => { carregar() }, [])

  async function handleExportar() {
    if (!inicio || !fim) return erro('Selecione o período de exportação')
    loading('Gerando Excel...')
    try {
      const blob = await exportarRelatorios(inicio, fim)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorios_${inicio}_${fim}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      loadingSucesso('Download concluído!')
    } catch (err) {
      console.error("Erro ao exportar:", err);
      loadingErro('Erro ao exportar')
    }
  }

  async function handleOcultar(id) {
    const ok = await confirmar({ titulo: 'Ocultar relatório?', texto: 'Será removido da visualização.' })
    if (!ok) return
    try {
      await ocultarRelatorio(id)
      setRelatorios(prev => prev.filter(r => r.id !== id))
      sucesso('Ocultado')
    } catch { erro('Erro ao ocultar') }
  }

  async function handleOcultarTodos() {
    const ok = await confirmar({ titulo: 'Ocultar todos os relatórios?', texto: 'Essa ação não pode ser desfeita.', confirmText: 'Ocultar' })
    if (!ok) return
    try {
      await ocultarTodosRelatorios()
      setRelatorios([])
      sucesso('Todos ocultados')
    } catch { erro('Erro') }
  }

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function setHoje() {
    const hoje = new Date();
    const data = formatDate(hoje);
    setInicio(data);
    setFim(data);
  }

  function setUltimos7Dias() {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 6);
    setInicio(formatDate(seteDiasAtras));
    setFim(formatDate(hoje));
  }

  function setMesAtual() {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    setInicio(formatDate(primeiroDia));
    setFim(formatDate(hoje));
  }

  return (
    <div className="ocean-bg scanlines min-h-screen">

      {/* ================ HEADER ================ */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        maxWidth: 520,
        margin: "0 auto",
      }}>
        <button
          onClick={() => navigate("/postos")}
          style={{ background: "none", border: "none", color: "rgba(245,240,232,0.4)", cursor: "pointer", padding: 4 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Relatórios</h1>
          <p style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", margin: 0 }}>Registros operacionais</p>
        </div>

        <button className="btn-danger" onClick={handleOcultarTodos} style={{ width: "auto", padding: "6px 14px", fontSize: 12 }}>
          Ocultar todos
        </button>
      </div>

      {/* ==================== EXPORTAÇÃO ================== */}
      <div style={{ maxWidth: 520, margin: "20px auto 0", padding: "0 16px" }}>
        <p className="section-label" style={{ marginBottom: 10 }}>Exportar por período</p>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 8, flex: 1 }}>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} style={{ flex: 1 }} />
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} style={{ flex: 1 }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: -32 }}>
            {[
              { label: "Hoje", action: setHoje },
              { label: "7 dias", action: setUltimos7Dias },
              { label: "Último mês", action: setMesAtual },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                style={{
                  padding: "4px 10px", fontSize: 12, borderRadius: 6,
                  background: "rgba(20, 90, 50, 0.25)", border: "1px solid rgba(20, 90, 50, 0.6)",
                  color: "#9BE3B0", cursor: "pointer", transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(20, 90, 50, 0.45)"; e.currentTarget.style.border = "1px solid rgba(20, 90, 50, 0.9)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(20, 90, 50, 0.25)"; e.currentTarget.style.border = "1px solid rgba(20, 90, 50, 0.6)" }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleExportar} style={{ marginTop: 12, width: "100%" }}>
          Exportar Excel
        </button>
      </div>

      {/* ==================== LISTA DE RELATÓRIOS ================== */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {relatorios.length === 0 ? (
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.3)', textAlign: 'center', padding: 40 }}>Nenhum relatório encontrado</p>
        ) : relatorios.map(r => (
          <div key={r.id} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{r.posto || `Posto ${r.postoId}`}</p>
                <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0 }}>
                  {r.data ? new Date(r.data).toLocaleDateString('pt-BR') : 'Sem data'}
                </p>
              </div>
              <button onClick={() => handleOcultar(r.id)} className="btn-danger" style={{ width: 'auto', padding: '5px 12px', fontSize: 12 }}>
                Ocultar
              </button>
            </div>

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
                  <td style={tdStyle}>{r.prevencoesManha ?? 0}</td>
                  <td style={tdStyle}>{r.ataquesManha ?? 0}</td>
                </tr>
                <tr>
                  <td style={tdStyle}>Tarde</td>
                  <td style={tdStyle}>{r.prevencoesTarde ?? 0}</td>
                  <td style={tdStyle}>{r.ataquesTarde ?? 0}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'rgba(245,240,232,0.5)' }}>
              <span>Total prevenções: <b style={{ color: '#F5F0E8' }}>{(r.prevencoesManha || 0) + (r.prevencoesTarde || 0)}</b></span>
              <span>Total lesões: <b style={{ color: '#F5F0E8' }}>{(r.ataquesManha || 0) + (r.ataquesTarde || 0)}</b></span>
            </div>

            {r.observacoes && (
              <div style={{
                marginTop: 10, padding: '8px 10px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 6, border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginBottom: 3 }}>Observações</p>
                <p style={{ fontSize: 13, color: '#F5F0E8', margin: 0 }}>{r.observacoes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

const thStyle = { padding: '7px 6px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'rgba(245,240,232,0.4)', borderBottom: '1px solid rgba(255,255,255,0.07)', textTransform: 'uppercase', letterSpacing: 1 }
const tdStyle = { padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }