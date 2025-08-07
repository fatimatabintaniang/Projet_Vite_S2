import { AuthService } from "../../../services/authService.js";

export default class LoginScreen {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService();
  }

  render() {
    this.root.innerHTML = `
      <div class="  grid grid-cols-2 mx-auto mt-6  bg-white w-[130vh] p-6 rounded-xl shadow-lg border border-gray-100 ">
               <div class="text-center mb-6 ">
                  <img src="./asset/images/image 1.png" alt="Logo" class=" mx-auto mb-10">
                <h1 class="text-3xl font-bold mb-2 text-gray-800">Bibliothèque École 221</h1>
                <p class="text-gray-500 mb-8">Découvrez un monde de connaissances</p>
</div>

      <div class="text-center mb-6">
      <div class="flex justify-center mb-6">
          <svg class="w-10 h-10 text-[#870E24]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold mb-2 text-center text-gray-800">Bienvenue</h1>
        <p class="text-gray-500 text-center mb-8">Connectez-vous à votre compte</p>
        
        <form id="login-form" class="space-y-5 ">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium">Email</label>
              <span id="email-error" class="text-red-600 text-xs hidden"></span>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
              </div>
              <input name="email" type="email" class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all" placeholder="votre@email.com">
            </div>
          </div>
          
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium">Mot de passe</label>
              <span id="password-error" class="text-red-600 text-xs hidden"></span>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <input name="password" type="password" class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all" placeholder="••••••••">
             
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember" name="remember" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
              <label for="remember" class="ml-2 block text-sm text-gray-700">Se souvenir de moi</label>
            </div>
          </div>
          
          <button type="submit" class="w-full px-4 py-3 bg-[#870E24] text-white font-medium rounded-lg shadow hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
            Se connecter
          </button>
          
          <div class="text-center text-sm text-gray-500">
            Pas encore de compte ? <a href="#register" class="font-medium text-[#870E24] hover:text-[#870e247a]">S'inscrire</a>
          </div>
          
          <p id="form-error" class="text-red-600 text-center text-sm hidden"></p>
        </form>
</div>
      </div>`;

    this.setUpEventListeners();
  }

  _validateForm() {
    const form = this.root.querySelector("#login-form");
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    let isValid = true;

    // Reset errors
    this.root.querySelectorAll('[id$="-error"]').forEach((el) => {
      el.classList.add("hidden");
    });

    // Email validation
    const emailError = this.root.querySelector("#email-error");
    if (!email) {
      emailError.textContent = "L'email est requis";
      emailError.classList.remove("hidden");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = "L'email n'est pas valide";
      emailError.classList.remove("hidden");
      isValid = false;
    }

    // Password validation
    const passwordError = this.root.querySelector("#password-error");
    if (!password) {
      passwordError.textContent = "Le mot de passe est requis";
      passwordError.classList.remove("hidden");
      isValid = false;
    }

    return isValid;
  }

  setUpEventListeners() {
    const form = this.root.querySelector("#login-form");
    if (!form) return;

    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!this._validateForm()) return;

      const formData = new FormData(form);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        const user = await this.authSvc.login(email, password);
        switch (user.id_role) {
          case "1":
            window.location.href = "#admin";
            break;
          case "2":
            window.location.hash = "#enseignant";
            break;
          case "3":
            window.location.hash = "#etudiant";
            break;
          default:
            window.location.hash = "#login";
        }
      } catch (error) {
        const errorEl = this.root.querySelector("#form-error");
        errorEl.textContent = error.message || "Erreur de connexion";
        errorEl.classList.remove("hidden");
      }
    };
  }
}
