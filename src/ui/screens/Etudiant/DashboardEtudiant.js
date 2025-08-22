import { AuthService } from "../../../services/authService";
import FavoriService from "../../../services/FavoriService";
import LivreService from "../../../services/LivreService";
import TelechargementService from "../../../services/TelechargementService";

export default class StudentDashboardScreen {
  
  
  constructor(container) {
    this.container = container;
    this.authSvc = new AuthService();
    this.livreSvc = new LivreService();
    this.telechargementSvc = new TelechargementService();
    this.favoriSvc = new FavoriService();
  }

  async render() {
    this.container.innerHTML = this.getHTMLSkeleton();
    await this.renderStats();
    await this.renderRecentBooks();
  }

  getHTMLSkeleton() {
    return `
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow">
          <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
              <h1 class="text-3xl font-bold text-[#873A0E]">Tableau de Bord Étudiant</h1>
              <div class="flex items-center space-x-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-sm font-medium text-green-800">
                  <span class="w-2 h-2 mr-2 rounded-full bg-green-500"></span>
                  Connecté
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Welcome Banner -->
          <div class="bg-gradient-to-r from-[#F998A9] to-[#873A0E] rounded-xl shadow-md p-6 mb-8 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold">Bienvenue, <span id="studentName">Étudiant</span> !</h2>
                <p class="mt-2 opacity-90">Consultez vos ressources pédagogiques et suivez votre progression.</p>
              </div>
              <div class="hidden md:block">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Stats Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <!-- Books Card -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Livres Disponibles</p>
                    <p id="nbLivres" class="text-2xl font-semibold text-gray-900">...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Downloads Card -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="p-3 rounded-full bg-green-100 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Mes Téléchargements</p>
                    <p id="nbTelechargements" class="text-2xl font-semibold text-gray-900">...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Favorites Card -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Favoris</p>
                    <p id="nbFavoris" class="text-2xl font-semibold text-gray-900">...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Books  -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#F998A9]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Livres Récents
                  </h2>
                </div>
                <div class="divide-y divide-gray-200" id="recentBooksContainer">
                  <!-- Les livres récents seront ajoutés ici dynamiquement -->
                  <div class="p-4 text-center text-gray-500">
                    Chargement des livres...
                  </div>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
                  <button class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Voir tous les livres &rarr;
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="space-y-6">
              <!-- Quick Actions Card -->
              <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#F998A9]" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    Accès Rapide
                  </h2>
                </div>
                <div class="p-6 space-y-4">
                  <button class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Rechercher un livre
                  </button>
                  <button class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Mes Favoris
                  </button>
                  <button class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Historique
                  </button>
                </div>
              </div>

              <!-- Progress Card -->
              <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[#F998A9]" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
                    </svg>
                    Ma Progression
                  </h2>
                </div>
                <div class="p-6">
                  <div class="mb-4">
                    <div class="flex justify-between mb-1">
                      <span class="text-sm font-medium text-gray-700">Livres lus</span>
                      <span class="text-sm font-medium text-gray-700" id="progressPercent">0%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div class="bg-indigo-600 h-2.5 rounded-full" id="progressBar" style="width: 0%"></div>
                    </div>
                  </div>
                  <p class="text-sm text-gray-500">Vous avez lu <span id="booksRead">0</span> sur <span id="totalBooksGoal">10</span> livres ce mois-ci.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }

async renderStats() {
    try {
        const user = this.authSvc.getCurrentUser();
        if (!user || !user.id) {
            throw new Error("Utilisateur non connecté");
        }

        // Afficher le nom de l'étudiant
        document.getElementById('studentName').textContent = 
            `${user.prenom} ${user.nom}` || 'Étudiant';

        // Récupération des données
        const [nbLivres, nbTelechargements, nbFavoris] = await Promise.all([
            this.livreSvc.getTotalLivres(),
            this.telechargementSvc.getUserDownloadsCount(user.id),
            this.favoriSvc.getUserFavorisCount(user.id) 
        ]);
        
        // Mise à jour de l'UI
        document.getElementById('nbLivres').textContent = nbLivres;
        document.getElementById('nbTelechargements').textContent = nbTelechargements;
        document.getElementById('nbFavoris').textContent = nbFavoris;
        
        this.animateCounters();
        this.updateProgress(nbTelechargements, 10);
        
    } catch (error) {
        console.error("Erreur stats:", error);
        this.showErrorState();
    }
}

  async renderRecentBooks() {
    try {
      const recentBooks = await this.livreSvc.getRecentBooks(3);
      const container = document.getElementById('recentBooksContainer');
      
      if (recentBooks.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">Aucun livre récent trouvé</div>';
        return;
      }
      
      container.innerHTML = recentBooks.map(book => `
        <div class="p-4 hover:bg-gray-50 transition-colors duration-150">
          <div class="flex items-start">
            <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
              ${book.image ? 
                `<img src="${book.image}" alt="${book.titre}" class="h-full w-full object-cover">` : 
                `<div class="h-full w-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>`}
            </div>
            <div class="ml-4 flex-1">
              <h3 class="text-lg font-medium text-gray-900">${book.titre}</h3>
              <p class="text-sm text-gray-500">${book.auteur || 'Auteur inconnu'}</p>
              <div class="mt-2 flex justify-between items-center">
                <span class="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">${book.categorie || 'Général'}</span>
                <button class="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
      
    } catch (error) {
      console.error("Erreur livres récents:", error);
      document.getElementById('recentBooksContainer').innerHTML = 
        '<div class="p-4 text-center text-red-500">Erreur de chargement des livres</div>';
    }
  }

  updateProgress(booksRead, goal) {
    const percent = Math.min(Math.round((booksRead / goal) * 100), 100);
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('booksRead').textContent = booksRead;
    document.getElementById('totalBooksGoal').textContent = goal;
  }

  animateCounters() {
    const counters = ['nbLivres', 'nbTelechargements', 'nbFavoris'];
    counters.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.add('animate-pulse', 'text-indigo-600');
        setTimeout(() => {
          element.classList.remove('animate-pulse', 'text-indigo-600');
        }, 1000);
      }
    });
  }

  showErrorState() {
    const elements = ['nbLivres', 'nbTelechargements', 'nbFavoris'];
    elements.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = 'Erreur';
        el.classList.add('text-red-500');
      }
    });
  }

  
}