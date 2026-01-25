import { formatDateString } from '../utils/date-utils.js';

export async function loadMealsForWeek(startDate) {
  try {
    return [];
  } catch (e) {
    console.warn('Erreur lors du chargement des repas:', e);
    return [];
  }
}
