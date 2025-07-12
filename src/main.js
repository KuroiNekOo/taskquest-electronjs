import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import TaskQuestDatabase from './database.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

class TaskQuestApp {
  constructor() {
    this.mainWindow = null;
    this.database = new TaskQuestDatabase();
  }

  createWindow() {
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true
      },
      titleBarStyle: 'default',
      show: false,
      icon: path.join(__dirname, 'assets/icon.png')
    });

    // Load the app
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      this.mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Open the DevTools in development
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  setupIPC() {
    // === GESTION DES TÂCHES ===
    ipcMain.handle('tasks:getAll', async () => {
      return this.database.getAllTasks();
    });

    ipcMain.handle('tasks:create', async (event, task) => {
      return this.database.createTask(task);
    });

    ipcMain.handle('tasks:update', async (event, id, updates) => {
      return this.database.updateTask(id, updates);
    });

    ipcMain.handle('tasks:delete', async (event, id) => {
      return this.database.deleteTask(id);
    });

    ipcMain.handle('tasks:toggleComplete', async (event, id) => {
      return this.database.toggleTaskComplete(id);
    });

    // === STATISTIQUES ===
    ipcMain.handle('stats:get', async () => {
      return this.database.getStats();
    });

    // === PROFIL ET GAMIFICATION ===
    ipcMain.handle('profile:get', async () => {
      return this.database.getProfile();
    });

    ipcMain.handle('profile:getLevel', async () => {
      const profile = this.database.getProfile();
      const config = this.database.getConfig();
      const currentThreshold = config.levelThresholds[profile.level - 1] || 0;
      const nextThreshold = config.levelThresholds[profile.level] || config.levelThresholds[config.levelThresholds.length - 1];
      
      return {
        level: profile.level,
        currentPoints: profile.totalPoints,
        currentThreshold,
        nextThreshold,
        progressToNext: profile.totalPoints - currentThreshold,
        pointsNeeded: nextThreshold - profile.totalPoints
      };
    });

    ipcMain.handle('profile:getBadges', async () => {
      const profile = this.database.getProfile();
      const allBadges = [
        {
          id: 'early_bird',
          name: 'Early Bird',
          description: 'Terminer une tâche avant 9h',
          icon: '🐦',
          earned: profile.badges.includes('early_bird')
        },
        {
          id: 'night_owl',
          name: 'Night Owl',
          description: 'Terminer une tâche après 22h',
          icon: '🦉',
          earned: profile.badges.includes('night_owl')
        }
      ];
      
      return allBadges;
    });

    ipcMain.handle('profile:getSkills', async () => {
      const profile = this.database.getProfile();
      return profile.skills;
    });

    // === QUÊTES ===
    ipcMain.handle('quests:getActive', async () => {
      return this.database.getActiveQuests();
    });

    ipcMain.handle('quests:getAll', async () => {
      return this.database.data.quests;
    });

    ipcMain.handle('quests:create', async (event, questData) => {
      // Ajouter une nouvelle quête
      const newQuest = {
        id: this.database.data.nextQuestId++,
        ...questData,
        isActive: false,
        progress: 0,
        createdAt: new Date().toISOString()
      };
      
      this.database.data.quests.push(newQuest);
      this.database.saveData();
      return newQuest;
    });

    ipcMain.handle('quests:activate', async (event, questId) => {
      const quest = this.database.data.quests.find(q => q.id === questId);
      if (quest && !this.database.data.activeQuests.find(q => q.id === questId)) {
        quest.isActive = true;
        quest.progress = 0;
        this.database.data.activeQuests.push(quest);
        this.database.saveData();
      }
      return quest;
    });

    ipcMain.handle('quests:deactivate', async (event, questId) => {
      this.database.data.activeQuests = this.database.data.activeQuests.filter(q => q.id !== questId);
      const quest = this.database.data.quests.find(q => q.id === questId);
      if (quest) {
        quest.isActive = false;
      }
      this.database.saveData();
      return true;
    });

    // === CONFIGURATION ADMIN ===
    ipcMain.handle('config:get', async () => {
      return this.database.getConfig();
    });

    ipcMain.handle('config:update', async (event, newConfig) => {
      this.database.updateConfig(newConfig);
      return this.database.getConfig();
    });

    ipcMain.handle('config:reset', async () => {
      // Reset aux valeurs par défaut
      const defaultConfig = {
        questCooldown: 24,
        pointsPerCreate: 10,
        pointsPerComplete: 20,
        pointsPerModify: 5,
        highPriorityMultiplier: 2,
        longTaskMultiplier: 1.5,
        longTaskThreshold: 120,
        levelThresholds: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500],
        skillPointsRequired: 50
      };
      
      this.database.updateConfig(defaultConfig);
      return defaultConfig;
    });

    // === DONNÉES ADMINISTRATIVES ===
    ipcMain.handle('admin:resetProfile', async () => {
      // Reset complet du profil utilisateur
      this.database.data.profile = {
        totalPoints: 0,
        level: 1,
        currentLevelPoints: 0,
        streak: 0,
        lastActiveDate: null,
        badges: [],
        skills: {
          efficiency: { level: 0, points: 0 },
          concentration: { level: 0, points: 0 },
          creativity: { level: 0, points: 0 }
        },
        stats: {
          tasksCreated: 0,
          tasksCompleted: 0,
          tasksModified: 0,
          totalTimeSpent: 0,
          earlyBirdTasks: 0,
          nightOwlTasks: 0
        }
      };
      
      this.database.saveData();
      return this.database.getProfile();
    });

    ipcMain.handle('admin:addPoints', async (event, points) => {
      this.database.addPoints(points);
      this.database.saveData();
      return this.database.getProfile();
    });

    ipcMain.handle('admin:addBadge', async (event, badgeId) => {
      const profile = this.database.getProfile();
      if (!profile.badges.includes(badgeId)) {
        profile.badges.push(badgeId);
        this.database.saveData();
      }
      return profile.badges;
    });

    // === EXPORT/IMPORT ===
    ipcMain.handle('data:export', async () => {
      return {
        exportDate: new Date().toISOString(),
        data: this.database.data
      };
    });

    ipcMain.handle('data:getPath', async () => {
      return this.database.dbPath;
    });
  }

  async initialize() {
    await this.database.initialize();
    this.setupIPC();
  }
}

const taskQuestApp = new TaskQuestApp();

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  await taskQuestApp.initialize();
  taskQuestApp.createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      taskQuestApp.createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (taskQuestApp.database) {
    taskQuestApp.database.close();
  }
});