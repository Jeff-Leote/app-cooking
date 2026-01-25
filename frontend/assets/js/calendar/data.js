export async function loadMealsForMonth(currentYear, currentMonth) {
  try {
    return [];
  } catch (e) {
    console.warn('Erreur lors du chargement des repas:', e);
    return [];
  }
}
