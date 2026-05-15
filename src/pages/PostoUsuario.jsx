import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fazerCheckin, fazerCheckout, getCheckinsHoje, getCheckoutsHoje, getRelatorioHoje, criarRelatorio, getPosto } from '../services/api'
import { aviso, loading, loadingSucesso, loadingErro, confirmar } from '../utils/feedback'

const thStyle = { padding: '8px 6px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'rgba(245,240,232,0.4)', borderBottom: '1px solid rgba(255,255,255,0.07)', textTransform: 'uppercase', letterSpacing: 1 }
const tdStyle = { padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }

export function PostoUsuario() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inputCheckinRef = useRef(null)
  const inputCheckoutRef = useRef(null)
  const [posto, setPosto] = useState(null)

  const [busy, setBusy] = useState(false)
  const [checkins, setCheckins] = useState([])
  const [checkouts, setCheckouts] = useState([])
  const [relatorio, setRelatorio] = useState(null)
  const [relatorioForm, setRelatorioForm] = useState({
    prevencoesManha: '', ataquesManha: '',
    prevencoesTarde: '', ataquesTarde: '',
    observacoes: ''
  })
  const [imagemAberta, setImagemAberta] = useState(null)
  const [fotoCheckin, setFotoCheckin] = useState(null)
  const [fotoCheckout, setFotoCheckout] = useState(null)

  function isAtrasado(horario) {
    if (!horario) return false
    const partes = String(horario).split(' ')
    if (partes.length < 2) return false
    const [horas, minutos] = partes[1].split(':').map(Number)
    if (Number.isNaN(horas) || Number.isNaN(minutos)) return false
    return horas > 7 || (horas === 7 && minutos > 30)
  }

  async function carregar() {
    try {
      const [c, o, r, p] = await Promise.all([
        getCheckinsHoje(id),
        getCheckoutsHoje(id),
        getRelatorioHoje(id),
        getPosto(id),
      ])
      setCheckins(c || [])
      setCheckouts(o || [])
      setRelatorio(r)
      setPosto(p)
      if (r) {
        setRelatorioForm({
          prevencoesManha: r.prevencoesManha ?? '',
          ataquesManha: r.ataquesManha ?? '',
          prevencoesTarde: r.prevencoesTarde ?? '',
          ataquesTarde: r.ataquesTarde ?? '',
          observacoes: r.observacoes || '',
        })
      }
    } catch {
      aviso('Erro ao carregar dados')
    }
  }

  useEffect(() => { carregar() }, [id])

  async function enviarCheckin() {
    if (!fotoCheckin) return aviso('Selecione uma foto')
    if (checkins.length >= 3) return aviso('Limite de 3 checkins por dia atingido')
    const ok = await confirmar({ titulo: 'Enviar checkin?', texto: 'Confirma o envio da foto?' })
    if (!ok) return
    setBusy(true)
    loading('Enviando checkin...')
    try {
      await fazerCheckin(id, fotoCheckin)
      setFotoCheckin(null)
      if (inputCheckinRef.current) inputCheckinRef.current.value = ''
      await carregar()
      loadingSucesso('Checkin enviado!')
    } catch (e) {
      loadingErro(e.message || 'Erro ao enviar checkin')
    } finally { setBusy(false) }
  }

  async function enviarCheckout() {
    if (!relatorio) return aviso('Envie o relatório antes do checkout')
    if (checkins.length === 0) return aviso('Faça o checkin primeiro')
    if (!fotoCheckout) return aviso('Selecione uma foto')
    if (checkouts.length >= 3) return aviso('Limite de 3 checkouts por dia atingido')
    const ok = await confirmar({ titulo: 'Enviar checkout?', texto: 'Confirma o encerramento do dia?' })
    if (!ok) return
    setBusy(true)
    loading('Enviando checkout...')
    try {
      await fazerCheckout(id, fotoCheckout)
      setFotoCheckout(null)
      if (inputCheckoutRef.current) inputCheckoutRef.current.value = ''
      await carregar()
      loadingSucesso('Checkout enviado!')
    } catch (e) {
      loadingErro(e.message || 'Erro ao enviar checkout')
    } finally { setBusy(false) }
  }

  async function salvarRelatorio() {
    const { prevencoesManha, ataquesManha, prevencoesTarde, ataquesTarde } = relatorioForm
    if ([prevencoesManha, ataquesManha, prevencoesTarde, ataquesTarde].some(v => v === '')) {
      return aviso('Preencha todos os campos do relatório')
    }
    const ok = await confirmar({ titulo: 'Salvar relatório?', texto: 'Confirma o envio?' })
    if (!ok) return
    setBusy(true)
    loading('Salvando relatório...')
    try {
      await criarRelatorio({
        postoId: Number(id),
        prevencoesManha: Number(prevencoesManha),
        ataquesManha: Number(ataquesManha),
        prevencoesTarde: Number(prevencoesTarde),
        ataquesTarde: Number(ataquesTarde),
        observacoes: relatorioForm.observacoes || null,
      })
      await carregar()
      loadingSucesso('Relatório salvo!')
    } catch (e) {
      loadingErro(e.message || 'Erro ao salvar relatório')
    } finally { setBusy(false) }
  }

  const finalizado = checkouts.length > 0
  const checkinAtrasado = checkins.some(c => isAtrasado(c.horario))

  return (
    <div className="ocean-bg scanlines min-h-screen">
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480, margin: '0 auto',
      }}>
        <button onClick={() => navigate('/postos')} style={{
          background: 'none', border: 'none', color: 'rgba(245,240,232,0.4)',
          cursor: 'pointer', padding: 4, display: 'flex',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>{posto?.nome || `Posto ${id}`}</h1>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0 }}>
            {finalizado ? '— Finalizado hoje' : '— Em operação'}
          </p>
        </div>
        {checkins.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <span className={checkinAtrasado ? 'badge-red' : 'badge-green'}>
              {checkinAtrasado
                ? 'Checkin realizado com atraso'
                : 'Checkin realizado'}
            </span>

            {finalizado && (
              <span className="badge-green">
                Checkout finalizado
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ======================================== CHECKIN ==================================== */}
        <Section titulo="Checkin">
          <input ref={inputCheckinRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }} onChange={e => setFotoCheckin(e.target.files[0])} />

          {fotoCheckin ? (
            <PreviewFoto
              file={fotoCheckin}
              onRemover={() => { setFotoCheckin(null); inputCheckinRef.current.value = '' }}
              onEnviar={enviarCheckin}
              busy={busy}
              label="Enviar Checkin"
              onAbrirImagem={setImagemAberta}
            />
          ) : (
            <button
              className={checkins.length >= 3 ? 'btn-secondary' : 'btn-primary'}
              disabled={busy || checkins.length >= 3}
              onClick={() => inputCheckinRef.current.click()}
            >
              {checkins.length >= 3
                ? 'Limite atingido'
                : 'Tirar Foto'}
            </button>
          )}

          <ListaFotos items={checkins} onAbrirImagem={setImagemAberta} />
        </Section>

        {/* ===================================== RELATORIO ==================================== */}
        <Section titulo="Relatório">

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={thStyle}>Período</th>
                <th style={thStyle}>Prevenções</th>
                <th style={thStyle}>Lesões Água-viva</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Manhã', 'prevencoesManha', 'ataquesManha'],
                ['Tarde', 'prevencoesTarde', 'ataquesTarde']
              ].map(([label, p, a]) => (
                <tr key={label}>
                  <td style={tdStyle}>{label}</td>
                  <td style={tdStyle}>
                    <input type="number" min="0"
                      value={relatorioForm[p]}
                      onChange={e => setRelatorioForm(prev => ({ ...prev, [p]: e.target.value }))}
                      style={{ textAlign: 'center', padding: '6px 4px' }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" min="0"
                      value={relatorioForm[a]}
                      onChange={e => setRelatorioForm(prev => ({ ...prev, [a]: e.target.value }))}
                      style={{ textAlign: 'center', padding: '6px 4px' }}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ paddingTop: 10 }}>
                  <label style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', display: 'block', marginBottom: 6 }}>
                    Observações (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva ocorrências, condições do mar..."
                    value={relatorioForm.observacoes || ''}
                    onChange={e => setRelatorioForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    style={{ resize: 'none', width: '100%' }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <button className="btn-primary" disabled={busy} onClick={salvarRelatorio}>
            {relatorio ? 'Atualizar Relatório' : 'Salvar Relatório'}
          </button>
        </Section>

        {/* ========================================= CHECKOUT ====================================== */}
        <Section titulo="Checkout">
          <input ref={inputCheckoutRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }} onChange={e => setFotoCheckout(e.target.files[0])} />

          {fotoCheckout ? (
            <PreviewFoto
              file={fotoCheckout}
              onRemover={() => { setFotoCheckout(null); inputCheckoutRef.current.value = '' }}
              onEnviar={enviarCheckout}
              busy={busy}
              label="Enviar Checkout"
              onAbrirImagem={setImagemAberta}
            />
          ) : (
            <button
              className={relatorio ? 'btn-primary' : 'btn-secondary'}
              disabled={busy || !relatorio || checkouts.length >= 3}
              onClick={() => inputCheckoutRef.current.click()}
            >
              {!relatorio ? 'Envie o relatório primeiro' : checkouts.length >= 3 ? 'Limite atingido' : 'Tirar Foto'}
            </button>
          )}

          <ListaFotos items={checkouts} onAbrirImagem={setImagemAberta} />
        </Section>
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

function Section({ titulo, children }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: '#F5F0E8' }}>{titulo}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}

function PreviewFoto({ file, onRemover, onEnviar, busy, label, onAbrirImagem }) {
  const url = URL.createObjectURL(file)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <img
        src={url}
        onClick={() => onAbrirImagem(url)}
        style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }}
        alt=""
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-secondary" onClick={onRemover}>Remover</button>
        <button className="btn-primary" onClick={onEnviar} disabled={busy}>{label}</button>
      </div>
    </div>
  )
}

function ListaFotos({ items, onAbrirImagem }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
      {items.map((item, i) => (
        <div key={item.id || i} style={{ textAlign: 'center' }}>
          <img
            src={item.foto}
            onClick={() => onAbrirImagem(item.foto)}
            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
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

function TabelaRelatorio({ relatorio }) {
  return (
    <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
      <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginBottom: 8 }}>Último envio</p>
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
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginBottom: 3 }}>Observações</p>
          <p style={{ fontSize: 13, color: '#F5F0E8', margin: 0 }}>{relatorio.observacoes}</p>
        </div>
      )}
    </div>
  )
}