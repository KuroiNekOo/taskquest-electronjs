# Infos

Partie 1 : docker build -t taskquest-builder .
bashdocker build    # Construire une image Docker
-t taskquest-builder    # Donner le nom "taskquest-builder" à l'image  
.    # Utiliser le Dockerfile du répertoire actuel

→ Crée l'environnement Linux avec make, wine, rpm, etc.

Partie 2 : docker run --rm -v "%cd%:/app" -w /app taskquest-builder
bashdocker run    # Lancer un container
--rm    # Supprimer automatiquement le container après exécution
-v "%cd%:/app"    # Monter ton dossier Windows dans /app du container
-w /app    # Définir /app comme répertoire de travail
taskquest-builder    # Utiliser l'image qu'on vient de créer

→ Lance le container qui exécute make all dans ton code

Partie 3 : && rimraf dist
bash&&    # Si la commande précédente réussit, alors...

rimraf dist out    # Supprimer le dossier dist/ et out/
