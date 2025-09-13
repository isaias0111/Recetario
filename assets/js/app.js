// Interactividad para favoritos
const favoriteButtons = document.querySelectorAll('.favorite-btn');
favoriteButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.textContent = btn.textContent.includes('★') ? '☆ Favorito' : '★ Favorito';
  });
});

// Buscador en vivo
const searchInput = document.getElementById('searchInput');
const recipeContainer = document.getElementById('recipeContainer');

searchInput.addEventListener('input', (e) => {
  const value = e.target.value.toLowerCase();
  const cards = recipeContainer.querySelectorAll('.recipe-title');
  cards.forEach(card => {
    const match = card.textContent.toLowerCase().includes(value);
    card.closest('.recipe-card').style.display = match ? 'block' : 'none';
  });
});

// Activar categoría seleccionada
const categoryButtons = document.querySelectorAll('.category-btn');
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
