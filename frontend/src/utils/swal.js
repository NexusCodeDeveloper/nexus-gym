import Swal from 'sweetalert2';

// Un "toast" estilizado y reutilizable para notificaciones rápidas
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  background: '#27272a', // zinc-800
  color: '#e4e7eb', // zinc-200
  iconColor: '#3b82f6' // blue-500
});

// Función para mostrar un toast de éxito
export const showSuccessToast = (message) => {
  Toast.fire({
    icon: 'success',
    title: message,
    iconColor: '#22c55e' // green-500
  });
};

// Función para mostrar un toast de error
export const showErrorToast = (message) => {
  Toast.fire({
    icon: 'error',
    title: message,
    iconColor: '#ef4444' // red-500
  });
};

// Función para mostrar un diálogo de confirmación general
export const showConfirmDialog = async ({ title, text, confirmButtonText = 'Sí, continuar' }) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    iconColor: '#3b82f6',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: '!bg-zinc-900 !rounded-2xl',
      title: '!text-zinc-100',
      htmlContainer: '!text-zinc-400',
      actions: '!gap-4',
      confirmButton: '!bg-blue-600 !hover:!bg-blue-500 !text-white !rounded-lg !shadow-none !px-5 !py-2.5 !font-semibold',
      cancelButton: '!bg-zinc-700 !hover:!bg-zinc-600 !text-white !rounded-lg !shadow-none !px-5 !py-2.5 !font-semibold',
    },
    buttonsStyling: false,
  });
  return result.isConfirmed;
};

// Función para mostrar un diálogo de confirmación de eliminación (más drástico)
export const showDeleteConfirmDialog = async ({ title = '¿Estás seguro?', text = "¡Esta acción no se puede deshacer!", confirmButtonText = 'Sí, eliminar' }) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    iconColor: '#f59e0b', // amber-500
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: '!bg-zinc-900 !rounded-2xl',
      title: '!text-zinc-100',
      htmlContainer: '!text-zinc-400',
      actions: '!gap-4',
      confirmButton: '!bg-red-600 !hover:!bg-red-500 !text-white !rounded-lg !shadow-none !px-5 !py-2.5 !font-semibold',
      cancelButton: '!bg-zinc-700 !hover:!bg-zinc-600 !text-white !rounded-lg !shadow-none !px-5 !py-2.5 !font-semibold',
    },
    buttonsStyling: false,
  });
  return result.isConfirmed;
};

// Función para mostrar un diálogo de confirmación para acciones positivas (ej: renovar)
export const showPositiveConfirmDialog = async ({ title, text, confirmButtonText = 'Sí, confirmar' }) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'success',
    iconColor: '#22c55e', // green-500
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: '!bg-zinc-900 !rounded-2xl',
      title: '!text-zinc-100',
      htmlContainer: '!text-zinc-400',
      actions: '!gap-4',
      confirmButton: '!bg-green-600 !hover:!bg-green-500 !text-white !rounded-lg !shadow-none !px-5 !py-2.5 !font-semibold',
      cancelButton: '!bg-zinc-700 !hover:!bg-zinc-600 !text-white !rounded-lg !shadow-none !px-5 !py-2.5 !font-semibold',
    },
    buttonsStyling: false,
  });
  return result.isConfirmed;
};