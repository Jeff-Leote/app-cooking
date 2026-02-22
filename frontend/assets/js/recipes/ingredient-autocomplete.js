// ============================================
// Module Autocomplete pour les ingrédients
// ============================================

let allIngredients = [];
let autocompleteTimeout = null;

/**
 * Charge tous les ingrédients depuis l'API
 */
async function loadAllIngredients() {
  if (allIngredients.length > 0) {
    return allIngredients;
  }
  
  try {
    const url = new URL('/api/ingredients', window.location.origin);
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    
    if (res.ok) {
      allIngredients = await res.json();
      return allIngredients;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des ingrédients:', error);
  }
  
  return [];
}

/**
 * Filtre les ingrédients selon le terme de recherche
 */
function filterIngredients(searchTerm, ingredients) {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  const term = searchTerm.toLowerCase().trim();
  return ingredients.filter(ing => 
    ing.nom && ing.nom.toLowerCase().includes(term)
  ).slice(0, 10); // Limiter à 10 résultats
}

/**
 * Affiche les suggestions d'autocomplete
 */
function showAutocomplete(input, suggestions) {
  const autocompleteDiv = input.parentElement.querySelector('.ingredient-autocomplete');
  if (!autocompleteDiv) return;
  
  if (suggestions.length === 0) {
    autocompleteDiv.classList.add('hidden');
    return;
  }
  
  autocompleteDiv.innerHTML = '';
  suggestions.forEach(ingredient => {
    const item = document.createElement('div');
    item.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
    item.textContent = ingredient.nom;
    item.dataset.ingredientId = ingredient.id;
    item.dataset.ingredientName = ingredient.nom;
    
    item.addEventListener('click', () => {
      input.value = ingredient.nom;
      input.dataset.ingredientId = ingredient.id;
      autocompleteDiv.classList.add('hidden');
      
      // Déclencher un événement pour mettre à jour le champ caché si nécessaire
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    autocompleteDiv.appendChild(item);
  });
  
  autocompleteDiv.classList.remove('hidden');
}

/**
 * Cache l'autocomplete
 */
function hideAutocomplete(input) {
  const autocompleteDiv = input.parentElement.querySelector('.ingredient-autocomplete');
  if (autocompleteDiv) {
    autocompleteDiv.classList.add('hidden');
  }
}

/**
 * Initialise l'autocomplete pour un champ de recherche d'ingrédient
 */
export function initIngredientAutocomplete(input) {
  if (!input || !input.classList.contains('ingredient-search-input')) {
    return;
  }
  
  // Charger les ingrédients au premier focus
  input.addEventListener('focus', async () => {
    await loadAllIngredients();
  });
  
  // Recherche lors de la saisie
  input.addEventListener('input', async (e) => {
    const searchTerm = e.target.value;
    
    // Annuler le timeout précédent
    if (autocompleteTimeout) {
      clearTimeout(autocompleteTimeout);
    }
    
    // Attendre 300ms avant de rechercher
    autocompleteTimeout = setTimeout(async () => {
      await loadAllIngredients();
      const suggestions = filterIngredients(searchTerm, allIngredients);
      showAutocomplete(input, suggestions);
    }, 300);
  });
  
  // Cacher l'autocomplete lors de la perte de focus
  input.addEventListener('blur', (e) => {
    // Petit délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      hideAutocomplete(e.target);
    }, 200);
  });
  
  // Gérer les touches du clavier
  input.addEventListener('keydown', (e) => {
    const autocompleteDiv = input.parentElement.querySelector('.ingredient-autocomplete');
    if (!autocompleteDiv || autocompleteDiv.classList.contains('hidden')) {
      return;
    }
    
    const items = autocompleteDiv.querySelectorAll('div[data-ingredient-id]');
    const currentIndex = Array.from(items).findIndex(item => item.classList.contains('bg-gray-200'));
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items.forEach((item, idx) => {
        item.classList.toggle('bg-gray-200', idx === nextIndex);
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items.forEach((item, idx) => {
        item.classList.toggle('bg-gray-200', idx === prevIndex);
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = items[currentIndex];
      if (selected) {
        selected.click();
      }
    } else if (e.key === 'Escape') {
      hideAutocomplete(input);
    }
  });
}

/**
 * Initialise tous les champs d'autocomplete sur la page
 */
export function initAllIngredientAutocompletes() {
  const inputs = document.querySelectorAll('.ingredient-search-input');
  inputs.forEach(input => {
    initIngredientAutocomplete(input);
  });
}

// Exposer les fonctions globalement pour les templates Twig
if (typeof window !== 'undefined') {
  window.initIngredientAutocomplete = initIngredientAutocomplete;
  window.initAllIngredientAutocompletes = initAllIngredientAutocompletes;
}
