import { execSync } from 'child_process';

const isWindows = process.platform === 'win32';

const dockerCommand = isWindows 
  ? 'docker build -t taskquest-builder . && docker run --rm -v "%cd%:/app" -w /app taskquest-builder'
  : 'docker build -t taskquest-builder . && docker run --rm -v "$(pwd):/app" -w /app taskquest-builder';

console.log('🚀 Démarrage du build cross-platform...');
console.log(`📟 Plateforme détectée: ${isWindows ? 'Windows' : 'Unix'}`);

try {
  execSync(dockerCommand, { stdio: 'inherit', shell: true });
  console.log('✅ Build terminé avec succès !');
} catch (error) {
  console.error('❌ Erreur pendant le build:', error.message);
  process.exit(1);
}