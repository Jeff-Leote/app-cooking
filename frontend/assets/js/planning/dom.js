import { formatDateString, formatDayHeader } from '../utils/date-utils.js';

function createAddIcon() {
  const addIcon = document.createElement('div');
  addIcon.className = 'planning-meal-slot__add';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-8 h-8');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', 'M12 4v16m8-8H4');
  
  svg.appendChild(path);
  addIcon.appendChild(svg);
  return addIcon;
}

function createPlaceholderImage() {
  const image = document.createElement('div');
  image.className = 'planning-meal-card__image planning-meal-card__image--placeholder';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-8 h-8 text-gray-400');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z');
  
  svg.appendChild(path);
  image.appendChild(svg);
  return image;
}

function createTimeElement(prepTime) {
  const time = document.createElement('div');
  time.className = 'planning-meal-card__time';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-4 h-4');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z');
  
  svg.appendChild(path);
  time.appendChild(svg);
  
  const span = document.createElement('span');
  span.textContent = `${prepTime}min`;
  time.appendChild(span);
  
  return time;
}

export function createEmptyMealSlot(dayIndex, mealType, date, onSlotClick) {
  const slot = document.createElement('div');
  slot.className = 'planning-meal-slot planning-meal-slot--empty';
  slot.id = `planning-slot-${dayIndex}-${mealType}`;
  slot.dataset.dayIndex = dayIndex;
  slot.dataset.mealType = mealType;
  slot.dataset.date = formatDateString(date);
  
  const addIcon = createAddIcon();
  slot.appendChild(addIcon);
  
  if (onSlotClick) {
    slot.addEventListener('click', () => {
      if (slot.closest('.planning-edit-mode')) {
        onSlotClick(slot.id, mealType, date, null);
      }
    });
  }
  
  return slot;
}

function createDeleteButton(mealId, onDelete) {
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'planning-meal-card__delete';
  deleteBtn.setAttribute('aria-label', 'Supprimer ce repas');
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-4 h-4');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16');
  
  svg.appendChild(path);
  deleteBtn.appendChild(svg);
  
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onDelete && mealId) {
      onDelete(mealId);
    }
  });
  
  return deleteBtn;
}

export function createFilledMealSlot(dayIndex, mealType, date, meal, onSlotClick, onDelete) {
  const slot = document.createElement('div');
  slot.className = 'planning-meal-slot planning-meal-slot--filled';
  slot.id = `planning-slot-${dayIndex}-${mealType}`;
  slot.dataset.dayIndex = dayIndex;
  slot.dataset.mealType = mealType;
  slot.dataset.date = formatDateString(date);
  
  const card = document.createElement('div');
  card.className = 'planning-meal-card';
  
  const image = document.createElement('div');
  const imageUrl = meal.recipe_image || meal.image;
  if (imageUrl) {
    image.className = 'planning-meal-card__image';
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = meal.recipe_title || meal.title || 'Recette';
    image.appendChild(img);
  } else {
    image.appendChild(createPlaceholderImage());
  }
  card.appendChild(image);
  
  const content = document.createElement('div');
  content.className = 'planning-meal-card__content';
  
  const title = document.createElement('div');
  title.className = 'planning-meal-card__title';
  title.textContent = meal.recipe_title || meal.title || 'Recette';
  content.appendChild(title);
  
  const meta = document.createElement('div');
  meta.className = 'planning-meal-card__meta';
  
  const prepTime = meal.prep_time || meal.prepTime || 0;
  if (prepTime > 0) {
    meta.appendChild(createTimeElement(prepTime));
  }
  
  content.appendChild(meta);
  card.appendChild(content);
  
  // Ajouter le bouton de suppression si on est en mode édition et qu'on a un mealId
  const mealId = meal.id || meal.meal_id;
  if (mealId && onDelete) {
    const deleteBtn = createDeleteButton(mealId, onDelete);
    card.appendChild(deleteBtn);
  }
  
  slot.appendChild(card);
  
  if (onSlotClick) {
    slot.addEventListener('click', () => {
      if (slot.closest('.planning-edit-mode')) {
        onSlotClick(slot.id, mealType, date, meal);
      }
    });
  }
  
  return slot;
}

export function createDayColumn(dayIndex, date) {
  const column = document.createElement('div');
  column.className = 'planning-day-column';
  
  const header = document.createElement('div');
  header.className = 'planning-day-header';
  header.textContent = formatDayHeader(date);
  column.appendChild(header);
  
  const lunchSlot = document.createElement('div');
  lunchSlot.className = 'planning-meal-type';
  
  const lunchLabel = document.createElement('div');
  lunchLabel.className = 'planning-meal-type__label';
  lunchLabel.textContent = 'Déjeuner';
  lunchSlot.appendChild(lunchLabel);
  
  const lunchContainer = document.createElement('div');
  lunchContainer.id = `planning-slot-${dayIndex}-lunch`;
  lunchSlot.appendChild(lunchContainer);
  column.appendChild(lunchSlot);
  
  const dinnerSlot = document.createElement('div');
  dinnerSlot.className = 'planning-meal-type';
  
  const dinnerLabel = document.createElement('div');
  dinnerLabel.className = 'planning-meal-type__label';
  dinnerLabel.textContent = 'Dîner';
  dinnerSlot.appendChild(dinnerLabel);
  
  const dinnerContainer = document.createElement('div');
  dinnerContainer.id = `planning-slot-${dayIndex}-dinner`;
  dinnerSlot.appendChild(dinnerContainer);
  column.appendChild(dinnerSlot);
  
  return column;
}
