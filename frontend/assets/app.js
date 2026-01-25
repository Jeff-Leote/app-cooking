import './css/app.css';
import { initDashboard } from './js/dashboard/index.js';
import { initMobileSidebar } from './js/common/sidebar.js';
import { initRecipesPage } from './js/recipes/index.js';
import { initIngredientsPage } from './js/ingredients/index.js';
import { initCalendarPage } from './js/calendar/index.js';
import { initPlanningPage } from './js/planning/index.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initMobileSidebar();
    initRecipesPage();
    initIngredientsPage();
    initCalendarPage();
    initPlanningPage();
  });
} else {
  initDashboard();
  initMobileSidebar();
  initRecipesPage();
  initIngredientsPage();
  initCalendarPage();
  initPlanningPage();
}
