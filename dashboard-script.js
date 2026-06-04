// ============================================
// DASHBOARD APPLICATION - MAIN SCRIPT
// ============================================

class Dashboard {
    constructor() {
        // DOM Elements
        this.navToggle = document.getElementById('navToggle');
        this.navLinks = document.getElementById('navLinks');
        this.themeToggle = document.getElementById('themeToggle');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.exportAllBtn = document.getElementById('exportAllBtn');
        this.activityList = document.getElementById('activityList');
        this.toast = document.getElementById('toast');
        this.darkModeSettings = document.getElementById('darkModeSettings');
        this.notificationsSettings = document.getElementById('notificationsSettings');
        this.clearAllDataBtn = document.getElementById('clearAllDataBtn');
        this.resetDashboardBtn = document.getElementById('resetDashboardBtn');

        // Stats Elements
        this.auditCountEl = document.getElementById('auditCount');
        this.todoCountEl = document.getElementById('todoCount');
        this.completionRateEl = document.getElementById('completionRate');
        this.lastActivityEl = document.getElementById('lastActivity');
        this.sdfAuditCountEl = document.getElementById('sdfAuditCount');
        this.sdfComplianceRateEl = document.getElementById('sdfComplianceRate');
        this.todoTaskCountEl = document.getElementById('todoTaskCount');
        this.todoCompletedCountEl = document.getElementById('todoCompletedCount');

        // App State
        this.settings = {
            darkMode: false,
            notifications: true
        };
        this.activities = [];

        this.init();
    }

    init() {
        this.loadSettings();
        this.attachEventListeners();
        this.updateDashboard();
        this.startClock();
        this.loadActivities();
        this.setInterval(() => this.updateDashboard(), 5000); // Update every 5 seconds
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    attachEventListeners() {
        // Navigation
        this.navToggle.addEventListener('click', () => this.toggleNavMenu());
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeNavMenu());
        });

        // Theme
        this.themeToggle.addEventListener('click', () => this.toggleDarkMode());

        // Settings
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettings();
        });

        this.darkModeSettings.addEventListener('change', (e) => {
            this.settings.darkMode = e.target.checked;
            this.saveSettings();
            this.applyDarkMode(e.target.checked);
        });

        this.notificationsSettings.addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
            this.saveSettings();
        });

        // Export & Clear
        this.exportAllBtn.addEventListener('click', () => this.exportAllData());
        this.clearAllDataBtn.addEventListener('click', () => this.clearAllData());
        this.resetDashboardBtn.addEventListener('click', () => this.resetDashboard());
    }

    // ============================================
    // NAVIGATION
    // ============================================

    toggleNavMenu() {
        this.navLinks.classList.toggle('active');
        this.navToggle.classList.toggle('active');
    }

    closeNavMenu() {
        this.navLinks.classList.remove('active');
        this.navToggle.classList.remove('active');
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================

    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        this.saveSettings();
        this.applyDarkMode(this.settings.darkMode);
    }

    applyDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // ============================================
    // SETTINGS MANAGEMENT
    // ============================================

    openSettings() {
        this.settingsModal.classList.add('active');
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    loadSettings() {
        const stored = localStorage.getItem('dashboardSettings');
        if (stored) {
            this.settings = JSON.parse(stored);
        }
        this.applyDarkMode(this.settings.darkMode);
        this.darkModeSettings.checked = this.settings.darkMode;
        this.notificationsSettings.checked = this.settings.notifications;
    }

    saveSettings() {
        localStorage.setItem('dashboardSettings', JSON.stringify(this.settings));
    }

    // ============================================
    // DASHBOARD UPDATE
    // ============================================

    updateDashboard() {
        const todoData = this.getTodoStats();
        const sdfData = this.getSDFStats();

        // Update stats
        const totalTasks = todoData.total + sdfData.total;
        const completedTasks = todoData.completed + sdfData.completed;
        const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        this.auditCountEl.textContent = sdfData.total;
        this.todoCountEl.textContent = todoData.total;
        this.completionRateEl.textContent = completionRate + '%';
        this.lastActivityEl.textContent = this.getLastActivityTime();

        // SDF Stats
        this.sdfAuditCountEl.textContent = sdfData.total;
        this.sdfComplianceRateEl.textContent = sdfData.compliance + '%';

        // Todo Stats
        this.todoTaskCountEl.textContent = todoData.total;
        this.todoCompletedCountEl.textContent = todoData.completed;
    }

    getTodoStats() {
        const todosStr = localStorage.getItem('todos');
        if (!todosStr) return { total: 0, completed: 0 };

        const todos = JSON.parse(todosStr);
        const completed = todos.filter(t => t.completed).length;

        return {
            total: todos.length,
            completed: completed
        };
    }

    getSDFStats() {
        const auditsStr = localStorage.getItem('audits');
        if (!auditsStr) return { total: 0, completed: 0, compliance: 0 };

        const audits = JSON.parse(auditsStr);
        const compliant = audits.filter(a => {
            const standards = a.standards || {};
            return Object.values(standards).every(v => v === true);
        }).length;

        return {
            total: audits.length,
            completed: audits.length, // All submitted audits are "completed"
            compliance: audits.length === 0 ? 0 : Math.round((compliant / audits.length) * 100)
        };
    }

    getLastActivityTime() {
        const todoTime = this.getLastTodoTime();
        const sdfTime = this.getLastSDFTime();

        if (!todoTime && !sdfTime) return 'No activity yet';
        if (!todoTime) return 'SDF: ' + sdfTime;
        if (!sdfTime) return 'Todo: ' + todoTime;

        const todoDate = new Date(todoTime);
        const sdfDate = new Date(sdfTime);
        const latest = todoDate > sdfDate ? 'Todo: ' + todoTime : 'SDF: ' + sdfTime;

        return latest;
    }

    getLastTodoTime() {
        const todosStr = localStorage.getItem('todos');
        if (!todosStr) return null;

        const todos = JSON.parse(todosStr);
        if (todos.length === 0) return null;

        const latest = todos[0];
        return this.formatTime(new Date(latest.createdAt));
    }

    getLastSDFTime() {
        const auditsStr = localStorage.getItem('audits');
        if (!auditsStr) return null;

        const audits = JSON.parse(auditsStr);
        if (audits.length === 0) return null;

        const latest = audits[0];
        return this.formatTime(new Date(latest.timestamp));
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return minutes + 'm ago';
        if (hours < 24) return hours + 'h ago';
        if (days < 7) return days + 'd ago';

        return date.toLocaleDateString();
    }

    // ============================================
    // CLOCK
    // ============================================

    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        this.timeDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    // ============================================
    // ACTIVITIES
    // ============================================

    loadActivities() {
        const todoActivities = this.getTodoActivities();
        const sdfActivities = this.getSdfActivities();
        this.activities = [...todoActivities, ...sdfActivities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
        this.renderActivities();
    }

    getTodoActivities() {
        const todosStr = localStorage.getItem('todos');
        if (!todosStr) return [];

        const todos = JSON.parse(todosStr);
        return todos.slice(0, 5).map(todo => ({
            type: 'todo',
            text: `Added task: "${todo.text.substring(0, 30)}${todo.text.length > 30 ? '...' : ''}"`,
            timestamp: new Date(todo.createdAt).getTime(),
            icon: 'fa-tasks'
        }));
    }

    getSdfActivities() {
        const auditsStr = localStorage.getItem('audits');
        if (!auditsStr) return [];

        const audits = JSON.parse(auditsStr);
        return audits.slice(0, 5).map(audit => ({
            type: 'audit',
            text: `Audit completed in ${audit.zone} - Bin #${audit.binNumber}`,
            timestamp: new Date(audit.timestamp).getTime(),
            icon: 'fa-clipboard-check'
        }));
    }

    renderActivities() {
        if (this.activities.length === 0) {
            this.activityList.innerHTML = `
                <div class="empty-activity">
                    <i class="fas fa-inbox"></i>
                    <p>No recent activity yet. Start using the applications!</p>
                </div>
            `;
            return;
        }

        this.activityList.innerHTML = this.activities.map((activity, index) => `
            <div class="activity-item" style="animation-delay: ${index * 0.1}s">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${this.formatTime(new Date(activity.timestamp))}</div>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // EXPORT & IMPORT
    // ============================================

    exportAllData() {
        const data = {
            todos: JSON.parse(localStorage.getItem('todos') || '[]'),
            audits: JSON.parse(localStorage.getItem('audits') || '[]'),
            settings: this.settings,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showToast('All data exported successfully', 'success');
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete all data from both applications? This cannot be undone.')) {
            localStorage.removeItem('todos');
            localStorage.removeItem('audits');
            localStorage.removeItem('todoSettings');
            this.updateDashboard();
            this.loadActivities();
            this.showToast('All data cleared', 'success');
        }
    }

    resetDashboard() {
        if (confirm('Reset dashboard to default settings?')) {
            this.settings = {
                darkMode: false,
                notifications: true
            };
            this.saveSettings();
            this.loadSettings();
            this.showToast('Dashboard reset', 'success');
        }
    }

    // ============================================
    // UI HELPERS
    // ============================================

    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});