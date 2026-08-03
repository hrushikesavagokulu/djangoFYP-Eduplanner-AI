/**
 * Frontend logic for Performance Tracker.
 */

let barChart = null;
let lineChart = null;

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const welcomeMessage = document.getElementById('welcomeMessage');
const logoutBtn = document.getElementById('logoutBtn');
const setupSection = document.getElementById('setupSection');
const trackerSection = document.getElementById('trackerSection');
const daysInput = document.getElementById('daysInput');
const initBtn = document.getElementById('initBtn');
const taskNameInput = document.getElementById('taskNameInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const addDayBtn = document.getElementById('addDayBtn');
const removeDayBtn = document.getElementById('removeDayBtn');
const resetBtn = document.getElementById('resetBtn');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');

// Stats Elements
const totalTasksEl = document.getElementById('totalTasks');
const overallCompletionEl = document.getElementById('overallCompletion');
const currentStreakEl = document.getElementById('currentStreak');

// Utility Functions
const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';

/**
 * Check if user is authenticated.
 */
const checkAuth = async () => {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        if (!data.authenticated) {
            window.location.href = 'login.html';
        } else {
            welcomeMessage.textContent = `Welcome, ${data.username}!`;
            loadTrackerData();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
    }
};

/**
 * Load tracker data and update UI.
 */
const loadTrackerData = async () => {
    showLoading();
    try {
        const response = await fetch('/api/data');
        if (response.status === 401) {
            window.location.href = 'login.html';
            return;
        }
        const data = await response.json();

        if (data.days === 0) {
            setupSection.style.display = 'block';
            trackerSection.style.display = 'none';
        } else {
            setupSection.style.display = 'none';
            trackerSection.style.display = 'block';
            renderTable(data);
            updateStats(data);
            updateCharts();
        }
    } catch (error) {
        console.error('Load data error:', error);
    } finally {
        hideLoading();
    }
};

/**
 * Update Dashboard Stats.
 */
const updateStats = (data) => {
    const totalTasks = data.tasks.length;
    totalTasksEl.textContent = totalTasks;

    if (totalTasks === 0) {
        overallCompletionEl.textContent = '0%';
        currentStreakEl.textContent = '0 Days';
        return;
    }

    // Overall Completion
    let totalDone = 0;
    data.tasks.forEach(task => {
        totalDone += task.progress.filter(p => p === 1).length;
    });
    const overallCompletion = Math.round((totalDone / (totalTasks * data.days)) * 100);
    overallCompletionEl.textContent = `${overallCompletion}%`;

    // Current Streak (Consecutive days where at least one task was done)
    let streak = 0;
    for (let i = data.days - 1; i >= 0; i--) {
        const anyTaskDone = data.tasks.some(task => task.progress[i] === 1);
        if (anyTaskDone) {
            streak++;
        } else {
            // Only break if we've already started a streak or if it's not today (last day)
            if (streak > 0) break;
        }
    }
    currentStreakEl.textContent = `${streak} Day${streak === 1 ? '' : 's'}`;
};

/**
 * Render the tracker table.
 */
const renderTable = (data) => {
    // Clear existing
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    // Create Header
    const taskHeader = document.createElement('th');
    taskHeader.textContent = 'Task Name';
    taskHeader.className = 'task-name-cell';
    tableHeader.appendChild(taskHeader);

    for (let i = 0; i < data.days; i++) {
        const dayHeader = document.createElement('th');
        dayHeader.textContent = `Day ${i + 1}`;
        tableHeader.appendChild(dayHeader);
    }

    const actionsHeader = document.createElement('th');
    actionsHeader.textContent = 'Action';
    tableHeader.appendChild(actionsHeader);

    // Create Body
    data.tasks.forEach(task => {
        const row = document.createElement('tr');

        // Task Name
        const nameCell = document.createElement('td');
        nameCell.textContent = task.name;
        nameCell.className = 'task-name-cell';
        row.appendChild(nameCell);

        // Progress Cells with Checkboxes
        task.progress.forEach((status, index) => {
            const cell = document.createElement('td');
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox';
            checkbox.checked = status === 1;
            checkbox.onchange = () => toggleProgress(task.id, index);

            checkboxContainer.appendChild(checkbox);
            cell.appendChild(checkboxContainer);
            row.appendChild(cell);
        });

        // Actions
        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.style.padding = '0.4rem 0.8rem';
        deleteBtn.style.fontSize = '0.75rem';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
};

/**
 * Toggle task progress.
 */
const toggleProgress = async (taskId, dayIndex) => {
    try {
        const response = await fetch('/api/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, dayIndex })
        });
        if (response.ok) {
            // We don't need to reload everything, just update stats and charts
            // but for simplicity and ensuring data integrity, we reload.
            // In a real production app, we'd update local state.
            const dataResponse = await fetch('/api/data');
            const data = await dataResponse.json();
            updateStats(data);
            updateCharts();
        }
    } catch (error) {
        console.error('Toggle progress error:', error);
    }
};

/**
 * Delete a task.
 */
const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        const response = await fetch('/api/delete-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId })
        });
        if (response.ok) {
            loadTrackerData();
        }
    } catch (error) {
        console.error('Delete task error:', error);
    }
};

/**
 * Update charts using Chart.js.
 */
const updateCharts = async () => {
    try {
        const response = await fetch('/api/charts');
        const data = await response.json();

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        };

        // Bar Chart
        if (barChart) barChart.destroy();
        const barCtx = document.getElementById('barChart').getContext('2d');
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: data.bar.labels,
                datasets: [{
                    ...data.bar.datasets[0],
                    backgroundColor: '#6366f1',
                    borderRadius: 6,
                    barThickness: 20
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { display: false },
                        ticks: { callback: value => `${value}%` }
                    },
                    x: { grid: { display: false } }
                }
            }
        });

        // Line Chart
        if (lineChart) lineChart.destroy();
        const lineCtx = document.getElementById('lineChart').getContext('2d');
        lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: data.line.labels,
                datasets: [{
                    ...data.line.datasets[0],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981'
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: '#f1f5f9' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    } catch (error) {
        console.error('Update charts error:', error);
    }
};

// Event Listeners
logoutBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
});

initBtn.addEventListener('click', async () => {
    const days = daysInput.value;
    try {
        const response = await fetch('/api/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ days })
        });
        if (response.ok) {
            loadTrackerData();
        }
    } catch (error) {
        console.error('Init error:', error);
    }
});

addTaskBtn.addEventListener('click', async () => {
    const name = taskNameInput.value;
    if (!name) return;
    try {
        const response = await fetch('/api/add-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (response.ok) {
            taskNameInput.value = '';
            loadTrackerData();
        }
    } catch (error) {
        console.error('Add task error:', error);
    }
});

addDayBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/add-day', { method: 'POST' });
        if (response.ok) {
            loadTrackerData();
        }
    } catch (error) {
        console.error('Add day error:', error);
    }
});

removeDayBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/remove-day', { method: 'POST' });
        if (response.ok) {
            loadTrackerData();
        }
    } catch (error) {
        console.error('Remove day error:', error);
    }
});

resetBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to reset all tasks?')) return;
    try {
        const response = await fetch('/api/reset', { method: 'POST' });
        if (response.ok) {
            loadTrackerData();
        }
    } catch (error) {
        console.error('Reset error:', error);
    }
});

// Initial Load
checkAuth();
