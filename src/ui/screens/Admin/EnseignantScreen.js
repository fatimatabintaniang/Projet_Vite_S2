import { CloudinaryClient } from "../../../services/Cloudinary.js";
import { Modal } from "../../component/Modal.js";
import { confirm } from "../../component/Confirm.js";

export default class EnseignantScreen {
  constructor(container) {
    this.cloudinary = new CloudinaryClient();
    this.state = {
      imagePreview: null,
      errors: {},
      showArchived: false
    };
    this.container = container;
    this.modal = null;
    this.currentEditId = null;

    this.validationRules = {
      add: {
        prenom: ['required', 'min:2', 'max:50'],
        nom: ['required', 'min:2', 'max:50'],
        email: ['required', 'email', 'max:100'],
        telephone: ['required', 'min:9', 'max:15'],
        password: ['required', 'min:6', 'max:50']
      },
      edit: {
        prenom: ['required', 'min:2', 'max:50'],
        nom: ['required', 'min:2', 'max:50'],
        email: ['required', 'email', 'max:100'],
        telephone: ['required', 'min:9', 'max:15']
      }
    };
  }

  // Fonction pour vérifier l'unicité de l'email
  async checkEmailUnique(email, excludeId = null) {
    const enseignants = await this.getEnseignants();
    return !enseignants.some(e => e.email === email && e.id !== excludeId);
  }

  // Fonction pour vérifier l'unicité du téléphone
  async checkTelephoneUnique(telephone, excludeId = null) {
    if (!telephone) return true;
    const enseignants = await this.getEnseignants();
    return !enseignants.some(e => e.telephone === telephone && e.id !== excludeId);
  }

  // Fonction pour valider le formulaire
  async validateForm(formValues, formType = 'add') {
    const errors = {};
    const rules = this.validationRules[formType];

    // Validation de base
    for (const field in rules) {
      const value = formValues[field];
      const fieldRules = rules[field];

      for (const rule of fieldRules) {
        const [ruleName, ruleParam] = rule.split(':');
        
        switch (ruleName) {
          case 'required':
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              errors[field] = 'Ce champ est requis';
            }
            break;
            
          case 'min':
            if (value && value.length < parseInt(ruleParam)) {
              errors[field] = `Doit contenir au moins ${ruleParam} caractères`;
            }
            break;
            
          case 'max':
            if (value && value.length > parseInt(ruleParam)) {
              errors[field] = `Ne doit pas dépasser ${ruleParam} caractères`;
            }
            break;
            
          case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors[field] = 'Email invalide';
            }
            break;
            
          default:
            break;
        }
        
        if (errors[field]) break;
      }
    }

    // Vérification de l'unicité de l'email et du téléphone
    if (formValues.email && !errors.email) {
      const isEmailUnique = await this.checkEmailUnique(formValues.email, this.currentEditId);
      if (!isEmailUnique) {
        errors.email = 'Cet email est déjà utilisé';
      }
    }

    if (formValues.telephone && !errors.telephone) {
      const isTelephoneUnique = await this.checkTelephoneUnique(formValues.telephone, this.currentEditId);
      if (!isTelephoneUnique) {
        errors.telephone = 'Ce numéro de téléphone est déjà utilisé';
      }
    }

    return errors;
  }

  // Fonction pour valider un champ spécifique
  // Utilisée pour la validation en temps réel dans le modal

  async validateField(fieldName, value, formType = 'add') {
    const form = this.modal.getElement().querySelector("#addForm, #editForm");
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());

    const tempErrors = await this.validateForm(formValues, formType);

    if (tempErrors[fieldName]) {
      this.state.errors[fieldName] = tempErrors[fieldName];
    } else {
      delete this.state.errors[fieldName];
    }

    this.displayFieldError(fieldName);
  }

  // Fonction pour afficher ou masquer les erreurs d'un champ
  // Utilisée pour afficher les erreurs spécifiques lors de la validation en temps réel
  displayFieldError(fieldName) {
    const errorElement = this.modal.getElement().querySelector(`#${fieldName}-error`);
    const inputElement = this.modal.getElement().querySelector(`[name="${fieldName}"]`);

    if (errorElement && inputElement) {
      if (this.state.errors[fieldName]) {
        errorElement.textContent = this.state.errors[fieldName];
        errorElement.classList.remove('hidden');
        inputElement.classList.add('border-red-500');
      } else {
        errorElement.classList.add('hidden');
        inputElement.classList.remove('border-red-500');
      }
    }
  }


  // Fonction pour afficher les erreurs de formulaire
  // Utilisée pour afficher toutes les erreurs après la soumission du formulaire
  displayFormErrors(formType = 'add') {
    const rules = this.validationRules[formType];
    
    for (const field in rules) {
      this.displayFieldError(field);
    }

    const imageError = this.modal.getElement().querySelector("#image-error");
    if (this.state.errors.image) {
      imageError.textContent = this.state.errors.image;
      imageError.classList.remove('hidden');
      this.modal.getElement().querySelector('[name="image"]').classList.add('border-red-500');
    } else {
      imageError.classList.add('hidden');
      this.modal.getElement().querySelector('[name="image"]').classList.remove('border-red-500');
    }
  }

  // Fonction pour effacer les erreurs d'un champ spécifique
  clearError(fieldName) {
    delete this.state.errors[fieldName];
    this.displayFieldError(fieldName);
  }

  // Fonction pour basculer entre la vue des enseignants actifs et archivés
  async toggleArchiveView() {
    this.state.showArchived = !this.state.showArchived;
    await this.render();
  }

  // Fonction pour archiver un enseignant
  async archiveEnseignant(id) {
    try {
      const response = await fetch(`http://localhost:3000/utilisateurs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deleted: "true",
          deletedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        this.render();
      } else {
        alert("Erreur lors de l'archivage");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'archivage");
    }
  }

  // Fonction pour restaurer un enseignant archivé
  async restoreEnseignant(id) {
    try {
      const response = await fetch(`http://localhost:3000/utilisateurs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deleted: "false",
          deletedAt: null
        })
      });

      if (response.ok) {
        this.render();
      } else {
        alert("Erreur lors de la restauration");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la restauration");
    }
  }

  // Fonction pour récupérer les enseignants depuis l'API
  async render() {
    const enseignants = await this.getEnseignants();
    const activeEnseignants = enseignants.filter(e => e.deleted !== "true");
    const archivedEnseignants = enseignants.filter(e => e.deleted === "true");

    this.container.innerHTML = `
      <div class="p-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Gestion des enseignants</h2>
          <div class="flex gap-4">
            <button id="toggleArchiveView" class="px-4 py-2 ${this.state.showArchived ? 'bg-gray-600' : 'bg-blue-600'} text-white rounded">
              ${this.state.showArchived ? 'Voir les actifs' : 'Voir les archives'}
            </button>
            <button id="openModal" class="px-4 py-2 bg-[#873A0E] text-white rounded">
              + Ajouter un enseignant
            </button>
          </div>
        </div>

        ${this.state.showArchived ? `
          <div class="mb-4">
            <h3 class="text-xl font-semibold text-gray-700 mb-3">Enseignants archivés (${archivedEnseignants.length})</h3>
            ${archivedEnseignants.length === 0 ? `
              <p class="text-gray-500 italic">Aucun enseignant archivé</p>
            ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                ${archivedEnseignants.map(e => `
                  <div class="bg-gray-100 shadow-md rounded-lg p-4 border-l-4 border-red-500">
                    <img src="${e.image || 'https://via.placeholder.com/150'}" alt="photo" 
                         class="w-24 h-24 object-cover rounded-full mb-2 opacity-70">
                    <h3 class="text-lg font-semibold text-gray-600">${e.prenom} ${e.nom}</h3>
                    <p class="text-gray-500">Email : ${e.email}</p>
                    <p class="text-gray-500">Téléphone : ${e.telephone || 'N/A'}</p>
                    <p class="text-red-500 text-sm mt-2">Archivé le ${new Date(e.deletedAt).toLocaleDateString()}</p>
                    <div class="flex gap-2 mt-3">
                      <button class="restoreBtn px-3 py-1 bg-green-600 text-white rounded" data-id="${e.id}">
                        Restaurer
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            `}
          </div>
        ` : `
          <div class="mb-4">
            <h3 class="text-xl font-semibold text-gray-700 mb-3">Enseignants actifs (${activeEnseignants.length})</h3>
            ${activeEnseignants.length === 0 ? `
              <p class="text-gray-500 italic">Aucun enseignant actif</p>
            ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                ${activeEnseignants.map(e => `
                  <div class="bg-white shadow-md rounded-lg p-4 border-l-4 border-green-500">
                    <img src="${e.image || 'https://via.placeholder.com/150'}" alt="photo" 
                         class="w-24 h-24 object-cover rounded-full mb-2">
                    <h3 class="text-lg font-semibold">${e.prenom} ${e.nom}</h3>
                    <p>Email : ${e.email}</p>
                    <p>Téléphone : ${e.telephone || 'N/A'}</p>
                    <div class="flex gap-2 mt-3">
                      <button class="editBtn px-3 py-1 bg-blue-600 text-white rounded" data-id="${e.id}">
                        Modifier
                      </button>
                      <button class="archiveBtn px-3 py-1 bg-red-600 text-white rounded" data-id="${e.id}">
                        Archiver
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            `}
          </div>
        `}
      </div>
    `;

    // Gestion du bouton de bascule archive/actif
    document.getElementById("toggleArchiveView").addEventListener("click", () => {
      this.toggleArchiveView();
    });

    // Gestion des boutons d'archivage avec confirmation
    this.container.querySelectorAll(".archiveBtn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const enseignants = await this.getEnseignants();
        const enseignant = enseignants.find(u => u.id == id);
        
        if (enseignant) {
          const isConfirmed = await confirm(`Êtes-vous sûr de vouloir archiver l'enseignant ${enseignant.prenom} ${enseignant.nom} ?`);
          if (isConfirmed) {
            await this.archiveEnseignant(id);
          }
        }
      });
    });

    // Gestion des boutons de restauration avec confirmation
    this.container.querySelectorAll(".restoreBtn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const enseignants = await this.getEnseignants();
        const enseignant = enseignants.find(u => u.id == id);
        
        if (enseignant) {
          const isConfirmed = await confirm(`Êtes-vous sûr de vouloir restaurer l'enseignant ${enseignant.prenom} ${enseignant.nom} ?`);
          if (isConfirmed) {
            await this.restoreEnseignant(id);
          }
        }
      });
    });

    // Le reste du code pour les modals (identique à avant)
    const modalContent = `
      <form id="addForm" class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Image</label>
          <div class="flex items-center space-x-4">
            <div id="image-preview" class="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-indigo-300 cursor-pointer">
              ${this.state.imagePreview
                ? `<img src="${this.state.imagePreview}" class="w-full h-full object-cover">`
                : `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>`
              }
            </div>
            <div class="flex-1">
              <input type="file" name="image" accept="image/*" class="w-full text-sm text-gray-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 transition-colors duration-200">
              <p id="image-error" class="text-red-500 text-xs mt-1 hidden"></p>
            </div>
          </div>
        </div>
        <div>
          <input type="text" name="prenom" placeholder="Prénom" class="w-full border p-2 rounded">
          <p id="prenom-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <input type="text" name="nom" placeholder="Nom" class="w-full border p-2 rounded">
          <p id="nom-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <input type="email" name="email" placeholder="Email" class="w-full border p-2 rounded">
          <p id="email-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <input type="tel" name="telephone" placeholder="Téléphone" class="w-full border p-2 rounded">
          <p id="telephone-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <input type="password" name="password" placeholder="Mot de passe" class="w-full border p-2 rounded">
          <p id="password-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" id="closeModal" class="px-4 py-2 bg-gray-400 text-white rounded">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-[#873A0E] text-white rounded">Ajouter</button>
        </div>
      </form>
    `;

    this.modal = new Modal({
      title: "Ajouter un enseignant",
      content: modalContent,
      onClose: () => {
        this.state.imagePreview = null;
        this.state.errors = {};
        this.currentEditId = null;
      }
    });

    this.container.appendChild(this.modal.getElement());

    document.getElementById("openModal").addEventListener("click", () => {
      this.modal.open();
    });

    document.getElementById("closeModal").addEventListener("click", () => {
      this.modal.close();
      this.state.imagePreview = null;
      this.state.errors = {};
      this.currentEditId = null;
    });

    const imageInput = this.modal.getElement().querySelector('[name="image"]');
    const imagePreview = this.modal.getElement().querySelector("#image-preview");

    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.state.imagePreview = event.target.result;
          imagePreview.innerHTML = `<img src="${this.state.imagePreview}" class="w-full h-full object-cover">`;
          this.clearError('image');
        };
        reader.readAsDataURL(file);
      } else {
        this.state.imagePreview = null;
        imagePreview.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>`;
      }
    });

    const inputs = this.modal.getElement().querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"]');
    inputs.forEach(input => {
      input.addEventListener('blur', async () => {
        await this.validateField(input.name, input.value, 'add');
      });
    });

    this.modal.getElement().querySelector("#addForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const formValues = Object.fromEntries(formData.entries());
      
      this.state.errors = await this.validateForm(formValues, 'add');
      
      if (!formData.get('image') || !formData.get('image').name) {
        this.state.errors.image = "L'image est requise";
      }

      this.displayFormErrors('add');

      if (Object.keys(this.state.errors).length > 0) {
        return;
      }

      const imageFile = formData.get("image");
      let imageUrl = "https://via.placeholder.com/150";

      if (imageFile && imageFile.size > 0) {
        try {
          const result = await this.cloudinary.uploadImage(imageFile);
          imageUrl = result.secure_url;
        } catch (err) {
          console.error("Erreur upload image :", err);
          this.state.errors.image = "Erreur lors du téléversement de l'image";
          this.displayFormErrors('add');
          return;
        }
      }

      const newUser = {
        nom: formValues.nom,
        prenom: formValues.prenom,
        email: formValues.email,
        telephone: formValues.telephone,
        password: formValues.password,
        image: imageUrl,
        id_role: "2",
        deleted: "false",
        deletedAt: null
      };

      try {
        await fetch("http://localhost:3000/utilisateurs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser)
        });

        this.modal.close();
        this.state.imagePreview = null;
        this.state.errors = {};
        this.render();
      } catch (error) {
        alert("Erreur lors de l'ajout.");
        console.error(error);
      }
    });

    this.container.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const enseignants = await this.getEnseignants();
        const enseignant = enseignants.find(u => u.id == id);
        if (enseignant) {
          this.openEditModal(enseignant);
        }
      });
    });
  }


  // Fonction pour ouvrir le modal d'édition
  openEditModal(enseignant) {
    this.currentEditId = enseignant.id;
    
    const modalContent = `
      <form id="editForm" class="space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Image</label>
          <div class="flex items-center space-x-4">
            <div id="image-preview" class="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              <img src="${enseignant.image || 'https://via.placeholder.com/150'}" 
                   class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
              <input type="file" name="image" accept="image/*" 
                     class="w-full text-sm text-gray-500
                       file:mr-4 file:py-2.5 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-medium
                       file:bg-indigo-50 file:text-indigo-700
                       hover:file:bg-indigo-100">
              <p id="image-error" class="text-red-500 text-xs mt-1 hidden"></p>
            </div>
          </div>
        </div>
        <div>
          <input type="text" name="prenom" value="${enseignant.prenom}" placeholder="Prénom" class="w-full border p-2 rounded">
          <p id="prenom-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <input type="text" name="nom" value="${enseignant.nom}" placeholder="Nom" class="w-full border p-2 rounded">
          <p id="nom-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <input type="email" name="email" value="${enseignant.email}" placeholder="Email" class="w-full border p-2 rounded">
          <p id="email-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <input type="tel" name="telephone" value="${enseignant.telephone || ''}" placeholder="Téléphone" class="w-full border p-2 rounded">
          <p id="telephone-error" class="text-red-500 text-xs mt-1 hidden"></p>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" id="closeEditModal" class="px-4 py-2 bg-gray-400 text-white rounded">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Enregistrer</button>
        </div>
      </form>
    `;

    this.modal = new Modal({
      title: "Modifier enseignant",
      content: modalContent,
      onClose: () => {
        this.state.imagePreview = null;
        this.state.errors = {};
        this.currentEditId = null;
      }
    });

    this.container.appendChild(this.modal.getElement());
    this.modal.open();

    // Gestion de l'aperçu de l'image
    const imageInput = this.modal.getElement().querySelector('[name="image"]');
    const imagePreview = this.modal.getElement().querySelector("#image-preview");

    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.state.imagePreview = event.target.result;
          imagePreview.innerHTML = `<img src="${this.state.imagePreview}" class="w-full h-full object-cover">`;
          this.clearError('image');
        };
        reader.readAsDataURL(file);
      }
    });

    // Validation des champs en temps réel
    const inputs = this.modal.getElement().querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    inputs.forEach(input => {
      input.addEventListener('blur', async () => {
        await this.validateField(input.name, input.value, 'edit');
      });
    });

    // Gestion soumission
    this.modal.getElement().querySelector("#editForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const formValues = Object.fromEntries(formData.entries());

      this.state.errors = await this.validateForm(formValues, 'edit');
      this.displayFormErrors('edit');

      if (Object.keys(this.state.errors).length > 0) return;

      let imageUrl = enseignant.image;
      const imageFile = formData.get("image");

      if (imageFile && imageFile.size > 0) {
        try {
          const result = await this.cloudinary.uploadImage(imageFile);
          imageUrl = result.secure_url;
        } catch (err) {
          console.error("Erreur upload image :", err);
          this.state.errors.image = "Erreur lors du téléversement de l'image";
          this.displayFormErrors('edit');
          return;
        }
      }

      const updatedUser = {
        ...enseignant,
        nom: formValues.nom,
        prenom: formValues.prenom,
        email: formValues.email,
        telephone: formValues.telephone,
        image: imageUrl,
      };

      try {
        await fetch(`http://localhost:3000/utilisateurs/${enseignant.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser)
        });

        this.modal.close();
        this.render();
      } catch (error) {
        alert("Erreur lors de la modification.");
        console.error(error);
      }
    });

    this.modal.getElement().querySelector("#closeEditModal").addEventListener("click", () => {
      this.modal.close();
    });
  }

  // Fonction pour récupérer les enseignants depuis l'API
  async getEnseignants() {
    try {
      const res = await fetch("http://localhost:3000/utilisateurs");
      const data = await res.json();
      return data.filter(user => user.id_role === "2");
    } catch (e) {
      console.error("Erreur fetch enseignants :", e);
      return [];
    }
  }
}