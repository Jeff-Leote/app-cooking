// ============================================
// Module Calendrier - Point d'entrée principal
// ============================================

import { MONTHS_PER_YEAR } from '../utils/date-utils.js';
import { renderCalendarGrid, updateMonthYearTitle, renderMeals } from './render.js';
import { loadMealsForMonth } from './data.js';

/**
 * Initialise la page du calendrier
 */
export function initCalendarPage() {
  const grid = document.getElementById('calendar-grid');
  const monthYearEl = document.getElementById('calendar-month-year');
  const prevBtn = document.getElementById('calendar-prev-month');
  const nextBtn = document.getElementById('calendar-next-month');
  const todayBtn = document.getElementById('calendar-today');

  if (!grid || !monthYearEl) return;

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  // Gestionnaire de clic sur un jour
  function handleDayClick(year, month, day, dateStr) {
    console.log('Jour cliqué:', year, month + 1, day);
    // TODO: Navigation vers la création de repas pour ce jour
    // window.location.href = `/planning/new?date=${dateStr}`;
  }

  function updateCalendar() {
    renderCalendarGrid(grid, currentYear, currentMonth, handleDayClick);
    updateMonthYearTitle(monthYearEl, currentYear, currentMonth);

    void loadMealsForMonth(currentYear, currentMonth)
      .then((meals) => renderMeals(meals))
      .catch((err) => console.error('Erreur updateCalendar:', err));
  }

  // Navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = MONTHS_PER_YEAR - 1;
        currentYear--;
      }
      updateCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth >= MONTHS_PER_YEAR) {
        currentMonth = 0;
        currentYear++;
      }
      updateCalendar();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const today = new Date();
      currentMonth = today.getMonth();
      currentYear = today.getFullYear();
      updateCalendar();
    });
  }

  updateCalendar();
}
