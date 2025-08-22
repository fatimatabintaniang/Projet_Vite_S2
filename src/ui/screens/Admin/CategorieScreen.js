import { Modal } from "../../component/Modal.js";
import { confirm } from "../../component/Confirm.js";
import CategorieService from "../../../services/CategorieService.js";
import { validate } from "../../../utils/validation.js";

export class CategorieScreen {
  constructor(container) {
    this.container = container;
    this.categorieService = new CategorieService();
    this.categories = [];

    this.container.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.edit-btn');
      const deleteBtn = e.target.closest('.delete-btn');
      const restoreBtn = e.target.closest('.restore-btn');
      const addBtn = e.target.closest('#add-category');

      if (editBtn) {
        const id = editBtn.dataset.id;
        const category = this.categories.find(c => c.id == id);
        this.showCategoryForm(category);
      }

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (await confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
          await this.categorieService.softDeleteCategory(id);
          await this.loadCategories();
        }
      }

      if (restoreBtn) {
        const id = restoreBtn.dataset.id;
        await this.categorieService.restoreCategory(id);
        await this.loadCategories();
      }

      if (addBtn) {
        this.showCategoryForm();
      }
    });

    this.init();
  }

  // Fonction d'initialisation
  async init() {
    await this.loadCategories();
  }

  // Fonction pour charger les catégories depuis le service
  async loadCategories() {
    try {
      let data = await this.categorieService.getAllCategories();
      this.categories = Array.isArray(data) ? data : [];
      this.render();
    } catch (error) {
      this.categories = [];
      this.showError(error.message);
    }
  }


  // Fonction pour afficher les catégories dans le conteneur
  render() {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Gestion des Catégories</h1>
          <button id="add-category" class="px-4 py-2 bg-[#873A0E] text-white rounded-lg hover:bg-[#873A0E] transition">
            + Ajouter
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg overflow-hidden">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left">ID</th>
                <th class="py-3 px-4 text-left">Nom</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${this.categories.map(cat => `
                <tr class="${cat.deleted ? 'opacity-50' : ''}">
                  <td class="py-3 px-4">${cat.id}</td>
                  <td class="py-3 px-4">${cat.nom}</td>
                  <td class="py-3 px-4 text-right space-x-2">
                    ${!cat.deleted ? `
                      <button data-id="${cat.id}" class="edit-btn px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Modifier</button>
                      <button data-id="${cat.id}" class="delete-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Supprimer</button>
                    ` : `
                      <button data-id="${cat.id}" class="restore-btn px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Restaurer</button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }


  // Fonction pour afficher le formulaire de catégorie
 showCategoryForm(category = null) {
  const modal = new Modal({
    title: category ? 'Modifier Catégorie' : 'Nouvelle Catégorie',
    content: `
      <form id="category-form" class="space-y-4 p-4">
        <div>
          <label class="block text-sm font-medium mb-1">
            Nom de la catégorie <span class="text-red-500">*</span>
          </label>
          <input type="text" name="nom" value="${category?.nom || ''}" 
                 class="w-full p-2 border rounded" 
                 minlength="2" maxlength="50" />
          <p class="text-red-500 text-sm mt-1 hidden" id="nom-error">
            Le nom doit contenir entre 2 et 50 caractères et être unique
          </p>
        </div>
        <div class="flex justify-end space-x-2">
          <button type="button" id="cancel-form" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-[#873A0E] text-white rounded hover:bg-[#873A0E]">
            ${category ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    `
  });

  document.body.appendChild(modal.getElement());
  modal.open();

  const formEl = modal.getElement().querySelector('#category-form');
  const nomInput = formEl.querySelector('input[name="nom"]');
  const nomError = formEl.querySelector('#nom-error');

  // Validation en temps réel
  nomInput.addEventListener('input', async () => {
    const value = nomInput.value.trim();
    const errors = await this.validateCategoryName(value, category?.id);
    
    if (errors.nom) {
      nomError.textContent = errors.nom;
      nomError.classList.remove('hidden');
      nomInput.setCustomValidity(errors.nom);
    } else {
      nomError.classList.add('hidden');
      nomInput.setCustomValidity('');
    }
  });

  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    
    const value = nomInput.value.trim();
    const errors = await this.validateCategoryName(value, category?.id);
    
    if (Object.keys(errors).length > 0) {
      nomError.textContent = errors.nom || '';
      nomError.classList.toggle('hidden', !errors.nom);
      return;
    }

    try {
      if (category) {
        await this.categorieService.updateCategory(category.id, { nom: value });
      } else {
        await this.categorieService.createCategory({ nom: value, deleted: false });
      }
      modal.close();
      await this.loadCategories();
    } catch (error) {
      alert(`Erreur: ${error.message}`);
    }
  });

  formEl.querySelector('#cancel-form').addEventListener('click', () => modal.close());
}


  // Fonction pour valider le nom de la catégorie
async validateCategoryName(name, currentId = null) {
  const errors = {};
  
  // Validation de base
  if (!name) {
    errors.nom = 'Le nom est requis';
    return errors;
  }
  
  if (name.length < 2 || name.length > 50) {
    errors.nom = 'Le nom doit contenir entre 2 et 50 caractères';
    return errors;
  }
  
  // Vérification d'unicité
  try {
    const categories = await this.categorieService.getAllCategories();
    const existingCategory = categories.find(cat => 
      cat.nom.toLowerCase() === name.toLowerCase() && 
      cat.id !== currentId && 
      !cat.deleted
    );
    
    if (existingCategory) {
      errors.nom = 'Ce nom de catégorie existe déjà';
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'unicité:', error);
    errors.nom = 'Erreur lors de la vérification de l\'unicité';
  }
  
  return errors;
}

  // Fonction pour afficher un message d'erreur
  showError(message) {
    this.container.innerHTML = `
      <div class="p-6 bg-red-50 text-red-600 rounded-lg">
        <p class="font-medium">Erreur:</p>
        <p>${message}</p>
        <button id="retry-btn" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Réessayer</button>
      </div>
    `;
    this.container.querySelector('#retry-btn')?.addEventListener('click', () => this.loadCategories());
  }
}
