import { contextBridge, ipcRenderer } from 'electron';

// Exposition sécurisée des APIs TaskQuest au renderer
contextBridge.exposeInMainWorld('taskQuestAPI', {
  // === APIs pour les tâches ===
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    create: (task) => ipcRenderer.invoke('tasks:create', task),
    update: (id, updates) => ipcRenderer.invoke('tasks:update', id, updates),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id),
    toggleComplete: (id) => ipcRenderer.invoke('tasks:toggleComplete', id)
  },

  // === APIs pour les statistiques ===
  stats: {
    get: () => ipcRenderer.invoke('stats:get')
  },

  // === APIs pour le profil et gamification ===
  profile: {
    get: () => ipcRenderer.invoke('profile:get'),
    getLevel: () => ipcRenderer.invoke('profile:getLevel'),
    getBadges: () => ipcRenderer.invoke('profile:getBadges'),
    getSkills: () => ipcRenderer.invoke('profile:getSkills')
  },

  // === APIs pour les quêtes ===
  quests: {
    getActive: () => ipcRenderer.invoke('quests:getActive'),
    getAll: () => ipcRenderer.invoke('quests:getAll'),
    create: (questData) => ipcRenderer.invoke('quests:create', questData),
    activate: (questId) => ipcRenderer.invoke('quests:activate', questId),
    deactivate: (questId) => ipcRenderer.invoke('quests:deactivate', questId)
  },

  // === APIs pour la configuration ===
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    update: (newConfig) => ipcRenderer.invoke('config:update', newConfig),
    reset: () => ipcRenderer.invoke('config:reset')
  },

  // === APIs d'administration ===
  admin: {
    resetProfile: () => ipcRenderer.invoke('admin:resetProfile'),
    addPoints: (points) => ipcRenderer.invoke('admin:addPoints', points),
    addBadge: (badgeId) => ipcRenderer.invoke('admin:addBadge', badgeId)
  },

  // === APIs pour les données ===
  data: {
    export: () => ipcRenderer.invoke('data:export'),
    getPath: () => ipcRenderer.invoke('data:getPath')
  }
});