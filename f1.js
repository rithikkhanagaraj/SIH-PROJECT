// Initialize the chart data for each day
const dailyData = {
    'Monday': { steps: 3515, distance: 2.3 },
    'Tuesday': { steps: 4400, distance: 2.8 },
    'Wednesday': { steps: 5230, distance: 3.1 },
    'Thursday': { steps: 4800, distance: 2.9 },
    'Friday': { steps: 5400, distance: 3.4 },
    'Saturday': { steps: 6000, distance: 3.7 },
    'Sunday': { steps: 7000, distance: 4.0 }
};

let selectedDay = 'Monday';

// Show popup function
function showGoalPopup() {
    document.getElementById('goalPopup').style.display = 'block';
}

// Handle form submission and show goal progress
document.getElementById('goalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get user inputs
    const steps = parseInt(document.getElementById('steps').value);
    const distance = parseFloat(document.getElementById('distance').value);

    // Show progress bar based on steps
    showProgressBar(steps, distance);
    
    // Close the popup
    document.getElementById('goalPopup').style.display = 'none';
});

// Show modern progress bar based on steps value
function showProgressBar(steps, distance) {
    const progressBar = document.getElementById('goalProgressBar');
    const progress = document.getElementById('goalProgress');

    // Progress logic (show percentage based on steps)
    const progressValue = Math.min((steps / 10000) * 100, 100);  // Assuming 10,000 steps as a goal
    
    progress.style.width = `${progressValue}%`;
    progressBar.style.display = 'block';
}

// Show the Day Popup
function showDayPopup() {
    document.getElementById('dayPopup').style.display = 'block';
}

// Handle day selection and show the daily goal popup
function selectDay(day) {
    selectedDay = day;
    document.getElementById('selectedDay').innerText = day;
    document.getElementById('dayPopup').style.display = 'none';
    document.getElementById('dailyGoalPopup').style.display = 'block';
}

// Handle daily stats form submission
document.getElementById('dailyStatsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const steps = parseInt(document.getElementById('dailySteps').value);
    const distance = parseFloat(document.getElementById('dailyDistance').value);
    const bpm = parseInt(document.getElementById('bpm').value);
    const waterIntake = parseFloat(document.getElementById('waterIntake').value);

    // Update the selected day's data
    dailyData[selectedDay] = { steps, distance };

    // Update the charts with the new data
    updateCharts();

    // Hide the daily goal popup
    document.getElementById('dailyGoalPopup').style.display = 'none';
});

// Function to update the charts with the new data
function updateCharts() {
    // Update the line chart data
    const stepsData = Object.values(dailyData).map(day => day.steps);
    const distanceData = Object.values(dailyData).map(day => day.distance);

    weightChart.data.datasets[0].data = stepsData;
    weightChart.update();

    activityChart.data.datasets[0].data = distanceData;
    activityChart.update();
}

// Chart for Walking Stats (Line Chart)
const weightCtx = document.getElementById('weightChart').getContext('2d');
const weightChart = new Chart(weightCtx, {
    type: 'line',
    data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Steps Walked',
            data: [3515, 4400, 5230, 4800, 5400, 6000, 7000],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Chart for Daily Activity (Bar Chart)
const activityCtx = document.getElementById('activityChart').getContext('2d');
const activityChart = new Chart(activityCtx, {
    type: 'bar',
    data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Distance (km)',
            data: [2.3, 2.8, 3.1, 2.9, 3.4, 3.7, 4.0],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Function to take screenshot and download it
function downloadStatus() {
    html2canvas(document.body).then(function (canvas) {
        var link = document.createElement('a');
        link.download = 'fitness_status.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}
