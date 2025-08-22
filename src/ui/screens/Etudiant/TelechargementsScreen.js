import { AuthService } from "../../../services/authService";
import TelechargementService from "../../../services/TelechargementService";
import LivreService from "../../../services/LivreService";

export default class TelechargementsScreen {
    constructor(container) {
        this.container = container;
        this.authSvc = new AuthService();
        this.telechargementSvc = new TelechargementService();
        this.livreSvc = new LivreService();
    }

    async render() {
        const user = this.authSvc.getCurrentUser();
        if (!user || !user.id) {
            this.container.innerHTML = `<p class="p-4 text-red-500">Veuillez vous connecter pour voir vos téléchargements</p>`;
            return;
        }

        // Récupérer tous les livres ET les téléchargements de l'utilisateur
        const [livres, telechargements] = await Promise.all([
            this.livreSvc.getAll(),
            this.telechargementSvc.getUserDownloads(user.id)
        ]);

        // Filtrer seulement les livres qui ont été téléchargés par cet utilisateur
        const idsLivresTelecharges = telechargements.map(t => t.id_livre);
        const livresTelecharges = livres.filter(l => 
            idsLivresTelecharges.includes(l.id) && l.chemin_fichier && !l.deleted
        );

        this.container.innerHTML = `
            <div class="p-4">
                <h1 class="text-xl font-bold mb-4 text-[#873A0E]">Mes Téléchargements</h1>
                ${livresTelecharges.length === 0 ? 
                    `<p class="text-gray-600">Aucun téléchargement trouvé.</p>` :
                    `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="telechargementsContainer">
                        ${livresTelecharges.map(livre => `
                            <div class="bg-white rounded-lg shadow-md p-4" data-id="${livre.id}">
                                <img src="${livre.image}" alt="${livre.titre}" class="w-full h-40 object-cover rounded-md mb-2">
                                <h2 class="text-lg font-semibold">${livre.titre}</h2>
                                <p class="text-gray-600">Auteur: ${livre.auteur}</p>
                                <button class="lire-btn flex items-center text-sm bg-[#F998A9] text-white px-3 py-2 rounded-md hover:bg-[#e87f92] mt-2"
                                        data-fichier="${livre.chemin_fichier}">
                                    Lire
                                </button>
                            </div>
                        `).join("")}
                    </div>`
                }
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.lire-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const livreElement = e.target.closest('[data-id]');
                const livreId = livreElement ? livreElement.dataset.id : null;
                const fichier = e.target.getAttribute('data-fichier');
                
                this.openBookReader(livreId, fichier);
            });
        });
    }

    openBookReader(livreId, fichier) {
        const extension = fichier.split('.').pop().toLowerCase();
        
        if (extension === 'pdf') {
            const pdfUrl = `${window.location.origin}/uploads/${fichier}`;
            window.open(pdfUrl, '_blank');
        } else {
            const fileUrl = encodeURIComponent(`${window.location.origin}/uploads/${fichier}`);
            const googleViewerUrl = `https://docs.google.com/viewer?url=${fileUrl}&embedded=true`;
            
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Lecteur de document</title>
                    <style>
                        body, html { margin: 0; padding: 0; height: 100%; }
                        iframe { width: 100%; height: 100%; border: none; }
                    </style>
                </head>
                <body>
                    <iframe src="${googleViewerUrl}"></iframe>
                </body>
                </html>
            `);
        }
    }

    async loadTelechargements(userId) {
        try {
            const telechargements = await this.telechargementSvc.getUserDownloads(userId);
            
            if (telechargements.length === 0) {
                document.getElementById('telechargementsList').innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center text-gray-500">Aucun téléchargement enregistré</td>
                    </tr>
                `;
                return;
            }

            // Récupérer les détails des livres en parallèle
            const telechargementsAvecLivres = await Promise.all(
                telechargements.map(async (tel) => {
                    const livre = await this.livreSvc.getLivreById(tel.id_livre);
                    return { ...tel, livre };
                })
            );

            document.getElementById('telechargementsList').innerHTML = 
                telechargementsAvecLivres.map(this.createTelechargementRow).join('');
        } catch (error) {
            console.error("Erreur loadTelechargements:", error);
            document.getElementById('telechargementsList').innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-red-500">Erreur de chargement des téléchargements</td>
                </tr>
            `;
        }
    }

    createTelechargementRow(telechargement) {
        const date = new Date(telechargement.date_telechargement);
        const dateFormatted = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <tr class="hover:bg-gray-50" data-id="${telechargement.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-md object-cover" 
                                 src="${telechargement.livre?.image || 'https://via.placeholder.com/40'}" 
                                 alt="${telechargement.livre?.titre}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${telechargement.livre?.titre || 'Livre inconnu'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${telechargement.livre?.auteur || 'Auteur inconnu'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        ${telechargement.format?.toUpperCase() || 'DOCX'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${dateFormatted}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="http://localhost:3000/uploads/${telechargement.livre?.chemin_fichier}" 
                       class="text-indigo-600 hover:text-indigo-900 mr-3" download>
                        Télécharger
                    </a>
                    <a href="#/livre/${telechargement.id_livre}" class="text-green-600 hover:text-green-900">
                        Voir
                    </a>
                </td>
            </tr>
        `;
    }
}