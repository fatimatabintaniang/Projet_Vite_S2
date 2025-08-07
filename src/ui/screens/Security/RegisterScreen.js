import { AuthService } from "../../../services/authService.js";
import { RoleService } from "../../../services/roleService.js";
import { CloudinaryClient } from "../../../services/Cloudinary.js";


export default class RegisterScreen {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService();
    this.roleSvc = new RoleService();
    this.cloudinary = new CloudinaryClient();
    this.state = {
      roles: [],
      imagePreview: null,
    };
  }

  async render() {

this.root.innerHTML = `
      <div class=" mx-auto grid grid-cols-2 my-8 bg-white w-[130vh] p-8 rounded-2xl shadow-xl border border-gray-100">
        
      <div class=" mb-6">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-gray-900">Rejoignez-nous</h1>
          <p class="mt-2 text-gray-600">Créez votre compte en quelques secondes</p>
        </div>
        
        <form id="register-form" class="space-y-6 overflow-y-auto max-h-[50vh]">
          <!-- Champ image -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">image de profil</label>
            <div class="flex items-center space-x-4">
              <!-- Aperçu de la image -->
              <div id="image-preview" class="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-indigo-300 cursor-pointer">
                ${
                  this.state.imagePreview
                    ? `
                  <img src="${this.state.imagePreview}" class="w-full h-full object-cover">
                `
                    : `
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                `
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
          
          <!-- Champ Nom -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Nom complet</label>
            <div class="relative">
              <input name="name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p id="name-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>

          <!-- Champ telephone -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Téléphone</label>
            <div class="relative">
              <input name="telephone" type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
              </div>
            </div>
            <p id="telephone-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>

          
          <!-- Champ Email -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <div class="relative">
              <input name="email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            <p id="email-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>
          
          <!-- Champ Mot de passe -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <div class="relative">
              <input name="password" type="password" minlength="6" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p id="password-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>
          
          <!-- Champ Confirmation mot de passe -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <div class="relative">
              <input name="confirmPassword" type="password" minlength="6" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p id="confirm-password-error" class="text-red-500 text-xs mt-1 hidden"></p>
          </div>
          
          <button type="submit" class="w-full px-4 py-3 text-white bg-gradient-to-r from-[#870E24] to-blue-[#870E24] rounded-lg hover:from-[#870E24] hover:to-[#870E24] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 transition-all duration-300 shadow-md transform hover:-translate-y-0.5">
            <span class="font-semibold">S'inscrire</span>
          </button>
          
          <div class="text-center text-sm text-gray-500 mt-4">
            Déjà un compte? 
            <a href="#login" class="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors duration-200">
              Se connecter
            </a>
          </div>
          
          <p id="form-error" class="text-red-500 text-center text-sm py-2 px-4 bg-red-50 rounded-lg hidden"></p>
        </form>
      </div>

                <div class="text-center mb-6 ">
                  <img src="./asset/images/image 1.png" alt="Logo" class=" mx-auto mb-10">
                <h1 class="text-3xl font-bold mb-2 text-gray-800">Bibliothèque École 221</h1>
                <p class="text-gray-500 mb-8">Découvrez un monde de connaissances</p>
              </div>
      </div>`;

    this.setUpEventListeners();
  }

  _validateForm() {
    const form = this.root.querySelector("#register-form");
    const name = form.querySelector('[name="name"]').value;
    const telephone = form.querySelector('[name="telephone"]').value;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    const confirmPassword = form.querySelector(
      '[name="confirmPassword"]'
    ).value;
    const image = form.querySelector('[name="image"]').files[0];

    let isValid = true;

    // Reset errors
    this.root.querySelectorAll('[id$="-error"]').forEach((el) => {
      el.classList.add("hidden");
    });

    // Name validation
    const nameError = this.root.querySelector("#name-error");
    if (!name.trim()) {
      nameError.textContent = "Le nom est requis";
      nameError.classList.remove("hidden");
      isValid = false;
    } else if (name.trim().length < 2) {
      nameError.textContent = "Le nom doit contenir au moins 2 caractères";
      nameError.classList.remove("hidden");
      isValid = false;
    }
    // Telephone validation
    const telephoneError = this.root.querySelector("#telephone-error");
    if (!telephone.trim()) {
      telephoneError.textContent = "Le téléphone est requis";
      telephoneError.classList.remove("hidden");
      isValid = false;
    } else if (!/^\d{9}$/.test(telephone)) {
      telephoneError.textContent = "Le téléphone doit contenir entre 9chiffres";
      telephoneError.classList.remove("hidden");
      isValid = false;
    }

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
    } else if (password.length < 6) {
      passwordError.textContent =
        "Le mot de passe doit contenir au moins 6 caractères";
      passwordError.classList.remove("hidden");
      isValid = false;
    }

    // Confirm password validation
    const confirmPasswordError = this.root.querySelector(
      "#confirm-password-error"
    );
    if (!confirmPassword) {
      confirmPasswordError.textContent =
        "Veuillez confirmer votre mot de passe";
      confirmPasswordError.classList.remove("hidden");
      isValid = false;
    } else if (password !== confirmPassword) {
      confirmPasswordError.textContent =
        "Les mots de passe ne correspondent pas";
      confirmPasswordError.classList.remove("hidden");
      isValid = false;
    }

    const imageError = this.root.querySelector("#image-error");
    if (image && image.size > 2 * 1024 * 1024) {
      // 2MB max
      imageError.textContent = "L'image ne doit pas dépasser 2MB";
      imageError.classList.remove("hidden");
      isValid = false;
    }

    return isValid;
  }

  setUpEventListeners() {
    const form = this.root.querySelector("#register-form");
    if (!form) return;

    // Gestion de la prévisualisation de la image
    const imageInput = form.querySelector('[name="image"]');
    const imagePreview = this.root.querySelector("#image-preview");

    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.state.imagePreview = event.target.result;
          imagePreview.innerHTML = `<img src="${this.state.imagePreview}" class="w-full h-full object-cover">`;
        };
        reader.readAsDataURL(file);
      }
    });

    // Validation en temps réel pour la confirmation du mot de passe
    const passwordInput = form.querySelector('[name="password"]');
    const confirmPasswordInput = form.querySelector('[name="confirmPassword"]');

    const validatePasswordMatch = () => {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const errorEl = this.root.querySelector("#confirm-password-error");

      if (password && confirmPassword && password !== confirmPassword) {
        errorEl.textContent = "Les mots de passe ne correspondent pas";
        errorEl.classList.remove("hidden");
      } else {
        errorEl.classList.add("hidden");
      }
    };

    passwordInput.addEventListener("input", validatePasswordMatch);
    confirmPasswordInput.addEventListener("input", validatePasswordMatch);

    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!this._validateForm()) return;

      const formData = new FormData(form);
      const imageFile = formData.get("image");

    let imageUrl = null;
if (imageFile && imageFile.size > 0) {
  try {
    const result = await this.cloudinary.uploadImage(imageFile);
    imageUrl = result.secure_url;
  } catch (uploadError) {
    const errorEl = this.root.querySelector("#form-error");
    errorEl.textContent = uploadError.message || "Erreur lors de l'upload de la image";
    errorEl.classList.remove("hidden");
    return;
  }
}

      const user = {
        name: formData.get("name"),
        telephone: formData.get("telephone"),
        email: formData.get("email"),
        password: formData.get("password"),
        roleId: "3",
        image: imageUrl,
      };

      try {
        await this.authSvc.register(user);
        window.location.hash = "#login";
      } catch (error) {
        const errorEl = this.root.querySelector("#form-error");
        errorEl.textContent = error.message || "Erreur lors de l'inscription";
        errorEl.classList.remove("hidden");
      }
    };
  }


}
