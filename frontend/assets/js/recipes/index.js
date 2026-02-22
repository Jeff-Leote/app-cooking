// ============================================
// Module Recettes - Gestion de la page des recettes
// ============================================

// Constante pour le debounce de recherche
const SEARCH_DEBOUNCE_MS = 300;

function toSafePositiveIntId(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function buildApiItemUrl(resource, id) {
  // Whitelist stricte pour éviter toute "URL utilisateur" (signalée SSRF par certains scanners).
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
  p.textContent = 'Chargement des recettes...';

  loadingDiv.appendChild(svg);
  loadingDiv.appendChild(p);
  return loadingDiv;
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
  path.setAttribute('d', 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z');
  svg.appendChild(path);

  const title = document.createElement('p');
  title.className = 'text-lg font-semibold';
  title.textContent = 'Aucune recette trouvée';

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

function buildApiUrl(state) {
  const params = new URLSearchParams();
  if (state.searchQuery) {
    params.append('search', state.searchQuery);
  }
  if (state.currentCategory !== 'all') {
    params.append('category', state.currentCategory);
  }
  const queryString = params.toString();
  if (!queryString) {
    return '/api/recipes';
  }
  return `/api/recipes?${queryString}`;
}

function createRecipeCard(recipe, reloadRecipes) {
  const recipeId = toSafePositiveIntId(recipe?.id);
  if (recipeId == null) {
    // Évite la construction d'URL avec une valeur non fiable.
    return document.createElement('div');
  }

  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.dataset.recipeId = String(recipeId);

  if (recipe.image_url) {
    const img = document.createElement('img');
    img.className = 'recipe-card__image';
    img.src = recipe.image_url;
    img.alt = recipe.titre || 'Recette';
    card.appendChild(img);
  }

  const content = document.createElement('div');
  content.className = 'recipe-card__content';

  const header = document.createElement('div');
  header.className = 'flex items-start justify-between mb-2';

  const title = document.createElement('h3');
  title.className = 'recipe-card__title';
  title.textContent = recipe.titre || 'Sans titre';
  header.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'flex items-center gap-2';

  const editBtn = createIconButton({
    title: 'Modifier',
    className: 'p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-dark-blue transition-colors',
    pathD: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    onClick: (e) => {
      e.stopPropagation();
      window.location.href = `/recipes/${recipeId}/edit`;
    },
  });

  const deleteBtn = createIconButton({
    title: 'Supprimer',
    className: 'p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors',
    pathD: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14',
    onClick: async (e) => {
      e.stopPropagation();
      const ok = window.confirm('Supprimer cette recette ?');
      if (!ok) return;
      try {
        const url = buildApiItemUrl('recipes', recipeId);
        const res = await fetch(url, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (typeof reloadRecipes === 'function') {
          await reloadRecipes();
        }
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        window.alert("Impossible de supprimer la recette pour le moment.");
      }
    },
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  header.appendChild(actions);
  content.appendChild(header);

  const meta = document.createElement('div');
  meta.className = 'recipe-card__meta flex items-center gap-2 text-xs text-gray-600';
  const prep = recipe.temps_preparation != null ? String(recipe.temps_preparation) : null;
  if (prep) {
    const span = document.createElement('span');
    span.className = 'recipe-card__meta-item flex items-center gap-1';
    span.textContent = `${prep} min`;
    meta.appendChild(span);
  }
  content.appendChild(meta);

  card.appendChild(content);

  card.addEventListener('click', () => {
    window.location.href = `/recipes/${recipeId}`;
  });

  return card;
}

function renderRecipes(container, recipes, reloadRecipes) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (!recipes || recipes.length === 0) {
    container.appendChild(createEmptyState());
    return;
  }

  recipes.forEach((r) => {
    container.appendChild(createRecipeCard(r, reloadRecipes));
  });
}


export function initRecipesPage() {
  const container = document.getElementById('recipes-container');
  if (!container) return;

  // État de l'application
  const state = {
    currentCategory: 'all',
    currentView: 'grid',
    searchQuery: '',
  };

  // Éléments DOM
  const filterButtons = document.querySelectorAll('.recipe-filter-btn');
  const viewButtons = document.querySelectorAll('.view-toggle-btn');
  const searchInput = document.getElementById('recipe-search');
  const countElement = document.getElementById('recipes-count-number');

  function createLoadRecipes() {
    async function loadRecipes() {
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

      const recipes = await response.json();
      if (!Array.isArray(recipes)) {
        throw new Error('Réponse invalide: attendu un tableau');
      }

      if (countElement) {
        countElement.textContent = String(recipes.length || 0);
      }

      renderRecipes(container, recipes, loadRecipes);

      if (state.currentView === 'list') {
        container.classList.add('list-view');
        document.querySelectorAll('.recipe-card').forEach((card) => {
          card.classList.add('list-view');
        });
      } else {
        container.classList.remove('list-view');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error);
      renderRecipes(container, [], loadRecipes);
      if (countElement) {
        countElement.textContent = '0';
      }
    }
  }
    return loadRecipes;
  }

  const loadRecipes = createLoadRecipes();


  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Retirer la classe active de tous les boutons
      filterButtons.forEach((b) => b.classList.remove('active-filter'));
      // Ajouter la classe active au bouton cliqué
      btn.classList.add('active-filter');
      // Mettre à jour la catégorie active
      state.currentCategory = btn.dataset.category || 'all';
      void loadRecipes().catch((err) => console.error('Erreur loadRecipes:', err));
    });
  });

  // Gestion du changement de vue (grille/liste)
  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Retirer la classe active de tous les boutons
      viewButtons.forEach((b) => b.classList.remove('active-view'));
      // Ajouter la classe active au bouton cliqué
      btn.classList.add('active-view');
      // Mettre à jour la vue active
      state.currentView = btn.dataset.view || 'grid';
      // Appliquer la classe à la grille
      if (state.currentView === 'list') {
        container.classList.add('list-view');
        document.querySelectorAll('.recipe-card').forEach((card) => {
          card.classList.add('list-view');
        });
      } else {
        container.classList.remove('list-view');
        document.querySelectorAll('.recipe-card').forEach((card) => {
          card.classList.remove('list-view');
        });
      }
    });
  });

  // Gestion de la recherche
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      state.searchQuery = e.target.value.trim();
      // Debounce : attendre après la dernière frappe
      searchTimeout = setTimeout(() => {
        void loadRecipes().catch((err) => console.error('Erreur loadRecipes:', err));
      }, SEARCH_DEBOUNCE_MS);
    });
  }

  // Initialisation
  const activeBtn = document.querySelector('.recipe-filter-btn.active-filter');
  if (activeBtn) {
    state.currentCategory = activeBtn.dataset.category || 'all';
  }
  void loadRecipes().catch((err) => console.error('Erreur loadRecipes:', err));
}
