# ⚔️ TaskQuest - Client Lourd Gamifié

## Description

TaskQuest est une application de gestion de tâches **gamifiée** développée comme **client lourd** avec Electron Forge et stockage JSON local. L'application fonctionne entièrement en local sans nécessiter de connexion internet ou de serveur externe.

Transformez votre productivité en aventure ! Gagnez des points, débloquez des badges, montez de niveau et accomplissez des quêtes en gérant vos tâches quotidiennes.

## 🎯 Objectifs du projet

- Démontrer le développement d'un **vrai client lourd** avec Electron
- Utiliser un **stockage de données local** (JSON) pour la persistance
- Créer une interface utilisateur moderne et gamifiée
- Assurer le fonctionnement **autonome** sans dépendances externes
- Illustrer les concepts pédagogiques du client lourd vs client léger

## 🛠️ Technologies utilisées

- **Electron Forge** - Framework et outils pour applications desktop
- **Vite** - Build tool moderne et rapide
- **Docker** - Environnement de build cross-platform
- **Makefile** - Automatisation des tâches de build
- **Stockage JSON** - Base de données locale simple et efficace
- **HTML/CSS/JavaScript** - Interface utilisateur moderne
- **Node.js** - Runtime JavaScript
- **ES6 Modules** - Architecture modulaire moderne

## 🎮 Fonctionnalités de gamification

### Système de points et niveaux
- ⭐ **+10 points** pour créer une tâche
- ⭐ **+20 points** pour terminer une tâche  
- ⭐ **+5 points** pour modifier une tâche
- 🚀 **Multiplicateurs** : ×2 pour haute priorité, ×1.5 pour tâches longues (120+ min)
- 🏆 **Progression de niveau** : Débutant → Apprenti → Expert → Maître → Légende

### Badges et accomplissements
- 🐦 **Early Bird** - Terminer une tâche avant 9h
- 🦉 **Night Owl** - Terminer une tâche après 22h
- 🔥 **Streak quotidien** - Jours consécutifs avec au moins 1 tâche terminée

### Compétences évolutives
- 🔧 **Efficacité** - Améliore avec chaque action
- 🎯 **Concentration** - Se développe avec la complétion des tâches
- 💡 **Créativité** - Grandit avec la diversité des tâches

### Quêtes dynamiques
- 🎯 **Quêtes actives** configurables
- 🎁 **Récompenses en points** pour les objectifs atteints
- ⏰ **Système de cooldown** pour renouveler les défis

## 🚀 Installation et Build

### Prérequis
- **Node.js** (version 16 ou supérieure)
- **Docker** (pour la compilation cross-platform)
- **npm** (inclus avec Node.js)

### 🔧 Mode Développement (Test rapide)

Pour tester l'application rapidement en mode développement :

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd taskquest-app

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement
npm start
```

L'application s'ouvrira avec :
- ✅ Hot reload automatique
- ✅ DevTools intégrés
- ✅ Données de test dans `./data/`

### 📦 Build Production (Binaires exécutables)

Pour générer les binaires exécutables cross-platform :

```bash
# 1. Build automatique avec Docker
npm run build-prod
```

Cette commande unique va :
- 🐳 **Construire l'environnement Docker** avec tous les outils nécessaires
- 🔨 **Compiler l'application** pour Linux, Windows et macOS
- 📁 **Générer les binaires** dans le dossier `out/`

### 📂 Résultat du build

Après compilation, vous trouverez dans `out/` :

```
out/
├── my-app-linux-x64/
│   └── my-app              # Exécutable Linux
├── my-app-win32-x64/
│   └── my-app.exe          # Exécutable Windows
└── my-app-darwin-x64/      # Application macOS (si build réussi)
    └── my-app.app
```

### 🧹 Nettoyage

```bash
# Nettoyer les fichiers de build
npm run clean
```

## 📁 Structure du projet

```
taskquest-app/
├── src/
│   ├── main.js              # Process principal Electron
│   ├── preload.js           # Script de préchargement sécurisé
│   ├── database.js          # Gestionnaire gamifié JSON
│   ├── index.html           # Interface utilisateur 4 pages
│   ├── index.css            # Styles gamifiés modernes
│   └── renderer.js          # Logique complète de l'interface
├── data/                    # Données de développement (auto-créé)
│   └── taskquest-data.json  # Base de données locale
├── out/                     # Binaires générés (après build)
├── Dockerfile               # Environnement de build cross-platform
├── Makefile                 # Automatisation des tâches
├── package.json             # Configuration Electron Forge
└── README.md               # Documentation
```

## 🔧 Architecture gamifiée

### Process Principal (main.js)
- Gestion de la fenêtre Electron avec Vite
- APIs IPC pour la gamification (points, badges, quêtes)
- Initialisation du système de stockage
- Gestion du cycle de vie de l'application

### Système de gamification (database.js)
- **Calcul automatique des points** avec multiplicateurs
- **Gestion des niveaux** et progression
- **Système de badges** basé sur les actions
- **Quêtes dynamiques** configurables
- **Streak quotidien** automatique
- **Compétences évolutives**

### Interface multi-pages (renderer.js + index.html)
- **🏠 Dashboard** - Vue d'ensemble héros + quêtes actives
- **👤 Profil** - Badges, compétences, statistiques détaillées  
- **📖 Guide** - Explication complète du système de gamification
- **⚙️ Admin** - Configuration avancée des paramètres

## 🎨 Design gamifié

- **Thème RPG/Fantasy** - Avatars, icônes d'aventure
- **Effets visuels** - Particules lors des réussites
- **Barres de progression** - XP, compétences, quêtes
- **Couleurs dynamiques** - Selon priorité et statut
- **Animations fluides** - Feedback visuel constant
- **Interface intuitive** - Navigation par onglets

## 💾 Système de données gamifié

### Structure des données
```json
{
  "tasks": [...],
  "profile": {
    "totalPoints": 350,
    "level": 3,
    "streak": 5,
    "badges": ["early_bird", "night_owl"],
    "skills": {
      "efficiency": { "level": 2, "points": 45 },
      "concentration": { "level": 1, "points": 30 }
    }
  },
  "quests": [...],
  "config": {
    "pointsPerCreate": 10,
    "pointsPerComplete": 20,
    "highPriorityMultiplier": 2
  }
}
```

## 🐳 Workflow Docker

Le système utilise Docker pour garantir un environnement de build reproductible :

1. **Image Docker** avec Linux + outils cross-compilation
2. **Volume mounting** pour accéder au code source
3. **Makefile** exécuté dans l'environnement Unix
4. **Cross-compilation** automatique pour toutes les plateformes
5. **Binaires copiés** vers le dossier local `out/`

## ⚙️ Configuration admin

L'interface admin permet de :
- 📊 **Ajuster les points** et multiplicateurs
- 🎯 **Créer des quêtes** personnalisées
- 🏅 **Gérer les badges** manuellement
- 🔄 **Reset du profil** complet
- 📤 **Export des données** de sauvegarde

## 🎓 Aspects pédagogiques

Ce projet démontre :

### 1. **Client lourd vs Client léger**
- **Autonomie totale** - Fonctionne sans serveur ni internet
- **Performance native** - Interface rapide sans latence réseau
- **Données privées** - Stockage local sécurisé
- **Installation locale** - Application desktop native

### 2. **Architecture moderne**
- **Docker** - Environnement de build standardisé
- **Makefile** - Automatisation des tâches
- **Cross-compilation** - Binaires multi-plateformes
- **Modules ES6** - Code structuré et maintenable

### 3. **Gamification appliquée**
- **Système de récompenses** - Points, niveaux, badges
- **Progression mesurable** - Compétences et statistiques
- **Engagement utilisateur** - Quêtes et défis
- **Feedback constant** - Notifications et effets visuels

## 🔍 Points clés démontrés

- ✅ **Client lourd autonome** - Zéro dépendance serveur
- ✅ **Cross-compilation** - Binaires Windows/Linux/macOS
- ✅ **Gamification complète** - Système de progression RPG
- ✅ **Interface moderne** - 4 pages avec navigation fluide
- ✅ **Architecture Docker** - Build reproductible
- ✅ **Données persistantes** - Sauvegarde locale automatique

## 📝 Licence

MIT License - Libre d'utilisation pour projets éducatifs et commerciaux.

---

## 💡 Note pédagogique

TaskQuest illustre parfaitement les avantages du **client lourd gamifié** :
- **Performance** : Interface native fluide avec effets visuels
- **Engagement** : Système de points et progression motivant
- **Autonomie** : Fonctionne hors ligne avec données privées
- **Expérience** : Application desktop complète et immersive

Idéal pour démontrer l'intersection entre développement d'applications desktop et design de systèmes gamifiés.
