import { formatDateString } from '../utils/date-utils.js';

export function createAddButton() {
  const addBtn = document.createElement('div');
  addBtn.className = 'calendar-day__add';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-6 h-6');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', 'M12 4v16m8-8H4');

  svg.appendChild(path);
  addBtn.appendChild(svg);
  return addBtn;
}

export function createDayElement(options) {
  const { year, month, day, isOtherMonth, isTodayDay, onDayClick } = options;
  const dayEl = document.createElement('div');
  dayEl.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${isTodayDay ? 'today' : ''}`;

  const dayNumber = document.createElement('div');
  dayNumber.className = 'calendar-day__number';
  dayNumber.textContent = String(day);
  dayEl.appendChild(dayNumber);

  const mealsContainer = document.createElement('div');
  mealsContainer.className = 'calendar-day__meals';
  const dateStr = formatDateString(year, month, day);
  mealsContainer.setAttribute('data-date', dateStr);
  dayEl.appendChild(mealsContainer);

  if (!isOtherMonth) {
    const addBtn = createAddButton();
    dayEl.appendChild(addBtn);
  }

  if (onDayClick) {
    dayEl.addEventListener('click', () => {
      if (!isOtherMonth) {
        onDayClick(year, month, day, dateStr);
      }
    });
  }

  return dayEl;
}
