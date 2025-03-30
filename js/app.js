document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage
    StorageManager.initializeFitnessData();
    
    // Remove dashboard hidden class
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.classList.remove('hidden');
    }
    
    // Initialize trackers and charts
    initializeTrackers();
    FitnessCharts.initCharts();
    
    // Start step counter with immediate display update
    StepCounter.startCounting();
    
    // Initialize workouts library
    WorkoutManager.initializeWorkouts();
    
    // UI Elements
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const userActions = document.getElementById('userActions');
    
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        userActions.classList.toggle('active');
    });
    
    // Initialize goals list
    renderGoals();
    
    // Event listeners for modals
    setupModalListeners();
    
    // Form submissions
    setupFormListeners();
    
    // Initialize theme
    initializeTheme();
    
    // Add Get Started functionality
    setupGetStartedButton();
});

// Render goals from storage
function renderGoals() {
    const goalsList = document.getElementById('goalsList');
    const goals = StorageManager.getGoals();
    
    goalsList.innerHTML = goals.map(goal => `
        <div class="goal-item">
            <div class="goal-info">
                <h4>${goal.type}</h4>
                <p>Target: ${goal.target}</p>
            </div>
            ${createGoalCircle(goal.id)}
        </div>
    `).join('');
    
    // Initialize progress for each goal
    updateGoalProgress();
}

// Setup modal listeners
function setupModalListeners() {
    const modals = ['loginModal', 'registerModal', 'addGoalModal'];
    const buttons = ['loginBtn', 'registerBtn', 'addGoalBtn'];
    
    buttons.forEach((btn, index) => {
        const button = document.getElementById(btn);
        const modal = document.getElementById(modals[index]);
        const closeBtn = modal.querySelector('.close-btn');
        
        button.addEventListener('click', () => modal.style.display = 'block');
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Setup form listeners
function setupFormListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        // Add login logic here
        document.getElementById('loginModal').style.display = 'none';
    });
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            focus: document.getElementById('fitnessFocus').value
        };
        StorageManager.saveUser(userData);
        document.getElementById('registerModal').style.display = 'none';
    });
    
    // Goal form
    document.getElementById('goalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const goalData = {
            type: document.getElementById('goalType').value,
            target: document.getElementById('goalTarget').value,
            date: document.getElementById('goalDate').value,
            progress: 0
        };
        StorageManager.saveGoal(goalData);
        renderGoals();
        document.getElementById('addGoalModal').style.display = 'none';
    });
}

// Initialize calorie and goal trackers
function initializeTrackers() {
    // Update displays immediately
    updateCalorieProgress();
    updateGoalProgress();
    
    // Set up periodic updates
    setInterval(() => {
        updateCalorieProgress();
        updateGoalProgress();
        FitnessCharts.updateAllCharts();
    }, 30000); // Update every 30 seconds
}

function updateCalorieProgress() {
    const caloriesBurned = calculateCaloriesBurned();
    const dailyCalorieTarget = 500; // Example target
    const percentage = (caloriesBurned / dailyCalorieTarget) * 100;
    
    const caloriesBar = document.querySelector('.calories-bar');
    const caloriesValue = document.querySelector('.calories-value');
    const caloriesTarget = document.querySelector('.calories-target');
    
    if (caloriesBar && caloriesValue && caloriesTarget) {
        caloriesBar.style.width = `${Math.min(percentage, 100)}%`;
        caloriesValue.textContent = Math.round(caloriesBurned);
        caloriesTarget.textContent = dailyCalorieTarget;
    }
}

function calculateCaloriesBurned() {
    const steps = parseInt(localStorage.getItem('currentSteps') || 0);
    // Approximate calories burned per step (varies by person)
    const caloriesPerStep = 0.04;
    return steps * caloriesPerStep;
}

function updateGoalProgress() {
    const goals = StorageManager.getGoals();
    goals.forEach(goal => {
        const progressCircle = document.querySelector(`#goal-${goal.id} .progress-ring-circle`);
        if (progressCircle) {
            const radius = progressCircle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const progress = (goal.progress / 100);
            const offset = circumference - (progress * circumference);
            
            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            progressCircle.style.strokeDashoffset = offset;
            
            const valueDisplay = document.querySelector(`#goal-${goal.id} .goal-progress-value`);
            if (valueDisplay) {
                valueDisplay.textContent = `${Math.round(goal.progress)}%`;
            }
        }
    });
}

function createGoalCircle(goalId, size = 120) {
    const radius = (size / 2) - 10;
    const circumference = radius * 2 * Math.PI;
    
    return `
        <div class="goal-progress-circle" id="goal-${goalId}">
            <svg class="progress-ring" width="${size}" height="${size}">
                <circle class="progress-ring-background"
                    stroke-width="8"
                    fill="transparent"
                    r="${radius}"
                    cx="${size/2}"
                    cy="${size/2}"/>
                <circle class="progress-ring-circle"
                    stroke-width="8"
                    fill="transparent"
                    r="${radius}"
                    cx="${size/2}"
                    cy="${size/2}"
                    style="stroke-dasharray: ${circumference} ${circumference};
                           stroke-dashoffset: ${circumference}"/>
            </svg>
            <div class="goal-progress-text">
                <div class="goal-progress-value">0%</div>
                <div class="goal-progress-label">Complete</div>
            </div>
        </div>
    `;
}

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    // Set initial theme
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Add transition animation
        document.documentElement.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    });
    
    // System theme change handler
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        // Dispatch theme change event for charts
        document.dispatchEvent(new CustomEvent('themeChanged'));
    }
}

function setupGetStartedButton() {
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (!getStartedBtn) return;

    getStartedBtn.addEventListener('click', () => {
        // Show welcome modal
        showWelcomeModal();
        
        // Scroll to dashboard smoothly
        const dashboardSection = document.getElementById('dashboard');
        if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
            dashboardSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Initialize user session
        initializeUserSession();
    });
}

function showWelcomeModal() {
    const modalHtml = `
        <div id="welcomeModal" class="modal">
            <div class="modal-content welcome-modal">
                <span class="close-btn">&times;</span>
                <h2>Welcome to FitTrack! 🎉</h2>
                <div class="welcome-steps">
                    <div class="welcome-step">
                        <i class="fas fa-bullseye"></i>
                        <h3>Set Your Goals</h3>
                        <p>Start by setting your fitness goals</p>
                    </div>
                    <div class="welcome-step">
                        <i class="fas fa-running"></i>
                        <h3>Track Activities</h3>
                        <p>Monitor your daily activities and workouts</p>
                    </div>
                    <div class="welcome-step">
                        <i class="fas fa-chart-line"></i>
                        <h3>View Progress</h3>
                        <p>Watch your progress over time</p>
                    </div>
                </div>
                <button id="startJourneyBtn" class="btn btn-primary">Start Your Journey</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const welcomeModal = document.getElementById('welcomeModal');
    const closeBtn = welcomeModal.querySelector('.close-btn');
    const startJourneyBtn = document.getElementById('startJourneyBtn');
    
    welcomeModal.style.display = 'block';
    
    closeBtn.onclick = () => {
        welcomeModal.style.display = 'none';
        showGoalSetupModal();
    };
    
    startJourneyBtn.onclick = () => {
        welcomeModal.style.display = 'none';
        showGoalSetupModal();
    };
}

function showGoalSetupModal() {
    const goalSetupHtml = `
        <div id="quickStartModal" class="modal">
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2>Quick Start Setup</h2>
                <form id="quickStartForm">
                    <div class="form-group">
                        <label>What's your main fitness goal?</label>
                        <select required>
                            <option value="weightLoss">Weight Loss</option>
                            <option value="muscleGain">Build Muscle</option>
                            <option value="endurance">Improve Endurance</option>
                            <option value="flexibility">Increase Flexibility</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Daily step goal:</label>
                        <input type="number" value="10000" min="1000" max="50000">
                    </div>
                    <div class="form-group">
                        <label>Weekly workout goal:</label>
                        <input type="number" value="3" min="1" max="7">
                    </div>
                    <button type="submit" class="btn btn-primary">Set Goals & Begin</button>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', goalSetupHtml);
    
    const quickStartModal = document.getElementById('quickStartModal');
    const quickStartForm = document.getElementById('quickStartForm');
    
    quickStartModal.style.display = 'block';
    
    quickStartForm.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(quickStartForm);
        saveInitialGoals(Object.fromEntries(formData));
        quickStartModal.style.display = 'none';
        
        // Show success message
        showSuccessToast('Goals set successfully! Let\'s begin your fitness journey!');
    };
}

function initializeUserSession() {
    // Set initial data
    if (!localStorage.getItem('currentSteps')) {
        localStorage.setItem('currentSteps', '0');
    }
    if (!localStorage.getItem('workoutStreak')) {
        localStorage.setItem('workoutStreak', '0');
    }
    
    // Start tracking
    StepCounter.startCounting();
    FitnessCharts.initCharts();
}

function saveInitialGoals(goals) {
    StorageManager.saveGoal({
        type: 'steps',
        target: goals.dailySteps || 10000,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 0
    });
    
    StorageManager.saveGoal({
        type: 'workouts',
        target: goals.weeklyWorkouts || 3,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 0
    });
    
    renderGoals();
}

function showSuccessToast(message) {
    const toastHtml = `
        <div class="toast success-toast">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toast = document.querySelector('.toast');
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}
