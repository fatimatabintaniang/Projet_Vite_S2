import { Modal } from "../../component/Modal.js";
import { confirm } from "../../component/Confirm.js";
import { validate } from "../../../utils/validation.js";
import { CloudinaryClient } from "../../../services/Cloudinary.js";
import LivreService from "../../../services/LivreService.js";

const ICONS = {
  add: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>`,
};

export class LivresScreen {
  constructor(container) {
    this.container = container;
    this.livreService = new LivreService();
    this.view = "active";
  }

  async render() {
    try {
      const livres = await this.livreService.getAllLivres();
      const filteredLivres = livres.filter(livre => 
        this.view === "active" ? !livre.deleted : livre.deleted
      );

      this.renderList(filteredLivres);
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
      <div class="flex justify-between items-center p-6 mt-10">
        <h1 class="text-2xl font-bold text-gray-800">Gestion des Livres</h1>
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

  renderList(livres) {
    if (!livres.length) {
      this.container.innerHTML = `
        ${this.renderControls()} 
        <div class="flex flex-col items-center justify-center p-10 text-center text-gray-500">
          <i class="fas fa-box-open text-5xl mb-4"></i>
          <p class="text-lg">Aucun livre trouvé</p>
        </div>`;
      return;
    }

    this.container.innerHTML = `
      ${this.renderControls()}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 p-6 mt-6">
        ${livres
          .map(
            (livre) => `
          <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
            <div class="h-48 overflow-hidden">
              <img 
                src="${livre.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                alt="${livre.titre}"
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              >
            </div>
            <div class="p-5">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">${livre.titre}</h3>
              <p class="text-gray-600 text-sm mb-1"><strong>Auteur:</strong> ${livre.auteur}</p>
              <p class="text-gray-600 text-sm mb-1"><strong>Format:</strong> ${livre.format}</p>
              <p class="text-gray-600 text-sm mb-3"><strong>Type:</strong> ${livre.type}</p>
              <button 
                data-id="${livre.id}" 
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
        const livre = await this.livreService.getLivreById(id);
        this.showDetails(livre);
      });
    });
  }

  async showAddForm() {
    const cloudinary = new CloudinaryClient();
    const [categories, niveaux, matieres] = await Promise.all([
      this.livreService.getCategories(),
      this.livreService.getNiveaux(),
      this.livreService.getMatieres()
    ]);

    const form = document.createElement("form");
    form.id = "add-livre-form";
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
        <select name="format" class="w-full p-2 border rounded">
          <option value="">-- Choisir un format --</option>
          <option value="PDF">PDF</option>
          <option value="EPUB">EPUB</option>
          <option value="DOCX">DOCX</option>
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="format"></p>
      </div>

      <div>
        <select name="type" class="w-full p-2 border rounded">
          <option value="">-- Choisir un type --</option>
          <option value="LIVRE_COURS">Livre de cours</option>
          <option value="LIVRE_EXERCICE">Livre d'exercices</option>
          <option value="MEMOIRE">Mémoire</option>
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="type"></p>
      </div>

      <div>
        <select name="categorieId" class="w-full p-2 border rounded">
          <option value="">-- Choisir une catégorie --</option>
          ${categories.map(cat => `<option value="${cat.id}">${cat.nom}</option>`).join("")}
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="categorieId"></p>
      </div>

      <div>
        <select name="niveauId" class="w-full p-2 border rounded">
          <option value="">-- Choisir un niveau --</option>
          ${niveaux.map(niv => `<option value="${niv.id}">${niv.libelle}</option>`).join("")}
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="niveauId"></p>
      </div>

      <div>
        <select name="matiereId" class="w-full p-2 border rounded">
          <option value="">-- Choisir une matière --</option>
          ${matieres.map(mat => `<option value="${mat.id}">${mat.nom_matiere}</option>`).join("")}
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="matiereId"></p>
      </div>

      <div>
        <input type="file" name="imageFile" accept="image/*" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="image"></p>
      </div>

      <div>
        <input type="file" name="fichier" accept=".pdf,.epub,.docx" class="w-full p-2 border rounded" />
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

    const modal = new Modal("Ajouter un livre", form);
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
        format: form.format.value,
        type: form.type.value,
        categorieId: form.categorieId.value,
        niveauId: form.niveauId.value,
        matiereId: form.matreId.value,
      };

      // Validation
      const errors = validate(formData, {
        titre: ["required", "min:3"],
        auteur: ["required", "min:3"],
        format: ["required"],
        type: ["required"],
        categorieId: ["required"],
        niveauId: ["required"],
        matiereId: ["required"],
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
        form.querySelector('[data-error="fichier"]').textContent = "Le fichier est requis";
        submitBtn.disabled = false;
        loader.classList.add("hidden");
        return;
      }

      // Upload image et fichier
      try {
        let imageUrl = null;
        if (imageFile) {
          const imageResult = await cloudinary.uploadImage(imageFile);
          imageUrl = imageResult.secure_url;
        }

        // Dans une vraie application, vous devriez aussi uploader le fichier PDF/EPUB
        // Ici nous simulons juste le chemin du fichier
        const cheminFichier = `/uploads/livres/${fichier.name}`;

        const newLivre = {
          ...formData,
          image: imageUrl,
          chemin_fichier: cheminFichier,
          deleted: false,
        };

        await this.livreService.createLivre(newLivre);
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

  showDetails(livre) {
    const detailContainer = document.createElement("div");

    const isDeleted = livre.deleted === true;

    detailContainer.innerHTML = `
      <div class="space-y-4">
        <img src="${livre.image || 'https://via.placeholder.com/400x300'}" alt="${livre.titre}" class="w-full h-60 object-cover rounded-md" />
        <h2 class="text-xl font-bold">${livre.titre}</h2>
        <p><strong>Auteur :</strong> ${livre.auteur}</p>
        <p><strong>Format :</strong> ${livre.format}</p>
        <p><strong>Type :</strong> ${livre.type}</p>
        <p><strong>Catégorie :</strong> ${livre.categorie?.nom || 'N/A'}</p>
        <p><strong>Niveau :</strong> ${livre.niveau?.libelle || 'N/A'}</p>
        <p><strong>Matière :</strong> ${livre.matiere?.nom_matiere || 'N/A'}</p>

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

    const modal = new Modal("Détails du livre", detailContainer);
    modal.open();

    if (isDeleted) {
      detailContainer.querySelector(".btn-restore").onclick = async () => {
        if (await confirm("Voulez-vous restaurer ce livre ?")) {
          await this.livreService.updateLivre(livre.id, { deleted: false });
          modal.close();
          this.render();
        }
      };
    } else {
      detailContainer.querySelector(".btn-edit").onclick = () => {
        modal.close();
        this.showEditForm(livre);
      };

      detailContainer.querySelector(".btn-delete").onclick = async () => {
        if (await confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {
          await this.livreService.deleteLivre(livre.id);
          modal.close();
          this.render();
        }
      };
    }
  }

  async showEditForm(livre) {
    const cloudinary = new CloudinaryClient();
    const [categories, niveaux, matieres] = await Promise.all([
      this.livreService.getCategories(),
      this.livreService.getNiveaux(),
      this.livreService.getMatieres()
    ]);

    const form = document.createElement("form");
    form.className = "space-y-4 relative";

    form.innerHTML = `
      <div>
        <input type="text" name="titre" value="${livre.titre}" placeholder="Titre" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="titre"></p>
      </div>

      <div>
        <input type="text" name="auteur" value="${livre.auteur}" placeholder="Auteur" class="w-full p-2 border rounded" />
        <p class="text-sm text-red-500 mt-1" data-error="auteur"></p>
      </div>

      <div>
        <select name="format" class="w-full p-2 border rounded">
          <option value="">-- Choisir un format --</option>
          <option value="PDF" ${livre.format === 'PDF' ? 'selected' : ''}>PDF</option>
          <option value="EPUB" ${livre.format === 'EPUB' ? 'selected' : ''}>EPUB</option>
          <option value="DOCX" ${livre.format === 'DOCX' ? 'selected' : ''}>DOCX</option>
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="format"></p>
      </div>

      <div>
        <select name="type" class="w-full p-2 border rounded">
          <option value="">-- Choisir un type --</option>
          <option value="LIVRE_COURS" ${livre.type === 'LIVRE_COURS' ? 'selected' : ''}>Livre de cours</option>
          <option value="LIVRE_EXERCICE" ${livre.type === 'LIVRE_EXERCICE' ? 'selected' : ''}>Livre d'exercices</option>
          <option value="MEMOIRE" ${livre.type === 'MEMOIRE' ? 'selected' : ''}>Mémoire</option>
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="type"></p>
      </div>

      <div>
        <select name="categorieId" class="w-full p-2 border rounded">
          <option value="">-- Choisir une catégorie --</option>
          ${categories.map(cat => 
            `<option value="${cat.id}" ${livre.categorieId == cat.id ? 'selected' : ''}>${cat.nom}</option>`
          ).join("")}
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="categorieId"></p>
      </div>

      <div>
        <select name="niveauId" class="w-full p-2 border rounded">
          <option value="">-- Choisir un niveau --</option>
          ${niveaux.map(niv => 
            `<option value="${niv.id}" ${livre.niveauId == niv.id ? 'selected' : ''}>${niv.libelle}</option>`
          ).join("")}
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="niveauId"></p>
      </div>

      <div>
        <select name="matiereId" class="w-full p-2 border rounded">
          <option value="">-- Choisir une matière --</option>
          ${matieres.map(mat => 
            `<option value="${mat.id}" ${livre.matiereId == mat.id ? 'selected' : ''}>${mat.nom_matiere}</option>`
          ).join("")}
        </select>
        <p class="text-sm text-red-500 mt-1" data-error="matiereId"></p>
      </div>

      <div>
        <p class="text-gray-600 text-sm mb-2">Image actuelle :</p>
        <img src="${livre.image}" alt="Aperçu de l'image" class="w-32 h-32 object-cover mb-2 rounded border" />
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

    const modal = new Modal("Modifier le livre", form);
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
        format: form.format.value,
        type: form.type.value,
        categorieId: form.categorieId.value,
        niveauId: form.niveauId.value,
        matiereId: form.matiereId.value,
      };

      form.querySelectorAll("[data-error]").forEach((el) => (el.textContent = ""));

      const errors = validate(formData, {
        titre: ["required", "min:3"],
        auteur: ["required", "min:3"],
        format: ["required"],
        type: ["required"],
        categorieId: ["required"],
        niveauId: ["required"],
        matiereId: ["required"],
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

      let imageUrl = livre.image;

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

      const updatedLivre = {
        ...livre,
        ...formData,
        image: imageUrl,
      };

      try {
        await this.livreService.updateLivre(livre.id, updatedLivre);
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