import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';

class TaskQuestDatabase {
  constructor() {
    const isDev = !app.isPackaged;
    
    if (isDev) {
      const projectRoot = path.resolve(process.cwd());
      const devDataDir = path.join(projectRoot, 'data');
      this.dbPath = path.join(devDataDir, 'taskquest-data.json');
      console.log('Mode DÉVELOPPEMENT - Données dans le projet');
    } else {
      this.dbPath = path.join(app.getPath('userData'), 'taskquest-data.json');
      console.log('Mode PRODUCTION - Données dans userData');
    }
    
    this.data = {
      tasks: [],
      profile: {
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
      },
      quests: [],
      activeQuests: [],
      config: {
        questCooldown: 24, // heures
        pointsPerCreate: 10,
        pointsPerComplete: 20,
        pointsPerModify: 5,
        highPriorityMultiplier: 2,
        longTaskMultiplier: 1.5,
        longTaskThreshold: 120, // minutes
        levelThresholds: [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500], // points pour chaque niveau
        skillPointsRequired: 50 // points requis pour augmenter une compétence
      },
      nextTaskId: 1,
      nextQuestId: 1
    };
  }

  async initialize() {
    try {
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Répertoire de données créé:', dataDir);
      }

      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        const loadedData = JSON.parse(fileContent);
        
        if (loadedData && Array.isArray(loadedData.tasks)) {
          // Merger les données avec les valeurs par défaut pour éviter les erreurs
          this.data = { ...this.data, ...loadedData };
          console.log('Données existantes chargées:', this.dbPath);
          console.log(`${this.data.tasks.length} tâches restaurées`);
          console.log(`Niveau ${this.data.profile.level} - ${this.data.profile.totalPoints} points`);
        } else {
          console.log('Fichier de données corrompu, recréation...');
          await this.insertSampleData();
          this.saveData();
        }
      } else {
        console.log('Nouveau héros ! Création des données initiales...');
        await this.insertSampleData();
        this.initializeQuests();
        this.saveData();
      }

      // Vérifier et actualiser les quêtes
      this.updateQuests();
      this.updateStreak();
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      this.data = {
        tasks: [], profile: { /* valeurs par défaut */ },
        quests: [], activeQuests: [], config: { /* valeurs par défaut */ },
        nextTaskId: 1, nextQuestId: 1
      };
      await this.insertSampleData();
      this.saveData();
    }
  }

  saveData() {
    try {
      const jsonData = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(this.dbPath, jsonData, 'utf8');
      console.log('Données sauvegardées:', {
        path: this.dbPath,
        level: this.data.profile.level,
        points: this.data.profile.totalPoints,
        tasksCount: this.data.tasks.length
      });
    } catch (error) {
      console.error('ERREUR CRITIQUE lors de la sauvegarde:', error);
      throw error;
    }
  }

  async insertSampleData() {
    const sampleTasks = [
      {
        id: 1,
        title: "Découvrir TaskQuest",
        description: "Apprendre à utiliser cette application gamifiée",
        priority: "medium",
        estimatedTime: 30,
        completed: true,
        completedAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        title: "Créer ma première vraie tâche",
        description: "Utiliser l'interface pour ajouter une tâche personnelle",
        priority: "high",
        estimatedTime: 15,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.data.tasks = sampleTasks;
    this.data.nextTaskId = 3;
    
    // Donner des points pour la tâche complétée d'exemple
    this.calculatePoints('complete', sampleTasks[0]);
  }

  initializeQuests() {
    const defaultQuests = [
      {
        id: 1,
        title: "Premier pas",
        description: "Créer votre première tâche",
        type: "create_tasks",
        target: 1,
        reward: 50,
        isActive: true,
        progress: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Productivité matinale",
        description: "Terminer 3 tâches avant 12h",
        type: "morning_tasks",
        target: 3,
        reward: 100,
        isActive: false,
        progress: 0,
        cooldownHours: 24
      },
      {
        id: 3,
        title: "Maître de l'efficacité",
        description: "Terminer 5 tâches en une journée",
        type: "daily_completion",
        target: 5,
        reward: 150,
        isActive: false,
        progress: 0,
        cooldownHours: 48
      }
    ];

    this.data.quests = defaultQuests;
    this.data.activeQuests = [defaultQuests[0]];
    this.data.nextQuestId = 4;
  }

  // === GESTION DES TÂCHES ===
  getAllTasks() {
    return [...this.data.tasks].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }

  createTask(taskData) {
    try {
      const newTask = {
        id: this.data.nextTaskId++,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        estimatedTime: taskData.estimatedTime || 60,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.data.tasks.push(newTask);
      this.calculatePoints('create', newTask);
      this.updateQuestProgress('create_tasks', 1);
      this.saveData();

      return newTask;
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      throw error;
    }
  }

  updateTask(id, updates) {
    try {
      const taskIndex = this.data.tasks.findIndex(task => task.id === id);
      
      if (taskIndex === -1) {
        throw new Error('Tâche non trouvée');
      }

      this.data.tasks[taskIndex] = {
        ...this.data.tasks[taskIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.calculatePoints('modify', this.data.tasks[taskIndex]);
      this.saveData();
      
      return this.data.tasks[taskIndex];
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  }

  toggleTaskComplete(id) {
    try {
      const task = this.data.tasks.find(task => task.id === id);
      
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      const wasCompleted = task.completed;
      task.completed = !task.completed;
      task.updated_at = new Date().toISOString();

      if (task.completed && !wasCompleted) {
        task.completedAt = new Date().toISOString();
        this.calculatePoints('complete', task);
        this.checkTimeBasedBadges(task);
        this.updateQuestProgress('completion', 1);
        this.updateStreak();
      }

      this.saveData();
      return { id, updated: true };
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  }

  deleteTask(id) {
    try {
      const initialLength = this.data.tasks.length;
      this.data.tasks = this.data.tasks.filter(task => task.id !== id);
      
      const deleted = this.data.tasks.length < initialLength;
      
      if (deleted) {
        this.saveData();
      }

      return { deleted };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  // === SYSTÈME DE GAMIFICATION ===
  calculatePoints(action, task) {
    let points = 0;
    const config = this.data.config;

    switch (action) {
      case 'create':
        points = config.pointsPerCreate;
        this.data.profile.stats.tasksCreated++;
        break;
      case 'complete':
        points = config.pointsPerComplete;
        this.data.profile.stats.tasksCompleted++;
        
        // Multiplicateurs
        if (task.priority === 'high') {
          points *= config.highPriorityMultiplier;
        }
        if (task.estimatedTime >= config.longTaskThreshold) {
          points *= config.longTaskMultiplier;
        }
        break;
      case 'modify':
        points = config.pointsPerModify;
        this.data.profile.stats.tasksModified++;
        break;
    }

    this.addPoints(Math.floor(points));
  }

  addPoints(points) {
    this.data.profile.totalPoints += points;
    this.data.profile.currentLevelPoints += points;
    
    // Vérifier le niveau
    this.checkLevelUp();
    
    // Ajouter points aux compétences
    this.addSkillPoints(points);
  }

  checkLevelUp() {
    const thresholds = this.data.config.levelThresholds;
    let newLevel = 1;
    
    for (let i = 0; i < thresholds.length; i++) {
      if (this.data.profile.totalPoints >= thresholds[i]) {
        newLevel = i + 1;
      } else {
        break;
      }
    }

    if (newLevel > this.data.profile.level) {
      this.data.profile.level = newLevel;
      console.log(`🎉 NIVEAU SUPÉRIEUR ! Niveau ${newLevel} atteint !`);
    }
  }

  addSkillPoints(points) {
    const skillPoints = Math.floor(points / 3); // 1/3 des points vont aux compétences
    
    // Répartition automatique basée sur les actions
    this.data.profile.skills.efficiency.points += skillPoints;
    
    // Vérifier les améliorations de compétences
    Object.keys(this.data.profile.skills).forEach(skill => {
      const skillData = this.data.profile.skills[skill];
      const required = this.data.config.skillPointsRequired;
      
      if (skillData.points >= required) {
        skillData.level++;
        skillData.points = 0;
        console.log(`🔧 Compétence ${skill} améliorée ! Niveau ${skillData.level}`);
      }
    });
  }

  checkTimeBasedBadges(task) {
    if (!task.completedAt) return;

    const completionHour = new Date(task.completedAt).getHours();
    
    // Early Bird (avant 9h)
    if (completionHour < 9 && !this.data.profile.badges.includes('early_bird')) {
      this.data.profile.badges.push('early_bird');
      this.data.profile.stats.earlyBirdTasks++;
      console.log('🐦 Badge "Early Bird" débloqué !');
    }
    
    // Night Owl (après 22h)
    if (completionHour >= 22 && !this.data.profile.badges.includes('night_owl')) {
      this.data.profile.badges.push('night_owl');
      this.data.profile.stats.nightOwlTasks++;
      console.log('🦉 Badge "Night Owl" débloqué !');
    }
  }

  updateStreak() {
    const today = new Date().toDateString();
    const lastActive = this.data.profile.lastActiveDate;
    
    // Vérifier si on a terminé une tâche aujourd'hui
    const todayTasks = this.data.tasks.filter(task => 
      task.completed && 
      task.completedAt && 
      new Date(task.completedAt).toDateString() === today
    );

    if (todayTasks.length > 0) {
      if (lastActive === today) {
        // Déjà compté aujourd'hui
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        // Continuité de la série
        this.data.profile.streak++;
      } else {
        // Nouvelle série
        this.data.profile.streak = 1;
      }
      
      this.data.profile.lastActiveDate = today;
      console.log(`🔥 Streak: ${this.data.profile.streak} jours !`);
    }
  }

  // === SYSTÈME DE QUÊTES ===
  updateQuests() {
    // TODO: Logique de renouvellement des quêtes
  }

  updateQuestProgress(type, amount) {
    this.data.activeQuests.forEach(quest => {
      if (quest.type === type || quest.type === 'completion') {
        quest.progress += amount;
        
        if (quest.progress >= quest.target) {
          this.completeQuest(quest);
        }
      }
    });
  }

  completeQuest(quest) {
    console.log(`🎯 Quête "${quest.title}" terminée ! +${quest.reward} points`);
    this.addPoints(quest.reward);
    
    // Retirer de la liste active
    this.data.activeQuests = this.data.activeQuests.filter(q => q.id !== quest.id);
    
    // TODO: Programmer la prochaine quête
  }

  // === STATISTIQUES ===
  getStats() {
    const total = this.data.tasks.length;
    const completed = this.data.tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const high_priority = this.data.tasks.filter(
      task => task.priority === 'high' && !task.completed
    ).length;

    return { total, completed, pending, high_priority };
  }

  getProfile() {
    return this.data.profile;
  }

  getActiveQuests() {
    return this.data.activeQuests;
  }

  getConfig() {
    return this.data.config;
  }

  updateConfig(newConfig) {
    this.data.config = { ...this.data.config, ...newConfig };
    this.saveData();
  }

  close() {
    try {
      this.saveData();
      console.log('Base de données TaskQuest fermée et sauvegardée');
    } catch (error) {
      console.error('Erreur lors de la fermeture:', error);
    }
  }
}

export default TaskQuestDatabase;