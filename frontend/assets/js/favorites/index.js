// ============================================
// Module Favoris - Gestion de la page des recettes favorites
// ============================================

import { showToast } from '../common/toasts.js';

const SEARCH_DEBOUNCE_MS = 300;

function toSafePositiveIntId(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function buildApiItemUrl(resource, id) {
  if (resource !== 'recipes') {
    throw new Error(`Unsupported resource: ${resource}`);
  }
  const safeId = toSafePositiveIntId(id);
  if (safeId == null) {
    throw new Error('Invalid id');
  }
  const url = new URL(`/api/${resource}/${safeId}`, window.location.origin);
  return url.toString();
}

async function loadFavorites(search = '') {
  const url = new URL('/api/recipes', window.location.origin);
  url.searchParams.set('favorites', 'true');
  if (search) {
    url.searchParams.set('search', search);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement des favoris:', error);
    return [];
  }
}

function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer';
  card.dataset.recipeId = recipe.id;

  const image = document.createElement('div');
  image.className = 'w-full h-48 bg-gray-200 overflow-hidden';
  if (recipe.image_url) {
    const img = document.createElement('img');
    img.src = recipe.image_url;
    img.alt = recipe.titre;
    img.className = 'w-full h-full object-cover';
    image.appendChild(img);
  } else {
    image.innerHTML = `
      <div class="w-full h-full flex items-center justify-center text-gray-400">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    `;
  }
  card.appendChild(image);

  const content = document.createElement('div');
  content.className = 'p-4';
  
  const title = document.createElement('h3');
  title.className = 'text-lg font-bold text-dark-blue mb-2 line-clamp-2';
  title.textContent = recipe.titre;
  content.appendChild(title);

  if (recipe.temps_preparation) {
    const time = document.createElement('div');
    time.className = 'flex items-center gap-1 text-sm text-gray-600';
    time.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>${recipe.temps_preparation} min</span>
    `;
    content.appendChild(time);
  }

  const actions = document.createElement('div');
  actions.className = 'flex items-center justify-between mt-4 pt-4 border-t border-gray-200';
  
  const viewBtn = document.createElement('button');
  viewBtn.className = 'text-primary-green hover:text-dark-blue font-semibold text-sm';
  viewBtn.textContent = 'Voir';
  viewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = `/recipes/${recipe.id}`;
  });
  actions.appendChild(viewBtn);

  const favoriteBtn = document.createElement('button');
  favoriteBtn.className = 'text-red-500 hover:text-red-700';
  favoriteBtn.innerHTML = `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  `;
  favoriteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await toggleFavorite(recipe.id);
  });
  actions.appendChild(favoriteBtn);

  content.appendChild(actions);
  card.appendChild(content);

  card.addEventListener('click', () => {
    window.location.href = `/recipes/${recipe.id}`;
  });

  return card;
}

async function toggleFavorite(recipeId) {
  try {
    const url = buildApiItemUrl('recipes', recipeId);
    const res = await fetch(`${url}/favorite`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    showToast('Recette retirée des favoris', 'success');
    await renderFavorites();
  } catch (error) {
    console.error('Erreur lors du changement de favori:', error);
    showToast('Erreur lors du changement de favori', 'error');
  }
}

async function renderFavorites(search = '') {
  const container = document.getElementById('favorites-container');
  const emptyState = document.getElementById('favorites-empty');
  const countEl = document.getElementById('favorites-count-number');
  
  if (!container) return;

  container.innerHTML = '';
  const favorites = await loadFavorites(search);
  
  if (countEl) {
    countEl.textContent = favorites.length;
  }

  if (favorites.length === 0) {
    if (emptyState) {
      emptyState.classList.remove('hidden');
    }
    return;
  }

  if (emptyState) {
    emptyState.classList.add('hidden');
  }

  favorites.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    container.appendChild(card);
  });
}

export function initFavoritesPage() {
  const container = document.getElementById('favorites-container');
  const searchInput = document.getElementById('favorite-search');
  
  if (!container) return;

  let searchTimeout;
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderFavorites(e.target.value);
      }, SEARCH_DEBOUNCE_MS);
    });
  }

  renderFavorites();
}
