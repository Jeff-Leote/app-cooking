import { formatDateString } from '../utils/date-utils.js';

export async function loadMealsForWeek(startDate) {
  const weekStart = new Date(startDate);
  const weekEnd = new Date(startDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const params = new URLSearchParams({
    startDate: formatDateString(weekStart),
    endDate: formatDateString(weekEnd),
  });

  try {
    const res = await fetch(`/api/meal-plan?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => {
        const date = typeof item?.date === 'string' ? item.date.slice(0, 10) : null;
        const moment = item?.moment;
        const type = moment === 'dejeuner' ? 'lunch' : moment === 'diner' ? 'dinner' : null;
        if (!date || !type) return null;

        const recipe = item?.recipe || null;
        return {
          id: item?.id,
          date,
          type,
          recipe_id: item?.recipe_id ?? recipe?.id ?? null,
          recipe_title: recipe?.titre ?? '',
          recipe_image: recipe?.image_url ?? null,
          prep_time: recipe?.temps_preparation ?? 0,
          note: item?.note ?? null,
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.warn('Erreur lors du chargement des repas:', e);
    return [];
  }
}
