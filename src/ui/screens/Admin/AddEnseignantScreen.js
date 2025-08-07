import { CloudinaryClient } from "../../../services/Cloudinary.js";
import {Modal} from "../../component/Modal.js";

export default class AddEnseignantScreen {
  constructor(container) {
    this.cloudinary = new CloudinaryClient();
    this.state = {
      imagePreview: null
    };
    this.container = container;
    this.modal = null;
  }

  async render() {
    const enseignants = await this.getEnseignants();

    this.container.innerHTML = `
      <div class="p-4">
        <h2 class="text-2xl font-bold mb-4">Liste des enseignants</h2>
        <button id="openModal" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Ajouter un enseignant
        </button>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${enseignants.map(e => `
            <div class="bg-white shadow-md rounded-lg p-4">
              <img src="${e.image || 'https://via.placeholder.com/150'}" alt="photo" class="w-24 h-24 object-cover rounded-full mb-2">
              <h3 class="text-lg font-semibold">${e.prenom} ${e.nom}</h3>
              <p>Email : ${e.email}</p>
              <p>Téléphone : ${e.telephone || 'N/A'}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    const modalContent = `
      <form id="addForm" class="space-y-3">
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
        <input type="text" name="prenom" placeholder="Prénom" required class="w-full border p-2 rounded">
        <input type="text" name="nom" placeholder="Nom" required class="w-full border p-2 rounded">
        <input type="email" name="email" placeholder="Email" required class="w-full border p-2 rounded">
        <input type="tel" name="telephone" placeholder="Téléphone" class="w-full border p-2 rounded">
        <input type="password" name="password" placeholder="Mot de passe" required class="w-full border p-2 rounded">
        <div class="flex justify-end gap-2">
          <button type="button" id="closeModal" class="px-4 py-2 bg-gray-400 text-white rounded">Annuler</button>
          <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded">Ajouter</button>
        </div>
      </form>
    `;

    this.modal = new Modal({
      title: "Ajouter un enseignant",
      content: modalContent,
      onClose: () => {
        this.state.imagePreview = null;
      }
    });

    this.container.appendChild(this.modal);

    // Gestionnaires d'événements
    document.getElementById("openModal").addEventListener("click", () => {
      this.modal.classList.remove("hidden");
    });

    document.getElementById("closeModal").addEventListener("click", () => {
      this.modal.classList.add("hidden");
      this.state.imagePreview = null;
    });

    const imageInput = this.modal.querySelector('[name="image"]');
    const imagePreview = this.modal.querySelector("#image-preview");

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

    this.modal.querySelector("#addForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const imageFile = formData.get("image");

      let imageUrl = "https://via.placeholder.com/150";

      if (imageFile && imageFile.size > 0) {
        try {
          const result = await this.cloudinary.uploadImage(imageFile);
          imageUrl = result.secure_url;
        } catch (err) {
          console.error("Erreur upload image :", err);
          alert("Erreur lors du téléversement de l'image");
          return;
        }
      }

      const newUser = {
        // id: uuidv4().slice(0, 4),
        nom: formData.get("nom"),
        prenom: formData.get("prenom"),
        email: formData.get("email"),
        telephone: formData.get("telephone"),
        password: formData.get("password"),
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

        this.modal.classList.add("hidden");
        location.reload();
      } catch (error) {
        alert("Erreur lors de l'ajout.");
        console.error(error);
      }
    });
  }

  async getEnseignants() {
    try {
      const res = await fetch("http://localhost:3000/utilisateurs");
      const data = await res.json();
      return data.filter(user => user.id_role === "2" && user.deleted !== "true");
    } catch (e) {
      console.error("Erreur fetch enseignants :", e);
      return [];
    }
  }
}