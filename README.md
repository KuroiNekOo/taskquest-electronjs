# 📋 TaskMaster - Client Lourd Electron

## Description

TaskMaster est une application de gestion de tâches développée comme **client lourd** avec Electron Forge et stockage JSON local. L'application fonctionne entièrement en local sans nécessiter de connexion internet ou de serveur externe.

## 🎯 Objectifs du projet

- Démontrer le développement d'un **vrai client lourd** avec Electron
- Utiliser un **stockage de données local** (JSON) pour la persistance
- Créer une interface utilisateur moderne et réactive
- Assurer le fonctionnement **autonome** sans dépendances externes
- Illustrer les concepts pédagogiques du client lourd vs client léger

## 🛠️ Technologies utilisées

- **Electron Forge** - Framework et outils pour applications desktop
- **Vite** - Build tool moderne et rapide
- **Stockage JSON** - Base de données locale simple et efficace
- **HTML/CSS/JavaScript** - Interface utilisateur moderne
- **Node.js** - Runtime JavaScript
- **ES6 Modules** - Architecture modulaire moderne

## 🚀 Fonctionnalités

### Gestion des tâches
- ✅ Créer, modifier et supprimer des tâches
- ✅ Marquer les tâches comme terminées/en cours
- ✅ Définir des priorités (haute, moyenne, basse)
- ✅ Ajouter des descriptions détaillées
- ✅ Persistance automatique des données

### Interface utilisateur
- 🎨 Design moderne avec effets glassmorphisme
- 📱 Interface responsive (desktop/mobile)
- 🔍 Filtres avancés par priorité et statut
- 📊 Tableau de bord avec statistiques en temps réel
- 🔔 Notifications toast pour feedback utilisateur
- ✨ Animations fluides et effets visuels

### Stockage de données
- 💾 Stockage local avec fichiers JSON
- 🔄 Sauvegarde automatique à chaque modification
- 📈 Calcul de statistiques en temps réel
- 🛡️ Gestion des erreurs et récupération automatique
- 🔄 Persistence entre les redémarrages

## 📦 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm (inclus avec Node.js)

### Étapes d'installation

1. **Cloner ou télécharger le projet**
```bash
git clone <url-du-repo>
cd taskmaster-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer l'application en mode développement**
```bash
npm start
```

4. **Construire l'application pour production**
```bash
npm run make
```

5. **Empaqueter sans installer**
```bash
npm run package
```

## 📁 Structure du projet

```
taskmaster-app/
├── src/
│   ├── main.js          # Process principal Electron
│   ├── preload.js       # Script de préchargement sécurisé
│   ├── database.js      # Gestionnaire de stockage JSON
│   ├── index.css        # Styles CSS modernes
│   └── renderer.js      # Logique de l'interface
├── data/                # Données de développement (auto-créé)
│   └── taskmaster-data.json
├── package.json         # Configuration Electron Forge
├── .vite/              # Build Vite (auto-généré)
├── index.html       # Interface utilisateur
└── README.md           # Documentation
```

## 🔧 Architecture

### Process Principal (main.js)
- Gestion de la fenêtre Electron avec Vite
- Configuration des communications IPC sécurisées
- Initialisation du système de stockage
- Gestion du cycle de vie de l'application

### Stockage de données (database.js)
- Système de fichiers JSON pour persistance locale
- Opérations CRUD complètes sur les tâches
- Calcul automatique des statistiques
- Gestion intelligente des chemins (dev/production)
- Sauvegarde automatique et récupération d'erreurs

### Interface utilisateur (renderer.js + index.html)
- Gestion des événements utilisateur modernes
- Communication sécurisée avec le process principal
- Mise à jour dynamique de l'interface
- Système de filtrage et tri des données
- Gestion des modales et notifications

### Sécurité (preload.js)
- Context isolation activé
- APIs exposées de manière sécurisée
- Validation et échappement des données

## 🎨 Caractéristiques du design

- **Glassmorphisme** - Effets de transparence et flou d'arrière-plan
- **Dégradés modernes** - Arrière-plans colorés et dynamiques
- **Animations fluides** - Transitions CSS et effets de hover
- **Design responsive** - Adaptation automatique mobile/desktop
- **Notifications toast** - Feedback visuel pour les actions utilisateur
- **Interface intuitive** - UX moderne et accessible

## 💾 Système de stockage

### Structure des données
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Exemple de tâche",
      "description": "Description détaillée",
      "completed": false,
      "priority": "medium",
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ],
  "projects": [],
  "nextId": 2
}
```

### Localisation des données
- **Développement** : `./data/taskmaster-data.json` (dans le projet)
- **Production** : `%APPDATA%/taskmaster-app/taskmaster-data.json` (Windows)

### Données d'exemple
L'application génère automatiquement 5 tâches d'exemple lors de la première utilisation pour démonstration.

## 🔐 Sécurité et bonnes pratiques

- **Context Isolation** - Séparation complète des contextes
- **Preload Script** - API contrôlée pour les communications
- **Validation des entrées** - Échappement HTML et sanitisation
- **Gestion des erreurs** - Traitement robuste des exceptions
- **Communications IPC** - Protocole sécurisé entre processus

## 🧪 Développement et debugging

### Mode développement
```bash
npm start
```
- Ouverture automatique des DevTools
- Hot reload avec Vite
- Logs détaillés en console
- Données stockées dans `./data/`

### Scripts disponibles
```bash
npm start          # Lancement en développement
npm run package    # Empaquetage sans installation
npm run make       # Build complet avec installeurs
npm run publish    # Publication (si configuré)
```

### Debugging
- DevTools intégrés pour inspection
- Logs détaillés dans la console
- Fichier de données JSON lisible et éditable
- Messages d'erreur explicites

## 📱 Compatibilité

- **Windows** - Windows 10/11 (testé)
- **macOS** - macOS 10.15+ (compatible)
- **Linux** - Ubuntu 18.04+ (compatible)

## 🚀 Distribution

### Build pour production
```bash
npm run make
```

Génère les installeurs dans le dossier `out/` :
- Windows : `.exe` et `.msi`
- macOS : `.dmg`
- Linux : `.deb`, `.rpm`, `.zip`

### Empaquetage rapide
```bash
npm run package
```
Génère une version portable dans `out/` sans installeur.

## 🎓 Aspects pédagogiques

Ce projet démontre parfaitement :

### 1. **Client lourd vs Client léger**
- **Autonomie totale** - Fonctionne sans serveur ni internet
- **Stockage local** - Données privées sur la machine utilisateur
- **Performance native** - Interface rapide sans latence réseau
- **Installation locale** - Application installée sur le système

### 2. **Architecture Electron moderne**
- **Separation des processus** - Main/Renderer avec IPC
- **Sécurité renforcée** - Context isolation et preload
- **Build moderne** - Vite + Electron Forge
- **Modules ES6** - Code structuré et maintenable

### 3. **Persistance des données locale**
- **Fichiers JSON** - Simple et efficace pour démonstration
- **Auto-sauvegarde** - Persistance transparente
- **Gestion d'erreurs** - Récupération automatique
- **Portabilité** - Données dans dossiers standards OS

### 4. **Interface utilisateur moderne**
- **CSS avancé** - Animations et effets visuels
- **JavaScript moderne** - ES6+, modules, async/await
- **Responsive design** - Adaptation multi-écrans
- **UX optimisée** - Feedback utilisateur constant

## 🔍 Points clés démontrés

- ✅ **Autonomie complète** - Zéro dépendance serveur
- ✅ **Performance native** - Rapidité d'une app desktop
- ✅ **Données privées** - Stockage local sécurisé
- ✅ **Interface moderne** - UX professionnelle
- ✅ **Architecture robuste** - Code maintenable et extensible
- ✅ **Sécurité** - Bonnes pratiques Electron
- ✅ **Cross-platform** - Fonctionnement multi-OS

## 🚧 Extensions possibles

Pour enrichir le projet pédagogique :
- Import/Export de données (CSV, JSON)
- Système de catégories et tags
- Notifications desktop système
- Raccourcis clavier globaux
- Mode sombre/clair
- Synchronisation optionnelle cloud
- Système de backup automatique

## 📝 Licence

MIT License - Libre d'utilisation pour projets éducatifs et commerciaux.

---

## 💡 Note pédagogique

Ce projet illustre parfaitement les avantages du **client lourd** :
- **Performance** : Pas de latence réseau
- **Fiabilité** : Fonctionne hors ligne
- **Sécurité** : Données locales privées
- **Expérience** : Interface native et fluide

Idéal pour démontrer les concepts fondamentaux des architectures logicielles et la différence entre applications web et desktop natives.
