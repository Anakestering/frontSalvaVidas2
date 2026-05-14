const BASE_URL = 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  const token = getToken()
  return { 'Authorization': token ? `Bearer ${token}` : '' }
}

function authJsonHeaders() {
  return { ...authHeaders(), 'Content-Type': 'application/json' }
}

// AUTH
export async function login(email, senha) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })
  if (!res.ok) throw new Error('Credenciais inválidas')
  return res.json()
}

// POSTOS

export async function getPosto(id) {
  const res = await fetch(`${BASE_URL}/postos/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar posto')
  return res.json()
}

export async function getPostos() {
  const res = await fetch(`${BASE_URL}/postos`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar postos')
  return res.json()
}

export async function criarPosto(dados) {
  const res = await fetch(`${BASE_URL}/postos`, {
    method: 'POST', headers: authJsonHeaders(), body: JSON.stringify(dados),
  })
  if (!res.ok) throw new Error('Erro ao criar posto')
  return res.json()
}

export async function editarPosto(id, dados) {
  const res = await fetch(`${BASE_URL}/postos/${id}`, {
    method: 'PUT', headers: authJsonHeaders(), body: JSON.stringify(dados),
  })
  if (!res.ok) throw new Error('Erro ao editar posto')
  return res.json()
}

export async function deletarPosto(id) {
  const res = await fetch(`${BASE_URL}/postos/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro ao deletar posto')
}

// CHECKIN
export async function fazerCheckin(postoId, fotoFile) {
  const form = new FormData()
  form.append('postoId', postoId)
  if (fotoFile) form.append('foto', fotoFile)
  const res = await fetch(`${BASE_URL}/check/in`, {
    method: 'POST', headers: authHeaders(), body: form,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Erro ao fazer checkin')
  }
  return res.json()
}

export async function getCheckinsHoje(postoId) {
  const res = await fetch(`${BASE_URL}/check/in/hoje/${postoId}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar checkins')
  return res.json()
}

export async function getCheckins() {
  const res = await fetch(`${BASE_URL}/check/in`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar checkins')
  return res.json()
}

export async function ocultarCheckin(id) {
  const res = await fetch(`${BASE_URL}/check/in/ocultar/${id}`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro ao ocultar checkin')
}

export async function ocultarTodosCheckins() {
  const res = await fetch(`${BASE_URL}/check/in/ocultar-todos`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro')
}

// CHECKOUT
export async function fazerCheckout(postoId, fotoFile) {
  const form = new FormData()
  form.append('postoId', postoId)
  if (fotoFile) form.append('foto', fotoFile)
  const res = await fetch(`${BASE_URL}/check/out`, {
    method: 'POST', headers: authHeaders(), body: form,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Erro ao fazer checkout')
  }
  return res.json()
}

export async function getCheckoutsHoje(postoId) {
  const res = await fetch(`${BASE_URL}/check/out/hoje/${postoId}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar checkouts')
  return res.json()
}

export async function getCheckouts() {
  const res = await fetch(`${BASE_URL}/check/out`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar checkouts')
  return res.json()
}

export async function ocultarCheckout(id) {
  const res = await fetch(`${BASE_URL}/check/out/ocultar/${id}`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro ao ocultar checkout')
}

export async function ocultarTodosCheckouts() {
  const res = await fetch(`${BASE_URL}/check/out/ocultar-todos`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro')
}

// RELATORIO
export async function getRelatorios() {
  const res = await fetch(`${BASE_URL}/relatorio`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar relatórios')
  return res.json()
}

export async function exportarRelatorios(inicio, fim) {
  const res = await fetch(`${BASE_URL}/relatorio/exportar?inicio=${inicio}&fim=${fim}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro ao exportar')
  return res.blob()
}

export async function getRelatorioHoje(postoId) {
  const res = await fetch(`${BASE_URL}/relatorio/hoje/${postoId}`, { headers: authHeaders() })
  if (!res.ok) return null
  const txt = await res.text()
  return txt ? JSON.parse(txt) : null
}

export async function criarRelatorio(dados) {
  const res = await fetch(`${BASE_URL}/relatorio`, {
    method: 'POST', headers: authJsonHeaders(), body: JSON.stringify(dados),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Erro ao salvar relatório')
  }
  return res.json()
}

export async function ocultarRelatorio(id) {
  const res = await fetch(`${BASE_URL}/relatorio/ocultar/${id}`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro ao ocultar relatório')
}

export async function ocultarTodosRelatorios() {
  const res = await fetch(`${BASE_URL}/relatorio/ocultar-todos`, {
    method: 'PATCH', headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Erro')
}