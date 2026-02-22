// ============================================
// Module Utilitaires de Date - Fonctions partagées
// ============================================

// Constantes communes
export const DAYS_PER_WEEK = 7;
export const MONTHS_PER_YEAR = 12;

// Noms des mois en français
export const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Noms des jours de la semaine
export const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
export const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// ============================================
// Fonctions de formatage de date
// ============================================

/**
 * Formate une date en string YYYY-MM-DD
 * @param {Date|number} dateOrYear - Objet Date ou année
 * @param {number} [month] - Mois (0-11) si dateOrYear est une année
 * @param {number} [day] - Jour si dateOrYear est une année
 * @returns {string} Date formatée YYYY-MM-DD
 */
export function formatDateString(dateOrYear, month, day) {
  let year, monthNum, dayNum;
  
  if (dateOrYear instanceof Date) {
    year = dateOrYear.getFullYear();
    monthNum = dateOrYear.getMonth() + 1;
    dayNum = dateOrYear.getDate();
  } else {
    year = dateOrYear;
    monthNum = month + 1;
    dayNum = day;
  }
  
  return `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
}

/**
 * Formate un en-tête de jour (ex: "Lundi 22 Jan")
 * @param {Date} date - Date à formater
 * @returns {string} En-tête formaté
 */
export function formatDayHeader(date) {
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const dayName = DAY_NAMES[dayIndex];
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()].substring(0, 3);
  return `${dayName} ${day} ${month}`;
}

/**
 * Formate une plage de semaine (ex: "22-28 Jan")
 * @param {Date} startDate - Date de début de la semaine
 * @returns {string} Plage formatée
 */
export function formatWeekRange(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = MONTH_NAMES[startDate.getMonth()];
  
  return `${startDay}-${endDay} ${month.substring(0, 3)}`;
}

/**
 * Formate le titre complet de la semaine (ex: "Semaine du 22-28 Janvier 2024")
 * @param {Date} startDate - Date de début de la semaine
 * @returns {string} Titre formaté
 */
export function formatWeekTitle(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = MONTH_NAMES[startDate.getMonth()];
  const endMonth = MONTH_NAMES[endDate.getMonth()];
  const year = startDate.getFullYear();
  
  // Si la semaine est dans le même mois
  if (startDate.getMonth() === endDate.getMonth()) {
    return `Semaine du ${startDay}-${endDay} ${startMonth} ${year}`;
  } else {
    // Si la semaine s'étend sur deux mois
    return `Semaine du ${startDay} ${startMonth.substring(0, 3)} - ${endDay} ${endMonth} ${year}`;
  }
}

// ============================================
// Fonctions utilitaires de date
// ============================================

/**
 * Obtient le lundi de la semaine pour une date donnée
 * @param {Date} date - Date de référence
 * @returns {Date} Date du lundi de la semaine
 */
export function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi = 0
  return new Date(d.setDate(diff));
}

/**
 * Obtient le premier jour du mois (0 = Lundi, 1 = Mardi, etc.)
 * @param {number} year - Année
 * @param {number} month - Mois (0-11)
 * @returns {number} Jour de la semaine (0-6, lundi = 0)
 */
export function getFirstDayOfMonth(year, month) {
  const date = new Date(year, month, 1);
  // Convertir en Lundi = 0 (au lieu de Dimanche = 0)
  return (date.getDay() + 6) % 7;
}

/**
 * Obtient le nombre de jours dans un mois
 * @param {number} year - Année
 * @param {number} month - Mois (0-11)
 * @returns {number} Nombre de jours dans le mois
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Vérifie si une date est aujourd'hui
 * @param {number} year - Année
 * @param {number} month - Mois (0-11)
 * @param {number} day - Jour
 * @returns {boolean} True si la date est aujourd'hui
 */
export function isTodayDate(year, month, day) {
  const today = new Date();
  return (
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()
  );
}
