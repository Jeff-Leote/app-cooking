// ============================================
// Module Render - Fonctions de rendu pour le calendrier
// ============================================

import {
  MONTHS_PER_YEAR,
  DAYS_PER_WEEK,
  MONTH_NAMES,
  getFirstDayOfMonth,
  getDaysInMonth,
  isTodayDate
} from '../utils/date-utils.js';
import { WEEKS_PER_CALENDAR } from './constants.js';
import { createDayElement } from './dom.js';

/**
 * Rend les jours du mois précédent
 */
export function renderPreviousMonthDays(grid, currentYear, currentMonth, firstDay) {
  const prevMonth = currentMonth === 0 ? MONTHS_PER_YEAR - 1 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayEl = createDayElement({ year: prevYear, month: prevMonth, day, isOtherMonth: true, isTodayDay: false, onDayClick: null });
    grid.appendChild(dayEl);
  }
}

/**
 * Rend les jours du mois actuel
 */
export function renderCurrentMonthDays(grid, currentYear, currentMonth, daysInMonth, onDayClick) {
  for (let day = 1; day <= daysInMonth; day++) {
    const isTodayDay = isTodayDate(currentYear, currentMonth, day);
    const dayEl = createDayElement({ year: currentYear, month: currentMonth, day, isOtherMonth: false, isTodayDay, onDayClick });
    grid.appendChild(dayEl);
  }
}

/**
 * Rend les jours du mois suivant
 */
export function renderNextMonthDays(grid, currentYear, currentMonth, totalCells) {
  const maxCells = WEEKS_PER_CALENDAR * DAYS_PER_WEEK;
  const remainingCells = maxCells - totalCells;

  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = currentMonth === MONTHS_PER_YEAR - 1 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === MONTHS_PER_YEAR - 1 ? currentYear + 1 : currentYear;
    const dayEl = createDayElement({ year: nextYear, month: nextMonth, day, isOtherMonth: true, isTodayDay: false, onDayClick: null });
    grid.appendChild(dayEl);
  }
}

/**
 * Rend la grille du calendrier
 */
export function renderCalendarGrid(grid, currentYear, currentMonth, onDayClick) {
  // Vider la grille de manière sécurisée
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }

  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  renderPreviousMonthDays(grid, currentYear, currentMonth, firstDay);
  renderCurrentMonthDays(grid, currentYear, currentMonth, daysInMonth, onDayClick);

  const totalCells = firstDay + daysInMonth;
  renderNextMonthDays(grid, currentYear, currentMonth, totalCells);
}

/**
 * Met à jour le titre du calendrier (mois et année)
 */
export function updateMonthYearTitle(monthYearEl, currentYear, currentMonth) {
  if (monthYearEl) {
    monthYearEl.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  }
}

/**
 * Rend les repas dans le calendrier
 */
export function renderMeals(meals) {
  // Grouper les repas par date
  const mealsByDate = {};
  meals.forEach((meal) => {
    if (!mealsByDate[meal.date]) {
      mealsByDate[meal.date] = [];
    }
    mealsByDate[meal.date].push(meal);
  });

  // Pour chaque date, trier les repas (Déjeuner avant Dîner) et les afficher
  Object.keys(mealsByDate).forEach((dateStr) => {
    const mealEl = document.querySelector(`[data-date="${dateStr}"]`);
    if (!mealEl) return;

    // Cacher le bouton add si un repas est ajouté
    const dayCard = mealEl.closest('.calendar-day');
    if (dayCard) {
      const addBtn = dayCard.querySelector('.calendar-day__add');
      if (addBtn) {
        addBtn.style.display = 'none';
      }
    }

    // Trier les repas : lunch (Déjeuner) avant dinner (Dîner)
    const sortedMeals = mealsByDate[dateStr].sort((a, b) => {
      if (a.type === 'lunch' && b.type === 'dinner') return -1;
      if (a.type === 'dinner' && b.type === 'lunch') return 1;
      return 0;
    });

    // Afficher les repas dans l'ordre trié
    sortedMeals.forEach((meal) => {
      const mealDiv = document.createElement('div');
      mealDiv.className = `calendar-meal calendar-meal--${meal.type}`;
      const mealTypeLabel = meal.type === 'lunch' ? 'Déjeuner' : 'Dîner';
      mealDiv.textContent = `${mealTypeLabel} ${meal.recipeTitle || ''}`;
      mealEl.appendChild(mealDiv);
    });
  });
}
