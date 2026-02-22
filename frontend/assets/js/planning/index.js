// ============================================
// Module Planification - Point d'entrée principal
// ============================================

import { getMondayOfWeek, formatDateString, formatWeekTitle } from '../utils/date-utils.js';
import { loadMealsForWeek } from './data.js';
import { renderWeekGrid, updateWeekSelector, updateStatistics } from './render.js';
import { enableEditMode, disableEditMode } from './edit-mode.js';
import { initWeekModal } from './week-modal.js';
import { initRecipeModal } from './recipe-modal.js';
import { createFilledMealSlot } from './dom.js';
import { addMissingIngredientsToShoppingList } from '../stock/index.js';
import { showToast } from '../common/toasts.js';

function createMealFromRecipe(recipe) {
  if (!recipe || recipe.id == null) {
    return null;
  }
  return {
    recipe_id: recipe.id,
    recipe_title: recipe.titre,
    recipe_image: recipe.image_url,
    prep_time: recipe.temps_preparation || 0,
  };
}

function getDayIndexFromSlotId(slotId) {
  return parseInt(slotId.match(/\d+/)?.[0] || '0');
}

function convertMealTypeToMoment(mealType) {
  if (mealType === 'lunch') return 'dejeuner';
  if (mealType === 'dinner') return 'diner';
  return mealType;
}

async function saveMealPlan(mealId, date, mealType, recipeId) {
  const moment = convertMealTypeToMoment(mealType);
  const dateStr = formatDateString(date);
  
  const payload = {
    date: dateStr,
    moment: moment,
    recipe_id: recipeId || null,
  };
  
  const url = new URL('/api/meal-plan', window.location.origin);
  const options = {
    method: mealId ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  };
  
  if (mealId) {
    url.pathname = `/api/meal-plan/${mealId}`;
  }
  
  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du repas:', error);
    throw error;
  }
}

async function deleteMealPlan(mealId) {
  const url = new URL(`/api/meal-plan/${mealId}`, window.location.origin);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok && response.status !== 204) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du repas:', error);
    throw error;
  }
}

/**
 * Initialise la page de planification
 */
export function initPlanningPage() {
  const grid = document.getElementById('planning-week-grid');
  const weekSelector = document.getElementById('planning-week-selector');
  const weekText = document.getElementById('planning-week-text');
  const weekNavTitle = document.getElementById('planning-week-navigation-title');
  const prevWeekBtn = document.getElementById('planning-prev-week');
  const nextWeekBtn = document.getElementById('planning-next-week');
  const todayBtn = document.getElementById('planning-today');
  const editBtn = document.getElementById('planning-edit-btn');
  const editBtnText = document.getElementById('planning-edit-btn-text');
  const cancelBtn = document.getElementById('planning-cancel-btn');
  
  if (!grid || !weekSelector) return;
  
  let currentDate = new Date();
  let startDate = getMondayOfWeek(currentDate);
  let isEditMode = false;
  let recipeModal = null;
  
  async function processPastMeals() {
    try {
      const url = new URL('/api/meal-plan/process-past-meals', window.location.origin);
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.processed > 0) {
        console.log(`${result.processed} repas passés traités, ingrédients retirés du stock`);
      }
    } catch (error) {
      console.error('Erreur lors du traitement des repas passés:', error);
    }
  }

  function updateWeek() {
    updateWeekSelector(weekText, startDate);
    if (weekNavTitle) {
      weekNavTitle.textContent = formatWeekTitle(startDate);
    }

    void loadMealsForWeek(startDate)
      .then((meals) => {
        renderWeekGrid(grid, startDate, meals, handleSlotClick, handleDeleteMeal);
        updateStatistics(meals);
      })
      .catch((err) => console.error('Erreur updateWeek:', err));
  }

  // Gestionnaire de clic sur un slot
  function handleSlotClick(slotId, mealType, date, meal) {
    if (isEditMode && recipeModal) {
      recipeModal.open(slotId, mealType, date, meal);
    }
  }

  // Gestionnaire de suppression d'un repas
  async function handleDeleteMeal(mealId) {
    if (!mealId) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      return;
    }
    
    try {
      // IMPORTANT: Charger le repas et la recette AVANT de supprimer le repas
      const mealUrl = new URL(`/api/meal-plan/${mealId}`, window.location.origin);
      const mealRes = await fetch(mealUrl.toString(), {
        headers: { Accept: 'application/json' },
      });
      
      let recipeId = null;
      let fullRecipe = null;
      
      if (mealRes.ok) {
        const meal = await mealRes.json();
        recipeId = meal.recipe_id;
        
        // Si le repas a une recette, charger la recette complète avec ses ingrédients
        if (recipeId) {
          try {
            const recipeUrl = new URL(`/api/recipes/${recipeId}`, window.location.origin);
            const recipeRes = await fetch(recipeUrl.toString(), {
              headers: { Accept: 'application/json' },
            });
            
            if (recipeRes.ok) {
              fullRecipe = await recipeRes.json();
            }
          } catch (error) {
            console.error('Erreur lors du chargement de la recette:', error);
          }
        }
      }
      
      // Maintenant supprimer le repas
      await deleteMealPlan(mealId);
      
      // Si on a chargé la recette avec ses ingrédients, supprimer les ingrédients de la liste de courses
      if (fullRecipe && fullRecipe.recipeIngredients && fullRecipe.recipeIngredients.length > 0) {
        try {
          // Supprimer les ingrédients de la liste de courses
          const removed = await removeIngredientsFromShoppingList(fullRecipe.recipeIngredients);
          if (removed > 0) {
            showToast(`${removed} ingrédient(s) retiré(s) de la liste de courses`, 'info');
          }
          
          // Remettre les ingrédients dans le stock
          await restoreIngredientsToStock(fullRecipe.recipeIngredients);
        } catch (error) {
          console.error('Erreur lors de la gestion des ingrédients:', error);
        }
      }
      
      showToast('Repas supprimé avec succès', 'success');
      // Recharger la semaine pour mettre à jour l'affichage
      updateWeek();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Impossible de supprimer le repas. Veuillez réessayer.', 'error');
    }
  }

  // Fonction pour supprimer les ingrédients de la liste de courses
  async function removeIngredientsFromShoppingList(recipeIngredients) {
    if (!recipeIngredients || recipeIngredients.length === 0) {
      return 0;
    }

    try {
      // Charger tous les items de la liste de courses
      const shoppingListUrl = new URL('/api/shopping-items', window.location.origin);
      const shoppingListRes = await fetch(shoppingListUrl.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (!shoppingListRes.ok) {
        return 0;
      }

      const shoppingItems = await shoppingListRes.json();
      if (!Array.isArray(shoppingItems) || shoppingItems.length === 0) {
        return 0;
      }

      // Créer un Map pour compter combien d'items on doit supprimer pour chaque ingrédient
      // Clé: nom normalisé, Valeur: nombre d'items à supprimer
      const ingredientCounts = new Map();
      for (const ri of recipeIngredients) {
        const ingredient = ri.ingredient || {};
        const ingredientName = (ingredient.nom || ri.nom || '').toLowerCase().trim();
        if (ingredientName) {
          const currentCount = ingredientCounts.get(ingredientName) || 0;
          ingredientCounts.set(ingredientName, currentCount + 1);
        }
      }

      // Trouver et supprimer UN SEUL item par ingrédient de la recette
      let removed = 0;
      const itemsToRemove = [];
      
      for (const item of shoppingItems) {
        const itemName = (item.nom || '').toLowerCase().trim();
        const countToRemove = ingredientCounts.get(itemName);
        
        // Si cet ingrédient doit être supprimé et qu'on n'a pas encore supprimé assez
        if (countToRemove && countToRemove > 0) {
          // Vérifier qu'on n'a pas déjà marqué cet item pour suppression
          if (!itemsToRemove.find(i => i.id === item.id)) {
            itemsToRemove.push(item);
            // Décrémenter le compteur pour cet ingrédient
            ingredientCounts.set(itemName, countToRemove - 1);
          }
        }
      }

      // Supprimer les items trouvés
      for (const item of itemsToRemove) {
        try {
          const deleteUrl = new URL(`/api/shopping-items/${item.id}`, window.location.origin);
          const deleteRes = await fetch(deleteUrl.toString(), {
            method: 'DELETE',
          });
          if (deleteRes.ok || deleteRes.status === 204) {
            removed++;
          }
        } catch (error) {
          // Ignorer les erreurs individuelles
        }
      }

      return removed;
    } catch (error) {
      console.error('Erreur lors de la suppression des ingrédients:', error);
      return 0;
    }
  }

  // Fonction pour remettre les ingrédients dans le stock
  async function restoreIngredientsToStock(recipeIngredients) {
    for (const ri of recipeIngredients) {
      const ingredient = ri.ingredient || {};
      const ingredientId = ingredient.id || ri.ingredient_id;
      
      if (ingredientId) {
        try {
          // Vérifier si l'ingrédient est déjà en stock
          const stockUrl = new URL(`/api/stock/ingredient/${ingredientId}`, window.location.origin);
          const stockRes = await fetch(stockUrl.toString(), {
            headers: { Accept: 'application/json' },
          });
          
          if (stockRes.ok) {
            // L'ingrédient est déjà en stock, on ne fait rien
            continue;
          }
          
          // Si 404, l'ingrédient n'est pas en stock, on continue pour l'ajouter
          if (stockRes.status === 404) {
            // L'ingrédient n'est pas en stock, on continue pour l'ajouter
          } else {
            // Autre erreur, on passe
            continue;
          }
          
          // Ajouter l'ingrédient au stock
          const addStockUrl = new URL('/api/stock', window.location.origin);
          await fetch(addStockUrl.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              ingredient_id: ingredientId,
              quantite: ri.quantite || null,
            }),
          });
        } catch (error) {
          console.error(`Erreur lors de la remise en stock de ${ingredient.nom}:`, error);
        }
      }
    }
  }

  // Gestionnaire de sélection de recette
  async function handleRecipeSelect(recipe, slotId, mealType, date, currentMeal) {
    if (!slotId || !mealType || !date) return;
    const meal = createMealFromRecipe(recipe);
    if (!meal || !meal.recipe_id) return;
    
    // Trouver le slot dans le DOM
    const slotElement = document.getElementById(slotId);
    if (!slotElement) return;
    
    try {
      // Sauvegarder le repas dans le backend
      const mealId = currentMeal?.id || null;
      await saveMealPlan(mealId, date, mealType, meal.recipe_id);
      
      // Toast de confirmation pour la planification
      const mealTypeLabel = mealType === 'lunch' ? 'Déjeuner' : 'Dîner';
      const dateFormatted = new Date(date).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
      if (mealId) {
        showToast(`Repas modifié : ${meal.recipe_title} (${mealTypeLabel})`, 'success');
      } else {
        showToast(`Repas planifié : ${meal.recipe_title} (${mealTypeLabel}) le ${dateFormatted}`, 'success');
      }
      
      // Charger la recette complète avec ses ingrédients pour ajouter à la liste de courses
      try {
        const recipeUrl = new URL(`/api/recipes/${meal.recipe_id}`, window.location.origin);
        const recipeRes = await fetch(recipeUrl.toString(), {
          headers: { Accept: 'application/json' },
        });
        
        if (recipeRes.ok) {
          const fullRecipe = await recipeRes.json();
          console.log('Recette chargée pour ajout à la liste:', fullRecipe);
          
          if (fullRecipe.recipeIngredients && fullRecipe.recipeIngredients.length > 0) {
            console.log(`${fullRecipe.recipeIngredients.length} ingrédient(s) trouvé(s) dans la recette`);
            // Ajouter les ingrédients manquants à la liste de courses
            const added = await addMissingIngredientsToShoppingList(fullRecipe.recipeIngredients);
            if (added > 0) {
              // Petit délai pour que le toast précédent soit visible
              setTimeout(() => {
                showToast(`${added} ingrédient(s) ajouté(s) à la liste de courses`, 'success');
              }, 500);
            } else {
              console.log('Aucun ingrédient ajouté (tous en stock ou aucun manquant)');
            }
          } else {
            console.log('La recette n\'a pas d\'ingrédients associés');
          }
        } else {
          console.error(`Erreur HTTP ${recipeRes.status} lors du chargement de la recette`);
        }
      } catch (ingredientError) {
        // Ne pas bloquer si l'ajout à la liste de courses échoue
        console.warn('Impossible d\'ajouter les ingrédients à la liste de courses:', ingredientError);
      }
      
      // Recharger la semaine pour afficher le repas sauvegardé
      updateWeek();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showToast('Impossible de sauvegarder le repas. Veuillez réessayer.', 'error');
    }
  }
  
  const weekModal = initWeekModal(async (selectedDate) => {
    startDate = selectedDate;
    updateWeek();
  });
  
  recipeModal = initRecipeModal(handleRecipeSelect);
  
  // Exporter la fonction pour l'utiliser dans les slots
  if (recipeModal && recipeModal.open) {
    window.openRecipeModal = recipeModal.open;
  }
  
  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate() - 7);
      updateWeek();
    });
  }
  
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => {
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate() + 7);
      updateWeek();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      currentDate = new Date();
      startDate = getMondayOfWeek(currentDate);
      updateWeek();
    });
  }
  
  // Sélecteur de semaine
  weekSelector.addEventListener('click', () => {
    weekModal.open(startDate);
  });
  
  // Bouton Modifier/Valider
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (isEditMode) {
        // Mode validation : sauvegarder les modifications
        console.log('Valider la planification');
        // TODO: Envoyer les données au backend
        isEditMode = false;
        disableEditMode(grid, editBtn, editBtnText, cancelBtn);
      } else {
        // Mode normal : activer l'édition
        isEditMode = true;
        enableEditMode(grid, editBtn, editBtnText, cancelBtn);
      }
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      isEditMode = false;
      disableEditMode(grid, editBtn, editBtnText, cancelBtn);
      updateWeek();
    });
  }
  
  // Traiter automatiquement les repas passés au chargement
  void processPastMeals();
  
  updateWeek();
}
