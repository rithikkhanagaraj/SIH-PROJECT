// Initialize Charts
const caloriesChart = new Chart(document.getElementById('caloriesChart'), {
    type: 'doughnut',
    data: {
        labels: ['Calories Burned'],
        datasets: [{
            data: [0], // Initial value
            backgroundColor: ['#FF6384'],
            hoverBackgroundColor: ['#FF6384']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

const stepsDistanceChart = new Chart(document.getElementById('stepsDistanceChart'), {
    type: 'pie',
    data: {
        labels: ['Steps Walked', 'Distance Covered (km)'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#36A2EB', '#FFCE56'],
            hoverBackgroundColor: ['#36A2EB', '#FFCE56']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

const worktimeChart = new Chart(document.getElementById('worktimeChart'), {
    type: 'polarArea',
    data: {
        labels: ['Work Time (hrs)'],
        datasets: [{
            data: [0],
            backgroundColor: ['#FF9F40'],
            hoverBackgroundColor: ['#FF9F40']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Function to handle updating charts based on input values
document.getElementById('updateButton').addEventListener('click', function() {
    const calories = parseFloat(document.getElementById('caloriesInput').value) || 0;
    const steps = parseFloat(document.getElementById('stepsInput').value) || 0;
    const distance = parseFloat(document.getElementById('distanceInput').value) || 0;
    const worktime = parseFloat(document.getElementById('worktimeInput').value) || 0;

    // Update chart data with new input values
    caloriesChart.data.datasets[0].data = [calories];
    caloriesChart.update();

    stepsDistanceChart.data.datasets[0].data = [steps, distance];
    stepsDistanceChart.update();

    worktimeChart.data.datasets[0].data = [worktime];
    worktimeChart.update();
});

// Handle recommendation popup
document.getElementById('viewRecommendationsButton').addEventListener('click', function() {
    document.getElementById('recommendationPopup').style.display = 'block';
});

// Close recommendation popup and open age category popup
document.getElementById('selectAgeCategoryButton').addEventListener('click', function() {
    document.getElementById('recommendationPopup').style.display = 'none';
    document.getElementById('ageCategoryPopup').style.display = 'block';
});

// Handle age button click and display target form
const ageButtons = document.querySelectorAll('.age-button');
ageButtons.forEach(button => {
    button.addEventListener('click', function() {
        const selectedAge = this.dataset.age;
        document.getElementById('ageCategoryPopup').style.display = 'none';
        document.getElementById('targetForm').style.display = 'block';
    });
});

// Close age category popup
document.getElementById('closeAgeCategoryPopup').addEventListener('click', function() {
    document.getElementById('ageCategoryPopup').style.display = 'none';
});

// Save target function
document.getElementById('saveTargetButton').addEventListener('click', function() {
    const runningDistance = document.getElementById('runningDistance').value;
    const pushUps = document.getElementById('pushUps').value;
    const pullUps = document.getElementById('pullUps').value;
    const cyclingDistance = document.getElementById('cyclingDistance').value;
    const waterDrinking = document.getElementById('waterDrinking').value;

    alert(`Target Saved:\nRunning Distance: ${runningDistance} km\nPush-Ups: ${pushUps}\nPull-Ups: ${pullUps}\nCycling Distance: ${cyclingDistance} km\nWater Drinking: ${waterDrinking} L`);
});

// Go back function
function goBack() {
    window.history.back();
}
