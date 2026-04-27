import { toast } from 'react-hot-toast'

export function toastSuccess(message, opts) {
  return toast.success(message, opts)
}

export function toastError(message, opts) {
  return toast.error(message, opts)
}

export function toastInfo(message, opts) {
  return toast(message, opts)
}

