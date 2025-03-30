const mockWorkouts = [
    {
        id: 1,
        title: 'HIIT Cardio Blast',
        description: 'High-intensity interval training for maximum calorie burn',
        category: 'cardio',
        image: './images/workouts/hiit-cardio.jpg',
        fallbackImage: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712',
        duration: '30 min',
        difficulty: 'Hard',
        calories: 400,
        exercises: [
            { name: 'Jumping Jacks', duration: '45 sec' },
            { name: 'Mountain Climbers', duration: '45 sec' },
            { name: 'Burpees', duration: '30 sec' },
            { name: 'High Knees', duration: '45 sec' }
        ],
        popularity: 4.8
    },
    {
        id: 2,
        title: 'Full Body Strength',
        description: 'Complete body workout with weights',
        category: 'strength',
        image: './images/workouts/strength-training.jpg',
        fallbackImage: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50',
        duration: '45 min',
        difficulty: 'Medium',
        calories: 350,
        exercises: [
            { name: 'Push-ups', duration: '12 reps' },
            { name: 'Squats', duration: '15 reps' },
            { name: 'Deadlifts', duration: '10 reps' },
            { name: 'Planks', duration: '60 sec' }
        ],
        popularity: 4.5
    },
    {
        id: 3,
        title: 'Yoga Flow',
        description: 'Relaxing yoga session for flexibility',
        category: 'flexibility',
        image: './images/workouts/yoga.jpg',
        fallbackImage: 'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6',
        duration: '40 min',
        difficulty: 'Easy',
        calories: 200,
        exercises: [
            { name: 'Sun Salutation', duration: '5 min' },
            { name: 'Warrior Pose', duration: '3 min' },
            { name: 'Downward Dog', duration: '2 min' },
            { name: 'Child Pose', duration: '2 min' }
        ],
        popularity: 4.3
    }
];

const WorkoutManager = {
    activeFilter: 'all',
    sortBy: 'popularity',

    initializeWorkouts() {
        this.renderWorkouts();
        this.setupFilters();
        this.setupSorting();
        this.setupSearch();
        this.setupWorkoutModal();
    },

    renderWorkouts(filteredWorkouts = null) {
        const workoutGrid = document.getElementById('workoutGrid');
        if (!workoutGrid) return;

        const workouts = filteredWorkouts || this.getFilteredAndSortedWorkouts();
        
        workoutGrid.innerHTML = workouts.map(workout => `
            <div class="workout-card" data-category="${workout.category}">
                <div class="workout-image">
                    <img src="${workout.image}" 
                         alt="${workout.title}" 
                         loading="lazy"
                         onerror="this.onerror=null; this.src='${workout.fallbackImage}?auto=format&fit=crop&w=800&q=80'">
                    <div class="workout-overlay">
                        <span class="workout-difficulty ${workout.difficulty.toLowerCase()}">
                            ${workout.difficulty}
                        </span>
                        <span class="workout-calories">
                            <i class="fas fa-fire"></i> ${workout.calories} cal
                        </span>
                    </div>
                </div>
                <div class="workout-details">
                    <h3>${workout.title}</h3>
                    <p>${workout.description}</p>
                    <div class="workout-meta">
                        <span><i class="far fa-clock"></i> ${workout.duration}</span>
                        <span><i class="fas fa-star"></i> ${workout.popularity.toFixed(1)}</span>
                    </div>
                    <button class="btn btn-primary btn-small start-workout" data-workout-id="${workout.id}">
                        Start Workout
                    </button>
                </div>
            </div>
        `).join('');

        this.addWorkoutCardListeners();
    },

    setupFilters() {
        const filterContainer = document.querySelector('.workout-filters');
        if (!filterContainer) return;

        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const filter = e.target.dataset.filter;
                
                // Update active filter
                document.querySelectorAll('.filter-btn').forEach(btn => 
                    btn.classList.remove('active'));
                e.target.classList.add('active');
                
                this.activeFilter = filter;
                this.renderWorkouts();
            }
        });
    },

    setupSorting() {
        const sortingHtml = `
            <div class="workout-sorting">
                <select id="workoutSort">
                    <option value="popularity">Most Popular</option>
                    <option value="duration">Duration</option>
                    <option value="calories">Calories Burned</option>
                    <option value="difficulty">Difficulty</option>
                </select>
            </div>
        `;

        document.querySelector('.workout-filters').insertAdjacentHTML('beforeend', sortingHtml);
        
        document.getElementById('workoutSort').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderWorkouts();
        });
    },

    setupSearch() {
        const searchHtml = `
            <div class="workout-search">
                <input type="text" id="workoutSearch" placeholder="Search workouts...">
            </div>
        `;

        document.querySelector('.workout-filters').insertAdjacentHTML('afterbegin', searchHtml);
        
        const searchInput = document.getElementById('workoutSearch');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredWorkouts = this.getFilteredAndSortedWorkouts().filter(workout => 
                workout.title.toLowerCase().includes(searchTerm) ||
                workout.description.toLowerCase().includes(searchTerm)
            );
            this.renderWorkouts(filteredWorkouts);
        });
    },

    getFilteredAndSortedWorkouts() {
        let workouts = [...mockWorkouts];
        
        // Apply filter
        if (this.activeFilter !== 'all') {
            workouts = workouts.filter(w => w.category === this.activeFilter);
        }
        
        // Apply sorting
        switch (this.sortBy) {
            case 'duration':
                workouts.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
                break;
            case 'calories':
                workouts.sort((a, b) => b.calories - a.calories);
                break;
            case 'difficulty':
                const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                workouts.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
                break;
            default:
                workouts.sort((a, b) => b.popularity - a.popularity);
        }
        
        return workouts;
    },

    setupWorkoutModal() {
        const modalHtml = `
            <div id="workoutModal" class="modal">
                <div class="modal-content workout-modal">
                    <span class="close-btn">&times;</span>
                    <div id="workoutDetails"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    addWorkoutCardListeners() {
        document.querySelectorAll('.start-workout').forEach(button => {
            button.addEventListener('click', (e) => {
                const workoutId = parseInt(e.target.dataset.workoutId);
                const workout = mockWorkouts.find(w => w.id === workoutId);
                this.showWorkoutDetails(workout);
            });
        });
    },

    showWorkoutDetails(workout) {
        const modal = document.getElementById('workoutModal');
        const detailsContainer = document.getElementById('workoutDetails');
        
        detailsContainer.innerHTML = `
            <h2>${workout.title}</h2>
            <div class="workout-info">
                <p class="workout-description">${workout.description}</p>
                <div class="workout-stats">
                    <span><i class="far fa-clock"></i> ${workout.duration}</span>
                    <span><i class="fas fa-fire"></i> ${workout.calories} cal</span>
                    <span><i class="fas fa-dumbbell"></i> ${workout.difficulty}</span>
                </div>
                <div class="workout-timer hidden">
                    <h3>Workout Timer</h3>
                    <div class="timer-display">00:00</div>
                    <div class="timer-controls">
                        <button class="btn btn-small pause-timer"><i class="fas fa-pause"></i></button>
                        <button class="btn btn-small stop-timer"><i class="fas fa-stop"></i></button>
                    </div>
                </div>
                <div class="workout-exercises">
                    <h3>Exercises</h3>
                    <ul class="exercise-list">
                        ${workout.exercises.map(exercise => `
                            <li data-duration="${exercise.duration}">
                                <span class="exercise-name">${exercise.name}</span>
                                <span class="exercise-duration">${exercise.duration}</span>
                                <span class="exercise-status"><i class="far fa-circle"></i></span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <button class="btn btn-primary start-tracking">Start Workout</button>
            </div>
        `;

        this.setupWorkoutTracking(workout);
        modal.style.display = 'block';
        
        // Close button handlers
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.onclick = () => this.confirmWorkoutClose(modal);
        window.onclick = (e) => {
            if (e.target === modal) this.confirmWorkoutClose(modal);
        };
    },

    setupWorkoutTracking(workout) {
        const startBtn = document.querySelector('.start-tracking');
        const timerDisplay = document.querySelector('.workout-timer');
        const exerciseList = document.querySelector('.exercise-list');
        let workoutTimer;
        let currentExerciseIndex = 0;
        let isWorkoutActive = false;
        
        startBtn.addEventListener('click', () => {
            if (!isWorkoutActive) {
                isWorkoutActive = true;
                timerDisplay.classList.remove('hidden');
                startBtn.innerHTML = 'Complete Workout';
                this.startWorkoutTimer();
                this.highlightCurrentExercise(currentExerciseIndex);
            } else {
                this.completeWorkout(workout);
            }
        });

        document.querySelector('.pause-timer').addEventListener('click', () => {
            this.toggleTimer();
        });

        document.querySelector('.stop-timer').addEventListener('click', () => {
            this.stopWorkout();
        });

        exerciseList.addEventListener('click', (e) => {
            const listItem = e.target.closest('li');
            if (listItem && isWorkoutActive) {
                const index = Array.from(exerciseList.children).indexOf(listItem);
                this.completeExercise(index);
                if (index === currentExerciseIndex) {
                    currentExerciseIndex++;
                    this.highlightCurrentExercise(currentExerciseIndex);
                }
            }
        });
    },

    startWorkoutTimer() {
        let seconds = 0;
        const timerDisplay = document.querySelector('.timer-display');
        
        this.workoutTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    },

    toggleTimer() {
        const pauseBtn = document.querySelector('.pause-timer i');
        if (this.workoutTimer) {
            clearInterval(this.workoutTimer);
            this.workoutTimer = null;
            pauseBtn.className = 'fas fa-play';
        } else {
            this.startWorkoutTimer();
            pauseBtn.className = 'fas fa-pause';
        }
    },

    stopWorkout() {
        if (confirm('Are you sure you want to stop this workout?')) {
            this.resetWorkout();
        }
    },

    resetWorkout() {
        clearInterval(this.workoutTimer);
        document.querySelector('.timer-display').textContent = '00:00';
        document.querySelector('.workout-timer').classList.add('hidden');
        document.querySelector('.start-tracking').innerHTML = 'Start Workout';
        
        // Reset exercise statuses
        document.querySelectorAll('.exercise-status i').forEach(icon => {
            icon.className = 'far fa-circle';
        });
    },

    completeExercise(index) {
        const exercises = document.querySelectorAll('.exercise-list li');
        const icon = exercises[index].querySelector('.exercise-status i');
        icon.className = 'fas fa-check-circle';
        icon.style.color = 'var(--success-color)';
    },

    highlightCurrentExercise(index) {
        const exercises = document.querySelectorAll('.exercise-list li');
        exercises.forEach(ex => ex.classList.remove('current'));
        if (exercises[index]) {
            exercises[index].classList.add('current');
        }
    },

    completeWorkout(workout) {
        clearInterval(this.workoutTimer);
        const timeSpent = document.querySelector('.timer-display').textContent;
        const completedExercises = document.querySelectorAll('.exercise-status i.fa-check-circle').length;
        
        // Save workout data
        const workoutData = {
            id: workout.id,
            title: workout.title,
            duration: timeSpent,
            calories: workout.calories,
            completedExercises,
            date: new Date().toISOString()
        };
        
        StorageManager.saveWorkout(workoutData);
        this.showWorkoutSummary(workoutData);
    },

    showWorkoutSummary(workout) {
        const detailsContainer = document.getElementById('workoutDetails');
        detailsContainer.innerHTML = `
            <div class="workout-summary">
                <h2>Workout Complete! 🎉</h2>
                <div class="summary-stats">
                    <div class="stat">
                        <i class="far fa-clock"></i>
                        <span>${workout.duration}</span>
                        <label>Duration</label>
                    </div>
                    <div class="stat">
                        <i class="fas fa-fire"></i>
                        <span>${workout.calories}</span>
                        <label>Calories</label>
                    </div>
                    <div class="stat">
                        <i class="fas fa-check"></i>
                        <span>${workout.completedExercises}</span>
                        <label>Exercises</label>
                    </div>
                </div>
                <button class="btn btn-primary close-summary">Done</button>
            </div>
        `;
        
        document.querySelector('.close-summary').addEventListener('click', () => {
            document.getElementById('workoutModal').style.display = 'none';
        });
    },

    confirmWorkoutClose(modal) {
        if (this.workoutTimer) {
            if (confirm('Workout in progress. Are you sure you want to exit?')) {
                this.resetWorkout();
                modal.style.display = 'none';
            }
        } else {
            modal.style.display = 'none';
        }
    }
};

// Initialize on load
window.WorkoutManager = WorkoutManager;
