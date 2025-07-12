# Makefile pour TaskQuest

.PHONY: install build-vite build build-all clean all

# Installation des dépendances
install:
	@echo "📦 Installation des dépendances..."
	npm install

# Build Vite (génère .vite/build/main.js)
build-vite:
	@echo "🔧 Build Vite en cours..."
	NODE_ENV=production npx vite build

# Build de l'application pour Linux seulement
build:
	@echo "🔨 Compilation de TaskQuest (Linux)..."
	NODE_ENV=production npm run package

# Build pour toutes les plateformes
build-all:
	@echo "🔨 Cross-compilation pour toutes les plateformes..."
	@echo "🐧 Build Linux..."
	NODE_ENV=production npm run package -- --platform=linux --arch=x64
	@echo "🪟 Build Windows..."
	NODE_ENV=production npm run package -- --platform=win32 --arch=x64
	@echo "🍎 Build macOS..."
	NODE_ENV=production npm run package -- --platform=darwin --arch=x64 || echo "macOS build peut échouer sur Linux"

# Nettoyage
clean:
	@echo "🧹 Nettoyage..."
	rm -rf node_modules out .vite

# Build complet pour toutes les plateformes
all: install build-vite build-all
	@echo "🎉 Build cross-platform terminé."
	@echo "📁 Binaires disponibles dans le dossier out/ :"
	@ls -la out/ 2>/dev/null || echo "Dossier out/ vide"

# Build simple (Linux seulement)
linux: install build-vite build
	@echo "🎉 Build Linux terminé dans out/"
