import Sidebar from "../ui/component/sidebar.js";
import Navbar from "../ui/component/navbar.js";
import { AuthService } from "../services/authService.js";
import LoginScreen from "../ui/screens/Security/loginScreen.js";
import RegisterScreen from "../ui/screens/Security/RegisterScreen.js";
import EnseignantScreen from "../ui/screens/Admin/EnseignantScreen.js";
import DashboardScreen from "../ui/screens/Admin/DashboardScreen.js";
import { LivresScreen } from "../ui/screens/Admin/LivresScreen.js";
import { CategorieScreen } from "../ui/screens/Admin/CategorieScreen.js";
import { MemoireScreen } from "../ui/screens/Admin/MemoireScreen.js";
export default class Router {
  constructor(appRoot) {
    this.appRoot = appRoot;
    this.authSvc = new AuthService();
  }

  init() {
    window.addEventListener("hashchange", () => this.route());
    window.addEventListener("load", () => this.route());
  }

  route() {
    const hash = window.location.hash || "#login";
    const user = this.authSvc.getCurrentUser();

    if (!user && !["#login", "#register"].includes(hash)) {
      window.location.hash = "#login";
      return;
    }

    if (user && hash === "#login") {
      this.redirectByRole(user.id_role);
      return;
    }

    this.renderLayout(user);
    this.renderContent(hash, user);
  }

  redirectByRole(roleId) {
    switch (roleId) {
      case "1":
        window.location.hash = "#admin";
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
  }

  renderLayout(user) {
    this.appRoot.innerHTML = `
      <div id="sidebar" class=""></div>
      <div class="flex flex-col flex-1">
        <div id="navbar"></div>
        <div id="content" class="flex-1 p-4 overflow-auto "></div>
      </div>
    `;

    if (user) {
      new Sidebar(document.getElementById("sidebar")).render();
      new Navbar(document.getElementById("navbar"), user, this.authSvc).render();
    }
  }

  renderContent(hash, user) {
    const content = document.getElementById("content");
    if (!content) return;

    switch (hash) {
      case "#login":
        new LoginScreen(content).render();
        break;
      case "#register":
        new RegisterScreen(content).render();
        break;
      case "#admin":
         new DashboardScreen(content).render();
        break;
      case "#livres":
        new LivresScreen(content).render();
        break; 
      case "#memoires":
        new MemoireScreen(content).render();
        break;
      // case "#categories":
      //   content.innerHTML = "<h1 class='text-2xl'>Espace Catégorie</h1>";
      //   break;
      case "#categories":
  new CategorieScreen(content).render();
  break;
      case "#memoires":
        content.innerHTML = "<h1 class='text-2xl'>Espace Mémoire</h1>";
        break;
      case "#enseignant":
        content.innerHTML = "<h1 class='text-2xl'>Espace Enseignant</h1>";
        break;
      case "#etudiant":
        content.innerHTML = "<h1 class='text-2xl'>Espace Étudiant</h1>";
        break;
      case "#add-enseignant":
        if (user?.id_role === "1") {
          new EnseignantScreen(content).render();
        } else {
          content.innerHTML = "<p class='text-red-500'>Accès non autorisé.</p>";
        }
        break;
      default:
        content.innerHTML = `
          <div class="p-4">
            <h1 class="text-2xl font-bold">404 - Page non trouvée</h1>
            <p class="mt-2">La page ${hash} n'existe pas</p>
            <button onclick="window.location.hash='#login'" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              Retour à l'accueil
            </button>
          </div>
        `;
    }
  }
}
