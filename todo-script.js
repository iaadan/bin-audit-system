// ============================================
// TODO LIST APPLICATION - MAIN SCRIPT
// ============================================

class TodoApp {
    constructor() {
        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todosContainer = document.getElementById('todosContainer');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.categorySelect = document.getElementById('categorySelect');
        this.sortSelect = document.getElementById('sortSelect');
        this.editModal = document.getElementById('editModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.editInput = document.getElementById('editInput');
        this.editPriority = document.getElementById('editPriority');
        this.editCategory = document.getElementById('editCategory');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.deleteAllBtn = document.getElementById('deleteAllBtn');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.notificationsToggle = document.getElementById('notificationsToggle');
        this.soundToggle = document.getElementById('soundToggle');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');
        this.toast = document.getElementById('toast');

        // App State
        this.todos = [];
        this.currentFilter = 'all';
        this.currentSort = 'date-desc';
        this.editingId = null;
        this.settings = {
            darkMode: false,
            notifications: true,
            sound: true
        };

        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.loadSettings();
        this.attachEventListeners();
        this.render();
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    attachEventListeners() {
        // Add Todo
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.closest('.filter-btn').dataset.filter));
        });

        // Sort
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // Modal
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeModal();
        });

        // Clear & Delete
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.deleteAllBtn.addEventListener('click', () => this.deleteAll());

        // Settings
        this.darkModeToggle.addEventListener('change', (e) => this.toggleDarkMode(e.target.checked));
        this.notificationsToggle.addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
            this.saveSettings();
        });
        this.soundToggle.addEventListener('change', (e) => {
            this.settings.sound = e.target.checked;
            this.saveSettings();
        });

        // Export & Import
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.importData(e));
    }

    // ============================================
    // TODO OPERATIONS
    // ============================================

    addTodo() {
        const text = this.todoInput.value.trim();
        const priority = this.prioritySelect.value;
        const category = this.categorySelect.value || 'other';

        if (!text) {
            this.showToast('Please enter a task', 'error');
            return;
        }

        const todo = {
            id: Date.now(),
            text,
            priority,
            category,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.categorySelect.value = '';
        this.prioritySelect.value = 'medium';
        this.saveToLocalStorage();
        this.render();
        this.playSound();
        this.showToast('Task added successfully', 'success');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.completedAt = todo.completed ? new Date().toISOString() : null;
            this.saveToLocalStorage();
            this.render();
            this.playSound();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.render();
        this.playSound();
        this.showToast('Task deleted', 'success');
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.editingId = id;
            this.editInput.value = todo.text;
            this.editPriority.value = todo.priority;
            this.editCategory.value = todo.category;
            this.openModal();
        }
    }

    saveEdit() {
        const todo = this.todos.find(t => t.id === this.editingId);
        if (todo) {
            const newText = this.editInput.value.trim();
            if (!newText) {
                this.showToast('Task cannot be empty', 'error');
                return;
            }
            todo.text = newText;
            todo.priority = this.editPriority.value;
            todo.category = this.editCategory.value;
            this.saveToLocalStorage();
            this.render();
            this.closeModal();
            this.playSound();
            this.showToast('Task updated successfully', 'success');
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showToast('No completed tasks to clear', 'warning');
            return;
        }
        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.render();
            this.playSound();
            this.showToast('Completed tasks cleared', 'success');
        }
    }

    deleteAll() {
        if (this.todos.length === 0) {
            this.showToast('No tasks to delete', 'warning');
            return;
        }
        if (confirm('Delete all tasks? This cannot be undone.')) {
            this.todos = [];
            this.saveToLocalStorage();
            this.render();
            this.playSound();
            this.showToast('All tasks deleted', 'success');
        }
    }

    // ============================================
    // FILTERING & SORTING
    // ============================================

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTodos() {
        let filtered = this.todos;

        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'high':
                filtered = filtered.filter(t => t.priority === 'high');
                break;
        }

        return filtered;
    }

    getSortedTodos(todos) {
        const sorted = [...todos];

        switch (this.currentSort) {
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'name':
                sorted.sort((a, b) => a.text.localeCompare(b.text));
                break;
            case 'date-desc':
            default:
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        return sorted;
    }

    // ============================================
    // RENDERING
    // ============================================

    render() {
        const filtered = this.getFilteredTodos();
        const sorted = this.getSortedTodos(filtered);

        this.updateStats();
        this.renderTodos(sorted);
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completionRate').textContent = rate + '%';
    }

    renderTodos(todos) {
        if (todos.length === 0) {
            this.todosContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>${this.currentFilter === 'all' ? 'No tasks yet. Add one to get started!' : 'No tasks found.'}</p>
                </div>
            `;
            return;
        }

        this.todosContainer.innerHTML = todos.map(todo => this.createTodoElement(todo)).join('');

        // Attach event listeners to todo items
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTodo(parseInt(e.target.dataset.id));
            });
        });

        document.querySelectorAll('.todo-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editTodo(parseInt(e.target.closest('.todo-btn').dataset.id));
            });
        });

        document.querySelectorAll('.todo-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTodo(parseInt(e.target.closest('.todo-btn').dataset.id));
            });
        });
    }

    createTodoElement(todo) {
        const date = new Date(todo.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const categoryLabels = {
            work: 'Work',
            personal: 'Personal',
            shopping: 'Shopping',
            health: 'Health',
            other: 'Other'
        };

        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <div class="todo-content">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    <div class="todo-meta">
                        <span class="todo-badge badge-${todo.priority}">${todo.priority}</span>
                        <span class="todo-badge badge-category">${categoryLabels[todo.category]}</span>
                        <span class="todo-date">${date}</span>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="todo-btn edit" data-id="${todo.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="todo-btn delete" data-id="${todo.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // MODAL OPERATIONS
    // ============================================

    openModal() {
        this.editModal.classList.add('active');
    }

    closeModal() {
        this.editModal.classList.remove('active');
        this.editingId = null;
    }

    // ============================================
    // LOCAL STORAGE
    // ============================================

    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('todos');
        this.todos = stored ? JSON.parse(stored) : [];
    }

    // ============================================
    // SETTINGS
    // ============================================

    loadSettings() {
        const stored = localStorage.getItem('todoSettings');
        if (stored) {
            this.settings = JSON.parse(stored);
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('todoSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        this.darkModeToggle.checked = this.settings.darkMode;
        this.notificationsToggle.checked = this.settings.notifications;
        this.soundToggle.checked = this.settings.sound;

        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    toggleDarkMode(enabled) {
        this.settings.darkMode = enabled;
        this.saveSettings();
        this.applySettings();
    }

    // ============================================
    // EXPORT & IMPORT
    // ============================================

    exportData() {
        const data = {
            todos: this.todos,
            settings: this.settings,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('Data exported successfully', 'success');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.todos && Array.isArray(data.todos)) {
                    this.todos = data.todos;
                    if (data.settings) {
                        this.settings = data.settings;
                        this.saveSettings();
                        this.applySettings();
                    }
                    this.saveToLocalStorage();
                    this.render();
                    this.showToast('Data imported successfully', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showToast('Error importing data: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
        this.importFile.value = '';
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

    playSound() {
        if (!this.settings.sound) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});