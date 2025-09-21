import { load } from "./data/recipesRepo.js";
import { mountHeaderFavorites } from "./ui/headerFavorites.js";
import { mountCards } from "./ui/cards.js";
import { mountModal } from "./ui/modal.js";
import { mountFooter } from "./ui/footer.js";   // <- nuevo

document.addEventListener("DOMContentLoaded", async () => {
  mountHeaderFavorites();
  mountCards();
  mountModal();
  mountFooter();                                  // <- nuevo

  await load("assets/data/recetas.json");
});
