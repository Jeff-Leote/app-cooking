// ============================================
// Module Render - Fonctions de rendu pour la planification
// ============================================

import { DAYS_PER_WEEK, formatDateString, formatWeekRange } from '../utils/date-utils.js';
import { TOTAL_MEAL_SLOTS } from './constants.js';
import { createDayColumn, createEmptyMealSlot, createFilledMealSlot } from './dom.js';

/**
 * Rend la grille hebdomadaire avec les repas
 * @param {HTMLElement} grid - Élément conteneur de la grille
 * @param {Date} startDate - Date de début de la semaine (lundi)
 * @param {Array} meals - Liste des repas de la semaine
 * @param {Function} onSlotClick - Callback appelé lors du clic sur un slot
 */
export function renderWeekGrid(grid, startDate, meals, onSlotClick, onDelete) {
  // Vider la grille
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  
  // Créer les colonnes pour chaque jour
  for (let i = 0; i < DAYS_PER_WEEK; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const column = createDayColumn(i, date);
    grid.appendChild(column);
    
    // Remplir les slots
    const lunchContainer = document.getElementById(`planning-slot-${i}-lunch`);
    const dinnerContainer = document.getElementById(`planning-slot-${i}-dinner`);
    
    const dateStr = formatDateString(date);
    const lunchMeal = meals.find(m => m.date === dateStr && m.type === 'lunch');
    const dinnerMeal = meals.find(m => m.date === dateStr && m.type === 'dinner');
    
    if (lunchMeal) {
      const lunchSlot = createFilledMealSlot(i, 'lunch', date, lunchMeal, onSlotClick, onDelete);
      lunchContainer.appendChild(lunchSlot);
    } else {
      const lunchSlot = createEmptyMealSlot(i, 'lunch', date, onSlotClick);
      lunchContainer.appendChild(lunchSlot);
    }
    
    if (dinnerMeal) {
      const dinnerSlot = createFilledMealSlot(i, 'dinner', date, dinnerMeal, onSlotClick, onDelete);
      dinnerContainer.appendChild(dinnerSlot);
    } else {
      const dinnerSlot = createEmptyMealSlot(i, 'dinner', date, onSlotClick);
      dinnerContainer.appendChild(dinnerSlot);
    }
  }
}

/**
 * Met à jour le sélecteur de semaine
 * @param {HTMLElement} selector - Élément du sélecteur
 * @param {Date} startDate - Date de début de la semaine
 */
export function updateWeekSelector(selector, startDate) {
  if (selector) {
    selector.textContent = `Semaine du ${formatWeekRange(startDate)}`;
  }
}

/**
 * Met à jour les statistiques de la semaine
 * @param {Array} meals - Liste des repas
 */
export function updateStatistics(meals) {
  const totalMeals = meals.length;
  const totalTime = meals.reduce((sum, meal) => sum + (meal.prep_time || meal.prepTime || 0), 0);
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;
  
  const totalMealsEl = document.getElementById('planning-total-meals');
  const totalTimeEl = document.getElementById('planning-total-time');
  const countEl = document.getElementById('planning-count-number');
  
  if (totalMealsEl) {
    totalMealsEl.textContent = `${totalMeals}/${TOTAL_MEAL_SLOTS}`;
  }
  
  if (totalTimeEl) {
    if (hours > 0) {
      totalTimeEl.textContent = `~${hours}h${String(minutes).padStart(2, '0')}`;
    } else {
      totalTimeEl.textContent = `~${minutes}min`;
    }
  }
  
  if (countEl) {
    countEl.textContent = totalMeals;
  }
}
