import { Modal } from "../../component/Modal.js";
import { confirm } from "../../component/Confirm.js";
import { validate } from "../../../utils/validation.js";
import { CloudinaryClient } from "../../../services/Cloudinary.js";
import LivreService from "../../../services/LivreService.js";
import MemoireService from "../../../services/MemoireService.js";
import { AuthService } from "../../../services/authService.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Fonction pour générer les icônes
const ICONS = {
  add: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>`,
};

export class LivresScreen {

  constructor(container) {
    this.container = container;
    this.livreService = new LivreService();
    this.memoireService = new MemoireService();
    this.authService = new AuthService();
    this.view = "active";
    this.cloudinary = new CloudinaryClient();
    this.formats = [];
    this.types = [];
    this.categories = [];
    this.niveaux = [];
    this.matieres = [];
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedType = '';
    this.selectedFormat = '';
  }

  // Fonction d'initialisation
  // Charge les données initiales et configure les événements
  async render() {
    try {

      const livres = await this.livreService.getAllLivres();
      const filteredLivres = livres.filter(livre => {
        // Filtre par statut (actif/corbeille)
        const viewMatch = this.view === "active" ? !livre.deleted : livre.deleted;

        // Filtre par recherche
        const searchMatch = !this.searchQuery ||
          livre.titre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          livre.auteur.toLowerCase().includes(this.searchQuery.toLowerCase());

        // Filtres par catégorie/type/format
        const categoryMatch = !this.selectedCategory || livre.categorieId == this.selectedCategory;
        const typeMatch = !this.selectedType || livre.id_type == this.selectedType;
        const formatMatch = !this.selectedFormat || livre.id_format == this.selectedFormat;
        const niveauMatch = !this.selectedNiveau || livre.niveauId == this.selectedNiveau;

        return viewMatch && searchMatch && categoryMatch && typeMatch && formatMatch && niveauMatch;;
      });


      const [typesRes, formatsRes, categoriesRes, niveauxRes] = await Promise.all([
        this.livreService.getTypes(),
        this.livreService.getFormats(),
        this.livreService.getCategories(),
         this.livreService.getNiveaux()
      ]);

      this.types = typesRes.data || [];
      this.formats = formatsRes.data || [];
      this.categories = categoriesRes.data || [];
      this.niveaux = niveauxRes.data || [];

      this.renderList(filteredLivres);
      this.bindViewToggle();
      this.bindAddButton();
      this.bindSearchInput();
      this.bindFilters();
      this.bindDownloadButton();
      this.bindActionButtons();
    } catch (err) {
      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-10 text-center text-red-500 mt-20">
          <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
          <p class="text-lg">Erreur : ${err.message}</p>
        </div>`;
    }
  }

  // Fonction pour générer les contrôles de la page (boutons, filtres, etc.)
 renderControls() {
  return `
    <div class="items-center p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Gestion des Livres</h1>
        <div class="inline-flex rounded-md shadow-sm ml-4" role="group">
         <div>
                ${this.view === "active" ? `
          <div class="flex flex-col sm:flex-row gap-4">
            <button id="btn-add" class="flex items-center justify-center gap-2 bg-[#873A0E] hover:bg-[#873A0E] text-white px-4 py-2 rounded-lg transition-colors duration-200">
              ${ICONS.add}
              <span>Ajouter</span>
            </button>
            
            <button id="btn-download" class="flex items-center justify-center gap-2 bg-[#F998A9] hover:bg-[#F998A] text-white px-4 py-2 rounded-lg transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-6-4l-4 4m0 0l-4-4m4 4V8m8 8V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" />
              </svg>
              <span>Télécharger</span>
            </button>
          </div>
         ` : ''}
         </div>
        

         <div class="px-4">
          <button data-v="active" type="button" class="tab px-4 py-2 text-sm font-medium rounded-l-lg border ${this.view === "active" ? "bg-[#873A0E] text-white" : ""}">
            Actifs
          </button>
          <button data-v="deleted" type="button" class="tab px-4 py-2 text-sm font-medium rounded-r-lg border ${this.view === "deleted" ? "bg-[#873A0E] text-white" : ""}">
            Corbeille
          </button>
         </div>

        </div>
      </div>
    </div>

    <div class="flex items-center justify-between space-x-4 p-6">
      <input 
        id="search-input"
        type="text"
        placeholder="Rechercher par titre ou auteur..."
        class="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:border-indigo-400"
        value="${this.searchQuery || ''}"
      />
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Filtres -->
        <select id="filter-category" class="px-4 py-2 border rounded-lg focus:outline-none">
          <option value="">Toutes catégories</option>
          ${this.categories.map(c => `
            <option value="${c.id}" ${this.selectedCategory == c.id ? 'selected' : ''}>${c.nom}</option>
          `).join('')}
        </select>
        
        <select id="filter-type" class="px-4 py-2 border rounded-lg focus:outline-none">
          <option value="">Tous types</option>
          ${this.types.map(t => `
            <option value="${t.id}" ${this.selectedType == t.id ? 'selected' : ''}>${t.libelle}</option>
          `).join('')}
        </select>

        <select id="filter-niveau" class="px-4 py-2 border rounded-lg focus:outline-none">
          <option value="">Tous niveaux</option>
          ${this.niveaux.map(n => `
            <option value="${n.id}" ${this.selectedNiveau == n.id ? 'selected' : ''}>${n.libelle}</option>
          `).join('')}
        </select>
        
        <select id="filter-format" class="px-4 py-2 border rounded-lg focus:outline-none">
          <option value="">Tous formats</option>
          ${this.formats.map(f => `
            <option value="${f.id}" ${this.selectedFormat == f.id ? 'selected' : ''}>${f.extension}</option>
          `).join('')}
        </select>
      </div>
    </div>
  `;
}

  // Fonction pour afficher la liste des livres
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
        .map(livre => {
          const format = this.formats.find(f => f.id == livre.id_format);
          const type = this.types.find(t => t.id == livre.id_type);

          return `
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
                  <p class="text-gray-600 text-sm mb-1"><strong>Format:</strong> ${format?.extension || 'N/A'}</p>
                  <p class="text-gray-600 text-sm mb-3"><strong>Type:</strong> ${type?.libelle || 'N/A'}</p>
                  <div class="flex justify-between items-center">
                    <button class="text-indigo-600 hover:text-indigo-800" data-action="edit" data-id="${livre.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v6m-7-3l4.586-4.586a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828L17 11m-6 6l-4.586-4.586a2 2 0 00-2.828 0L4.172 13a2 2 0 000 2.828L9.172 20" />
                      </svg>
                    </button>
                    <button class="${livre.deleted ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}" data-action="${livre.deleted ? 'restore' : 'delete'}" data-id="${livre.id}">
                      ${livre.deleted ? `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ` : `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7h-3.586l-1.707-1.707a1 1 0 00-.707-.293H9.414a1 1 0 00-.707.293L7 7H3m16 0v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7m16 0H5m16 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2m16 0H5" />
                        </svg>
                      `}
                    </button>
                    <button class="text-gray-600 hover:text-gray-800" data-action="details" data-id="${livre.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-3a6 6 0 110-12 6 6 0 010 12zm1-6h-2m1-4h.01M12 15h.01" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>`;
        }).join("")}
      </div>`;


  }

  // Fonction pour lier les événements de recherche
  bindSearchInput() {
    const searchInput = this.container.querySelector("#search-input");
    if (searchInput) {
      // Recherche lors de la frappe avec un délai de 300ms
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.render();
        }, 300);
      });

      // Recherche lors de la touche Entrée
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.searchQuery = e.target.value.trim();
          this.render();
        }
      });
    }
  }

  // Fonction pour lier les événements des boutons d'action (éditer, supprimer, restaurer, détails)
  bindFilters() {
    // Filtre par catégorie
    const categoryFilter = this.container.querySelector("#filter-category");
    if (categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        this.selectedCategory = e.target.value;
        this.render();
      });
    }

    // Filtre par type
    const typeFilter = this.container.querySelector("#filter-type");
    if (typeFilter) {
      typeFilter.addEventListener("change", (e) => {
        this.selectedType = e.target.value;
        this.render();
      });
    }

    // Filtre par format
    const formatFilter = this.container.querySelector("#filter-format");
    if (formatFilter) {
      formatFilter.addEventListener("change", (e) => {
        this.selectedFormat = e.target.value;
        this.render();
      });
    }
    // filtre niveau
     const niveauFilter = this.container.querySelector("#filter-niveau");
  if (niveauFilter) {
    niveauFilter.addEventListener("change", (e) => {
      this.selectedNiveau = e.target.value;
      this.render();
    });
  }
  }

// Fonction pour lier les événements de basculement de vue (actifs/corbeille)
  bindViewToggle() {
    const buttons = this.container.querySelectorAll(".tab");
    buttons.forEach(btn =>
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-v");
        if (v !== this.view) {
          this.view = v;
          this.render();
        }
      })
    );
  }


  // Fonction pour lier le bouton d'ajout de livre
  bindAddButton() {
    const btnAdd = this.container.querySelector("#btn-add");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => this.showAddForm());
    }
  }

// Fonction pour lier le bouton de téléchargement
bindDownloadButton() {
    const btnDownload = this.container.querySelector("#btn-download");
    if (btnDownload) {
        btnDownload.addEventListener("click", async () => {
            try {
                // Afficher un indicateur de chargement
                btnDownload.innerHTML = `
                    <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Génération en cours...
                `;
                
                // Récupérer tous les livres
                const livres = await this.livreService.getAllLivres();
                
                // Générer le PDF
                await this.generateBooksPDF(livres);
                
                // Restaurer le texte original du bouton
                btnDownload.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-6-4l-4 4m0 0l-4-4m4 4V8m8 8V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" />
                    </svg>
                    Télécharger
                `;
            } catch (error) {
                console.error("Erreur génération PDF:", error);
                alert("Erreur lors de la génération du PDF");
                btnDownload.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-6-4l-4 4m0 0l-4-4m4 4V8m8 8V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" />
                    </svg>
                    Télécharger
                `;
            }
        });
    }
}

// fonction pour generer un PDF avec jsPDF et autoTable
async generateBooksPDF(livres) {
    // Créer un nouveau document PDF
    const doc = new jsPDF();

    // Ajouter un titre
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Liste des Livres', 105, 15, { align: 'center' });

    // Préparer les données
    const headers = [["Titre", "Auteur", "Type", "Catégorie", "Niveau"]];
    const data = livres.map(livre => [
        livre.titre,
        livre.auteur,
        this.types.find(t => t.id == livre.id_type)?.libelle || 'N/A',
        this.categories.find(c => c.id == livre.categorieId)?.nom || 'N/A',
        this.niveaux.find(n => n.id == livre.niveauId)?.libelle || 'N/A'
    ]);

    // Générer le tableau avec autoTable
    autoTable(doc, {
        head: headers,
        body: data,
        startY: 30,
        theme: 'grid',
        headStyles: {
            fillColor: [135, 58, 14], // Marron
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 152, 169, 0.2] // Rose clair
        },
        margin: { top: 30 }
    });

    // Ajouter la date
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 22, { align: 'center' });

    // Ajouter le nombre total de livres
    doc.setFontSize(10);
    doc.text(`Total: ${livres.length} livres`, 14, doc.lastAutoTable.finalY + 10);

    // Sauvegarder le PDF
    doc.save(`liste-livres_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Fonction pour lier les événements des boutons d'action (éditer, supprimer, restaurer, détails)
  bindActionButtons() {
    const buttons = this.container.querySelectorAll("[data-action]");
    buttons.forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        try {
          const livre = await this.livreService.getLivreById(id);

          switch (action) {
            case "details":
              this.showDetails(livre.data);
              break;
            case "edit":
              this.showAddForm(livre.data);
              break;
            case "delete":
              if (await confirm("Voulez-vous vraiment supprimer ce livre ?")) {
                console.log("Suppression du livre ID:", livre.data.id);
                await this.livreService.softDeleteLivre(livre.data.id);
                this.render();
              }
              break;

            case "restore":
              if (await confirm("Voulez-vous vraiment restaurer ce livre ?")) {
                console.log("Restauration du livre ID:", livre.data.id);
                await this.livreService.restoreLivre(livre.data.id);
                this.render();
              }
              break;

          }
        } catch (err) {
          console.error("Erreur lors de l'action sur le livre:", err);
          alert("Une erreur est survenue: " + err.message);
        }
      });
    });
  }


  // Fonction pour afficher les détails d'un livre dans une modale
  async showDetails(livre) {
    try {
      // Charger toutes les données nécessaires
      const [categoriesRes, niveauxRes, matieresRes, typesRes, formatsRes, memoiresRes] = await Promise.all([
        this.livreService.getCategories(),
        this.livreService.getNiveaux(),
        this.livreService.getMatieres(),
        this.livreService.getTypes(),
        this.livreService.getFormats(),
        this.memoireService.getAllMemoires() // récupérer toutes les mémoires
      ]);

      this.categories = categoriesRes.data || [];
      this.niveaux = niveauxRes.data || [];
      this.matieres = matieresRes.data || [];
      this.types = typesRes.data || [];
      this.formats = formatsRes.data || [];
      this.memoires = memoiresRes || []; // 

      // Vérifier si le livre est un mémoire
      const isMemoire = livre.id_type == "3";

      // Chercher le mémoire correspondant à ce livre
      let memoire = null;
      if (isMemoire) {
        memoire = this.memoires.find(m => m.id_livre === livre.id);
        console.log("Mémoire trouvée:", memoire);
      }

      const modal = new Modal({
        title: "Détails du livre",
        content: `
        <div class="space-y-4 overflow-y-auto h-[70vh]">
          <div class="flex items-center justify-center">
            <img src="${livre.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${livre.titre}"
                 class="max-h-64 rounded-lg shadow-md">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-bold text-lg mb-2">Informations de base</h3>
              <p><strong>Titre:</strong> ${livre.titre}</p>
              <p><strong>Auteur:</strong> ${livre.auteur}</p>
              <p><strong>Format:</strong> ${this.formats.find(f => f.id == livre.id_format)?.extension || 'N/A'}</p>
              <p><strong>Type:</strong> ${this.types.find(t => t.id == livre.id_type)?.libelle || 'N/A'}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-bold text-lg mb-2">Classification</h3>
              <p><strong>Catégorie:</strong> ${this.categories.find(c => c.id == livre.categorieId)?.nom || 'N/A'}</p>
              <p><strong>Niveau:</strong> ${this.niveaux.find(n => n.id == livre.niveauId)?.libelle || 'N/A'}</p>
              <p><strong>Matière:</strong> ${this.matieres.find(m => m.id == livre.matiereId)?.nom_matiere || 'N/A'}</p>
            </div>
          </div>

          ${livre.chemin_fichier ? `
            <div class="bg-blue-50 p-4 rounded-lg">
              <h3 class="font-bold text-lg mb-2">Fichier</h3>
              <p><strong>Nom du fichier:</strong> ${livre.chemin_fichier}</p>
              <button class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Télécharger le fichier
              </button>
            </div>
          ` : ''}

          ${isMemoire && memoire ? `
            <div class="bg-green-50 p-4 rounded-lg">
              <h3 class="font-bold text-lg mb-2">Détails Mémoire</h3>
              <p><strong>Année:</strong> ${memoire.annee || 'N/A'}</p>
              <p><strong>Spécialité:</strong> ${memoire.specialite || 'N/A'}</p>
              <p><strong>Statut:</strong> ${memoire.statut || 'N/A'}</p>
            </div>
          ` : ''}
        </div>
      `,
        onClose: () => { }
      });

      document.body.appendChild(modal.getElement());
      modal.open();

    } catch (error) {
      console.error("Erreur showDetails:", error);
      alert("Impossible d'afficher les détails du livre");
    }
  }


// Fonction pour afficher le formulaire d'ajout/édition de livre
  async showAddForm(livreToEdit = null) {
    try {
      const [categoriesRes, niveauxRes, matieresRes, typesRes, formatsRes, utilisateursRes] = await Promise.all([
        this.livreService.getCategories(),
        this.livreService.getNiveaux(),
        this.livreService.getMatieres(),
        this.livreService.getTypes(),
        this.livreService.getFormats(),
        this.authService.apiClient.get("/utilisateurs")
      ]);

      this.categories = categoriesRes.data || [];
      this.niveaux = niveauxRes.data || [];
      this.matieres = matieresRes.data || [];
      this.types = typesRes.data || [];
      this.formats = formatsRes.data || [];
      const utilisateurs = utilisateursRes.data || [];

      const modal = new Modal({
        title: livreToEdit ? "Modifier le livre" : "Ajouter un livre",
        content: `
      <form id="add-livre-form" class="space-y-6 overflow-y-auto h-[70vh] ">
        <!-- Titre et Auteur -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="titre">Titre</label>
            <input type="text" name="titre" id="titre" value="${livreToEdit?.titre || ''}" class="w-full p-2 border rounded" />
            <p class="text-red-500" data-error="titre"></p>
          </div>
          <div>
            <label for="auteur">Auteur</label>
            <input type="text" name="auteur" id="auteur" value="${livreToEdit?.auteur || ''}" class="w-full p-2 border rounded" />
            <p class="text-red-500" data-error="auteur"></p>
          </div>
        </div>

        <!-- Format et Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="id_format">Format</label>
            <select name="id_format" id="id_format" class="w-full p-2 border rounded">
              <option value="">-- Choisir un format --</option>
              ${this.formats.map(f => `<option value="${f.id}" ${livreToEdit?.id_format == f.id ? "selected" : ""}>${f.extension}</option>`).join("")}
            </select>
            <p class="text-red-500" data-error="id_format"></p>
          </div>
          <div>
            <label for="id_type">Type</label>
            <select name="id_type" id="id_type" class="w-full p-2 border rounded">
              <option value="">-- Choisir un type --</option>
              ${this.types.map(t => `<option value="${t.id}" ${livreToEdit?.id_type == t.id ? "selected" : ""}>${t.libelle}</option>`).join("")}
            </select>
            <p class="text-red-500" data-error="id_type"></p>
          </div>
        </div>

        <!-- Catégorie, Niveau, Matière -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="categorieId">Catégorie</label>
            <select name="categorieId" id="categorieId" class="w-full p-2 border rounded">
              <option value="">-- Choisir une catégorie --</option>
              ${this.categories.map(c => `<option value="${c.id}" ${livreToEdit?.categorieId == c.id ? "selected" : ""}>${c.nom}</option>`).join("")}
            </select>
            <p class="text-red-500" data-error="categorieId"></p>
          </div>
          <div>
            <label for="niveauId">Niveau</label>
            <select name="niveauId" id="niveauId" class="w-full p-2 border rounded">
              <option value="">-- Choisir un niveau --</option>
              ${this.niveaux.map(n => `<option value="${n.id}" ${livreToEdit?.niveauId == n.id ? "selected" : ""}>${n.libelle}</option>`).join("")}
            </select>
            <p class="text-red-500" data-error="niveauId"></p>
          </div>
          <div>
            <label for="matiereId">Matière</label>
            <select name="matiereId" id="matiereId" class="w-full p-2 border rounded">
              <option value="">-- Choisir une matière --</option>
              ${this.matieres.map(m => `<option value="${m.id}" ${livreToEdit?.matiereId == m.id ? "selected" : ""}>${m.nom_matiere}</option>`).join("")}
            </select>
            <p class="text-red-500" data-error="matiereId"></p>
          </div>
        </div>

        <!-- Auteur (utilisateur) -->
        <div>
          <label for="utilisateurId">Auteur (si inscrit)</label>
          <select name="utilisateurId" id="utilisateurId" class="w-full p-2 border rounded">
            <option value="">-- Auteur externe --</option>
            ${utilisateurs.map(u => `<option value="${u.id}">${u.prenom} ${u.nom}</option>`).join("")}
          </select>
        </div>

        <!-- Champs Mémoire -->
        <div id="memoire-fields" class="hidden space-y-4">
          <div>
            <label for="annee">Année</label>
            <input type="number" name="annee" id="annee" value="${livreToEdit?.annee || new Date().getFullYear()}" class="w-full p-2 border rounded" />
            <p class="text-red-500" data-error="annee"></p>
          </div>
          <div>
            <label for="statut" class="block text-sm font-medium text-gray-700">Statut</label>
            <select id="statut" name="statut" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">-- Sélectionner un statut --</option>
              <option value="Valider" ${livreToEdit?.statut === "Valider" ? "selected" : ""}>Valider</option>
              <option value="En attente" ${livreToEdit?.statut === "En attente" ? "selected" : ""}>En attente</option>
            </select>
            <p class="text-red-500" data-error="statut"></p>
          </div>
          <div>
            <label for="specialite">Spécialité</label>
            <input type="text" name="specialite" id="specialite" value="${livreToEdit?.specialite || ''}" class="w-full p-2 border rounded" />
            <p class="text-red-500" data-error="specialite"></p>
          </div>
        </div>

        <!-- Image et Fichier -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="imageFile">Image</label>
            <input type="file" name="imageFile" id="imageFile" accept="image/*" class="w-full p-2 border rounded" />
            <p>${livreToEdit?.image ? `Image actuelle: ${livreToEdit.image.split('/').pop()}` : 'Aucune image sélectionnée'}</p>
            <p class="text-red-500" data-error="image"></p>
          </div>
          <div>
            <label for="fichier">Fichier</label>
            <input type="file" name="fichier" id="fichier" accept=".pdf,.epub,.docx" class="w-full p-2 border rounded" />
            <p>${livreToEdit?.chemin_fichier ? `Fichier actuel: ${livreToEdit.chemin_fichier}` : 'Aucun fichier sélectionné'}</p>
            <p class="text-red-500" data-error="fichier"></p>
          </div>
        </div>

        <!-- Boutons -->
        <div class="flex justify-end space-x-2 pt-4">
          <button type="button" id="cancel-add" class="px-4 py-2 bg-gray-300 rounded">Annuler</button>
          <button type="submit" class="submit-btn px-4 py-2 bg-[#873A0E] text-white rounded">${livreToEdit ? "Modifier" : "Ajouter"}</button>
        </div>
      </form>
      `,
        onClose: () => { }
      });

      document.body.appendChild(modal.getElement());
      modal.open();

      const form = modal.getElement().querySelector("#add-livre-form");
      const memoireFields = form.querySelector("#memoire-fields");
      const typeSelect = form.querySelector("#id_type");
      const statutSelect = form.querySelector("#statut");

      // Affichage dynamique champs Mémoire
      const toggleMemoireFields = () => {
        const isMemoire = typeSelect.value === "3";
        memoireFields.classList.toggle("hidden", !isMemoire);
        if (isMemoire) statutSelect.setAttribute("required", "true");
        else statutSelect.removeAttribute("required");
      };
      typeSelect.addEventListener("change", toggleMemoireFields);
      toggleMemoireFields();

      form.querySelector("#cancel-add").addEventListener("click", () => modal.close());

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
          titre: form.titre.value.trim(),
          auteur: form.auteur.value.trim(),
          id_format: form.id_format.value,
          id_type: form.id_type.value,
          categorieId: form.categorieId.value,
          niveauId: form.niveauId.value,
          matiereId: form.matiereId.value,
          utilisateurId: form.utilisateurId.value || null,
          annee: form.annee?.value,
          specialite: form.specialite?.value,
          statut: form.statut?.value
        };

        // Validation
        const rules = {
          titre: ["required", "min:3"],
          auteur: ["required", "min:3"],
          id_format: ["required"],
          id_type: ["required"],
          categorieId: ["required"],
          niveauId: ["required"],
          matiereId: ["required"]
        };

        if (formData.id_type === "3") {
          rules.annee = ["required", "number"];
          rules.specialite = ["required"];
          rules.statut = ["required"];
        }

        const errors = validate(formData, rules);
          // Vérification de l'unicité du titre
  const isTitreUnique = await this.livreService.checkTitreUnique(
    formData.titre, 
    livreToEdit?.id
  );
  
  if (!isTitreUnique) {
    errors.titre = "Ce titre est déjà utilisé par un autre livre";
  }

        form.querySelectorAll("[data-error]").forEach(p => p.textContent = "");
        Object.keys(errors).forEach(field => {
          const p = form.querySelector(`[data-error="${field}"]`);
          if (p) p.textContent = errors[field];
        });
        if (Object.keys(errors).length > 0) return;

        // Upload image
        if (form.imageFile.files[0]) {
          const imgResult = await this.cloudinary.uploadImage(form.imageFile.files[0]);
          formData.image = imgResult.secure_url || imgResult;
        } else if (livreToEdit) {
          formData.image = livreToEdit.image || null;
        }

        // Upload fichier
        if (form.fichier.files[0]) {
          formData.chemin_fichier = form.fichier.files[0].name;
        } else if (livreToEdit) {
          formData.chemin_fichier = livreToEdit.chemin_fichier || null;
        }

        // Créer ou modifier le livre
        let savedLivre;
        if (livreToEdit) savedLivre = await this.livreService.updateLivre(livreToEdit.id, formData);
        else savedLivre = await this.livreService.createLivre(formData);

        // Créer mémoire si type = Mémoire
        if (formData.id_type === "3") {
          const memoirePayload = {
            id_livre: savedLivre.id,
            annee: formData.annee || new Date().getFullYear(),
            specialite: formData.specialite || "",
            statut: formData.statut || "",
            utilisateurId: formData.utilisateurId,
            deleted: false,
            deletedAt: null
          };
          await this.memoireService.createMemoire(memoirePayload);
        }

        modal.close();
        this.render();
      });

    } catch (error) {
      console.error("Erreur showAddForm:", error);
      alert("Impossible d'ouvrir le formulaire");
    }
  }

}