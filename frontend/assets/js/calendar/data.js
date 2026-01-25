import { formatDateString } from '../utils/date-utils.js';

function toYyyyMmDd(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    // ISO (YYYY-MM-DDTHH:mm:ss.sssZ) ou déjà YYYY-MM-DD
    if (value.length < 10) return null;
    return value.slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return null;
}

function momentToType(moment) {
  if (moment === 'dejeuner') return 'lunch';
  if (moment === 'diner') return 'dinner';
  return null;
}

function normalizeMealPlanItem(item) {
  if (!item) return null;
  const date = toYyyyMmDd(item.date);
  const type = momentToType(item.moment);
  if (!date || !type) return null;

  const recipe = item.recipe || null;
  let recipeId = null;
  let recipeTitle = '';
  let recipeImage = null;
  let prep_time = 0;
  let note = null;
  if (recipe) {
    recipeId = recipe.id ?? null;
    recipeTitle = recipe.titre || '';
    recipeImage = recipe.image_url || null;
    prep_time = recipe.temps_preparation || 0;
  }
  if (item.recipe_id != null) {
    recipeId = item.recipe_id;
  }
  if (item.note != null) {
    note = item.note;
  }

  return {
    id: item.id,
    date,
    type,
    recipeId,
    recipeTitle,
    recipeImage,
    prep_time,
    note,
  };
}

export async function loadMealsForMonth(currentYear, currentMonth) {
  const start = new Date(currentYear, currentMonth, 1);
  const end = new Date(currentYear, currentMonth + 1, 0);

  const url = new URL('/api/meal-plan', window.location.origin);
  url.searchParams.set('startDate', formatDateString(start));
  url.searchParams.set('endDate', formatDateString(end));

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
