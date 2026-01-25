// ============================================
// Module Week Modal - Modal de sélection de semaine
// ============================================

import {
  MONTHS_PER_YEAR,
  MONTH_NAMES,
  DAY_NAMES_SHORT,
  formatDateString,
  getMondayOfWeek,
  getFirstDayOfMonth,
  getDaysInMonth
} from '../utils/date-utils.js';

/**
 * Initialise la modal de sélection de semaine
 * @param {Function} onWeekSelect - Callback appelé lors de la sélection d'une semaine
 * @returns {Object} Objet avec les fonctions open et close
 */
export function initWeekModal(onWeekSelect) {
  const weekModal = document.getElementById('planning-week-modal');
  const weekModalOverlay = document.getElementById('planning-week-modal-overlay');
  const weekModalClose = document.getElementById('planning-week-modal-close');
  const calendarGrid = document.getElementById('planning-week-calendar');
  const calendarMonthYear = document.getElementById('planning-calendar-month-year');
  const calendarPrevMonth = document.getElementById('planning-calendar-prev-month');
  const calendarNextMonth = document.getElementById('planning-calendar-next-month');
  
  if (!weekModal || !calendarGrid) {
    return { open: () => {}, close: () => {} };
  }
  
  let calendarYear = new Date().getFullYear();
  let calendarMonth = new Date().getMonth();
  let currentStartDate = null;
  
  function createCalendarDayButton(year, month, day, isOtherMonth, selectedMonday) {
    const dayEl = document.createElement('button');
    dayEl.type = 'button';
    dayEl.className = 'p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors';
    
    if (isOtherMonth) {
      dayEl.className += ' text-gray-400';
    } else {
      dayEl.className += ' text-gray-700';
    }
    
    dayEl.textContent = String(day);
    
    // Vérifier si ce jour fait partie de la semaine sélectionnée
    const dayDate = new Date(year, month, day);
    const dayMonday = getMondayOfWeek(dayDate);
    
    if (selectedMonday && formatDateString(dayMonday) === formatDateString(selectedMonday) && !isOtherMonth) {
      dayEl.className += ' bg-primary-green text-white font-semibold';
    }
    
    // Gestion du clic
    dayEl.addEventListener('click', () => {
      if (!isOtherMonth && onWeekSelect) {
        const selectedMonday = getMondayOfWeek(dayDate);
        onWeekSelect(selectedMonday);
        close();
      }
    });
    
    return dayEl;
  }
  
  function renderWeekCalendar(selectedMonday) {
    if (!calendarGrid || !calendarMonthYear) return;
    
    // Vider le calendrier
    while (calendarGrid.firstChild) {
      calendarGrid.removeChild(calendarGrid.firstChild);
    }
    
    // En-têtes des jours
    DAY_NAMES_SHORT.forEach(dayName => {
      const header = document.createElement('div');
      header.className = 'text-center text-xs font-semibold text-gray-600 py-2';
      header.textContent = dayName;
      calendarGrid.appendChild(header);
    });
    
    // Obtenir le premier jour du mois
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    
    // Jours du mois précédent
    const prevMonth = calendarMonth === 0 ? MONTHS_PER_YEAR - 1 : calendarMonth - 1;
    const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dayEl = createCalendarDayButton(prevYear, prevMonth, day, true, selectedMonday);
      calendarGrid.appendChild(dayEl);
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = createCalendarDayButton(calendarYear, calendarMonth, day, false, selectedMonday);
      calendarGrid.appendChild(dayEl);
    }
    
    // Jours du mois suivant
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    const nextMonth = calendarMonth === MONTHS_PER_YEAR - 1 ? 0 : calendarMonth + 1;
    const nextYear = calendarMonth === MONTHS_PER_YEAR - 1 ? calendarYear + 1 : calendarYear;
    
    for (let day = 1; day <= remainingCells; day++) {
      const dayEl = createCalendarDayButton(nextYear, nextMonth, day, true, selectedMonday);
      calendarGrid.appendChild(dayEl);
    }
    
    // Mettre à jour le titre
    if (calendarMonthYear) {
      calendarMonthYear.textContent = `${MONTH_NAMES[calendarMonth]} ${calendarYear}`;
    }
  }
  
  /**
   * Ouvre la modal
   */
  function open(startDate) {
    currentStartDate = startDate;
    calendarYear = startDate.getFullYear();
    calendarMonth = startDate.getMonth();
    const selectedMonday = getMondayOfWeek(startDate);
    renderWeekCalendar(selectedMonday);
    weekModal.classList.remove('hidden');
  }
  
  /**
   * Ferme la modal
   */
  function close() {
    weekModal.classList.add('hidden');
  }
  
  // Navigation du calendrier
  if (calendarPrevMonth) {
    calendarPrevMonth.addEventListener('click', () => {
      calendarMonth--;
      if (calendarMonth < 0) {
        calendarMonth = MONTHS_PER_YEAR - 1;
        calendarYear--;
      }
      const selectedMonday = currentStartDate ? getMondayOfWeek(currentStartDate) : null;
      renderWeekCalendar(selectedMonday);
    });
  }
  
  if (calendarNextMonth) {
    calendarNextMonth.addEventListener('click', () => {
      calendarMonth++;
      if (calendarMonth >= MONTHS_PER_YEAR) {
        calendarMonth = 0;
        calendarYear++;
      }
      const selectedMonday = currentStartDate ? getMondayOfWeek(currentStartDate) : null;
      renderWeekCalendar(selectedMonday);
    });
  }
  
  // Fermer la modal
  if (weekModalOverlay) {
    weekModalOverlay.addEventListener('click', close);
  }
  
  if (weekModalClose) {
    weekModalClose.addEventListener('click', close);
  }
  
  return { open, close };
}
