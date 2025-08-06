# Frontend Components Documentation

## Table of Contents
1. [UI Components](#ui-components)
2. [Form Handlers](#form-handlers)
3. [Chart Components](#chart-components)
4. [Media Management](#media-management)
5. [Navigation System](#navigation-system)
6. [Theme Management](#theme-management)
7. [Event Handlers](#event-handlers)

---

## UI Components

### Modal Management

#### `openRegisterModal()`
**Location**: `reg.js`, `v.js`
**Purpose**: Opens the registration modal dialog
**Parameters**: None
**Returns**: void

```javascript
function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
}
```

**Usage**:
```html
<button onclick="openRegisterModal()">Register</button>
<div id="registerModal" class="modal">
    <!-- Modal content -->
</div>
```

#### `closeRegisterModal()`
**Location**: `reg.js`, `v.js`
**Purpose**: Closes the registration modal dialog
**Parameters**: None
**Returns**: void

```javascript
function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}
```

#### `showGoalPopup()`
**Location**: `f1.js`
**Purpose**: Displays the fitness goal setting popup
**Parameters**: None
**Returns**: void

```javascript
function showGoalPopup() {
    document.getElementById('goalPopup').style.display = 'block';
}
```

#### `showDayPopup()`
**Location**: `f1.js`
**Purpose**: Shows the day selection popup for fitness tracking
**Parameters**: None
**Returns**: void

```javascript
function showDayPopup() {
    document.getElementById('dayPopup').style.display = 'block';
}
```

### Progress Indicators

#### `showProgressBar(steps, distance)`
**Location**: `f1.js`
**Purpose**: Displays progress bar based on fitness goals
**Parameters**:
- `steps` (Number): Number of steps taken
- `distance` (Number): Distance covered in kilometers
**Returns**: void

```javascript
function showProgressBar(steps, distance) {
    const progressBar = document.getElementById('goalProgressBar');
    const progress = document.getElementById('goalProgress');
    
    // Calculate progress percentage (10,000 steps = 100%)
    const progressValue = Math.min((steps / 10000) * 100, 100);
    
    progress.style.width = `${progressValue}%`;
    progressBar.style.display = 'block';
}
```

**Usage Example**:
```javascript
// Show progress for 7500 steps and 5.2 km distance
showProgressBar(7500, 5.2);
```

---

## Form Handlers

### Registration Form Handler

#### Registration Form Event Listener
**Location**: `reg.js`, `v.js`
**Purpose**: Handles form submission with validation
**Triggered**: On form submit event

```javascript
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const teamMembers = document.getElementById('team').value.trim();
    const generatedId = document.getElementById('generatedId').value;

    let errorMessage = '';

    // Validation logic
    if (!name) errorMessage += 'Name is required.\n';
    if (!email) errorMessage += 'Email is required.\n';
    if (!contact) errorMessage += 'Contact number is required.\n';
    if (!teamMembers) errorMessage += 'Please enter team members.\n';
    if (!generatedId) errorMessage += 'Please generate an ID.\n';

    if (errorMessage) {
        alert(errorMessage);
        return;
    }

    alert('Registration Submitted Successfully!');
    closeRegisterModal();
});
```

### Event Registration Form Handler

#### Event Registration Handler
**Location**: `e.js`
**Purpose**: Handles event registration form submission
**Triggered**: On form submit event

```javascript
document.getElementById('registration-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const eventSelected = document.getElementById('event').value;

    const successMessage = document.getElementById('success-message');
    successMessage.textContent = `Thank you, ${name}, for registering for the ${eventSelected} event!`;
    successMessage.style.display = 'block';

    this.reset();
});
```

### Fitness Goal Form Handler

#### Daily Stats Form Handler
**Location**: `f1.js`
**Purpose**: Handles daily fitness statistics submission
**Triggered**: On form submit event

```javascript
document.getElementById('dailyStatsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const steps = parseInt(document.getElementById('dailySteps').value);
    const distance = parseFloat(document.getElementById('dailyDistance').value);
    const bpm = parseInt(document.getElementById('bpm').value);
    const waterIntake = parseFloat(document.getElementById('waterIntake').value);

    // Update selected day's data
    dailyData[selectedDay] = { steps, distance };
    
    // Update charts
    updateCharts();
    
    // Hide popup
    document.getElementById('dailyGoalPopup').style.display = 'none';
});
```

---

## Chart Components

### Chart Initialization

#### Calories Chart
**Location**: `script.js`
**Type**: Doughnut Chart
**Purpose**: Displays calories burned data

```javascript
const caloriesChart = new Chart(document.getElementById('caloriesChart'), {
    type: 'doughnut',
    data: {
        labels: ['Calories Burned'],
        datasets: [{
            data: [0],
            backgroundColor: ['#FF6384'],
            hoverBackgroundColor: ['#FF6384']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});
```

#### Steps and Distance Chart
**Location**: `script.js`
**Type**: Pie Chart
**Purpose**: Displays steps and distance data

```javascript
const stepsDistanceChart = new Chart(document.getElementById('stepsDistanceChart'), {
    type: 'pie',
    data: {
        labels: ['Steps Walked', 'Distance Covered (km)'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#36A2EB', '#FFCE56'],
            hoverBackgroundColor: ['#36A2EB', '#FFCE56']
        }]
    }
});
```

#### Work Time Chart
**Location**: `script.js`
**Type**: Polar Area Chart
**Purpose**: Displays work time data

```javascript
const worktimeChart = new Chart(document.getElementById('worktimeChart'), {
    type: 'polarArea',
    data: {
        labels: ['Work Time (hrs)'],
        datasets: [{
            data: [0],
            backgroundColor: ['#FF9F40'],
            hoverBackgroundColor: ['#FF9F40']
        }]
    }
});
```

#### Walking Stats Chart
**Location**: `f1.js`
**Type**: Line Chart
**Purpose**: Displays weekly walking statistics

```javascript
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
            y: { beginAtZero: true }
        }
    }
});
```

#### Activity Chart
**Location**: `f1.js`
**Type**: Bar Chart
**Purpose**: Displays daily activity distance

```javascript
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
    }
});
```

### Chart Update Functions

#### `updateCharts()`
**Location**: `f1.js`
**Purpose**: Updates all fitness charts with new data
**Parameters**: None (uses global `dailyData`)
**Returns**: void

```javascript
function updateCharts() {
    const stepsData = Object.values(dailyData).map(day => day.steps);
    const distanceData = Object.values(dailyData).map(day => day.distance);

    weightChart.data.datasets[0].data = stepsData;
    weightChart.update();

    activityChart.data.datasets[0].data = distanceData;
    activityChart.update();
}
```

#### Chart Update Button Handler
**Location**: `script.js`
**Purpose**: Updates charts based on user input
**Triggered**: On button click

```javascript
document.getElementById('updateButton').addEventListener('click', function() {
    const calories = parseFloat(document.getElementById('caloriesInput').value) || 0;
    const steps = parseFloat(document.getElementById('stepsInput').value) || 0;
    const distance = parseFloat(document.getElementById('distanceInput').value) || 0;
    const worktime = parseFloat(document.getElementById('worktimeInput').value) || 0;

    caloriesChart.data.datasets[0].data = [calories];
    caloriesChart.update();

    stepsDistanceChart.data.datasets[0].data = [steps, distance];
    stepsDistanceChart.update();

    worktimeChart.data.datasets[0].data = [worktime];
    worktimeChart.update();
});
```

---

## Media Management

### Image Management Functions

#### `changeImage(imageId)`
**Location**: `v.js`
**Purpose**: Changes an image in the profile or content area
**Parameters**:
- `imageId` (String): ID of the image element to change
**Returns**: void

```javascript
function changeImage(imageId) {
    const input = document.getElementById(imageId + 'Input');
    const image = document.getElementById(imageId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            image.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}
```

**Usage**:
```html
<img id="profileImage" src="default.jpg" alt="Profile">
<input type="file" id="profileImageInput" onchange="changeImage('profileImage')">
```

### Journey Media Management

#### `addContent(containerId)`
**Location**: `j.js`
**Purpose**: Opens modal to add content to a journey container
**Parameters**:
- `containerId` (String): ID of the container to add content to
**Returns**: void

```javascript
function addContent(containerId) {
    currentContainerId = containerId;
    document.getElementById('modal').style.display = 'flex';
}
```

#### `submitMedia()`
**Location**: `j.js`
**Purpose**: Submits media content to the journey
**Parameters**: None (uses form data)
**Returns**: void

```javascript
function submitMedia() {
    const mediaInput = document.getElementById('media-input');
    const description = document.getElementById('description').value;

    if (mediaInput.files.length > 0) {
        const file = mediaInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function (e) {
            const mediaContainer = document.querySelector(`#${currentContainerId} .media`);
            let mediaElement;
            
            if (file.type.startsWith('image/')) {
                mediaElement = `<div><img src="${e.target.result}" alt="media"><p>${description}</p></div>`;
            } else if (file.type.startsWith('video/')) {
                mediaElement = `<div><video src="${e.target.result}" controls></video><p>${description}</p></div>`;
            }
            
            mediaContainer.innerHTML += mediaElement;
        };
        
        reader.readAsDataURL(file);
    }
    
    closeModal();
}
```

#### `closeModal()`
**Location**: `j.js`
**Purpose**: Closes the media upload modal and resets form
**Parameters**: None
**Returns**: void

```javascript
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('media-input').value = '';
    document.getElementById('description').value = '';
}
```

---

## Navigation System

### Menu Item Management

#### `changeActiveItem()`
**Location**: `index.js`
**Purpose**: Removes active class from all menu items
**Parameters**: None
**Returns**: void

```javascript
const changeActiveItem = () => {
    menuItems.forEach(item => {
        item.classList.remove('active');
    })
}
```

#### Menu Item Event Listeners
**Location**: `index.js`
**Purpose**: Handles menu item clicks and navigation
**Triggered**: On menu item click

```javascript
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        changeActiveItem();
        item.classList.add('active');
        
        if(item.id != 'notifications') {
            document.querySelector('.notifications-popup').style.display = 'none';
        } else {
            document.querySelector('.notifications-popup').style.display = 'block';
            document.querySelector('#notifications .notification-count').style.display = 'none';
        }
    })
})
```

### Message Search Functionality

#### `searchMessage()`
**Location**: `index.js`
**Purpose**: Searches through messages based on input
**Parameters**: None (uses input value)
**Returns**: void

```javascript
const searchMessage = () => {
    const val = messageSearch.value.toLowerCase();
    message.forEach(chat => {
        let name = chat.querySelector('h5').textContent.toLowerCase();
        if(name.indexOf(val) != -1) {
            chat.style.display = 'flex';
        } else {
            chat.style.display = 'none';
        }
    })
}
```

---

## Theme Management

### Theme Functions

#### Theme Modal Toggle
**Location**: `index.js`
**Purpose**: Opens/closes theme customization modal
**Triggered**: On theme button click

```javascript
theme.addEventListener('click', () => {
    themeModal.style.display = 'grid';
})
```

#### Font Size Selection
**Location**: `index.js`
**Purpose**: Changes application font size
**Triggered**: On font size option click

```javascript
fontSize.forEach(size => {
    size.addEventListener('click', () => {
        // Remove active class from all sizes
        fontSize.forEach(s => s.classList.remove('active'));
        size.classList.add('active');
        
        // Apply font size
        if(size.classList.contains('font-size-1')) {
            root.style.setProperty('----sticky-top-left', '5.4rem');
            root.style.setProperty('----sticky-top-right', '5.4rem');
        }
        // ... additional size options
    });
})
```

#### Color Palette Selection
**Location**: `index.js`
**Purpose**: Changes application color scheme
**Triggered**: On color option click

```javascript
colorPalette.forEach(color => {
    color.addEventListener('click', () => {
        // Remove active class from all colors
        colorPalette.forEach(c => c.classList.remove('active'));
        color.classList.add('active');
        
        // Apply color scheme
        if(color.classList.contains('color-1')) {
            primaryHue = 252;
        }
        // ... additional color options
        
        root.style.setProperty('--color-primary', hsl(primaryHue, 75, 60));
    });
})
```

#### Background Selection
**Location**: `index.js`
**Purpose**: Changes application background
**Triggered**: On background option click

```javascript
Bg1.addEventListener('click', () => {
    // Light background
    lightColorLightness = 95;
    whiteColorLightness = 20;
    darkColorLightness = 15;
    
    // Apply changes
    root.style.setProperty('--color-white', hsl(252, 30, whiteColorLightness));
    root.style.setProperty('--color-light', hsl(252, 30, lightColorLightness));
    root.style.setProperty('--color-gray', hsl(252, 15, 65));
    root.style.setProperty('--color-dark', hsl(252, 30, darkColorLightness));
});
```

---

## Event Handlers

### Utility Functions

#### `goBack()`
**Location**: Multiple files (`reg.js`, `v.js`, `j.js`)
**Purpose**: Navigates back to previous page
**Parameters**: None
**Returns**: void

```javascript
function goBack() {
    window.history.back();
}
```

#### `generateId()`
**Location**: `reg.js`, `v.js`
**Purpose**: Generates random ID and password for registration
**Parameters**: None
**Returns**: void

```javascript
function generateId() {
    const generatedId = 'ID-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const generatedPassword = Math.random().toString(36).substr(2, 10);
    
    document.getElementById('generatedId').value = generatedId;
    document.getElementById('generatedPassword').value = generatedPassword;
}
```

### Text Editing Functions

#### `editText(textId)`
**Location**: `v.js`
**Purpose**: Allows inline text editing with prompt
**Parameters**:
- `textId` (String): ID of the text element to edit
**Returns**: void

```javascript
function editText(textId) {
    const textElement = document.getElementById(textId);
    const newText = prompt("Edit the text:", textElement.innerText);
    if (newText !== null) {
        textElement.innerText = newText;
    }
}
```

### Fitness-Specific Functions

#### `selectDay(day)`
**Location**: `f1.js`
**Purpose**: Selects a specific day for fitness tracking
**Parameters**:
- `day` (String): Day of the week
**Returns**: void

```javascript
function selectDay(day) {
    selectedDay = day;
    document.getElementById('selectedDay').innerText = day;
    document.getElementById('dayPopup').style.display = 'none';
    document.getElementById('dailyGoalPopup').style.display = 'block';
}
```

#### `downloadStatus()`
**Location**: `f1.js`
**Purpose**: Downloads fitness status as PNG image using html2canvas
**Parameters**: None
**Returns**: void

```javascript
function downloadStatus() {
    html2canvas(document.body).then(function (canvas) {
        var link = document.createElement('a');
        link.download = 'fitness_status.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}
```

### Window Event Handlers

#### Modal Close Handler
**Location**: `reg.js`, `v.js`
**Purpose**: Closes modal when clicking outside
**Triggered**: On window click

```javascript
window.onclick = function(event) {
    var modal = document.getElementById('registerModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
```

#### Preloader Handler
**Location**: `reg.js`, `v.js`
**Purpose**: Hides preloader when page loads
**Triggered**: On window load

```javascript
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'none';
});
```

---

## Component Integration Examples

### Complete Registration Flow
```javascript
// 1. Open registration modal
function startRegistration() {
    openRegisterModal();
    generateId(); // Auto-generate ID
}

// 2. Handle form submission
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        generatedId: document.getElementById('generatedId').value,
        password: document.getElementById('generatedPassword').value,
        // ... other fields
    };
    
    // Validate and submit
    if (validateForm(formData)) {
        await submitRegistration(formData);
        closeRegisterModal();
    }
});
```

### Complete Fitness Tracking Flow
```javascript
// 1. Show goal popup
showGoalPopup();

// 2. Handle goal submission
document.getElementById('goalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const steps = parseInt(document.getElementById('steps').value);
    const distance = parseFloat(document.getElementById('distance').value);
    
    showProgressBar(steps, distance);
    document.getElementById('goalPopup').style.display = 'none';
});

// 3. Update charts with new data
function updateFitnessData(day, data) {
    dailyData[day] = data;
    updateCharts();
}
```

This comprehensive documentation covers all frontend components, their functions, parameters, and usage examples. Each component is designed to be modular and reusable across different parts of the Sports Connect application.