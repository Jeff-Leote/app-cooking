function updateIcon(icon, pathData) {
  if (!icon) return;
  const path = icon.querySelector('path');
  if (path) {
    path.setAttribute('d', pathData);
  } else {
    const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    newPath.setAttribute('stroke-linecap', 'round');
    newPath.setAttribute('stroke-linejoin', 'round');
    newPath.setAttribute('stroke-width', '2');
    newPath.setAttribute('d', pathData);
    icon.appendChild(newPath);
  }
}

export function enableEditMode(grid, editBtn, editBtnText, cancelBtn) {
  if (editBtnText) {
    editBtnText.textContent = 'Valider la planification';
  }
  if (editBtn) {
    const icon = editBtn.querySelector('svg');
    updateIcon(icon, 'M5 13l4 4L19 7');
  }
  if (cancelBtn) {
    cancelBtn.classList.remove('hidden');
  }
  if (grid) {
    grid.classList.add('planning-edit-mode');
  }
}

export function disableEditMode(grid, editBtn, editBtnText, cancelBtn) {
  if (editBtnText) {
    editBtnText.textContent = 'Modifier la planification';
  }
  if (editBtn) {
    const icon = editBtn.querySelector('svg');
    updateIcon(icon, 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z');
  }
  if (cancelBtn) {
    cancelBtn.classList.add('hidden');
  }
  if (grid) {
    grid.classList.remove('planning-edit-mode');
  }
}
