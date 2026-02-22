function dismissToast(toastEl) {
  if (!toastEl) return;
  toastEl.classList.add('opacity-0', 'translate-y-2');
  toastEl.classList.remove('opacity-100', 'translate-y-0');
  window.setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.parentNode.removeChild(toastEl);
    }
  }, 200);
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) {
    // Créer le conteneur s'il n'existe pas
    const newContainer = document.createElement('div');
    newContainer.id = 'toast-container';
    newContainer.className = 'fixed bottom-4 right-4 z-50 space-y-2';
    document.body.appendChild(newContainer);
    return showToast(message, type);
  }

  const toast = document.createElement('div');
  toast.className = `bg-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-md border-l-4 ${
    type === 'error' ? 'border-red-500' : 'border-primary-green'
  }`;
  toast.setAttribute('data-toast', '');
  toast.setAttribute('data-toast-type', type);

  const content = document.createElement('div');
  content.className = 'flex items-center justify-between';
  
  const messageEl = document.createElement('p');
  messageEl.className = `font-semibold ${type === 'error' ? 'text-red-700' : 'text-primary-green'}`;
  messageEl.textContent = message;
  content.appendChild(messageEl);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'ml-4 text-gray-400 hover:text-gray-600';
  closeBtn.setAttribute('data-toast-close', '');
  closeBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;
  closeBtn.addEventListener('click', () => dismissToast(toast));
  content.appendChild(closeBtn);

  toast.appendChild(content);
  container.appendChild(toast);

  // Animation d'entrée
  setTimeout(() => {
    toast.classList.add('opacity-100', 'translate-y-0');
    toast.classList.remove('opacity-0', 'translate-y-2');
  }, 10);

  // Auto-dismiss
  const timeoutMs = type === 'error' ? 8000 : 4500;
  setTimeout(() => dismissToast(toast), timeoutMs);
}

export function initToasts() {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toasts = Array.from(container.querySelectorAll('[data-toast]'));
  if (toasts.length === 0) return;

  toasts.forEach((toastEl) => {
    const type = toastEl.getAttribute('data-toast-type') || 'success';
    const timeoutMs = type === 'error' ? 8000 : 4500;

    const closeBtn = toastEl.querySelector('[data-toast-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dismissToast(toastEl));
    }

    window.setTimeout(() => dismissToast(toastEl), timeoutMs);
  });
}

