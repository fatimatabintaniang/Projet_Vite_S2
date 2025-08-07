import { AuthService } from "../../services/authService.js";

export default class Sidebar {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService();
    this.dropdownOpen = false;
  }

  render() {
    const user = this.authSvc.getCurrentUser();

    if (!user) {
      this.root.innerHTML = "";
      return;
    }

    let links = "";

    switch (user.id_role) {
      case "1": // Admin
        links = `
          <a href="admin" class="mr-4 hover:text-[#ff6e88]">
            <i class="fa fa-tachometer-alt text-xs"></i> Dashboard
          </a>
          <a href="#" class="mr-4 hover:text-[#ff6e88]">
            <i class="fa fa-book text-xs"></i> Lister les livres
          </a>
         
          <a href="#" class="mr-4 hover:text-[#ff6e88]">
            <i class="fa fa-users text-xs"></i> Lister les catégories
            </a>
          <a href="#" class="mr-4 hover:text-[#ff6e88]">
            <i class="fa fa-file-alt text-xs"></i> Lister les mémoires
          </a>
          <a href="#add-enseignant" class="mr-4 hover:text-[#ff6e88]">
            <i class="fa fa-chalkboard-teacher text-xs"></i> Lister les enseignants
          </a>
        `;
        break;

      case "2": // Enseignant
        links = `
          <a href="#" class="mr-4 hover:text-blue-600">Catalogue</a>
          <a href="#" class="mr-4 hover:text-blue-600">liste favorie</a>
          <a href="#" class="mr-4 hover:text-blue-600">liste telechargement</a>
        `;
        break;

      case "3": // Etudiant
        links = `
          <a href="client" class="mr-4 hover:text-blue-600">Dashboard Client</a>
          <a href="articles" class="mr-4 hover:text-blue-600">Articles</a>
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
          <nav class="flex flex-col space-y-5 px-4 py-6">
            ${links}
          </nav>
        </div>

        <div class="p-4 border-t relative ">
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
            <svg class="w-4 h-4 ml-auto transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="profile-dropdown" class="hidden absolute bottom-full mb-2   bg-white text-[#870E24]  border rounded shadow-md z-20">
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
      e.stopPropagation(); // Empêche la propagation du clic

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

    // Clic en dehors du dropdown pour fermer
    document.addEventListener("click", () => {
      if (!dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
        profileBtn.setAttribute("aria-expanded", "false");
        arrowIcon.classList.remove("rotate-180");
      }
    });
  }
}
