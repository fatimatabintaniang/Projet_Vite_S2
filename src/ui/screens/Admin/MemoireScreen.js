import { Modal } from "../../component/Modal.js";
import { confirm } from "../../component/Confirm.js";
import { validate } from "../../../utils/validation.js";
import { CloudinaryClient } from "../../../services/Cloudinary.js";
import MemoireService from "../../../services/MemoireService.js";

const ICONS = {
  add: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>`,
};

export class MemoireScreen {
  constructor(container) {
    this.container = container;
    this.memoireService = new MemoireService();
    this.view = "active";
  }

  async render() {
    try {
      const memoires = await this.memoireService.getAllMemoires();
      const filteredMemoires = memoires.filter(memoire => 
        this.view === "active" ? !memoire.deleted : memoire.deleted
      );

      this.renderList(filteredMemoires);
      this.bindViewToggle();
      this.bindAddButton();
    } catch (err) {
      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-10 text-center text-red-500 mt-20">
          <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
          <p class="text-lg">Erreur : ${err.message}</p>
        </div>`;
    }
  }

  renderControls() {
    return `
      <div class="flex justify-between items-center p-6 ">
        <h1 class="text-2xl font-bold text-gray-800">Gestion des Mémoires</h1>
        <div class="flex items-center space-x-4">
            <button id="btn-add" class="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
              ${ICONS.add}
              <span>Ajouter</span>
            </button>
            <div class="inline-flex rounded-md shadow-sm ml-4" role="group">
                <button data-v="active" type="button" class="tab px-4 py-2 text-sm font-medium rounded-l-lg border ${this.view === "active" ? "bg-indigo-600 text-white" : ""}">
                    Actifs
                </button>
                <button data-v="deleted" type="button" class="tab px-4 py-2 text-sm font-medium rounded-r-lg border ${this.view === "deleted" ? "bg-indigo-600 text-white" : ""}">
                    Corbeille
                </button>
            </div>
        </div>
      </div>
    `;
  }

  renderList(memoires) {
    if (!memoires.length) {
      this.container.innerHTML = `
        ${this.renderControls()} 
        <div class="flex flex-col items-center justify-center p-10 text-center text-gray-500">
          <i class="fas fa-box-open text-5xl mb-4"></i>
          <p class="text-lg">Aucun mémoire trouvé</p>
        </div>`;
      return;
    }

    this.container.innerHTML = `
      ${this.renderControls()}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 p-6 mt-6">
        ${memoires
          .map(
            (memoire) => `
          <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
            <div class="h-48 overflow-hidden">
              <img 
                src="${memoire.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                alt="${memoire.titre}"
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              >
            </div>
            <div class="p-5">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">${memoire.titre}</h3>
              <p class="text-gray-600 text-sm mb-1"><strong>Auteur:</strong> ${memoire.auteur}</p>
              <p class="text-gray-600 text-sm mb-1"><strong>Année:</strong> ${memoire.annee}</p>
              <p class="text-gray-600 text-sm mb-3"><strong>Spécialité:</strong> ${memoire.specialite}</p>
              <button 
                data-id="${memoire.id}" 
                class="btn-details w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
                Voir détails
              </button>
            </div>
          </div>`
          )
          .join("")}
      </div>`;

    this.bindDetailsButtons();
  }

  bindViewToggle() {
    const buttons = this.container.querySelectorAll(".tab");
    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-v");
        if (v !== this.view) {
          this.view = v;
          this.render();
        }
      })
    );
  }

  bindAddButton() {
    const btnAdd = this.container.querySelector("#btn-add");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => this.showAddForm());
    }
  }

  bindDetailsButtons() {
    const buttons = this.container.querySelectorAll(".btn-details");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const memoire = await this.memoireService.getMemoireById(id);
        this.showDetails(memoire);
      });
    });
  }

  async showAddForm() {
    const cloudinary = new CloudinaryClient();

    const form = document.createElement("form");
    form.id = "add-memoire-form";
    form.className = "space-y-4 relative";

    form.innerHTML = `
      <div>
        <input type="text" name="titre" placeholder="Titre" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="titre"></p>
      </div>

      <div>
        <input type="text" name="auteur" placeholder="Auteur" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="auteur"></p>
      </div>

      <div>
        <input type="number" name="annee" placeholder="Année" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="annee"></p>
      </div>

      <div>
        <input type="text" name="specialite" placeholder="Spécialité" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="specialite"></p>
      </div>

      <div>
        <select name="statut" class="w-full p-2 border rounded">
          <option value="">-- Statut --</option>
          <option value="valide">Validé</option>
          <option value="en_attente">En attente</option>
          <option value="rejete">Rejeté</option>
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="statut"></p>
      </div>

      <div>
        <input type="file" name="imageFile" accept="image/*" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="image"></p>
      </div>

      <div>
        <input type="file" name="fichier" accept=".pdf" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="fichier"></p>
      </div>

      <div class="flex justify-end space-x-2 pt-2">
        <button type="button" id="cancel-add" class="px-4 py-2 bg-gray-300 rounded">Annuler</button>
        <button type="submit" class="submit-btn px-4 py-2 bg-indigo-600 text-white rounded flex items-center justify-center gap-2">
          <span>Ajouter</span>
          <svg class="loader hidden w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </button>
      </div>
    `;

    const modal = new Modal("Ajouter un mémoire", form);
    modal.open();

    form.querySelector("#cancel-add").onclick = () => modal.close();

    form.onsubmit = async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector(".submit-btn");
      const loader = form.querySelector(".loader");
      submitBtn.disabled = true;
      loader.classList.remove("hidden");

      const imageFile = form.imageFile.files[0];
      const fichier = form.fichier.files[0];

      const formData = {
        titre: form.titre.value.trim(),
        auteur: form.auteur.value.trim(),
        annee: form.annee.value,
        specialite: form.specialite.value.trim(),
        statut: form.statut.value,
      };

      // Validation
      const errors = validate(formData, {
        titre: ["required", "min:3"],
        auteur: ["required", "min:3"],
        annee: ["required", "numeric"],
        specialite: ["required"],
        statut: ["required"],
      });

      form.querySelectorAll("[data-error]").forEach((el) => (el.textContent = ""));
      if (Object.keys(errors).length > 0) {
        for (const field in errors) {
          const el = form.querySelector(`[data-error="${field}"]`);
          if (el) el.textContent = errors[field];
        }
        submitBtn.disabled = false;
        loader.classList.add("hidden");
        return;
      }

      // Vérification du fichier
      if (!fichier) {
        form.querySelector('[data-error="fichier"]').textContent = "Le fichier PDF est requis";
        submitBtn.disabled = false;
        loader.classList.add("hidden");
        return;
      }

      try {
        let imageUrl = null;
        if (imageFile) {
          const imageResult = await cloudinary.uploadImage(imageFile);
          imageUrl = imageResult.secure_url;
        }

        // Simuler l'upload du fichier PDF
        const fichierMemoire = `/uploads/memoires/${fichier.name}`;

        const newMemoire = {
          ...formData,
          image: imageUrl,
          fichier_memoire: fichierMemoire,
          deleted: false,
          utilisateurId: "currentUserId" // À remplacer par l'ID de l'utilisateur connecté
        };

        await this.memoireService.createMemoire(newMemoire);
        modal.close();
        this.render();
      } catch (error) {
        alert("Erreur lors de l'ajout : " + error.message);
      } finally {
        submitBtn.disabled = false;
        loader.classList.add("hidden");
      }
    };
  }

  showDetails(memoire) {
    const detailContainer = document.createElement("div");

    const isDeleted = memoire.deleted === true;

    detailContainer.innerHTML = `
      <div class="space-y-4">
        <img src="${memoire.image || 'https://via.placeholder.com/400x300'}" alt="${memoire.titre}" class="w-full h-60 object-cover rounded-md" />
        <h2 class="text-xl font-bold">${memoire.titre}</h2>
        <p><strong>Auteur :</strong> ${memoire.auteur}</p>
        <p><strong>Année :</strong> ${memoire.annee}</p>
        <p><strong>Spécialité :</strong> ${memoire.specialite}</p>
        <p><strong>Statut :</strong> ${memoire.statut}</p>

        <div class="flex justify-end gap-4 mt-4">
          ${isDeleted
            ? `<button class="btn-restore px-4 py-2 bg-green-600 text-white rounded">Restaurer</button>`
            : `
              <button class="btn-edit px-4 py-2 bg-indigo-600 text-white rounded">Modifier</button>
              <button class="btn-delete px-4 py-2 bg-red-600 text-white rounded">Supprimer</button>
            `
          }
        </div>
      </div>
    `;

    const modal = new Modal("Détails du mémoire", detailContainer);
    modal.open();

    if (isDeleted) {
      detailContainer.querySelector(".btn-restore").onclick = async () => {
        if (await confirm("Voulez-vous restaurer ce mémoire ?")) {
          await this.memoireService.updateMemoire(memoire.id, { deleted: false });
          modal.close();
          this.render();
        }
      };
    } else {
      detailContainer.querySelector(".btn-edit").onclick = () => {
        modal.close();
        this.showEditForm(memoire);
      };

      detailContainer.querySelector(".btn-delete").onclick = async () => {
        if (await confirm("Êtes-vous sûr de vouloir supprimer ce mémoire ?")) {
          await this.memoireService.deleteMemoire(memoire.id);
          modal.close();
          this.render();
        }
      };
    }
  }

  async showEditForm(memoire) {
    const cloudinary = new CloudinaryClient();

    const form = document.createElement("form");
    form.className = "space-y-4 relative";

    form.innerHTML = `
      <div>
        <input type="text" name="titre" value="${memoire.titre}" placeholder="Titre" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="titre"></p>
      </div>

      <div>
        <input type="text" name="auteur" value="${memoire.auteur}" placeholder="Auteur" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="auteur"></p>
      </div>

      <div>
        <input type="number" name="annee" value="${memoire.annee}" placeholder="Année" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="annee"></p>
      </div>

      <div>
        <input type="text" name="specialite" value="${memoire.specialite}" placeholder="Spécialité" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="specialite"></p>
      </div>

      <div>
        <select name="statut" class="w-full p-2 border rounded">
          <option value="">-- Statut --</option>
          <option value="valide" ${memoire.statut === 'valide' ? 'selected' : ''}>Validé</option>
          <option value="en_attente" ${memoire.statut === 'en_attente' ? 'selected' : ''}>En attente</option>
          <option value="rejete" ${memoire.statut === 'rejete' ? 'selected' : ''}>Rejeté</option>
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="statut"></p>
      </div>

      <div>
        <p class="text-gray-600 text-sm mb-2">Image actuelle :</p>
        <img src="${memoire.image}" alt="Aperçu de l'image" class="w-32 h-32 object-cover mb-2 rounded border" />
        <input type="file" name="imageFile" accept="image/*" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="image"></p>
      </div>

      <div class="flex justify-end space-x-2 pt-2">
        <button type="button" id="cancel-edit" class="px-4 py-2 bg-gray-300 rounded">Annuler</button>
        <button type="submit" class="submit-btn px-4 py-2 bg-indigo-600 text-white rounded flex items-center justify-center gap-2">
          <span>Modifier</span>
          <svg class="loader hidden w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </button>
      </div>
    `;

    const modal = new Modal("Modifier le mémoire", form);
    modal.open();

    form.querySelector("#cancel-edit").onclick = () => modal.close();

    form.onsubmit = async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector(".submit-btn");
      const loader = form.querySelector(".loader");
      submitBtn.disabled = true;
      loader.classList.remove("hidden");

      const imageInput = form.imageFile;
      const imageFile = imageInput.files[0];

      const formData = {
        titre: form.titre.value.trim(),
        auteur: form.auteur.value.trim(),
        annee: form.annee.value,
        specialite: form.specialite.value.trim(),
        statut: form.statut.value,
      };

      form.querySelectorAll("[data-error]").forEach((el) => (el.textContent = ""));

      const errors = validate(formData, {
        titre: ["required", "min:3"],
        auteur: ["required", "min:3"],
        annee: ["required", "numeric"],
        specialite: ["required"],
        statut: ["required"],
      });

      if (Object.keys(errors).length > 0) {
        for (const field in errors) {
          const el = form.querySelector(`[data-error="${field}"]`);
          if (el) el.textContent = errors[field];
        }
        submitBtn.disabled = false;
        loader.classList.add("hidden");
        return;
      }

      let imageUrl = memoire.image;

      if (imageFile) {
        try {
          const result = await cloudinary.uploadImage(imageFile);
          imageUrl = result.secure_url;
        } catch (err) {
          const imageError = form.querySelector(`[data-error="image"]`);
          if (imageError) imageError.textContent = err.message;
          submitBtn.disabled = false;
          loader.classList.add("hidden");
          return;
        }
      }

      const updatedMemoire = {
        ...memoire,
        ...formData,
        image: imageUrl,
      };

      try {
        await this.memoireService.updateMemoire(memoire.id, updatedMemoire);
        modal.close();
        this.render();
      } catch (error) {
        alert("Erreur lors de la mise à jour : " + error.message);
      } finally {
        submitBtn.disabled = false;
        loader.classList.add("hidden");
      }
    };
  }
}