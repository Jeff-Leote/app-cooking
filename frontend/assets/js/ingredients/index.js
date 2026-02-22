const SEARCH_DEBOUNCE_MS = 300;

function toSafePositiveIntId(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function buildApiItemUrl(resource, id) {
  // Whitelist stricte pour éviter toute "URL utilisateur" (signalée SSRF par certains scanners).
  if (resource !== 'ingredients') {
    throw new Error(`Unsupported resource: ${resource}`);
  }
  const safeId = toSafePositiveIntId(id);
  if (safeId == null) {
    throw new Error('Invalid id');
  }
  const url = new URL(`/api/${resource}/${safeId}`, window.location.origin);
  return url.toString();
}

function getCategoryActiveClasses(categoryKey) {
  if (!categoryKey || categoryKey === 'all' || !CATEGORY_CONFIG[categoryKey]) {
    return { bg: 'bg-primary-green', text: 'text-white' };
  }
  const config = CATEGORY_CONFIG[categoryKey];
  // Version plus foncée pour l'état actif
  const activeBg = config.bg.replace(/-100$/, '-500').replace(/-200$/, '-600');
  return { bg: activeBg, text: 'text-white' };
}

function getCategoryBaseClasses(categoryKey) {
  if (!categoryKey || categoryKey === 'all' || !CATEGORY_CONFIG[categoryKey]) {
    return { bg: 'bg-white', text: 'text-gray-700' };
  }
  const config = CATEGORY_CONFIG[categoryKey];
  return { bg: config.bg, text: config.text };
}

function applyCategoryColorsToFilters() {
  const filterButtons = document.querySelectorAll('.ingredient-filter-btn');
  filterButtons.forEach((btn) => {
    const filterValue = btn.dataset.filter;
    const baseClasses = getCategoryBaseClasses(filterValue);
    // Nettoyer les classes de couleur existantes
    btn.className = btn.className.replace(/bg-\w+-\d+|text-\w+-\d+/g, '').trim();
    // Ajouter les nouvelles classes
    btn.classList.add(baseClasses.bg, baseClasses.text, 'border-transparent');
  });
}

function setupFilters(container, state, loadIngredients) {
  const filterButtons = document.querySelectorAll('.ingredient-filter-btn');
  if (filterButtons.length === 0) {
    return;
  }

  // Appliquer les couleurs aux boutons au chargement
  applyCategoryColorsToFilters();

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Réinitialiser tous les boutons
      filterButtons.forEach((b) => {
        b.classList.remove('active-filter');
        const filterValue = b.dataset.filter;
        const baseClasses = getCategoryBaseClasses(filterValue);
        b.className = b.className.replace(/bg-\w+-\d+|text-\w+-\d+/g, '').trim();
        b.classList.add('ingredient-filter-btn', 'px-4', 'py-2', 'rounded-lg', 'font-semibold', 'text-sm', 'transition-all', 'duration-200', baseClasses.bg, baseClasses.text, 'border-transparent');
      });
      
      // Appliquer le style actif au bouton sélectionné
      const filterValue = btn.dataset.filter;
      const activeClasses = getCategoryActiveClasses(filterValue);
      btn.className = btn.className.replace(/bg-\w+-\d+|text-\w+-\d+/g, '').trim();
      btn.classList.add('ingredient-filter-btn', 'px-4', 'py-2', 'rounded-lg', 'font-semibold', 'text-sm', 'transition-all', 'duration-200', activeClasses.bg, activeClasses.text, 'border-transparent', 'active-filter');
      
      state.currentFilter = filterValue || 'all';
      void loadIngredients().catch((err) => console.error('Erreur loadIngredients:', err));
    });
  });
}

function setupViewToggle(container, state) {
  const viewButtons = document.querySelectorAll('.view-toggle-btn');
  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      viewButtons.forEach((b) => b.classList.remove('active-view'));
      btn.classList.add('active-view');
      state.currentView = btn.dataset.view || 'grid';
      if (state.currentView === 'list') {
        container.classList.add('list-view');
        document.querySelectorAll('.ingredient-card').forEach((card) => {
          card.classList.add('list-view');
        });
      } else {
        container.classList.remove('list-view');
        document.querySelectorAll('.ingredient-card').forEach((card) => {
          card.classList.remove('list-view');
        });
      }
    });
  });
}

function setupSearch(searchInput, state, loadIngredients) {
  if (!searchInput) return;
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    state.searchQuery = e.target.value.trim();
    searchTimeout = setTimeout(() => {
      void loadIngredients().catch((err) => console.error('Erreur loadIngredients:', err));
    }, SEARCH_DEBOUNCE_MS);
  });
}

function buildApiUrl(state) {
  const params = new URLSearchParams();
  if (state.searchQuery) {
    params.append('search', state.searchQuery);
  }
  if (state.currentFilter !== 'all') {
    // Catégorie alimentaire (enum Prisma)
    params.append('categorie', state.currentFilter);
  }
  const queryString = params.toString();
  if (queryString) {
    return `/api/ingredients?${queryString}`;
  }
  return '/api/ingredients';
}


function createEmptyState() {
  const emptyState = document.createElement('div');
  emptyState.className = 'col-span-full text-center py-12 text-gray-500';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-16 h-16 mx-auto mb-4 text-gray-300');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10');
  svg.appendChild(path);
  
  const title = document.createElement('p');
  title.className = 'text-lg font-semibold';
  title.textContent = 'Aucun ingrédient trouvé';
  
  const subtitle = document.createElement('p');
  subtitle.className = 'text-sm mt-2';
  subtitle.textContent = 'Essayez de modifier vos critères de recherche';
  
  emptyState.appendChild(svg);
  emptyState.appendChild(title);
  emptyState.appendChild(subtitle);
  return emptyState;
}

function createIconButton({ title, className, pathD, onClick }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.title = title;
  btn.setAttribute('aria-label', title);
  btn.className = className;
  btn.addEventListener('click', onClick);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-4 h-4');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  btn.appendChild(svg);

  return btn;
}

function createLoadingState() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'col-span-full text-center py-12 text-gray-500';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-16 h-16 mx-auto mb-4 text-gray-300 animate-spin');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15');
  svg.appendChild(path);

  const p = document.createElement('p');
  p.className = 'text-lg font-semibold';
  p.textContent = 'Chargement des ingrédients...';

  loadingDiv.appendChild(svg);
  loadingDiv.appendChild(p);
  return loadingDiv;
}

// Mapping des catégories avec leurs labels et couleurs
const CATEGORY_CONFIG = {
  FECULENTS: { label: 'Féculents', bg: 'bg-amber-100', text: 'text-amber-800' },
  PROTEINES: { label: 'Protéines', bg: 'bg-red-100', text: 'text-red-800' },
  LEGUMES: { label: 'Légumes', bg: 'bg-green-100', text: 'text-green-800' },
  FRUITS: { label: 'Fruits', bg: 'bg-orange-100', text: 'text-orange-800' },
  PRODUITS_LAITIERS: { label: 'Produits laitiers', bg: 'bg-blue-100', text: 'text-blue-800' },
  MATIERES_GRASSES: { label: 'Matières grasses', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  CEREALES: { label: 'Céréales', bg: 'bg-amber-200', text: 'text-amber-900' },
  OLEAGINEUX: { label: 'Oléagineux', bg: 'bg-yellow-200', text: 'text-yellow-900' },
  PRODUITS_SUCRES: { label: 'Produits sucrés', bg: 'bg-pink-100', text: 'text-pink-800' },
  PRODUITS_SALES: { label: 'Produits salés', bg: 'bg-gray-100', text: 'text-gray-800' },
  BOISSONS: { label: 'Boissons', bg: 'bg-cyan-100', text: 'text-cyan-800' },
  EPICES_CONDIMENTS: { label: 'Épices et condiments', bg: 'bg-purple-100', text: 'text-purple-800' },
};

function createIngredientBadges(ingredient) {
  const meta = document.createElement('div');
  meta.className = 'ingredient-card__meta flex flex-wrap gap-2 mt-2';

  const cat = ingredient?.categorie;
  const config = cat ? CATEGORY_CONFIG[String(cat)] : null;
  if (config) {
    const badge = document.createElement('span');
    badge.className = `px-2 py-1 ${config.bg} ${config.text} rounded-full text-xs font-semibold`;
    badge.textContent = config.label;
    meta.appendChild(badge);
  }

  return meta.children.length > 0 ? meta : null;
}

function createIngredientActions(ingredientId, reloadIngredients) {
  const actions = document.createElement('div');
  actions.className = 'flex items-center gap-2';

  const editBtn = createIconButton({
    title: 'Modifier',
    className: 'p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-dark-blue transition-colors',
    pathD: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    onClick: (e) => {
      e.stopPropagation();
      window.location.href = `/ingredients/${ingredientId}/edit`;
    },
  });

  const deleteBtn = createIconButton({
    title: 'Supprimer',
    className: 'p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors',
    pathD: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14',
    onClick: async (e) => {
      e.stopPropagation();
      const ok = window.confirm('Supprimer cet ingrédient ?');
      if (!ok) return;
      try {
        const url = buildApiItemUrl('ingredients', ingredientId);
        const res = await fetch(url, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        if (typeof reloadIngredients === 'function') {
          await reloadIngredients();
        }
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        window.alert("Impossible de supprimer l'ingrédient pour le moment.");
      }
    },
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  return actions;
}

function createIngredientCard(ingredient, reloadIngredients) {
  const ingredientId = toSafePositiveIntId(ingredient?.id);
  if (ingredientId == null) {
    // Évite la construction d'URL avec une valeur non fiable.
    return document.createElement('div');
  }

  const card = document.createElement('div');
  card.className = 'ingredient-card recipe-card';
  card.dataset.ingredientId = String(ingredientId);

  const content = document.createElement('div');
  content.className = 'ingredient-card__content p-4';

  const header = document.createElement('div');
  header.className = 'flex items-start justify-between mb-2';

  const title = document.createElement('h3');
  title.className = 'ingredient-card__title recipe-card__title';
  title.textContent = ingredient.nom || 'Sans nom';
  header.appendChild(title);

  const actions = createIngredientActions(ingredientId, reloadIngredients);
  header.appendChild(actions);
  content.appendChild(header);

  const meta = createIngredientBadges(ingredient);
  if (meta) content.appendChild(meta);

  card.appendChild(content);

  card.addEventListener('click', () => {
    window.location.href = `/ingredients/${ingredientId}/edit`;
  });

  return card;
}

function renderIngredients(container, ingredients, reloadIngredients) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (ingredients.length === 0) {
    container.appendChild(createEmptyState());
    return;
  }

  ingredients.forEach(ingredient => {
    const card = createIngredientCard(ingredient, reloadIngredients);
    container.appendChild(card);
  });
}

export function initIngredientsPage() {
  const container = document.getElementById('ingredients-container');
  if (!container) {
    return;
  }

  const state = {
    currentFilter: 'all',
    currentView: 'grid',
    searchQuery: ''
  };

  const searchInput = document.getElementById('ingredient-search');
  const countElement = document.getElementById('ingredients-count-number');

  async function loadIngredients() {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    container.appendChild(createLoadingState());
    
    try {
      const url = buildApiUrl(state);
      const response = await fetch(url, {
        headers: { Accept: 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const ingredients = await response.json();
      
      if (!Array.isArray(ingredients)) {
        throw new Error('Réponse invalide: attendu un tableau');
      }
      
      if (countElement) {
        countElement.textContent = ingredients.length || 0;
      }
      renderIngredients(container, ingredients || [], loadIngredients);

      // Réappliquer la vue courante après re-render
      if (state.currentView === 'list') {
        container.classList.add('list-view');
        document.querySelectorAll('.ingredient-card').forEach((card) => {
          card.classList.add('list-view');
        });
      } else {
        container.classList.remove('list-view');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ingrédients:', error);
      
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'col-span-full text-center py-12 text-red-500';
      const errorSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      errorSvg.setAttribute('class', 'w-16 h-16 mx-auto mb-4 text-red-300');
      errorSvg.setAttribute('fill', 'none');
      errorSvg.setAttribute('stroke', 'currentColor');
      errorSvg.setAttribute('viewBox', '0 0 24 24');
      const errorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      errorPath.setAttribute('stroke-linecap', 'round');
      errorPath.setAttribute('stroke-linejoin', 'round');
      errorPath.setAttribute('stroke-width', '2');
      errorPath.setAttribute('d', 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
      errorSvg.appendChild(errorPath);
      const errorTitle = document.createElement('p');
      errorTitle.className = 'text-lg font-semibold';
      errorTitle.textContent = 'Erreur lors du chargement';
      const errorSubtitle = document.createElement('p');
      errorSubtitle.className = 'text-sm mt-2';
      errorSubtitle.textContent = error.message || 'Une erreur est survenue';
      errorDiv.appendChild(errorSvg);
      errorDiv.appendChild(errorTitle);
      errorDiv.appendChild(errorSubtitle);
      container.appendChild(errorDiv);
      
      if (countElement) {
        countElement.textContent = '0';
      }
    }
  }

  setupFilters(container, state, loadIngredients);
  setupViewToggle(container, state);
  setupSearch(searchInput, state, loadIngredients);

  const activeFilterBtn = document.querySelector('.ingredient-filter-btn.active-filter');
  if (activeFilterBtn) {
    state.currentFilter = activeFilterBtn.dataset.filter || 'all';
  }

  void loadIngredients().catch((err) => console.error('Erreur loadIngredients:', err));
}
