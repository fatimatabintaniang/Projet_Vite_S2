import { ApiClient } from "../data/Api-Client.js";

export default class LivreService {
    constructor(baseUrl = "http://localhost:3000") {
        this.api = new ApiClient(baseUrl);
    }

    // Méthodes pour la gestion des livres
async getAll() {
  try {
    const response = await this.api.get("livres");
    return response.data;
  } catch (error) {
    console.error("Erreur getAll:", error);
    throw error;
  }
}


// Méthode pour récupérer tous les livres avec leurs catégories, niveaux et matières
    async getAllLivres() {
        try {
            const response = await this.api.get('livres?_expand=categorie&_expand=niveau&_expand=matiere');
            return response.data;
        } catch (error) {
            console.error("Erreur getAllLivres:", error);
            throw error;
        }
    }


    // Méthode pour récupérer un livre par son ID avec ses détails
    async getLivreById(id) {
        try {
            const response = await this.api.get(`livres/${id}?_expand=categorie&_expand=niveau&_expand=matiere`);
            return response;
        } catch (error) {
            console.error("Erreur getLivreById:", error);
            throw error;
        }
    }


    // Methode pour creer un livre
    async createLivre(livreData) {
        try {
            const response = await this.api.post('livres', livreData);
            return response;
        } catch (error) {
            console.error("Erreur createLivre:", error);
            throw error;
        }
    }

    // Méthode pour mettre à jour un livre
    async updateLivre(id, livreData) {
        try {
            const response = await this.api.put(`livres/${id}`, livreData);
            return response;
        } catch (error) {
            console.error("Erreur updateLivre:", error);
            throw error;
        }
    }

    // Méthode pour supprimer un livre
    async deleteLivre(id) {
        try {
            const response = await this.api.delete(`livres/${id}`);
            return response;
        } catch (error) {
            console.error("Erreur deleteLivre:", error);
            throw error;
        }
    }


    // Méthode pour supprimer un livre en mode "soft delete"
    async softDeleteLivre(id) {
        try {
            const response = await this.api.patch(`livres/${id}`, { deleted: true });
            return response;
        } catch (error) {
            console.error("Erreur softDeleteLivre:", error);
            throw new Error("Erreur lors de la suppression du livre");
        }
    }


    // Méthode pour restaurer un livre supprimé
    async restoreLivre(id) {
        try {
            const response = await this.api.patch(`livres/${id}`, { deleted: false });
            return response;
        } catch (error) {
            console.error("Erreur restoreLivre:", error);
            throw new Error("Erreur lors de la restauration du livre");
        }
    }


    // Méthode pour récupérer toutes les catégories
    async getCategories() {
        try {
            const response = await this.api.get('categories');
            return response;
        } catch (error) {
            console.error("Erreur getCategories:", error);
            throw error;
        }
    }

    // Méthode pour récupérer tous les niveaux
    async getNiveaux() {
        try {
            const response = await this.api.get('niveaux');
            return response;
        } catch (error) {
            console.error("Erreur getNiveaux:", error);
            throw error;
        }
    }

    // Méthode pour récupérer toutes les matières
    async getMatieres() {
        try {
            const response = await this.api.get('matieres');
            return response;
        } catch (error) {
            console.error("Erreur getMatieres:", error);
            throw error;
        }
    }

    // Méthode pour récupérer tous les types
    async getTypes() {
        try {
            const response = await this.api.get('types');
            return response;
        } catch (error) {
            console.error("Erreur getTypes:", error);
            throw error;
        }
    }


    // Méthode pour récupérer tous les formats
    async getFormats() {
        try {
            const response = await this.api.get('formats');
            return response;
        } catch (error) {
            console.error("Erreur getFormats:", error);
            throw error;
        }
    }

    // Méthode pour uploader une image
    async uploadImage(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const fakeUrl = `https://example.com/uploads/${file.name}`;
                resolve(fakeUrl);
            }, 1000);
        });
    }

    // Methode pour afficher le total des livres
    async getTotalLivres() {
        try {
            const response = await this.api.get('livres');
            return response.data.length;
        } catch (error) {
            console.error("Erreur getTotalLivres:", error);
            return 0;
        }
    }



    async getMemoireStats() {
    try {
        // 1. Récupérer les mémoires et leurs téléchargements
        const [memoiresRes, telechargementsRes] = await Promise.all([
            this.api.get('livres?id_type=3&_expand=matiere'),
            this.api.get('telechargements?_expand=livre')
        ]);
        
        const memoires = memoiresRes.data;
        const telechargements = telechargementsRes.data
            .filter(t => t.livre?.id_type === "3");
        
        // 2. Créer un map pour trouver rapidement un mémoire par son ID
        const memoireMap = {};
        memoires.forEach(m => {
            memoireMap[m.id] = m;
        });
        
        // 3. Calculer les statistiques
        const stats = {};
        
        // Parcourir les téléchargements pour trouver les dates
        telechargements.forEach(t => {
            const memoire = memoireMap[t.id_livre];
            if (!memoire) return;
            
            const annee = memoire.annee || 'Non spécifiée';
            const specialite = memoire.matiere?.nom_matiere || memoire.specialite || 'Générale';
            const key = `${annee}-${specialite}`;
            
            if (!stats[key]) {
                stats[key] = {
                    annee,
                    specialite,
                    count: 0,
                    lastDownload: null
                };
            }
            
            // Mettre à jour la date la plus récente
            const dlDate = new Date(t.date_telechargement);
            if (!stats[key].lastDownload || dlDate > new Date(stats[key].lastDownload)) {
                stats[key].lastDownload = t.date_telechargement;
            }
        });
        
        // Compter les mémoires (même ceux jamais téléchargés)
        memoires.forEach(memoire => {
            const annee = memoire.annee || 'Non spécifiée';
            const specialite = memoire.matiere?.nom_matiere || memoire.specialite || 'Générale';
            const key = `${annee}-${specialite}`;
            
            if (!stats[key]) {
                stats[key] = {
                    annee,
                    specialite,
                    count: 0,
                    lastDownload: null
                };
            }
            stats[key].count++;
        });
        
        // 4. Formater et retourner les résultats
        return Object.values(stats)
            .sort((a, b) => b.annee.localeCompare(a.annee) || a.specialite.localeCompare(b.specialite))
            .map(stat => ({
                ...stat,
                lastDownload: stat.lastDownload 
                    ? new Date(stat.lastDownload).toISOString() 
                    : null
            }));
        
    } catch (error) {
        console.error("Erreur getMemoireStats:", error);
        throw error;
    }
}



// Méthode pour récupérer les livres populaires
async getPopularBooks(limit = 5) {
    try {
        const response = await this.api.get(
            `livres?_expand=matiere&_sort=downloadCount&_order=desc&_limit=${limit}`
        );
        return response.data;
    } catch (error) {
        console.error("Erreur getPopularBooks:", error);
        throw new Error("Erreur lors de la récupération des livres populaires");
    }
}


// Méthode pour vérifier si un titre de livre est unique

  async checkTitreUnique(titre, excludeId = null) {
  const livres = await this.getAllLivres();
  return !livres.some(l => 
    l.titre.toLowerCase() === titre.toLowerCase() && 
    (excludeId ? l.id !== excludeId : true)
  );
}




    // =============================================
    // NOUVELLES MÉTHODES SPÉCIFIQUES POUR ÉTUDIANTS
    // =============================================


    // Méthode pour afficher les livres récents
    async getRecentBooks(limit = 5) {
        try {
            const response = await this.api.get(
                `livres?_expand=categorie&_expand=niveau&_expand=matiere&_sort=createdAt&_order=desc&_limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error("Erreur getRecentBooks:", error);
            throw new Error("Erreur lors de la récupération des livres récents");
        }
    }

    // Methode pour récupérer les livres populaires
    async getPopularBooks(limit = 2) {
        try {
            const response = await this.api.get(
                `livres?_expand=categorie&_expand=niveau&_expand=matiere&_sort=downloadCount&_order=desc&_limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error("Erreur getPopularBooks:", error);
            throw new Error("Erreur lors de la récupération des livres populaires");
        }
    }


    // Méthode pour récupérer les livres recommandés
    async getRecommendedBooks(niveauId, matiereIds = [], limit = 5) {
        try {
            let url = `livres?niveauId=${niveauId}&_expand=categorie&_expand=niveau&_expand=matiere&_limit=${limit}`;
            
            if (matiereIds.length > 0) {
                url += `&matiereId=${matiereIds.join('&matiereId=')}`;
            }
            
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            console.error("Erreur getRecommendedBooks:", error);
            throw new Error("Erreur lors de la récupération des livres recommandés");
        }
    }


    // Méthode pour rechercher des livres par titre ou auteur
    async searchBooks(query) {
        try {
            const response = await this.api.get(
                `livres?q=${encodeURIComponent(query)}&_expand=categorie&_expand=niveau&_expand=matiere`
            );
            return response.data;
        } catch (error) {
            console.error("Erreur searchBooks:", error);
            throw new Error("Erreur lors de la recherche de livres");
        }
    }


    // Méthode pour récupérer les livres d'un utilisateur
    async searchLivres(searchTerm) {
    try {
        // Récupère tous les livres et filtre localement
        const allLivres = await this.getLivresForStudent();
        
        return allLivres.filter(livre => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (livre.titre && livre.titre.toLowerCase().includes(searchLower)) ||
                (livre.auteur && livre.auteur.toLowerCase().includes(searchLower))
            );
        });
    } catch (error) {
        console.error("Erreur searchLivres:", error);
        return [];
    }
}

    // Méthode pour incrementer le compteur de téléchargements
    async incrementDownloadCount(livreId) {
        try {
            // D'abord récupérer le livre pour obtenir le compteur actuel
            const livre = await this.getLivreById(livreId);
            const currentCount = livre.data.downloadCount || 0;
            
            // Puis mettre à jour avec le nouveau compteur
            const response = await this.api.patch(`livres/${livreId}`, {
                downloadCount: currentCount + 1
            });
            
            return response;
        } catch (error) {
            console.error("Erreur incrementDownloadCount:", error);
            throw new Error("Erreur lors de la mise à jour du compteur de téléchargements");
        }
    }


    // Méthode pour récupérer les livres par catégorie
    async getBooksByCategory(categorieId) {
        try {
            const response = await this.api.get(
                `livres?categorieId=${categorieId}&_expand=categorie&_expand=niveau&_expand=matiere`
            );
            return response.data;
        } catch (error) {
            console.error("Erreur getBooksByCategory:", error);
            throw new Error("Erreur lors de la récupération des livres par catégorie");
        }
    }

    // Methode pour recuperer les livres pour les étudiants
    async getLivresForStudent() {
    try {
        const response = await this.api.get('livres?deleted=false&_expand=categorie&_expand=niveau');
        return response.data;
    } catch (error) {
        console.error("Erreur getLivresForStudent:", error);
        return [];
    }
}



// Methode pour télécharger un fichier
async downloadFile(id) {
    const livre = await this.getById(id);
    if (livre && livre.chemin_fichier) {
      return livre.chemin_fichier; 
    }
    throw new Error("Fichier introuvable pour ce livre");
  }
}