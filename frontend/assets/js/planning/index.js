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
  
  // Gestionnaire de sélection de recette
  function handleRecipeSelect(recipe, slotId, mealType, date) {
    if (!slotId || !mealType || !date) return;
    
    // Trouver le slot dans le DOM
    const slotElement = document.getElementById(slotId);
    if (!slotElement) return;
    
    // Créer un nouveau slot rempli avec la recette
    const dayIndex = parseInt(slotId.match(/\d+/)?.[0] || '0');
    const meal = {
      recipe_id: recipe.id,
      recipe_title: recipe.titre,
      recipe_image: recipe.image_url,
      prep_time: recipe.temps_preparation || 0
    };
    
    const newSlot = createFilledMealSlot(dayIndex, mealType, date, meal, handleSlotClick);
    
    // Remplacer l'ancien slot
    const parent = slotElement.parentNode;
    if (parent) {
      parent.replaceChild(newSlot, slotElement);
    }
    
    void updateWeek();
  }
  
  // Gestionnaire de clic sur un slot
  function handleSlotClick(slotId, mealType, date, meal) {
    if (isEditMode && recipeModal) {
      recipeModal.open(slotId, mealType, date, meal);
    }
  }
  
  const weekModal = initWeekModal(async (selectedDate) => {
    startDate = selectedDate;
    await updateWeek();
  });
  
  recipeModal = initRecipeModal(handleRecipeSelect);
  
  // Exporter la fonction pour l'utiliser dans les slots
  if (recipeModal && recipeModal.open) {
    window.openRecipeModal = recipeModal.open;
  }
  
  async function updateWeek() {
    updateWeekSelector(weekText, startDate);
    const meals = await loadMealsForWeek(startDate);
    renderWeekGrid(grid, startDate, meals, handleSlotClick);
    updateStatistics(meals);
  }
  
  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', async () => {
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate() - 7);
      await updateWeek();
    });
  }
  
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', async () => {
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate() + 7);
      await updateWeek();
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
    cancelBtn.addEventListener('click', async () => {
      isEditMode = false;
      disableEditMode(grid, editBtn, editBtnText, cancelBtn);
      await updateWeek();
    });
  }
  
  void updateWeek();
}
