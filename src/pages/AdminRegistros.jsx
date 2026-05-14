import { useNavigate } from 'react-router-dom'

/**
 * Página hub de registros.
 * Substituiu a página única que listava checkins e checkouts juntos.
 * Agora redireciona para /admin/checkins ou /admin/checkouts.
 */
export function AdminRegistros() {
  const navigate = useNavigate()

  return (
    <div className="ocean-bg scanlines min-h-screen">

      {/* HEADER */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 12,
        maxWidth: 520, margin: '0 auto',
      }}>
        <button
          onClick={() => navigate('/postos')}
          style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.4)', cursor: 'pointer', padding: 4 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Registros</h1>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0 }}>
            Selecione o tipo de registro
          </p>
        </div>
      </div>

      {/* BOTÕES */}
      <div style={{
        maxWidth: 520, margin: '32px auto 0',
        padding: '0 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>

        {/* Checkins */}
        <button
          onClick={() => navigate('/admin/checkins')}
          style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 12, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', textAlign: 'left', width: '100%',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
        >
          {/* ícone login */}
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(59,130,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(59,130,246,0.9)" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'rgba(245,240,232,0.9)' }}>
              Checkins
            </p>
            <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0, marginTop: 2 }}>
              Registros de entrada
            </p>
          </div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.2)" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Checkouts */}
        <button
          onClick={() => navigate('/admin/checkouts')}
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 12, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer', textAlign: 'left', width: '100%',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.08)'}
        >
          {/* ícone logout */}
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(34,197,94,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(34,197,94,0.9)" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'rgba(245,240,232,0.9)' }}>
              Checkouts
            </p>
            <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0, marginTop: 2 }}>
              Registros de saída
            </p>
          </div>
          <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.2)" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

      </div>
    </div>
  )
}