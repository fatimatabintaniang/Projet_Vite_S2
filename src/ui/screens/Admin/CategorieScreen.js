import { Modal } from "../../component/Modal.js";
import { confirm } from "../../component/Confirm.js";
import CategorieService from "../../../services/CategorieService.js";

export class CategorieScreen {
  constructor(container) {
    this.container = container;
    this.categorieService = new CategorieService();
    this.init();
    this.categories = []; 
  }

  async init() {
    await this.loadCategories();
    this.setupEventListeners();
  }

  async loadCategories() {
    try {
      this.categories = await this.categorieService.getAllCategories();
      this.render();
    } catch (error) {
       this.categories = [];
      this.showError(error.message);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Gestion des Catégories</h1>
          <button id="add-category" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
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
                <tr>
                  <td class="py-3 px-4">${cat.id}</td>
                  <td class="py-3 px-4">${cat.nom}</td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <button data-id="${cat.id}" class="edit-btn px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                      Modifier
                    </button>
                    <button data-id="${cat.id}" class="delete-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Supprimer
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Bouton Ajouter
    this.container.querySelector('#add-category')?.addEventListener('click', () => {
      this.showCategoryForm();
    });

    // Boutons Modifier
    this.container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const category = this.categories.find(c => c.id == id);
        this.showCategoryForm(category);
      });
    });

    // Boutons Supprimer
    this.container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (await confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
          try {
            await this.categorieService.deleteCategory(id);
            await this.loadCategories();
          } catch (error) {
            this.showError(error.message);
          }
        }
      });
    });
  }

  showCategoryForm(category = null) {
    const form = document.createElement('form');
    form.className = 'space-y-4 p-4';
    
    form.innerHTML = `
      <div>
        <label class="block text-sm font-medium mb-1">Nom de la catégorie</label>
        <input type="text" name="nom" value="${category?.nom || ''}" 
               class="w-full p-2 border rounded" required />
      </div>
      <div class="flex justify-end space-x-2">
        <button type="button" id="cancel-form" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Annuler
        </button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          ${category ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    `;

    const modal = new Modal({
      title: category ? 'Modifier Catégorie' : 'Nouvelle Catégorie',
      content: form
    });

    modal.open();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        nom: form.nom.value.trim()
      };

      try {
        if (category) {
          await this.categorieService.updateCategory(category.id, formData);
        } else {
          await this.categorieService.createCategory(formData);
        }
        modal.close();
        await this.loadCategories();
      } catch (error) {
        alert(`Erreur: ${error.message}`);
      }
    });

    form.querySelector('#cancel-form').addEventListener('click', () => modal.close());
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="p-6 bg-red-50 text-red-600 rounded-lg">
        <p class="font-medium">Erreur:</p>
        <p>${message}</p>
        <button id="retry-btn" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          Réessayer
        </button>
      </div>
    `;
    
    this.container.querySelector('#retry-btn')?.addEventListener('click', () => {
      this.loadCategories();
    });
  }
}