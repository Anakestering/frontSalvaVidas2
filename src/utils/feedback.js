import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#0A2540',
  color: '#F5F0E8',
})

export const sucesso = (msg) => Toast.fire({ icon: 'success', title: msg })
export const erro = (msg) => Toast.fire({ icon: 'error', title: msg })
export const aviso = (msg) => Toast.fire({ icon: 'warning', title: msg })

export function loading(msg = 'Aguarde...') {
  Swal.fire({
    title: msg,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    background: '#0A2540',
    color: '#F5F0E8',
  })
}

export function loadingSucesso(msg) {
  Swal.fire({
    icon: 'success',
    title: msg,
    timer: 2000,
    showConfirmButton: false,
    background: '#0A2540',
    color: '#F5F0E8',
  })
}

export function loadingErro(msg) {
  Swal.fire({
    icon: 'error',
    title: msg,
    background: '#0A2540',
    color: '#F5F0E8',
  })
}

export async function confirmar({ titulo, texto, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  const result = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#E8381A',
    cancelButtonColor: '#334155',
    background: '#0A2540',
    color: '#F5F0E8',
  })
  return result.isConfirmed
}