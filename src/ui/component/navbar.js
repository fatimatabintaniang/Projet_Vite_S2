export default class Navbar {
  constructor(root, user, authSvc) {
    this.root = root;
    this.user = user;
    this.authSvc = authSvc;
  }

  render() {
    this.root.innerHTML = `
      <div class="flex items-center justify-between w-full shadow p-3">
        <div class="flex items-center gap-4">
          <button id="burger-btn" class="p-2 rounded hover:bg-gray-200 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          <div class="relative w-90">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </span>
            <input type="text" placeholder="Rechercher..." class="bg-[#FDDAC5] pl-8 pr-2 py-2 w-full border-none rounded text-sm focus:outline-none">
          </div>
        </div>

        <div>
          <button id="logout-btn" class="flex items-center gap-2 focus:outline-none">
            ${this.user.image
              ? `<img src="${this.user.image}" alt="Profil" class="w-8 h-8 rounded-full object-cover">`
              : `<div class="bg-gray-300 w-8 h-8 rounded-full"></div>`}
            <span>${this.user.prenom} ${this.user.nom}</span>
          </button>
        </div>
      </div>
    `;

    this.setEventListeners();
  }

  setEventListeners() {
    const logoutBtn = this.root.querySelector("#logout-btn");
    logoutBtn.addEventListener("click", () => {
      this.authSvc.logout();
      window.location.hash = "#login";
    });
  }
}
