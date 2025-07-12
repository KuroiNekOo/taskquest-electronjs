import './index.css';

class TaskQuestUI {
  constructor() {
    this.tasks = [];
    this.profile = {};
    this.activeQuests = [];
    this.config = {};
    this.currentEditingTask = null;
    this.currentPage = 'dashboard';
    this.init();
  }

  async init() {
    // Attendre que l'API soit disponible
    if (typeof window.taskQuestAPI === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    this.setupEventListeners();
    await this.loadAllData();
  }

  async loadAllData() {
    try {
      // Charger toutes les données
      await Promise.all([
        this.loadTasks(),
        this.loadProfile(),
        this.loadActiveQuests(),
        this.loadConfig()
      ]);
      
      // Mettre à jour l'interface
      this.updateNavigation();
      this.renderCurrentPage();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.showToast('Erreur lors du chargement', 'error');
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.target.getAttribute('data-page');
        this.switchPage(page);
      });
    });

    // Boutons principales actions
    document.getElementById('add-task-btn').addEventListener('click', () => {
      this.openTaskModal();
    });

    // Modales
    this.setupModalListeners();
    
    // Filtres
    document.getElementById('priority-filter').addEventListener('change', () => {
      this.filterTasks();
    });

    document.getElementById('status-filter').addEventListener('change', () => {
      this.filterTasks();
    });

    // Page admin
    this.setupAdminListeners();
  }

  setupModalListeners() {
    // Modal tâche
    document.getElementById('close-modal').addEventListener('click', () => {
      this.closeTaskModal();
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.closeTaskModal();
    });

    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleTaskSubmit();
    });

    // Modal quête admin
    document.getElementById('close-quest-modal').addEventListener('click', () => {
      this.closeQuestModal();
    });

    document.getElementById('cancel-quest-btn').addEventListener('click', () => {
      this.closeQuestModal();
    });

    document.getElementById('quest-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleQuestSubmit();
    });

    // Fermer modales en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  setupAdminListeners() {
    // Configuration
    document.getElementById('save-config-btn').addEventListener('click', () => {
      this.saveConfig();
    });

    document.getElementById('reset-config-btn').addEventListener('click', () => {
      this.resetConfig();
    });

    // Quêtes admin
    document.getElementById('add-quest-btn').addEventListener('click', () => {
      this.openQuestModal();
    });

    // Actions admin
    document.getElementById('add-points-btn').addEventListener('click', () => {
      this.addAdminPoints();
    });

    document.getElementById('reset-profile-btn').addEventListener('click', () => {
      this.resetProfile();
    });

    document.getElementById('export-data-btn').addEventListener('click', () => {
      this.exportData();
    });
  }

  // === NAVIGATION ===
  switchPage(page) {
    // Mettre à jour les boutons de navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    // Afficher la bonne page
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
    });
    document.getElementById(`${page}-page`).classList.add('active');

    this.currentPage = page;
    this.renderCurrentPage();
  }

  async renderCurrentPage() {
    switch (this.currentPage) {
      case 'dashboard':
        await this.renderDashboard();
        break;
      case 'profile':
        await this.renderProfile();
        break;
      case 'guide':
        await this.renderGuide();
        break;
      case 'admin':
        await this.renderAdmin();
        break;
    }
  }

  // === CHARGEMENT DES DONNÉES ===
  async loadTasks() {
    this.tasks = await window.taskQuestAPI.tasks.getAll();
  }

  async loadProfile() {
    this.profile = await window.taskQuestAPI.profile.get();
  }

  async loadActiveQuests() {
    this.activeQuests = await window.taskQuestAPI.quests.getActive();
  }

  async loadConfig() {
    this.config = await window.taskQuestAPI.config.get();
  }

  // === NAVIGATION UPDATE ===
  updateNavigation() {
    document.getElementById('nav-level').textContent = this.profile.level || 1;
    document.getElementById('nav-points').textContent = this.profile.totalPoints || 0;
  }

  // === DASHBOARD ===
  async renderDashboard() {
    this.renderHeroHeader();
    this.renderActiveQuests();
    this.renderTaskStats();
    this.renderTasks();
  }

  renderHeroHeader() {
    // Nom du héros basé sur le niveau
    const heroNames = {
      1: "Héros Débutant",
      2: "Apprenti Aventurier", 
      3: "Guerrier Compétent",
      4: "Expert en Quêtes",
      5: "Maître de la Productivité",
      6: "Légende Vivante"
    };

    const heroName = heroNames[this.profile.level] || heroNames[Math.min(this.profile.level, 6)];
    document.getElementById('hero-name').textContent = heroName;
    document.getElementById('hero-level').textContent = this.profile.level || 1;

    // Barre d'XP
    this.updateXPBar();

    // Stats du héros
    document.getElementById('streak-value').textContent = this.profile.streak || 0;
    document.getElementById('total-points').textContent = this.profile.totalPoints || 0;
  }

  async updateXPBar() {
    const levelData = await window.taskQuestAPI.profile.getLevel();
    const progress = Math.min((levelData.progressToNext / (levelData.nextThreshold - levelData.currentThreshold)) * 100, 100);
    
    document.getElementById('xp-progress').style.width = `${progress}%`;
    document.getElementById('xp-text').textContent = `${levelData.progressToNext} / ${levelData.nextThreshold - levelData.currentThreshold} XP`;
  }

  renderActiveQuests() {
    const container = document.getElementById('active-quests');
    
    if (this.activeQuests.length === 0) {
      container.innerHTML = `
        <div class="quest-card empty-quest-card">
          <div class="empty-state">
            <h4>🎯 Aucune quête active</h4>
            <p>Terminez des tâches pour débloquer de nouvelles quêtes !</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = this.activeQuests.map(quest => this.createQuestHTML(quest)).join('');
  }

  createQuestHTML(quest) {
    const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);
    
    return `
      <div class="quest-card">
        <div class="quest-header">
          <h4 class="quest-title">${this.escapeHtml(quest.title)}</h4>
          <span class="quest-reward">+${quest.reward} ⭐</span>
        </div>
        <p class="quest-description">${this.escapeHtml(quest.description)}</p>
        <div class="quest-progress">
          <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="quest-progress-text">${quest.progress} / ${quest.target}</div>
        </div>
      </div>
    `;
  }

  async renderTaskStats() {
    const stats = await window.taskQuestAPI.stats.get();
    
    document.getElementById('total-tasks').textContent = stats.total || 0;
    document.getElementById('completed-tasks').textContent = stats.completed || 0;
    document.getElementById('pending-tasks').textContent = stats.pending || 0;
    document.getElementById('high-priority-tasks').textContent = stats.high_priority || 0;
  }

  renderTasks() {
    const container = document.getElementById('tasks-container');
    
    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>⚔️ Aucune quête en cours</h3>
          <p>Créez votre première quête pour commencer votre aventure !</p>
          <button class="btn btn-primary" onclick="taskQuestUI.openTaskModal()">
            Créer une Quête
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.tasks.map(task => this.createTaskHTML(task)).join('');
    this.attachTaskActionListeners();
  }

  createTaskHTML(task) {
    const priorityClass = `priority-${task.priority}`;
    const taskClass = task.completed ? 'completed' : '';
    const date = new Date(task.created_at).toLocaleDateString('fr-FR');
    const estimatedTime = task.estimatedTime || 60;
    
    // Calculer les points que cette tâche donnerait
    let points = this.config.pointsPerComplete || 20;
    if (task.priority === 'high') {
      points *= this.config.highPriorityMultiplier || 2;
    }
    if (estimatedTime >= (this.config.longTaskThreshold || 120)) {
      points *= this.config.longTaskMultiplier || 1.5;
    }
    points = Math.floor(points);
    
    return `
      <div class="task-item ${taskClass} ${task.priority}-priority" data-id="${task.id}">
        <div class="task-header">
          <div>
            <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
          </div>
        </div>
        <div class="task-meta">
          <div class="task-info">
            <span class="task-priority ${priorityClass}">${this.getPriorityText(task.priority)}</span>
            <span class="task-time">⏱️ ${estimatedTime}min</span>
            <span class="task-date">📅 ${date}</span>
            ${!task.completed ? `<span class="quest-reward">+${points} ⭐</span>` : ''}
          </div>
          <div class="task-actions">
            <button class="btn btn-primary" data-action="toggle" data-id="${task.id}">
              ${task.completed ? '↩️ Réactiver' : '⚔️ Terminer'}
            </button>
            <button class="btn btn-secondary" data-action="edit" data-id="${task.id}">
              ✏️ Modifier
            </button>
            <button class="btn btn-danger" data-action="delete" data-id="${task.id}">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getPriorityText(priority) {
    const priorities = {
      'high': 'Haute',
      'medium': 'Moyenne',
      'low': 'Basse'
    };
    return priorities[priority] || 'Moyenne';
  }

  attachTaskActionListeners() {
    const actionButtons = document.querySelectorAll('[data-action]');
    
    actionButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const action = button.getAttribute('data-action');
        const taskId = parseInt(button.getAttribute('data-id'));
        
        switch (action) {
          case 'toggle':
            await this.toggleTask(taskId);
            break;
          case 'edit':
            this.editTask(taskId);
            break;
          case 'delete':
            await this.deleteTask(taskId);
            break;
        }
      });
    });
  }

  filterTasks() {
    const priorityFilter = document.getElementById('priority-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    const filteredTasks = this.tasks.filter(task => {
      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
      const statusMatch = statusFilter === 'all' || 
                         (statusFilter === 'completed' && task.completed) ||
                         (statusFilter === 'pending' && !task.completed);
      
      return priorityMatch && statusMatch;
    });

    // Temporairement remplacer les tâches pour le rendu
    const originalTasks = this.tasks;
    this.tasks = filteredTasks;
    this.renderTasks();
    this.tasks = originalTasks;
  }

  // === ACTIONS SUR LES TÂCHES ===
  async toggleTask(id) {
    try {
      const result = await window.taskQuestAPI.tasks.toggleComplete(id);
      const task = this.tasks.find(t => t.id === id);
      
      if (task && !task.completed) {
        // Tâche terminée - effet de particules et toast spécial
        this.createParticleEffect('⭐✨🎉');
        this.showToast('Quête terminée ! Points gagnés !', 'quest-complete');
      }
      
      await this.loadAllData();
      this.renderCurrentPage();
    } catch (error) {
      console.error('Erreur lors du toggle:', error);
      this.showToast('Erreur lors de la mise à jour', 'error');
    }
  }

  editTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      this.openTaskModal(task);
    }
  }

  async deleteTask(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette quête ?')) {
      return;
    }

    try {
      await window.taskQuestAPI.tasks.delete(id);
      await this.loadAllData();
      this.renderCurrentPage();
      this.showToast('Quête supprimée', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      this.showToast('Erreur lors de la suppression', 'error');
    }
  }

  // === MODALES ===
  openTaskModal(task = null) {
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('task-form');
    
    if (task) {
      modalTitle.textContent = 'Modifier la Tâche';
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-description').value = task.description || '';
      document.getElementById('task-priority').value = task.priority;
      document.getElementById('task-time').value = task.estimatedTime || 60;
      this.currentEditingTask = task;
    } else {
      modalTitle.textContent = 'Nouvelle Tâche';
      form.reset();
      document.getElementById('task-time').value = 60;
      this.currentEditingTask = null;
    }
    
    modal.classList.add('active');
    document.getElementById('task-title').focus();
  }

  closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    this.currentEditingTask = null;
  }

  async handleTaskSubmit() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const priority = document.getElementById('task-priority').value;
    const estimatedTime = parseInt(document.getElementById('task-time').value);

    if (!title) {
      this.showToast('Le titre est obligatoire', 'error');
      return;
    }

    if (estimatedTime < 5 || estimatedTime > 480) {
      this.showToast('Le temps doit être entre 5 et 480 minutes', 'error');
      return;
    }

    try {
      if (this.currentEditingTask) {
        await window.taskQuestAPI.tasks.update(this.currentEditingTask.id, {
          title,
          description,
          priority,
          estimatedTime
        });
        this.showToast('Quête modifiée !', 'success');
      } else {
        await window.taskQuestAPI.tasks.create({
          title,
          description,
          priority,
          estimatedTime
        });
        this.showToast('Nouvelle quête créée !', 'success');
        this.createParticleEffect('⚔️🎯✨');
      }
      
      this.closeTaskModal();
      await this.loadAllData();
      this.renderCurrentPage();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.showToast('Erreur lors de la sauvegarde', 'error');
    }
  }

  // === PAGE PROFIL ===
  async renderProfile() {
    await this.renderProfileHeader();
    await this.renderBadges();
    await this.renderSkills();
    await this.renderDetailedStats();
  }

  async renderProfileHeader() {
    const levelData = await window.taskQuestAPI.profile.getLevel();
    const progress = Math.min((levelData.progressToNext / (levelData.nextThreshold - levelData.currentThreshold)) * 100, 100);
    
    document.getElementById('profile-level').textContent = this.profile.level || 1;
    document.getElementById('profile-level-fill').style.width = `${progress}%`;
    document.getElementById('profile-level-text').textContent = `${levelData.progressToNext} / ${levelData.nextThreshold - levelData.currentThreshold} XP`;
  }

  async renderBadges() {
    const badges = await window.taskQuestAPI.profile.getBadges();
    const container = document.getElementById('badges-container');
    
    container.innerHTML = badges.map(badge => `
      <div class="badge-card ${badge.earned ? 'earned' : ''}">
        <span class="badge-icon">${badge.icon}</span>
        <h4 class="badge-name">${badge.name}</h4>
        <p class="badge-description">${badge.description}</p>
      </div>
    `).join('');
  }

  async renderSkills() {
    const skills = await window.taskQuestAPI.profile.getSkills();
    const container = document.getElementById('skills-container');
    
    const skillNames = {
      efficiency: 'Efficacité',
      concentration: 'Concentration', 
      creativity: 'Créativité'
    };

    container.innerHTML = Object.entries(skills).map(([key, skill]) => {
      const progressPercent = Math.min((skill.points / this.config.skillPointsRequired) * 100, 100);
      
      return `
        <div class="skill-card">
          <div class="skill-header">
            <span class="skill-name">${skillNames[key]}</span>
            <span class="skill-level">Niv. ${skill.level}</span>
          </div>
          <div class="skill-progress">
            <div class="skill-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="skill-points">${skill.points} / ${this.config.skillPointsRequired}</div>
        </div>
      `;
    }).join('');
  }

  async renderDetailedStats() {
    const stats = this.profile.stats || {};
    const container = document.getElementById('detailed-stats-container');
    
    const statsData = [
      { label: 'Tâches créées', value: stats.tasksCreated || 0 },
      { label: 'Tâches terminées', value: stats.tasksCompleted || 0 },
      { label: 'Tâches modifiées', value: stats.tasksModified || 0 },
      { label: 'Streak record', value: this.profile.streak || 0 },
      { label: 'Early Bird', value: stats.earlyBirdTasks || 0 },
      { label: 'Night Owl', value: stats.nightOwlTasks || 0 }
    ];

    container.innerHTML = statsData.map(stat => `
      <div class="detailed-stat-card">
        <div class="detailed-stat-value">${stat.value}</div>
        <div class="detailed-stat-label">${stat.label}</div>
      </div>
    `).join('');
  }

  // === PAGE GUIDE ===
  async renderGuide() {
    // Le guide est statique, pas besoin de rendu dynamique
    // Mais on peut mettre à jour les valeurs actuelles
    const config = this.config;
    
    // Mettre à jour les valeurs dans le guide si nécessaire
    document.querySelectorAll('.rule-points').forEach((el, index) => {
      const values = [config.pointsPerCreate, config.pointsPerComplete, config.pointsPerModify];
      if (values[index]) {
        el.textContent = `+${values[index]} points`;
      }
    });
  }

  // === PAGE ADMIN ===
  async renderAdmin() {
    await this.loadConfig();
    this.renderConfigForm();
    await this.renderQuestsList();
  }

  renderConfigForm() {
    // Remplir le formulaire avec les valeurs actuelles
    document.getElementById('points-create').value = this.config.pointsPerCreate || 10;
    document.getElementById('points-complete').value = this.config.pointsPerComplete || 20;
    document.getElementById('points-modify').value = this.config.pointsPerModify || 5;
    
    document.getElementById('multiplier-high').value = this.config.highPriorityMultiplier || 2;
    document.getElementById('multiplier-long').value = this.config.longTaskMultiplier || 1.5;
    document.getElementById('long-task-threshold').value = this.config.longTaskThreshold || 120;
    
    document.getElementById('quest-cooldown').value = this.config.questCooldown || 24;
  }

  async renderQuestsList() {
    const quests = await window.taskQuestAPI.quests.getAll();
    const container = document.getElementById('quests-list');
    
    container.innerHTML = quests.map(quest => `
      <div class="quest-admin-item">
        <div class="quest-admin-info">
          <div class="quest-admin-title">${this.escapeHtml(quest.title)}</div>
          <div class="quest-admin-details">
            ${quest.type} • ${quest.target} objectif • ${quest.reward} points
            ${quest.isActive ? ' • ACTIVE' : ''}
          </div>
        </div>
        <div class="quest-admin-actions">
          ${!quest.isActive ? 
            `<button class="btn btn-primary" onclick="taskQuestUI.activateQuest(${quest.id})">Activer</button>` :
            `<button class="btn btn-secondary" onclick="taskQuestUI.deactivateQuest(${quest.id})">Désactiver</button>`
          }
        </div>
      </div>
    `).join('');
  }

  // === ACTIONS ADMIN ===
  async saveConfig() {
    try {
      const newConfig = {
        pointsPerCreate: parseInt(document.getElementById('points-create').value),
        pointsPerComplete: parseInt(document.getElementById('points-complete').value),
        pointsPerModify: parseInt(document.getElementById('points-modify').value),
        highPriorityMultiplier: parseFloat(document.getElementById('multiplier-high').value),
        longTaskMultiplier: parseFloat(document.getElementById('multiplier-long').value),
        longTaskThreshold: parseInt(document.getElementById('long-task-threshold').value),
        questCooldown: parseInt(document.getElementById('quest-cooldown').value)
      };

      await window.taskQuestAPI.config.update(newConfig);
      this.config = await window.taskQuestAPI.config.get();
      this.showToast('Configuration sauvegardée !', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.showToast('Erreur lors de la sauvegarde', 'error');
    }
  }

  async resetConfig() {
    if (!confirm('Êtes-vous sûr de vouloir remettre la configuration par défaut ?')) {
      return;
    }

    try {
      await window.taskQuestAPI.config.reset();
      this.config = await window.taskQuestAPI.config.get();
      this.renderConfigForm();
      this.showToast('Configuration remise à zéro !', 'success');
    } catch (error) {
      console.error('Erreur lors du reset:', error);
      this.showToast('Erreur lors du reset', 'error');
    }
  }

  openQuestModal() {
    document.getElementById('quest-modal').classList.add('active');
  }

  closeQuestModal() {
    document.getElementById('quest-modal').classList.remove('active');
  }

  async handleQuestSubmit() {
    try {
      const questData = {
        title: document.getElementById('quest-title').value,
        description: document.getElementById('quest-description').value,
        type: document.getElementById('quest-type').value,
        target: parseInt(document.getElementById('quest-target').value),
        reward: parseInt(document.getElementById('quest-reward').value),
        cooldownHours: parseInt(document.getElementById('quest-cooldown-hours').value)
      };

      await window.taskQuestAPI.quests.create(questData);
      this.closeQuestModal();
      document.getElementById('quest-form').reset();
      await this.renderQuestsList();
      this.showToast('Quête créée !', 'success');
    } catch (error) {
      console.error('Erreur lors de la création de quête:', error);
      this.showToast('Erreur lors de la création', 'error');
    }
  }

  async activateQuest(questId) {
    try {
      await window.taskQuestAPI.quests.activate(questId);
      await this.renderQuestsList();
      await this.loadActiveQuests();
      this.showToast('Quête activée !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      this.showToast('Erreur lors de l\'activation', 'error');
    }
  }

  async deactivateQuest(questId) {
    try {
      await window.taskQuestAPI.quests.deactivate(questId);
      await this.renderQuestsList();
      await this.loadActiveQuests();
      this.showToast('Quête désactivée', 'info');
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
      this.showToast('Erreur lors de la désactivation', 'error');
    }
  }

  async addAdminPoints() {
    const points = parseInt(document.getElementById('admin-points').value);
    if (!points || points <= 0) {
      this.showToast('Entrez un nombre de points valide', 'error');
      return;
    }

    try {
      await window.taskQuestAPI.admin.addPoints(points);
      document.getElementById('admin-points').value = '';
      await this.loadProfile();
      this.updateNavigation();
      this.showToast(`+${points} points ajoutés !`, 'success');
      this.createParticleEffect('⭐💎🎉');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de points:', error);
      this.showToast('Erreur lors de l\'ajout', 'error');
    }
  }

  async resetProfile() {
    if (!confirm('Êtes-vous sûr de vouloir remettre à zéro tout le profil ? Cette action est irréversible !')) {
      return;
    }

    try {
      await window.taskQuestAPI.admin.resetProfile();
      await this.loadProfile();
      this.updateNavigation();
      this.showToast('Profil remis à zéro', 'warning');
    } catch (error) {
      console.error('Erreur lors du reset:', error);
      this.showToast('Erreur lors du reset', 'error');
    }
  }

  async exportData() {
    try {
      const data = await window.taskQuestAPI.data.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskquest-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showToast('Données exportées !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.showToast('Erreur lors de l\'export', 'error');
    }
  }

  // === EFFETS VISUELS ===
  createParticleEffect(particles = '⭐✨🎉') {
    const particleContainer = document.getElementById('particle-container');
    const particleTypes = particles.split('');
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particleTypes[Math.floor(Math.random() * particleTypes.length)];
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight - 100 + 'px';
        
        particleContainer.appendChild(particle);
        
        setTimeout(() => {
          if (particleContainer.contains(particle)) {
            particleContainer.removeChild(particle);
          }
        }, 3000);
      }, i * 100);
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Ajouter une icône selon le type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      'quest-complete': '🎉'
    };
    
    const icon = icons[type] || icons.info;
    toast.innerHTML = `${icon} ${message}`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialisation de l'application
let taskQuestUI;
document.addEventListener('DOMContentLoaded', () => {
  taskQuestUI = new TaskQuestUI();
  
  // Exposer globalement pour les onclick dans le HTML
  window.taskQuestUI = taskQuestUI;
});

console.log('⚔️ TaskQuest chargé via Vite + Electron Forge');