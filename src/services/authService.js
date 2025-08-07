import { ApiClient } from "../data/Api-Client.js";

export class AuthService {
  constructor() {
    this.apiClient = new ApiClient("http://localhost:3000");
  }

  async login(email, password) {
    const response = await fetch(`http://localhost:3000/utilisateurs?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    const users = await response.json();

    if (users.length === 0) {
      throw new Error("Email ou mot de passe incorrect");
    }

    const user = users[0];

    const { data: role } = await this.apiClient.get(`/roles/${user.id_role}`);
    
    user.role = role ? role.libelle : "inconnu";

    localStorage.setItem("user", JSON.stringify(user));

    return user;
  }

  async register(userData) {
    console.log(userData);
    
    const { data: existing } = await this.apiClient.get("/utilisateurs", {
      email: userData.email
    });
    
    if (existing.length > 0) {
      throw new Error("Cet email est déjà utilisé");
    }

    // Enregistrement avec ApiClient
    const newUser = {
      nom: userData.name.split(" ")[0],
      prenom: userData.name.split(" ").slice(1).join(" "),
      telephone: userData.telephone,
      email: userData.email,
      password: userData.password,
      id_role: userData.roleId,
      image: userData.image
    };

    const user = await this.apiClient.post("/utilisateurs", newUser);
    console.log(user);

    return user;
  }

  async addUser(user) {
  const response = await fetch("http://localhost:3000/utilisateurs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) throw new Error("Erreur lors de l'ajout de l'utilisateur");
  return await response.json();
}


  logout() {
    localStorage.removeItem("user");
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}