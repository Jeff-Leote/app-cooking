// ============================================
// Module Recette - Page de détail d'une recette
// ============================================

import { showToast } from '../common/toasts.js';
import { addMissingIngredientsToShoppingList } from '../stock/index.js';

export function initRecipeShowPage() {
  const addMissingBtn = document.getElementById('add-missing-to-shopping-list-btn');
  
  if (!addMissingBtn) return;

  addMissingBtn.addEventListener('click', async () => {
    const recipeId = addMissingBtn.dataset.recipeId;
    if (!recipeId) return;

    try {
      // Charger la recette avec ses ingrédients
      const url = new URL(`/api/recipes/${recipeId}`, window.location.origin);
      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const recipe = await res.json();

      if (!recipe.recipeIngredients || recipe.recipeIngredients.length === 0) {
        showToast('Cette recette n\'a pas d\'ingrédients', 'error');
        return;
      }

      // Ajouter les ingrédients manquants à la liste de courses
      const added = await addMissingIngredientsToShoppingList(recipe.recipeIngredients);
      
      if (added > 0) {
        showToast(`${added} ingrédient(s) ajouté(s) à la liste de courses`, 'success');
      } else {
        showToast('Tous les ingrédients sont déjà en stock', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste:', error);
      showToast('Erreur lors de l\'ajout à la liste de courses', 'error');
    }
  });
}
