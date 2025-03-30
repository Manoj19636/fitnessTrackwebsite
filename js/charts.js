// Weekly Progress Chart
function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        textColor: isDark ? '#ffffff' : '#333333'
    };
}

function initWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return null;

    const colors = getChartColors();
    const data = getWeeklyData();
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Steps',
                    data: data.steps,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Calories',
                    data: data.calories,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: colors.textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${value.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Steps',
                        color: colors.textColor
                    },
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Calories',
                        color: colors.textColor
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: colors.textColor
                    }
                },
                x: {
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor
                    }
                }
            }
        }
    });
}

function initCalorieChart() {
    const ctx = document.getElementById('calorieChart').getContext('2d');
    const calorieData = {
        labels: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
        datasets: [{
            data: getDailyCaloriesData(),
            backgroundColor: [
                '#4CAF50',
                '#2196F3',
                '#FFC107',
                '#9C27B0'
            ]
        }]
    };

    return new Chart(ctx, {
        type: 'doughnut',
        data: calorieData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return null;

    const colors = getChartColors();
    const data = calculateWeeklyPerformance();
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Steps Goal', 'Calories Goal', 'Workouts Goal', 'Active Minutes'],
            datasets: [{
                label: 'Achievement %',
                data: [
                    data.stepsPercentage,
                    data.caloriesPercentage,
                    data.workoutsPercentage,
                    data.activeMinutesPercentage
                ],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(33, 150, 243, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(156, 39, 176, 0.7)'
                ],
                borderColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#9C27B0'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Achievement: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: colors.textColor
                    }
                }
            }
        }
    });
}

// Helper functions to get data from localStorage
function getWeeklyStepsData() {
    const stepsData = JSON.parse(localStorage.getItem('weeklySteps')) || Array(7).fill(0);
    return stepsData;
}

function getDailyCaloriesData() {
    const caloriesData = JSON.parse(localStorage.getItem('dailyCalories')) || [0, 0, 0, 0];
    return caloriesData;
}

function getWeeklyData() {
    const steps = getWeeklyStepsData();
    const calories = steps.map(step => Math.round(step * 0.04));
    
    return {
        steps,
        calories
    };
}

function calculateWeeklyPerformance() {
    const stepsData = getWeeklyStepsData();
    const dailyGoal = 10000; // Daily steps goal
    const weeklyCalorieGoal = 3500; // Weekly calorie burn goal
    const weeklyWorkoutGoal = 5; // Weekly workout sessions goal
    const activeMinutesGoal = 150; // Weekly active minutes goal

    const totalSteps = stepsData.reduce((a, b) => a + b, 0);
    const totalCalories = totalSteps * 0.04;
    const workouts = StorageManager.getWorkouts().length;
    const activeMinutes = Math.round(totalSteps / 100); // Approximate active minutes

    return {
        stepsPercentage: (totalSteps / (dailyGoal * 7)) * 100,
        caloriesPercentage: (totalCalories / weeklyCalorieGoal) * 100,
        workoutsPercentage: (workouts / weeklyWorkoutGoal) * 100,
        activeMinutesPercentage: (activeMinutes / activeMinutesGoal) * 100
    };
}

// Export charts for use in other files
window.FitnessCharts = {
    weeklyChart: null,
    calorieChart: null,
    performanceChart: null,
    
    initCharts() {
        // Wait for DOM to be fully loaded
        requestAnimationFrame(() => {
            this.weeklyChart = initWeeklyChart();
            this.calorieChart = initCalorieChart();
            this.performanceChart = initPerformanceChart();
            this.generateMockData();
            
            // Add resize handler
            window.addEventListener('resize', this.handleResize.bind(this));
            
            // Add theme change handler
            document.addEventListener('themeChanged', this.updateChartThemes.bind(this));
        });
    },

    handleResize() {
        if (this.weeklyChart) this.weeklyChart.resize();
        if (this.calorieChart) this.calorieChart.resize();
        if (this.performanceChart) this.performanceChart.resize();
    },

    updateChartThemes() {
        const colors = getChartColors();
        
        // Update all charts with new theme colors
        [this.weeklyChart, this.performanceChart].forEach(chart => {
            if (!chart) return;
            
            // Update grid colors
            chart.options.scales.y.grid.color = colors.gridColor;
            chart.options.scales.x.grid.color = colors.gridColor;
            
            // Update text colors
            chart.options.scales.y.ticks.color = colors.textColor;
            chart.options.scales.x.ticks.color = colors.textColor;
            
            // Update title colors if they exist
            if (chart.options.scales.y.title) {
                chart.options.scales.y.title.color = colors.textColor;
            }
            
            chart.update();
        });
    },

    generateMockData() {
        // Generate more realistic mock data
        const weeklySteps = Array(7).fill(0).map((_, index) => {
            // Generate steps between 4000 and 12000
            const baseSteps = 4000;
            const variableSteps = Math.floor(Math.random() * 8000);
            // Less steps on weekends (index 5,6)
            const multiplier = index >= 5 ? 0.7 : 1;
            return Math.floor((baseSteps + variableSteps) * multiplier);
        });
        
        const dailyCalories = [
            Math.floor(Math.random() * 300 + 400),  // Breakfast
            Math.floor(Math.random() * 400 + 500),  // Lunch
            Math.floor(Math.random() * 500 + 600),  // Dinner
            Math.floor(Math.random() * 200 + 200)   // Snacks
        ];
        
        localStorage.setItem('weeklySteps', JSON.stringify(weeklySteps));
        localStorage.setItem('dailyCalories', JSON.stringify(dailyCalories));
        
        this.updateAllCharts();
    },

    updateAllCharts() {
        if (this.weeklyChart) {
            const data = getWeeklyData();
            this.weeklyChart.data.datasets[0].data = data.steps;
            this.weeklyChart.data.datasets[1].data = data.calories;
            this.weeklyChart.update();
        }
        
        if (this.calorieChart) {
            this.calorieChart.data.datasets[0].data = getDailyCaloriesData();
            this.calorieChart.update();
        }
        
        if (this.performanceChart) {
            const performance = calculateWeeklyPerformance();
            this.performanceChart.data.datasets[0].data = [
                performance.stepsPercentage,
                performance.caloriesPercentage,
                performance.workoutsPercentage,
                performance.activeMinutesPercentage
            ];
            this.performanceChart.update();
        }
        
        // Update weekly total display
        const weeklyTotal = document.getElementById('weeklyTotal');
        if (weeklyTotal) {
            const totalSteps = getWeeklyStepsData().reduce((a, b) => a + b, 0);
            weeklyTotal.textContent = totalSteps.toLocaleString();
        }
    }
};
