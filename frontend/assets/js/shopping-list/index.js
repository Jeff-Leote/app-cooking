// ============================================
// Module Liste de courses - Gestion de la liste de courses
// ============================================

import { showToast } from '../common/toasts.js';

async function loadAllShoppingItems() {
  const url = new URL('/api/shopping-items', window.location.origin);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement de la liste:', error);
    return [];
  }
}

async function findOrCreateIngredient(name) {
  // Chercher l'ingrédient par nom
  const url = new URL('/api/ingredients', window.location.origin);
  url.searchParams.set('search', name);
  
  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ingredients = await res.json();
    
    // Chercher un ingrédient avec le nom exact
    const exactMatch = ingredients.find(ing => ing.nom.toLowerCase() === name.toLowerCase());
    if (exactMatch) {
      return exactMatch.id;
    }
    
    // Si pas trouvé, créer l'ingrédient
    const createUrl = new URL('/api/ingredients', window.location.origin);
    const createRes = await fetch(createUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ nom: name }),
    });
    
    if (createRes.ok) {
      const newIngredient = await createRes.json();
      return newIngredient.id;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche/création de l\'ingrédient:', error);
    return null;
  }
}

async function addItemToStock(itemName, quantity) {
  // Trouver ou créer l'ingrédient
  const ingredientId = await findOrCreateIngredient(itemName);
  if (!ingredientId) {
    throw new Error('Impossible de trouver ou créer l\'ingrédient');
  }
  
  // Ajouter au stock
  const url = new URL('/api/stock', window.location.origin);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      ingredient_id: ingredientId,
      quantite: quantity || null,
    }),
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  
  return await res.json();
}

function toSafePositiveIntId(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

async function loadShoppingItems() {
  const url = new URL('/api/shopping-items', window.location.origin);
  // Ne pas filtrer par unchecked pour afficher tous les articles (cochés et non cochés)

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du chargement de la liste:', error);
    return [];
  }
}

async function createShoppingItem(data) {
  const url = new URL('/api/shopping-items', window.location.origin);
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

async function toggleCheckItem(id) {
  const safeId = toSafePositiveIntId(id);
  if (!safeId) return;
  
  const url = new URL(`/api/shopping-items/${safeId}/toggle`, window.location.origin);
  try {
    const res = await fetch(url.toString(), {
      method: 'PATCH',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Erreur lors du toggle:', error);
    throw error;
  }
}

async function deleteItem(id) {
  const safeId = toSafePositiveIntId(id);
  if (!safeId) return;
  
  const url = new URL(`/api/shopping-items/${safeId}`, window.location.origin);
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

async function clearCheckedItems() {
  const url = new URL('/api/shopping-items/checked/all', window.location.origin);
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

function createShoppingItemCard(item) {
  const card = document.createElement('div');
  card.className = `flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
    item.coche ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
  }`;
  card.dataset.itemId = item.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.coche || false;
  checkbox.className = 'w-5 h-5 text-primary-green rounded focus:ring-primary-green';
  checkbox.addEventListener('change', async () => {
    try {
      await toggleCheckItem(item.id);
      await renderShoppingList();
      // Vérifier s'il y a des items cochés pour afficher le bouton Valider
      checkAndShowValidateButton();
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  });
  card.appendChild(checkbox);

  const content = document.createElement('div');
  content.className = 'flex-1';
  
  const name = document.createElement('div');
  name.className = `font-semibold ${item.coche ? 'text-gray-400 line-through' : 'text-dark-blue'}`;
  name.textContent = item.nom;
  content.appendChild(name);

  if (item.quantite) {
    const quantity = document.createElement('div');
    quantity.className = `text-sm ${item.coche ? 'text-gray-400' : 'text-gray-600'}`;
    quantity.textContent = item.quantite;
    content.appendChild(quantity);
  }

  card.appendChild(content);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'text-red-500 hover:text-red-700 p-1';
  deleteBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  `;
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (confirm('Supprimer cet article ?')) {
      try {
        await deleteItem(item.id);
        showToast('Article supprimé', 'success');
        await renderShoppingList();
      } catch (error) {
        showToast('Erreur lors de la suppression', 'error');
      }
    }
  });
  card.appendChild(deleteBtn);

  return card;
}

function checkAndShowValidateButton() {
  const validateBtn = document.getElementById('validate-checked-btn');
  if (!validateBtn) return;
  
  // Charger tous les items (y compris les cochés)
  loadAllShoppingItems()
    .then(items => {
      const checkedItems = items.filter(item => item.coche === true);
      if (checkedItems.length > 0) {
        validateBtn.classList.remove('hidden');
      } else {
        validateBtn.classList.add('hidden');
      }
    })
    .catch(err => console.error('Erreur lors de la vérification:', err));
}

async function renderShoppingList() {
  const container = document.getElementById('shopping-list-container');
  const emptyState = document.getElementById('shopping-empty');
  const countEl = document.getElementById('shopping-count-number');
  
  if (!container) return;

  container.innerHTML = '';
  // Charger tous les articles (cochés et non cochés) pour pouvoir les afficher
  const allItems = await loadAllShoppingItems();
  
  // Filtrer pour n'afficher que les articles non cochés dans le compteur
  const uncheckedItems = allItems.filter(item => !item.coche);
  
  if (countEl) {
    countEl.textContent = uncheckedItems.length;
  }

  if (allItems.length === 0) {
    if (emptyState) {
      emptyState.classList.remove('hidden');
    }
    // Cacher le bouton Valider si aucun item
    const validateBtn = document.getElementById('validate-checked-btn');
    if (validateBtn) {
      validateBtn.classList.add('hidden');
    }
    return;
  }

  if (emptyState) {
    emptyState.classList.add('hidden');
  }

  // Afficher tous les articles (cochés et non cochés)
  allItems.forEach((item) => {
    const card = createShoppingItemCard(item);
    container.appendChild(card);
  });
  
  // Vérifier s'il y a des items cochés pour afficher le bouton Valider
  checkAndShowValidateButton();
}

export function initShoppingListPage() {
  const container = document.getElementById('shopping-list-container');
  const addBtn = document.getElementById('add-shopping-item-btn');
  const form = document.getElementById('add-stock-form');
  const addForm = document.getElementById('add-item-form');
  const cancelBtn = document.getElementById('cancel-add-item-btn');
  const submitForm = document.getElementById('new-shopping-item-form');
  const clearBtn = document.getElementById('clear-checked-btn');
  
  if (!container) return;

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
        nom: formData.get('nom'),
        quantite: formData.get('quantite') || null,
      };

      try {
        await createShoppingItem(data);
        showToast('Article ajouté', 'success');
        if (addForm) addForm.classList.add('hidden');
        submitForm.reset();
        await renderShoppingList();
      } catch (error) {
        showToast('Erreur lors de l\'ajout', 'error');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('Supprimer tous les articles cochés ?')) {
        try {
          await clearCheckedItems();
          showToast('Articles supprimés', 'success');
          await renderShoppingList();
        } catch (error) {
          showToast('Erreur lors de la suppression', 'error');
        }
      }
    });
  }

  const validateBtn = document.getElementById('validate-checked-btn');
  if (validateBtn) {
    validateBtn.addEventListener('click', async () => {
      // Charger tous les items pour trouver ceux qui sont cochés
      const allItems = await loadAllShoppingItems();
      const checkedItems = allItems.filter(item => item.coche === true);
      
      if (checkedItems.length === 0) {
        showToast('Aucun article coché à valider', 'error');
        return;
      }
      
      // Popup de confirmation
      const itemsList = checkedItems.map(item => `- ${item.nom}${item.quantite ? ` (${item.quantite})` : ''}`).join('\n');
      if (!confirm(`Êtes-vous sûr de vouloir ajouter ces articles au stock ?\n\n${itemsList}\n\nLes articles seront ajoutés au stock et retirés de la liste de courses.`)) {
        return;
      }
      
      try {
        let addedCount = 0;
        let errorCount = 0;
        
        // Ajouter chaque article au stock
        for (const item of checkedItems) {
          try {
            await addItemToStock(item.nom, item.quantite);
            addedCount++;
          } catch (error) {
            console.error(`Erreur pour ${item.nom}:`, error);
            errorCount++;
          }
        }
        
        // Supprimer les articles cochés de la liste de courses
        if (addedCount > 0) {
          await clearCheckedItems();
        }
        
        if (addedCount > 0) {
          showToast(`${addedCount} article(s) ajouté(s) au stock`, 'success');
        }
        if (errorCount > 0) {
          showToast(`${errorCount} article(s) n'ont pas pu être ajoutés`, 'error');
        }
        
        await renderShoppingList();
      } catch (error) {
        console.error('Erreur lors de la validation:', error);
        showToast('Erreur lors de l\'ajout au stock', 'error');
      }
    });
  }

  renderShoppingList();
}
