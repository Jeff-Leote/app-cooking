import { formatDateString } from '../utils/date-utils.js';

function normalizeMealPlanItem(item) {
  if (!item) return null;
  let date = null;
  if (typeof item.date === 'string') {
    date = item.date.slice(0, 10);
  }

  let type = null;
  if (item.moment === 'dejeuner') {
    type = 'lunch';
  } else if (item.moment === 'diner') {
    type = 'dinner';
  }
  if (!date || !type) return null;

  const recipe = item.recipe || null;
  let recipe_id = null;
  let recipe_title = '';
  let recipe_image = null;
  let prep_time = 0;
  let note = null;
  if (recipe) {
    recipe_id = recipe.id ?? null;
    recipe_title = recipe.titre || '';
    recipe_image = recipe.image_url || null;
    prep_time = recipe.temps_preparation || 0;
  }
  if (item.recipe_id != null) {
    recipe_id = item.recipe_id;
  }
  if (item.note != null) {
    note = item.note;
  }

  return {
    id: item.id,
    date,
    type,
    recipe_id,
    recipe_title,
    recipe_image,
    prep_time,
    note,
  };
}

export async function loadMealsForWeek(startDate) {
  const weekStart = new Date(startDate);
  const weekEnd = new Date(startDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const url = new URL('/api/meal-plan', window.location.origin);
  url.searchParams.set('startDate', formatDateString(weekStart));
  url.searchParams.set('endDate', formatDateString(weekEnd));

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map(normalizeMealPlanItem).filter(Boolean);
  } catch (e) {
    console.warn('Erreur lors du chargement des repas:', e);
    return [];
  }
}
