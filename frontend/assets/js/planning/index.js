// ============================================
// Module Planification - Point d'entrée principal
// ============================================

import { getMondayOfWeek } from '../utils/date-utils.js';
import { loadMealsForWeek } from './data.js';
import { renderWeekGrid, updateWeekSelector, updateStatistics } from './render.js';
import { enableEditMode, disableEditMode } from './edit-mode.js';
import { initWeekModal } from './week-modal.js';
import { initRecipeModal } from './recipe-modal.js';
import { createFilledMealSlot } from './dom.js';

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

/**
 * Initialise la page de planification
 */
export function initPlanningPage() {
  const grid = document.getElementById('planning-week-grid');
  const weekSelector = document.getElementById('planning-week-selector');
  const weekText = document.getElementById('planning-week-text');
  const prevWeekBtn = document.getElementById('planning-prev-week');
  const nextWeekBtn = document.getElementById('planning-next-week');
  const editBtn = document.getElementById('planning-edit-btn');
  const editBtnText = document.getElementById('planning-edit-btn-text');
  const cancelBtn = document.getElementById('planning-cancel-btn');
  
  if (!grid || !weekSelector) return;
  
  let currentDate = new Date();
  let startDate = getMondayOfWeek(currentDate);
  let isEditMode = false;
  let recipeModal = null;
  
  function updateWeek() {
    updateWeekSelector(weekText, startDate);

    void loadMealsForWeek(startDate)
      .then((meals) => {
        renderWeekGrid(grid, startDate, meals, handleSlotClick);
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

  // Gestionnaire de sélection de recette
  function handleRecipeSelect(recipe, slotId, mealType, date) {
    if (!slotId || !mealType || !date) return;
    const meal = createMealFromRecipe(recipe);
    if (!meal) return;
    
    // Trouver le slot dans le DOM
    const slotElement = document.getElementById(slotId);
    if (!slotElement) return;
    
    // Créer un nouveau slot rempli avec la recette
    const dayIndex = getDayIndexFromSlotId(slotId);
    
    const newSlot = createFilledMealSlot(dayIndex, mealType, date, meal, handleSlotClick);
    
    // Remplacer l'ancien slot
    const parent = slotElement.parentNode;
    if (parent) {
      parent.replaceChild(newSlot, slotElement);
    }
    
    updateWeek();
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
  
  updateWeek();
}
