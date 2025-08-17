import { AuthService } from "../../services/authService.js";

export default class Sidebar {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService();
    this.dropdownOpen = false;
  }

  render() {
    const user = this.authSvc.getCurrentUser();
    const currentHash = window.location.hash;

    if (!user) {
      this.root.innerHTML = "";
      return;
    }

    let links = "";

    const getActiveClass = (hash) => {
      return currentHash === hash ? 'bg-[#ff6e88]' : 'hover:bg-[#9a1a33]';
    };

    switch (user.id_role) {
      case "1": // Admin
        links = `
          <a href="#admin" class="flex items-center p-2 rounded-lg ${getActiveClass('#admin')} transition-colors">
            <i class="fa fa-tachometer-alt mr-3 text-xs"></i>
            <span>Dashboard</span>
          </a>
          <a href="#livres" class="flex items-center p-2 rounded-lg ${getActiveClass('#livres')} transition-colors">
            <i class="fa fa-book mr-3 text-xs"></i>
            <span>Lister les livres</span>
          </a>
          <a href="#categories" class="flex items-center p-2 rounded-lg ${getActiveClass('#categories')} transition-colors">
            <i class="fa fa-tags mr-3 text-xs"></i>
            <span>Lister les catégories</span>
          </a>
        
          <a href="#add-enseignant" class="flex items-center p-2 rounded-lg ${getActiveClass('#enseignants')} transition-colors">
            <i class="fa fa-chalkboard-teacher mr-3 text-xs"></i>
            <span>Lister les enseignants</span>
          </a>
      
        `;
        break;

      case "2": // Enseignant
        links = `
          <a href="#enseignant" class="flex items-center p-2 rounded-lg ${getActiveClass('#enseignant')} transition-colors">
            <i class="fa fa-home mr-3 text-xs"></i>
            <span>Accueil</span>
          </a>
          <a href="#catalogue" class="flex items-center p-2 rounded-lg ${getActiveClass('#catalogue')} transition-colors">
            <i class="fa fa-book-open mr-3 text-xs"></i>
            <span>Catalogue</span>
          </a>
          <a href="#favoris" class="flex items-center p-2 rounded-lg ${getActiveClass('#favoris')} transition-colors">
            <i class="fa fa-heart mr-3 text-xs"></i>
            <span>Liste favoris</span>
          </a>
          <a href="#telechargements" class="flex items-center p-2 rounded-lg ${getActiveClass('#telechargements')} transition-colors">
            <i class="fa fa-download mr-3 text-xs"></i>
            <span>Téléchargements</span>
          </a>
        `;
        break;

      case "3": // Etudiant
        links = `
          <a href="#etudiant" class="flex items-center p-2 rounded-lg ${getActiveClass('#etudiant')} transition-colors">
            <i class="fa fa-home mr-3 text-xs"></i>
            <span>Dashboard</span>
          </a>
          <a href="#livre-Etudiant" class="flex items-center p-2 rounded-lg ${getActiveClass('#livre-Etudiant')} transition-colors">
            <i class="fa fa-search mr-3 text-xs"></i>
            <span>Liste Livre</span>
          </a>
          <a href="#favoris" class="flex items-center p-2 rounded-lg ${getActiveClass('#favoris')} transition-colors">
            <i class="fa fa-bookmark mr-3 text-xs"></i>
            <span>Liste des favorie</span>
          </a>
          <a href="#telechargement" class="flex items-center p-2 rounded-lg ${getActiveClass('#telechargement')} transition-colors">
            <i class="fa fa-list-alt mr-3 text-xs"></i>
            <span>Liste des telechargements</span>
          </a>
        `;
        break;

      default:
        links = "";
    }

    this.root.innerHTML = `
      <aside class="bg-[#870E24] text-white w-64 h-screen shadow flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-center p-4 border-b">
            <div class="text-xl text-[#870E24] font-bold p-5 bg-white rounded-3xl">GB</div>
          </div>
          <nav class="flex flex-col space-y-2 px-4 py-6">
            ${links}
          </nav>
        </div>

        <div class="p-4 border-t relative">
          <button id="profile-dropdown-btn" 
                  class="flex items-center gap-2 focus:outline-none w-full text-left" 
                  aria-haspopup="true" aria-expanded="false">
            ${user.image
              ? `<img src="${user.image}" alt="image" class="w-8 h-8 rounded-full object-cover">`
              : `<div class="bg-gray-200 w-8 h-8 rounded-full"></div>`
            }
            <div class="text-sm font-medium text-white">
              <span>${user.prenom} ${user.nom}</span>
            </div>
            <svg class="w-4 h-4 ml-auto transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="profile-dropdown" class="hidden absolute bottom-full mb-2 bg-white text-[#870E24] border rounded shadow-md z-20">
            <button id="logoutBtn" class="w-full text-left px-4 py-2 hover:bg-[#ff6e88] hover:text-white transition-colors rounded">
              <i class="fa fa-sign-out-alt mr-2"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    `;

    this.setUpEventListeners();
  }

  setUpEventListeners() {
    const logoutBtn = this.root.querySelector("#logoutBtn");
    const profileBtn = this.root.querySelector("#profile-dropdown-btn");
    const dropdown = this.root.querySelector("#profile-dropdown");
    const arrowIcon = profileBtn.querySelector("svg");

    logoutBtn.addEventListener("click", () => {
      this.authSvc.logout();
      window.location.hash = "#login";
    });

    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = dropdown.classList.contains("hidden");
      if (isHidden) {
        dropdown.classList.remove("hidden");
        profileBtn.setAttribute("aria-expanded", "true");
        arrowIcon.classList.add("rotate-180");
      } else {
        dropdown.classList.add("hidden");
        profileBtn.setAttribute("aria-expanded", "false");
        arrowIcon.classList.remove("rotate-180");
      }
    });

    document.addEventListener("click", () => {
      if (!dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
        profileBtn.setAttribute("aria-expanded", "false");
        arrowIcon.classList.remove("rotate-180");
      }
    });

    // Ajout d'un écouteur pour mettre à jour la classe active lors du changement de hash
    window.addEventListener('hashchange', () => {
      this.render(); // Re-rend le composant pour mettre à jour les classes active
    });
  }
}