import './css/app.css';
import { initDashboard } from './js/dashboard/index.js';
import { initMobileSidebar } from './js/common/sidebar.js';
import { initRecipesPage } from './js/recipes/index.js';
import { initIngredientsPage } from './js/ingredients/index.js';
import { initCalendarPage } from './js/calendar/index.js';
import { initPlanningPage } from './js/planning/index.js';
import { initFavoritesPage } from './js/favorites/index.js';
import { initShoppingListPage } from './js/shopping-list/index.js';
import { initStockPage } from './js/stock/index.js';
import { initRecipeShowPage } from './js/recipes/show.js';
import { initToasts } from './js/common/toasts.js';
import { initAllIngredientAutocompletes } from './js/recipes/ingredient-autocomplete.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initMobileSidebar();
    initToasts();
    initRecipesPage();
    initIngredientsPage();
    initCalendarPage();
    initPlanningPage();
    initFavoritesPage();
    initShoppingListPage();
    initStockPage();
    initRecipeShowPage();
    initAllIngredientAutocompletes();
  });
} else {
  initDashboard();
  initMobileSidebar();
  initToasts();
  initRecipesPage();
  initIngredientsPage();
  initCalendarPage();
  initPlanningPage();
  initFavoritesPage();
  initShoppingListPage();
  initStockPage();
  initRecipeShowPage();
  initAllIngredientAutocompletes();
}
