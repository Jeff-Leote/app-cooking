// ============================================
// Module Stock - Gestion du stock d'ingrédients
// ============================================

import { showToast } from '../common/toasts.js';

function toSafePositiveIntId(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function loadStock() {
  const url = new URL('/api/stock', window.location.origin);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement du stock:', error);
    return [];
  }
}

async function loadIngredients() {
  const url = new URL('/api/ingredients', window.location.origin);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement des ingrédients:', error);
    return [];
  }
}

async function createStockItem(data) {
  const url = new URL('/api/stock', window.location.origin);
  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    throw error;
  }
}

async function deleteStockItem(id) {
  const safeId = toSafePositiveIntId(id);
  if (!safeId) return;
  
  const url = new URL(`/api/stock/${safeId}`, window.location.origin);
  try {
    const res = await fetch(url.toString(), {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw error;
  }
}

function getCategoryColor(category) {
  const colors = {
    FECULENTS: 'bg-yellow-100 text-yellow-800',
    PROTEINES: 'bg-pink-100 text-pink-800',
    LEGUMES: 'bg-green-100 text-green-800',
    FRUITS: 'bg-orange-100 text-orange-800',
    PRODUITS_LAITIERS: 'bg-blue-100 text-blue-800',
    MATIERES_GRASSES: 'bg-purple-100 text-purple-800',
    CEREALES: 'bg-amber-100 text-amber-800',
    OLEAGINEUX: 'bg-yellow-100 text-yellow-800',
    PRODUITS_SUCRES: 'bg-pink-100 text-pink-800',
    PRODUITS_SALES: 'bg-gray-100 text-gray-800',
    BOISSONS: 'bg-cyan-100 text-cyan-800',
    EPICES_CONDIMENTS: 'bg-red-100 text-red-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
}

function getCategoryLabel(category) {
  const labels = {
    FECULENTS: 'Féculents',
    PROTEINES: 'Protéines',
    LEGUMES: 'Légumes',
    FRUITS: 'Fruits',
    PRODUITS_LAITIERS: 'Produits laitiers',
    MATIERES_GRASSES: 'Matières grasses',
    CEREALES: 'Céréales',
    OLEAGINEUX: 'Oléagineux',
    PRODUITS_SUCRES: 'Produits sucrés',
    PRODUITS_SALES: 'Produits salés',
    BOISSONS: 'Boissons',
    EPICES_CONDIMENTS: 'Épices et condiments',
  };
  return labels[category] || category;
}

function createStockCard(stockItem) {
  const ingredient = stockItem.ingredient;
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow';
  card.dataset.stockId = stockItem.id;

  if (ingredient.categorie) {
    const category = document.createElement('div');
    category.className = `inline-block px-2 py-1 rounded-full text-xs font-bold mb-2 ${getCategoryColor(ingredient.categorie)}`;
    category.textContent = getCategoryLabel(ingredient.categorie);
    card.appendChild(category);
  }

  const name = document.createElement('h3');
  name.className = 'text-lg font-bold text-dark-blue mb-2';
  name.textContent = ingredient.nom;
  card.appendChild(name);

  if (stockItem.quantite) {
    const quantity = document.createElement('div');
    quantity.className = 'text-sm text-gray-600 mb-2';
    quantity.textContent = `Quantité: ${stockItem.quantite}`;
    card.appendChild(quantity);
  }

  if (stockItem.date_peremption) {
    const expiry = document.createElement('div');
    const expiryDate = new Date(stockItem.date_peremption);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    expiry.className = `text-sm font-semibold mb-2 ${
      daysUntilExpiry < 0 ? 'text-red-600' : daysUntilExpiry <= 3 ? 'text-orange-600' : 'text-gray-600'
    }`;
    expiry.textContent = `Péremption: ${expiryDate.toLocaleDateString('fr-FR')}`;
    if (daysUntilExpiry < 0) {
      expiry.textContent += ' (Expiré)';
    } else if (daysUntilExpiry <= 3) {
      expiry.textContent += ` (${daysUntilExpiry} jour(s))`;
    }
    card.appendChild(expiry);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'w-full mt-3 bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors';
  deleteBtn.textContent = 'Retirer du stock';
  deleteBtn.addEventListener('click', async () => {
    if (confirm(`Retirer ${ingredient.nom} du stock ?`)) {
      try {
        await deleteStockItem(stockItem.id);
        showToast('Ingrédient retiré du stock', 'success');
        await renderStock();
      } catch (error) {
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  });
  card.appendChild(deleteBtn);

  return card;
}

async function renderStock() {
  const container = document.getElementById('stock-container');
  const emptyState = document.getElementById('stock-empty');
  const countEl = document.getElementById('stock-count-number');
  
  if (!container) return;

  container.innerHTML = '';
  const stock = await loadStock();
  
  if (countEl) {
    countEl.textContent = stock.length;
  }

  if (stock.length === 0) {
    if (emptyState) {
      emptyState.classList.remove('hidden');
    }
    return;
  }

  if (emptyState) {
    emptyState.classList.add('hidden');
  }

  stock.forEach((item) => {
    const card = createStockCard(item);
    container.appendChild(card);
  });
}

export async function initStockPage() {
  const container = document.getElementById('stock-container');
  const addBtn = document.getElementById('add-stock-item-btn');
  const addForm = document.getElementById('add-stock-form');
  const cancelBtn = document.getElementById('cancel-add-stock-btn');
  const submitForm = document.getElementById('new-stock-item-form');
  const ingredientSelect = document.getElementById('stock-ingredient');
  
  if (!container) return;

  // Charger les ingrédients dans le select
  if (ingredientSelect) {
    const ingredients = await loadIngredients();
    ingredients.forEach((ing) => {
      const option = document.createElement('option');
      option.value = ing.id;
      option.textContent = ing.nom;
      ingredientSelect.appendChild(option);
    });
  }

  if (addBtn && addForm) {
    addBtn.addEventListener('click', () => {
      addForm.classList.remove('hidden');
    });
  }

  if (cancelBtn && addForm) {
    cancelBtn.addEventListener('click', () => {
      addForm.classList.add('hidden');
      if (submitForm) submitForm.reset();
    });
  }

  if (submitForm) {
    submitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(submitForm);
      const data = {
        ingredient_id: Number.parseInt(formData.get('ingredient_id'), 10),
        quantite: formData.get('quantite') || null,
        date_peremption: formData.get('date_peremption') || null,
      };

      try {
        await createStockItem(data);
        showToast('Ingrédient ajouté au stock', 'success');
        if (addForm) addForm.classList.add('hidden');
        submitForm.reset();
        await renderStock();
      } catch (error) {
        showToast('Erreur lors de l\'ajout', 'error');
      }
    });
  }

  await renderStock();
}

export async function addMissingIngredientsToShoppingList(recipeIngredients) {
  if (!recipeIngredients || recipeIngredients.length === 0) {
    console.log('Aucun ingrédient dans la recette');
    return 0;
  }

  // Charger le stock actuel
  const stock = await loadStock();
  const stockIngredientIds = new Set(stock.map(s => s.ingredient_id));
  
  // Trouver les ingrédients manquants
  const missingIngredients = recipeIngredients.filter(
    ri => {
      const ingredientId = ri.ingredient_id || ri.ingredient?.id;
      return ingredientId && !stockIngredientIds.has(ingredientId);
    }
  );
  
  if (missingIngredients.length === 0) {
    console.log('Tous les ingrédients sont déjà en stock');
    return 0;
  }
  
  console.log(`${missingIngredients.length} ingrédient(s) manquant(s) à ajouter à la liste de courses`);
  
  // Ajouter chaque ingrédient manquant à la liste de courses
  const url = new URL('/api/shopping-items', window.location.origin);
  let added = 0;
  
  for (const missing of missingIngredients) {
    try {
      const ingredient = missing.ingredient || {};
      const ingredientName = ingredient.nom || missing.nom || 'Ingrédient inconnu';
      const quantity = missing.quantite || null;
      
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          nom: ingredientName,
          quantite: quantity,
        }),
      });
      if (res.ok) {
        added++;
        console.log(`Ingrédient ajouté: ${ingredientName}`);
      } else {
        console.error(`Erreur HTTP ${res.status} pour ${ingredientName}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste:', error);
    }
  }
  
  return added;
}
