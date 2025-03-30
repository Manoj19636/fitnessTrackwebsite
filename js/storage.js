const StorageManager = {
    // User Management
    saveUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    getUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    },

    clearUser() {
        localStorage.removeItem('currentUser');
    },

    // Fitness Data Management
    saveSteps(steps, day = new Date().getDay()) {
        let weeklySteps = this.getWeeklySteps();
        weeklySteps[day] = steps;
        localStorage.setItem('weeklySteps', JSON.stringify(weeklySteps));
    },

    getWeeklySteps() {
        return JSON.parse(localStorage.getItem('weeklySteps')) || Array(7).fill(0);
    },

    saveWorkout(workout) {
        let workouts = this.getWorkouts();
        workouts.push({...workout, date: new Date().toISOString()});
        localStorage.setItem('workouts', JSON.stringify(workouts));
    },

    getWorkouts() {
        return JSON.parse(localStorage.getItem('workouts')) || [];
    },

    saveGoal(goal) {
        let goals = this.getGoals();
        goals.push({...goal, id: Date.now()});
        localStorage.setItem('goals', JSON.stringify(goals));
    },

    getGoals() {
        return JSON.parse(localStorage.getItem('goals')) || [];
    },

    updateGoal(goalId, progress) {
        let goals = this.getGoals();
        const index = goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            goals[index].progress = progress;
            localStorage.setItem('goals', JSON.stringify(goals));
        }
    },

    // Nutrition Data Management
    saveMeal(meal) {
        let meals = this.getMeals();
        meals.push({...meal, id: Date.now()});
        localStorage.setItem('meals', JSON.stringify(meals));
        this.updateDailyCalories(meal.type, meal.calories);
    },

    getMeals() {
        return JSON.parse(localStorage.getItem('meals')) || [];
    },

    updateDailyCalories(mealType, calories) {
        let dailyCalories = this.getDailyCalories();
        const mealIndex = ['breakfast', 'lunch', 'dinner', 'snacks'].indexOf(mealType);
        if (mealIndex !== -1) {
            dailyCalories[mealIndex] += calories;
            localStorage.setItem('dailyCalories', JSON.stringify(dailyCalories));
        }
    },

    getDailyCalories() {
        return JSON.parse(localStorage.getItem('dailyCalories')) || [0, 0, 0, 0];
    },

    initializeFitnessData() {
        if (!localStorage.getItem('lastUpdateDate')) {
            localStorage.setItem('lastUpdateDate', new Date().toISOString());
        }
        if (!localStorage.getItem('weeklySteps')) {
            localStorage.setItem('weeklySteps', JSON.stringify(Array(7).fill(0)));
        }
        if (!localStorage.getItem('dailyCalories')) {
            localStorage.setItem('dailyCalories', '0');
        }
        if (!localStorage.getItem('workoutStreak')) {
            localStorage.setItem('workoutStreak', '0');
        }
        if (!localStorage.getItem('bestStreak')) {
            localStorage.setItem('bestStreak', '0');
        }
    }
};

// Mock Step Counter API
const StepCounter = {
    stepInterval: null,
    lastUpdateTime: null,
    dailyGoal: 10000,
    
    startCounting() {
        // Reset steps at midnight
        this.checkDayChange();
        
        this.stepInterval = setInterval(() => {
            this.generateSteps();
            this.checkDayChange();
        }, 2000);
        
        // Update display immediately
        this.updateDisplay(parseInt(localStorage.getItem('currentSteps') || 0));
    },

    checkDayChange() {
        const now = new Date();
        const lastUpdate = new Date(localStorage.getItem('lastUpdateDate'));
        
        if (lastUpdate.getDate() !== now.getDate()) {
            this.resetDaily();
            localStorage.setItem('lastUpdateDate', now.toISOString());
        }
    },

    generateSteps() {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        
        // Generate steps based on time of day
        let stepIncrement;
        if (currentHour >= 6 && currentHour < 9) {  // Morning workout
            stepIncrement = Math.floor(Math.random() * 50) + 30;
        } else if (currentHour >= 12 && currentHour < 14) {  // Lunch walk
            stepIncrement = Math.floor(Math.random() * 30) + 20;
        } else if (currentHour >= 17 && currentHour < 20) {  // Evening activity
            stepIncrement = Math.floor(Math.random() * 40) + 25;
        } else if (currentHour >= 22 || currentHour < 6) {  // Night time
            stepIncrement = Math.floor(Math.random() * 5);
        } else {  // Regular daytime activity
            stepIncrement = Math.floor(Math.random() * 20) + 10;
        }
        
        const currentSteps = parseInt(localStorage.getItem('currentSteps') || 0);
        const newSteps = currentSteps + stepIncrement;
        
        localStorage.setItem('currentSteps', newSteps);
        this.updateDisplay(newSteps);
        
        // Update weekly data and calories
        StorageManager.saveSteps(newSteps);
        this.updateCalories(stepIncrement);
        
        // Trigger chart updates
        if (window.FitnessCharts) {
            window.FitnessCharts.updateAllCharts();
        }
    },

    updateCalories(newSteps) {
        const caloriesPerStep = 0.04;
        const currentCalories = parseInt(localStorage.getItem('dailyCalories')) || 0;
        const newCalories = currentCalories + (newSteps * caloriesPerStep);
        
        localStorage.setItem('dailyCalories', Math.round(newCalories));
        this.updateStreakAndGoals(newSteps);
    },

    updateStreakAndGoals(newSteps) {
        const currentStreak = parseInt(localStorage.getItem('workoutStreak')) || 0;
        const bestStreak = parseInt(localStorage.getItem('bestStreak')) || 0;
        
        if (newSteps > 100) {  // Consider it an active day
            localStorage.setItem('workoutStreak', currentStreak + 1);
            if (currentStreak + 1 > bestStreak) {
                localStorage.setItem('bestStreak', currentStreak + 1);
            }
            this.updateStreakDisplay();
        }
    },

    updateStreakDisplay() {
        const streakCount = document.getElementById('streakCount');
        const bestStreak = document.getElementById('bestStreak');
        
        if (streakCount) {
            streakCount.textContent = localStorage.getItem('workoutStreak') || '0';
        }
        if (bestStreak) {
            bestStreak.textContent = localStorage.getItem('bestStreak') || '0';
        }
    },

    updateDisplay(steps) {
        const stepCount = document.getElementById('stepCount');
        const stepProgress = document.getElementById('stepProgress');
        const statusText = document.querySelector('.status-text');
        
        if (stepCount && stepProgress) {
            // Animate the step count
            this.animateNumber(stepCount, parseInt(stepCount.textContent), steps);
            
            // Update progress bar
            const percentage = (steps / this.dailyGoal) * 100;
            stepProgress.style.width = `${Math.min(percentage, 100)}%`;
            
            // Update status message
            if (statusText) {
                statusText.textContent = this.getMotivationalMessage(steps);
                statusText.className = 'status-text ' + this.getStatusClass(percentage);
            }
        }
    },

    animateNumber(element, start, end) {
        const duration = 1000;
        const range = end - start;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(start + (range * progress));
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    getMotivationalMessage(steps) {
        if (steps >= this.dailyGoal) return "Amazing! You've hit your daily goal! 🎉";
        if (steps >= this.dailyGoal * 0.75) return "Almost there! Keep pushing! 💪";
        if (steps >= this.dailyGoal * 0.5) return "Halfway there! You're doing great! 👍";
        if (steps >= this.dailyGoal * 0.25) return "Good start! Keep moving! 🚶";
        return "Every step counts! Let's get moving! 🎯";
    },

    getStatusClass(percentage) {
        if (percentage >= 100) return 'status-complete';
        if (percentage >= 75) return 'status-almost';
        if (percentage >= 50) return 'status-halfway';
        if (percentage >= 25) return 'status-starting';
        return 'status-begin';
    },

    stopCounting() {
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }
    },

    resetDaily() {
        localStorage.setItem('currentSteps', '0');
        this.updateDisplay(0);
    }
};

// Export for use in other files
window.StorageManager = StorageManager;
window.StepCounter = StepCounter;
