import { SEARCH_DEBOUNCE_MS } from './constants.js';

function createLoadingState() {
  const container = document.createElement('div');
  container.className = 'text-center py-12 text-gray-500';
  
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
  
  container.appendChild(svg);
  container.appendChild(p);
  return container;
}

function createEmptyState() {
  const container = document.createElement('div');
  container.className = 'text-center py-12 text-gray-500';
  
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
  
  container.appendChild(svg);
  container.appendChild(title);
  container.appendChild(subtitle);
  return container;
}

function createErrorState() {
  const container = document.createElement('div');
  container.className = 'text-center py-12 text-red-500';
  
  const title = document.createElement('p');
  title.className = 'text-lg font-semibold';
  title.textContent = 'Erreur lors du chargement';
  
  const subtitle = document.createElement('p');
  subtitle.className = 'text-sm mt-2';
  subtitle.textContent = 'Veuillez réessayer plus tard';
  
  container.appendChild(title);
  container.appendChild(subtitle);
  return container;
}

function createRecipeCard(recipe, onRecipeSelect, currentSelectedSlot, currentSelectedMealType, currentSelectedDate, close) {
  const card = document.createElement('div');
  card.className = 'recipe-card cursor-pointer';
  
  const imageDiv = document.createElement('div');
  const imageUrl = recipe.image_url || '';
  if (imageUrl) {
    imageDiv.className = 'recipe-card__image';
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = recipe.titre || 'Sans titre';
    img.className = 'w-full h-32 object-cover';
    imageDiv.appendChild(img);
  } else {
    imageDiv.className = 'recipe-card__image bg-gray-200 flex items-center justify-center';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-12 h-12 text-gray-400');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z');
    svg.appendChild(path);
    imageDiv.appendChild(svg);
  }
  card.appendChild(imageDiv);
  
  const content = document.createElement('div');
  content.className = 'recipe-card__content p-3';
  
  const header = document.createElement('div');
  header.className = 'flex items-start justify-between mb-2';
  
  const title = document.createElement('h4');
  title.className = 'recipe-card__title text-sm font-semibold text-dark-blue line-clamp-2';
  title.textContent = recipe.titre || 'Sans titre';
  header.appendChild(title);
  
  if (recipe.is_favorite) {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    star.setAttribute('class', 'w-5 h-5 text-primary-green flex-shrink-0 ml-2');
    star.setAttribute('fill', 'currentColor');
    star.setAttribute('viewBox', '0 0 20 20');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z');
    star.appendChild(path);
    header.appendChild(star);
  }
  
  content.appendChild(header);
  
  const meta = document.createElement('div');
  meta.className = 'recipe-card__meta flex items-center gap-2 text-xs text-gray-600';
  
  const timeSpan = document.createElement('span');
  timeSpan.className = 'flex items-center gap-1';
  
  const timeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  timeSvg.setAttribute('class', 'w-4 h-4');
  timeSvg.setAttribute('fill', 'none');
  timeSvg.setAttribute('stroke', 'currentColor');
  timeSvg.setAttribute('viewBox', '0 0 24 24');
  const timePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  timePath.setAttribute('stroke-linecap', 'round');
  timePath.setAttribute('stroke-linejoin', 'round');
  timePath.setAttribute('stroke-width', '2');
  timePath.setAttribute('d', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z');
  timeSvg.appendChild(timePath);
  timeSpan.appendChild(timeSvg);
  
  const timeText = document.createTextNode(`${recipe.temps_preparation || 0}min`);
  timeSpan.appendChild(timeText);
  meta.appendChild(timeSpan);
  content.appendChild(meta);
  
  card.appendChild(content);
  
  card.addEventListener('click', () => {
    if (onRecipeSelect) {
      onRecipeSelect(recipe, currentSelectedSlot, currentSelectedMealType, currentSelectedDate);
    }
    close();
  });
  
  return card;
}

export function initRecipeModal(onRecipeSelect) {
  const recipeModal = document.getElementById('planning-recipe-modal');
  const recipeModalOverlay = document.getElementById('planning-recipe-modal-overlay');
  const recipeModalClose = document.getElementById('planning-recipe-modal-close');
  const recipeModalList = document.getElementById('planning-recipe-modal-list');
  const recipeModalSearch = document.getElementById('planning-recipe-modal-search');
  const recipeFilterButtons = document.querySelectorAll('.planning-recipe-filter-btn');
  
  if (!recipeModal || !recipeModalList) {
    return { open: () => {} };
  }
  
  let currentSelectedSlot = null;
  let currentSelectedMealType = null;
  let currentSelectedDate = null;
  let currentRecipeCategory = 'all';
  let currentRecipeSearch = '';
  
  async function loadRecipes() {
    while (recipeModalList.firstChild) {
      recipeModalList.removeChild(recipeModalList.firstChild);
    }
    recipeModalList.appendChild(createLoadingState());
    
    try {
      const params = new URLSearchParams();
      if (currentRecipeSearch) {
        params.append('search', currentRecipeSearch);
      }
      if (currentRecipeCategory !== 'all') {
        params.append('category', currentRecipeCategory);
      }
      
      const queryString = params.toString();
      let url = '/api/recipes';
      if (queryString) {
        url = `/api/recipes?${queryString}`;
      }
      const response = await fetch(url, {
        headers: { Accept: 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const recipes = await response.json();
      
      while (recipeModalList.firstChild) {
        recipeModalList.removeChild(recipeModalList.firstChild);
      }
      
      if (!recipes || recipes.length === 0) {
        recipeModalList.appendChild(createEmptyState());
        return;
      }
      
      renderRecipes(recipes);
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error);
      while (recipeModalList.firstChild) {
        recipeModalList.removeChild(recipeModalList.firstChild);
      }
      recipeModalList.appendChild(createErrorState());
    }
  }
  
  function renderRecipes(recipes) {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    
    recipes.forEach(recipe => {
      const card = createRecipeCard(recipe, onRecipeSelect, currentSelectedSlot, currentSelectedMealType, currentSelectedDate, close);
      grid.appendChild(card);
    });
    
    recipeModalList.appendChild(grid);
  }
  
  function open(slotId, mealType, date, currentMeal) {
    currentSelectedSlot = slotId;
    currentSelectedMealType = mealType;
    currentSelectedDate = date;
    
    currentRecipeCategory = 'all';
    currentRecipeSearch = '';
    if (recipeModalSearch) {
      recipeModalSearch.value = '';
    }
    
    recipeFilterButtons.forEach(btn => {
      if (btn.dataset.category === 'all') {
        btn.classList.add('active-filter');
      } else {
        btn.classList.remove('active-filter');
      }
    });
    
    loadRecipes();
    recipeModal.classList.remove('hidden');
  }
  
  function close() {
    recipeModal.classList.add('hidden');
    currentSelectedSlot = null;
    currentSelectedMealType = null;
    currentSelectedDate = null;
  }
  
  recipeFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      recipeFilterButtons.forEach(b => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');
      currentRecipeCategory = btn.dataset.category || 'all';
      loadRecipes();
    });
  });
  
  if (recipeModalSearch) {
    let searchTimeout;
    recipeModalSearch.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      currentRecipeSearch = e.target.value.trim();
      searchTimeout = setTimeout(() => {
        loadRecipes();
      }, SEARCH_DEBOUNCE_MS);
    });
  }
  
  if (recipeModalOverlay) {
    recipeModalOverlay.addEventListener('click', close);
  }
  
  if (recipeModalClose) {
    recipeModalClose.addEventListener('click', close);
  }
  
  return { open };
}
