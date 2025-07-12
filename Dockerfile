# Environnement Linux pour build TaskQuest
FROM node:22-slim

# Installer make et TOUS les outils de build (y compris rpmbuild)
RUN apt-get update && apt-get install -y \
    make \
    wine64 \
    mono-devel \
    fakeroot \
    dpkg \
    python3 \
    build-essential \
    rpm \
    alien \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# PAS de COPY ni RUN ici - tout se fait via volume mounting
# Le container va recevoir le code via -v "$(pwd):/app"

# Commande par défaut : exécuter le build complet via Makefile
CMD ["make", "all"]