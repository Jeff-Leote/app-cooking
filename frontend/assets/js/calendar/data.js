import { formatDateString } from '../utils/date-utils.js';

function toYyyyMmDd(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    // ISO (YYYY-MM-DDTHH:mm:ss.sssZ) ou déjà YYYY-MM-DD
    return value.length >= 10 ? value.slice(0, 10) : null;
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
  const date = toYyyyMmDd(item?.date);
  const type = momentToType(item?.moment);
  if (!date || !type) return null;

  const recipe = item?.recipe || null;
  return {
    id: item?.id,
    date,
    type,
    recipeId: item?.recipe_id ?? recipe?.id ?? null,
    recipeTitle: recipe?.titre ?? '',
    recipeImage: recipe?.image_url ?? null,
    prep_time: recipe?.temps_preparation ?? 0,
    note: item?.note ?? null,
  };
}

export async function loadMealsForMonth(currentYear, currentMonth) {
  const start = new Date(currentYear, currentMonth, 1);
  const end = new Date(currentYear, currentMonth + 1, 0);

  const params = new URLSearchParams({
    startDate: formatDateString(start),
    endDate: formatDateString(end),
  });

  try {
    const res = await fetch(`/api/meal-plan?${params.toString()}`, {
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
