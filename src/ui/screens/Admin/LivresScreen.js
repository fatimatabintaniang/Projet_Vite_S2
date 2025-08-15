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
    this.cloudinary = new CloudinaryClient();
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
      this.bindDownloadButton();
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
          
          <button id="btn-download" class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-6-4l-4 4m0 0l-4-4m4 4V8m8 8V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" />
            </svg>
            <span>Télécharger</span>
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
              <p class="text-gray-600 text-sm mb-1"><strong>Format:</strong> ${livre.formats?.extension || 'N/A'}</p>
              <p class="text-gray-600 text-sm mb-3"><strong>Type:</strong> ${livre.types?.libelle || 'N/A'}</p>
              <button 
                data-id="${livre.id}" 
                class="btn-details w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
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
      btnAdd.addEventListener("click", () => {
        this.showAddForm();
      });
    }
  }

  bindDownloadButton() {
    const btnDownload = this.container.querySelector("#btn-download");
    if (btnDownload) {
      btnDownload.addEventListener("click", () => {
        // Implémentez la logique de téléchargement ici
        console.log("Téléchargement des livres");
      });
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
    try {
      const [categories, niveaux, matieres, types, formats] = await Promise.all([
        this.livreService.getCategories(),
        this.livreService.getNiveaux(),
        this.livreService.getMatieres(),
        this.livreService.getTypes(),
        this.livreService.getFormats()
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
          <select name="id_format" class="w-full p-2 border rounded">
            <option value="">-- Choisir un format --</option>
            ${formats.map(f => `<option value="${f.id}">${f.extension}</option>`).join("")}
          </select>
          <p class="text-sm text-red-500 mt-1" data-error="id_format"></p>
        </div>

        <div>
          <select name="id_type" class="w-full p-2 border rounded">
            <option value="">-- Choisir un type --</option>
            ${types.map(t => `<option value="${t.id}">${t.libelle}</option>`).join("")}
          </select>
          <p class="text-sm text-red-500 mt-1" data-error="id_type"></p>
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

      const modal = new Modal({
        title: "Ajouter un livre",
        content: form.outerHTML,
        onClose: () => {}
      });

      document.body.appendChild(modal.getElement());
      modal.open();

      form.querySelector("#cancel-add").addEventListener("click", () => modal.close());

     form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector(".submit-btn");
  const loader = form.querySelector(".loader");
  submitBtn.disabled = true;
  loader.classList.remove("hidden");

  try {
    // Validation des champs
    const formData = {
      titre: form.titre.value.trim(),
      auteur: form.auteur.value.trim(),
      id_format: form.id_format.value,
      id_type: form.id_type.value,
      categorieId: form.categorieId.value,
      niveauId: form.niveauId.value,
      matiereId: form.matiereId.value,
    };

    // Vérification des fichiers
    if (!form.fichier.files[0]) {
      throw new Error("Le fichier du livre est requis");
    }

    // Upload de l'image si elle existe
    let imageUrl = null;
    if (form.imageFile.files[0]) {
      const imageResult = await this.cloudinary.uploadImage(form.imageFile.files[0]);
      imageUrl = imageResult.secure_url;
    }

    // Création de l'objet livre à envoyer
    const newLivre = {
      ...formData,
      image: imageUrl,
      chemin_fichier: form.fichier.files[0].name, // ou uploader aussi ce fichier
      deleted: false,
    };

    // Envoi au backend
    await this.livreService.createLivre(newLivre);
    modal.close();
    this.render();
  } catch (error) {
    console.error("Erreur lors de l'ajout:", error);
    alert(`Erreur: ${error.message}`);
  } finally {
    submitBtn.disabled = false;
    loader.classList.add("hidden");
  }
});
    } catch (error) {
      console.error("Erreur dans showAddForm:", error);
      alert("Une erreur est survenue lors de l'ouverture du formulaire");
    }
  }

  showDetails(livre) {
    const detailContainer = document.createElement("div");

    const isDeleted = livre.deleted === true;

    detailContainer.innerHTML = `
      <div class="space-y-4">
        <img src="${livre.image || 'https://via.placeholder.com/400x300'}" alt="${livre.titre}" class="w-full h-60 object-cover rounded-md" />
        <h2 class="text-xl font-bold">${livre.titre}</h2>
        <p><strong>Auteur :</strong> ${livre.auteur}</p>
        <p><strong>Format :</strong> ${livre.format?.extension || 'N/A'}</p>
        <p><strong>Type :</strong> ${livre.type?.libelle || 'N/A'}</p>
        <p><strong>Catégorie :</strong> ${livre.categorie?.nom || 'N/A'}</p>
        <p><strong>Niveau :</strong> ${livre.niveau?.libelle || 'N/A'}</p>
        <p><strong>Matière :</strong> ${livre.matiere?.nom_matiere || 'N/A'}</p>
        <p><strong>Fichier :</strong> ${livre.chemin_fichier || 'N/A'}</p>

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

    const modal = new Modal({
      title: "Détails du livre",
      content: detailContainer,
      onClose: () => {}
    });   
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
    try {
      const [categories, niveaux, matieres, types, formats] = await Promise.all([
        this.livreService.getCategories(),
        this.livreService.getNiveaux(),
        this.livreService.getMatieres(),
        this.livreService.getTypes(),
        this.livreService.getFormats()
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
          <select name="id_format" class="w-full p-2 border rounded">
            <option value="">-- Choisir un format --</option>
            ${formats.map(f => 
              `<option value="${f.id}" ${livre.id_format == f.id ? 'selected' : ''}>${f.extension}</option>`
            ).join("")}
          </select>
          <p class="text-sm text-red-500 mt-1" data-error="id_format"></p>
        </div>

        <div>
          <select name="id_type" class="w-full p-2 border rounded">
            <option value="">-- Choisir un type --</option>
            ${types.map(t => 
              `<option value="${t.id}" ${livre.id_type == t.id ? 'selected' : ''}>${t.libelle}</option>`
            ).join("")}
          </select>
          <p class="text-sm text-red-500 mt-1" data-error="id_type"></p>
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
          <img src="${livre.image || 'https://via.placeholder.com/150'}" alt="Aperçu de l'image" class="w-32 h-32 object-cover mb-2 rounded border" />
          <input type="file" name="imageFile" accept="image/*" class="w-full p-2 border rounded" />
          <p class="text-sm text-red-500 mt-1" data-error="image"></p>
        </div>

        <div>
          <p class="text-gray-600 text-sm mb-2">Fichier actuel :</p>
          <p class="text-sm mb-2">${livre.chemin_fichier || 'Aucun fichier'}</p>
          <input type="file" name="fichier" accept=".pdf,.epub,.docx" class="w-full p-2 border rounded" />
          <p class="text-sm text-red-500 mt-1" data-error="fichier"></p>
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

      const modal = new Modal({
        title: "Modifier le livre",
        content: form,
        onClose: () => {}
      });
      modal.open();

      form.querySelector("#cancel-edit").onclick = () => modal.close();

      form.onsubmit = async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector(".submit-btn");
        const loader = form.querySelector(".loader");
        submitBtn.disabled = true;
        loader.classList.remove("hidden");

        const imageInput = form.imageFile;
        const fichierInput = form.fichier;
        const imageFile = imageInput.files[0];
        const fichier = fichierInput.files[0];

        const formData = {
          titre: form.titre.value.trim(),
          auteur: form.auteur.value.trim(),
          id_format: form.id_format.value,
          id_type: form.id_type.value,
          categorieId: form.categorieId.value,
          niveauId: form.niveauId.value,
          matiereId: form.matiereId.value,
        };

        form.querySelectorAll("[data-error]").forEach((el) => (el.textContent = ""));

        const errors = validate(formData, {
          titre: ["required", "min:3"],
          auteur: ["required", "min:3"],
          id_format: ["required"],
          id_type: ["required"],
          categorieId: ["required"],
          niveauId: ["required"],
          matiereId: ["required"],
        });
        console.log("Erreurs de validation:", errors);

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
        let fichierPath = livre.chemin_fichier;

        try {
          // Upload de la nouvelle image si elle existe
          if (imageFile) {
            const result = await this.cloudinary.uploadImage(imageFile);
            imageUrl = result.secure_url;
          }

          // Simuler l'upload du nouveau fichier
          if (fichier) {
            fichierPath = `/uploads/livres/${fichier.name}`;
          }

          const updatedLivre = {
            ...livre,
            ...formData,
            image: imageUrl,
            chemin_fichier: fichierPath,
          };

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
    } catch (error) {
      console.error("Erreur dans showEditForm:", error);
      alert("Une erreur est survenue lors de l'ouverture du formulaire");
    }
  }
}