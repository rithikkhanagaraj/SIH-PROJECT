# Sports Connect - Usage Examples & Integration Guide

## Table of Contents
1. [Quick Start Guide](#quick-start-guide)
2. [API Integration Examples](#api-integration-examples)
3. [Frontend Component Usage](#frontend-component-usage)
4. [Complete Workflow Examples](#complete-workflow-examples)
5. [Advanced Integration Patterns](#advanced-integration-patterns)
6. [Testing Examples](#testing-examples)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start Guide

### Setting Up the Development Environment

#### 1. Prerequisites Installation
```bash
# Install Node.js (v14+)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb

# Verify installations
node --version
npm --version
mongod --version
```

#### 2. Project Setup
```bash
# Clone the repository
git clone <repository-url>
cd sports-connect

# Install dependencies
npm install

# Create uploads directory
mkdir -p uploads

# Start MongoDB
sudo systemctl start mongodb
# or
mongod --dbpath /data/db
```

#### 3. Start All Services
```bash
# Terminal 1 - Posts API
node server.js

# Terminal 2 - Association API  
node serverNew.js

# Terminal 3 - Journey API
node serverjourney.js

# Terminal 4 - Serve static files (optional)
python3 -m http.server 8080
```

### Basic HTML Setup
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sports Connect</title>
    <link rel="stylesheet" href="styleHome.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <!-- Your content here -->
    <script src="index.js"></script>
</body>
</html>
```

---

## API Integration Examples

### 1. Posts API Integration

#### Creating a Post with File Upload
```javascript
class PostManager {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api/posts';
    }

    // Create a new post
    async createPost(description, files) {
        const formData = new FormData();
        formData.append('description', description);
        
        // Add multiple files
        for (let file of files) {
            formData.append('files', file);
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Post created successfully:', result);
            return result;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    // Get all posts
    async getPosts() {
        try {
            const response = await fetch(this.apiUrl);
            const posts = await response.json();
            return posts;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    // Display posts in UI
    displayPosts(posts) {
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-content">
                    <p>${post.description}</p>
                    <div class="post-media">
                        ${post.files.map(file => 
                            file.type.startsWith('image/') 
                                ? `<img src="${file.url}" alt="Post image" class="post-image">`
                                : `<video src="${file.url}" controls class="post-video"></video>`
                        ).join('')}
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    }
}

// Usage Example
const postManager = new PostManager();

// Handle form submission
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const description = document.getElementById('postDescription').value;
    const files = document.getElementById('postFiles').files;
    
    if (files.length === 0) {
        alert('Please select at least one file');
        return;
    }

    try {
        const result = await postManager.createPost(description, files);
        alert('Post created successfully!');
        
        // Refresh posts display
        const posts = await postManager.getPosts();
        postManager.displayPosts(posts);
        
        // Reset form
        e.target.reset();
    } catch (error) {
        alert('Error creating post: ' + error.message);
    }
});
```

#### Complete Post Creation Component
```html
<div class="create-post-container">
    <form id="postForm" class="post-form">
        <div class="form-group">
            <label for="postDescription">What's happening?</label>
            <textarea 
                id="postDescription" 
                rows="3" 
                placeholder="Share your sports moment..."
                required
            ></textarea>
        </div>
        
        <div class="form-group">
            <label for="postFiles" class="file-upload-btn">
                📷 Add Photos/Videos
            </label>
            <input 
                type="file" 
                id="postFiles" 
                multiple 
                accept="image/*,video/*"
                style="display: none;"
            >
        </div>
        
        <div id="filePreview" class="file-preview"></div>
        
        <button type="submit" class="btn-primary">Share Post</button>
    </form>
</div>

<div id="postsContainer" class="posts-container">
    <!-- Posts will be dynamically loaded here -->
</div>
```

### 2. Association Management Integration

#### Complete Registration System
```javascript
class AssociationManager {
    constructor() {
        this.apiUrl = 'http://localhost:3000';
    }

    // Generate unique ID and password
    generateCredentials() {
        const id = 'ASSOC_' + Math.random().toString(36).substr(2, 8).toUpperCase();
        const password = Math.random().toString(36).substr(2, 12);
        return { id, password };
    }

    // Register new association
    async registerAssociation(associationData) {
        try {
            const response = await fetch(`${this.apiUrl}/saveAssociation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(associationData)
            });

            if (response.ok) {
                return { success: true, message: 'Association registered successfully!' };
            } else {
                const errorText = await response.text();
                throw new Error(errorText);
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message };
        }
    }

    // Login association
    async loginAssociation(username, id, password) {
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    id,
                    password,
                    type: 'association'
                })
            });

            if (response.ok) {
                // Store session data
                sessionStorage.setItem('associationId', id);
                sessionStorage.setItem('associationName', username);
                return { success: true, message: 'Login successful!' };
            } else {
                const errorText = await response.text();
                throw new Error(errorText);
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    }

    // Get association profile
    async getProfile(userId) {
        try {
            const response = await fetch(`${this.apiUrl}/getAssociationProfile?userId=${userId}`);
            const profile = await response.json();
            return profile;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }
}

// Complete Registration Form Handler
class RegistrationForm {
    constructor() {
        this.associationManager = new AssociationManager();
        this.initializeForm();
    }

    initializeForm() {
        const form = document.getElementById('associationRegistrationForm');
        const generateBtn = document.getElementById('generateCredentials');
        
        generateBtn.addEventListener('click', () => {
            const credentials = this.associationManager.generateCredentials();
            document.getElementById('generatedId').value = credentials.id;
            document.getElementById('generatedPassword').value = credentials.password;
        });

        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateForm(formData) {
        const errors = [];
        
        if (!formData.name.trim()) errors.push('Association name is required');
        if (!formData.email.trim()) errors.push('Email is required');
        if (!formData.contactNumber.trim()) errors.push('Contact number is required');
        if (!formData.generatedId) errors.push('Please generate credentials first');
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Phone validation
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (formData.contactNumber && !phoneRegex.test(formData.contactNumber)) {
            errors.push('Please enter a valid phone number');
        }

        return errors;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('associationName').value,
            generatedId: document.getElementById('generatedId').value,
            password: document.getElementById('generatedPassword').value,
            associationType: document.getElementById('associationType').value,
            registrationNumber: document.getElementById('registrationNumber').value,
            email: document.getElementById('email').value,
            contactNumber: document.getElementById('contactNumber').value
        };

        // Validate form
        const errors = this.validateForm(formData);
        if (errors.length > 0) {
            alert('Please fix the following errors:\n' + errors.join('\n'));
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#associationRegistrationForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;

        try {
            const result = await this.associationManager.registerAssociation(formData);
            
            if (result.success) {
                alert(result.message);
                this.showCredentials(formData.generatedId, formData.password);
                e.target.reset();
            } else {
                alert('Registration failed: ' + result.message);
            }
        } catch (error) {
            alert('Registration failed: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showCredentials(id, password) {
        const modal = document.createElement('div');
        modal.className = 'credentials-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Registration Successful!</h3>
                <p>Please save these credentials:</p>
                <div class="credentials">
                    <p><strong>ID:</strong> ${id}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">
                    Got it!
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

// Initialize registration form
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationForm();
});
```

### 3. Journey API Integration

#### Journey Content Manager
```javascript
class JourneyManager {
    constructor() {
        this.apiUrl = 'http://localhost:9000/api/posts';
    }

    // Create journey post with binary storage
    async createJourneyPost(description, files) {
        const formData = new FormData();
        formData.append('description', description);
        
        for (let file of files) {
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
            }
            formData.append('files', file);
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create journey post');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating journey post:', error);
            throw error;
        }
    }

    // Get all journey posts
    async getJourneyPosts() {
        try {
            const response = await fetch(this.apiUrl);
            const posts = await response.json();
            return posts;
        } catch (error) {
            console.error('Error fetching journey posts:', error);
            throw error;
        }
    }

    // Get specific file from journey post
    getFileUrl(postId, fileIndex) {
        return `${this.apiUrl}/${postId}/file/${fileIndex}`;
    }

    // Display journey posts
    displayJourneyPosts(posts) {
        const container = document.getElementById('journeyContainer');
        container.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'journey-post';
            
            const filesHtml = post.files.map((file, index) => {
                const fileUrl = this.getFileUrl(post._id, index);
                
                if (file.type.startsWith('image/')) {
                    return `<img src="${fileUrl}" alt="${file.filename}" class="journey-image">`;
                } else if (file.type.startsWith('video/')) {
                    return `<video src="${fileUrl}" controls class="journey-video"></video>`;
                }
                return '';
            }).join('');

            postElement.innerHTML = `
                <div class="journey-header">
                    <h4>Journey Entry</h4>
                    <span class="journey-date">${new Date(post._id).toLocaleDateString()}</span>
                </div>
                <div class="journey-content">
                    <p>${post.description}</p>
                    <div class="journey-media">
                        ${filesHtml}
                    </div>
                </div>
            `;
            
            container.appendChild(postElement);
        });
    }
}

// Journey Form Handler
class JourneyForm {
    constructor() {
        this.journeyManager = new JourneyManager();
        this.initializeForm();
    }

    initializeForm() {
        const form = document.getElementById('journeyForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // File preview functionality
        const fileInput = document.getElementById('journeyFiles');
        fileInput.addEventListener('change', (e) => this.previewFiles(e));
    }

    previewFiles(e) {
        const files = e.target.files;
        const preview = document.getElementById('journeyPreview');
        preview.innerHTML = '';

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview_element = document.createElement('div');
                preview_element.className = 'file-preview-item';
                
                if (file.type.startsWith('image/')) {
                    preview_element.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <span>${file.name}</span>
                    `;
                } else if (file.type.startsWith('video/')) {
                    preview_element.innerHTML = `
                        <video src="${e.target.result}" controls></video>
                        <span>${file.name}</span>
                    `;
                }
                
                preview.appendChild(preview_element);
            };
            reader.readAsDataURL(file);
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const description = document.getElementById('journeyDescription').value;
        const files = document.getElementById('journeyFiles').files;
        
        if (!description.trim()) {
            alert('Please enter a description for your journey');
            return;
        }
        
        if (files.length === 0) {
            alert('Please select at least one file');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving Journey...';
        submitBtn.disabled = true;

        try {
            await this.journeyManager.createJourneyPost(description, files);
            alert('Journey entry saved successfully!');
            
            // Refresh journey display
            const posts = await this.journeyManager.getJourneyPosts();
            this.journeyManager.displayJourneyPosts(posts);
            
            // Reset form
            e.target.reset();
            document.getElementById('journeyPreview').innerHTML = '';
            
        } catch (error) {
            alert('Error saving journey: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Initialize journey form
document.addEventListener('DOMContentLoaded', () => {
    new JourneyForm();
    
    // Load existing journey posts
    const journeyManager = new JourneyManager();
    journeyManager.getJourneyPosts()
        .then(posts => journeyManager.displayJourneyPosts(posts))
        .catch(error => console.error('Error loading journey posts:', error));
});
```

---

## Frontend Component Usage

### 1. Fitness Tracking Component

#### Complete Fitness Dashboard
```javascript
class FitnessDashboard {
    constructor() {
        this.dailyData = {
            'Monday': { steps: 0, distance: 0, calories: 0, water: 0 },
            'Tuesday': { steps: 0, distance: 0, calories: 0, water: 0 },
            'Wednesday': { steps: 0, distance: 0, calories: 0, water: 0 },
            'Thursday': { steps: 0, distance: 0, calories: 0, water: 0 },
            'Friday': { steps: 0, distance: 0, calories: 0, water: 0 },
            'Saturday': { steps: 0, distance: 0, calories: 0, water: 0 },
            'Sunday': { steps: 0, distance: 0, calories: 0, water: 0 }
        };
        
        this.selectedDay = 'Monday';
        this.charts = {};
        
        this.initializeCharts();
        this.loadSavedData();
        this.setupEventListeners();
    }

    initializeCharts() {
        // Steps Chart
        this.charts.steps = new Chart(document.getElementById('stepsChart'), {
            type: 'line',
            data: {
                labels: Object.keys(this.dailyData),
                datasets: [{
                    label: 'Steps',
                    data: Object.values(this.dailyData).map(day => day.steps),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Distance Chart
        this.charts.distance = new Chart(document.getElementById('distanceChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(this.dailyData),
                datasets: [{
                    label: 'Distance (km)',
                    data: Object.values(this.dailyData).map(day => day.distance),
                    backgroundColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Calories Chart
        this.charts.calories = new Chart(document.getElementById('caloriesChart'), {
            type: 'doughnut',
            data: {
                labels: ['Burned', 'Remaining'],
                datasets: [{
                    data: [0, 2000],
                    backgroundColor: ['#FF5722', '#E0E0E0']
                }]
            }
        });
    }

    setupEventListeners() {
        // Day selection buttons
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDay(e.target.dataset.day);
            });
        });

        // Goal form submission
        document.getElementById('goalForm').addEventListener('submit', (e) => {
            this.handleGoalSubmission(e);
        });

        // Quick stats buttons
        document.getElementById('quickStatsForm').addEventListener('submit', (e) => {
            this.handleQuickStats(e);
        });
    }

    selectDay(day) {
        this.selectedDay = day;
        
        // Update UI
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-day="${day}"]`).classList.add('active');
        
        // Show day's data
        const dayData = this.dailyData[day];
        document.getElementById('selectedDayStats').innerHTML = `
            <h3>${day} Stats</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${dayData.steps}</span>
                    <span class="stat-label">Steps</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${dayData.distance}</span>
                    <span class="stat-label">Distance (km)</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${dayData.calories}</span>
                    <span class="stat-label">Calories</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${dayData.water}</span>
                    <span class="stat-label">Water (L)</span>
                </div>
            </div>
        `;
    }

    handleGoalSubmission(e) {
        e.preventDefault();
        
        const steps = parseInt(document.getElementById('dailySteps').value) || 0;
        const distance = parseFloat(document.getElementById('dailyDistance').value) || 0;
        const calories = parseInt(document.getElementById('dailyCalories').value) || 0;
        const water = parseFloat(document.getElementById('dailyWater').value) || 0;

        // Update data
        this.dailyData[this.selectedDay] = { steps, distance, calories, water };
        
        // Update charts
        this.updateCharts();
        
        // Save to localStorage
        this.saveData();
        
        // Update UI
        this.selectDay(this.selectedDay);
        
        // Show success message
        this.showNotification('Daily stats updated successfully!', 'success');
        
        // Hide modal
        document.getElementById('goalModal').style.display = 'none';
    }

    handleQuickStats(e) {
        e.preventDefault();
        
        const quickSteps = parseInt(document.getElementById('quickSteps').value) || 0;
        const quickDistance = parseFloat(document.getElementById('quickDistance').value) || 0;
        
        // Add to today's data
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if (this.dailyData[today]) {
            this.dailyData[today].steps += quickSteps;
            this.dailyData[today].distance += quickDistance;
            
            this.updateCharts();
            this.saveData();
            this.selectDay(today);
            
            this.showNotification(`Added ${quickSteps} steps and ${quickDistance}km to ${today}!`, 'success');
            e.target.reset();
        }
    }

    updateCharts() {
        // Update steps chart
        this.charts.steps.data.datasets[0].data = Object.values(this.dailyData).map(day => day.steps);
        this.charts.steps.update();

        // Update distance chart
        this.charts.distance.data.datasets[0].data = Object.values(this.dailyData).map(day => day.distance);
        this.charts.distance.update();

        // Update calories chart (example: today's calories)
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayCalories = this.dailyData[today]?.calories || 0;
        this.charts.calories.data.datasets[0].data = [todayCalories, Math.max(0, 2000 - todayCalories)];
        this.charts.calories.update();
    }

    saveData() {
        localStorage.setItem('fitnessData', JSON.stringify(this.dailyData));
    }

    loadSavedData() {
        const saved = localStorage.getItem('fitnessData');
        if (saved) {
            this.dailyData = { ...this.dailyData, ...JSON.parse(saved) };
            this.updateCharts();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Export fitness data
    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            fitnessData: this.dailyData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fitness-data.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Generate fitness report
    generateReport() {
        const totalSteps = Object.values(this.dailyData).reduce((sum, day) => sum + day.steps, 0);
        const totalDistance = Object.values(this.dailyData).reduce((sum, day) => sum + day.distance, 0);
        const avgSteps = Math.round(totalSteps / 7);
        const avgDistance = (totalDistance / 7).toFixed(2);
        
        const report = `
            <div class="fitness-report">
                <h3>Weekly Fitness Report</h3>
                <div class="report-stats">
                    <div class="report-item">
                        <strong>Total Steps:</strong> ${totalSteps.toLocaleString()}
                    </div>
                    <div class="report-item">
                        <strong>Total Distance:</strong> ${totalDistance.toFixed(2)} km
                    </div>
                    <div class="report-item">
                        <strong>Average Steps/Day:</strong> ${avgSteps.toLocaleString()}
                    </div>
                    <div class="report-item">
                        <strong>Average Distance/Day:</strong> ${avgDistance} km
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('reportContainer').innerHTML = report;
        document.getElementById('reportModal').style.display = 'block';
    }
}

// Initialize fitness dashboard
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new FitnessDashboard();
    
    // Expose methods for button clicks
    window.exportFitnessData = () => dashboard.exportData();
    window.generateFitnessReport = () => dashboard.generateReport();
});
```

### 2. Theme Management System

#### Advanced Theme Controller
```javascript
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light',
                colors: {
                    primary: 'hsl(252, 75%, 60%)',
                    background: 'hsl(252, 30%, 95%)',
                    surface: 'hsl(252, 30%, 100%)',
                    text: 'hsl(252, 30%, 15%)'
                }
            },
            dark: {
                name: 'Dark',
                colors: {
                    primary: 'hsl(252, 75%, 60%)',
                    background: 'hsl(252, 30%, 10%)',
                    surface: 'hsl(252, 30%, 17%)',
                    text: 'hsl(252, 30%, 85%)'
                }
            },
            sport: {
                name: 'Sport',
                colors: {
                    primary: 'hsl(120, 75%, 50%)',
                    background: 'hsl(120, 30%, 95%)',
                    surface: 'hsl(120, 30%, 100%)',
                    text: 'hsl(120, 30%, 15%)'
                }
            }
        };
        
        this.currentTheme = 'light';
        this.fontSize = 'medium';
        
        this.initializeTheme();
        this.setupEventListeners();
    }

    initializeTheme() {
        // Load saved preferences
        const savedTheme = localStorage.getItem('selectedTheme') || 'light';
        const savedFontSize = localStorage.getItem('fontSize') || 'medium';
        
        this.applyTheme(savedTheme);
        this.applyFontSize(savedFontSize);
    }

    setupEventListeners() {
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.applyTheme(theme);
            });
        });

        // Font size selection
        document.querySelectorAll('.font-size-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const size = e.target.dataset.size;
                this.applyFontSize(size);
            });
        });

        // Theme modal toggle
        document.getElementById('themeBtn').addEventListener('click', () => {
            document.getElementById('themeModal').style.display = 'grid';
        });

        // Close theme modal
        document.getElementById('closeThemeModal').addEventListener('click', () => {
            document.getElementById('themeModal').style.display = 'none';
        });
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        // Apply CSS custom properties
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(`--color-${property}`, value);
        });
        
        // Update active theme indicator
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        // Save preference
        localStorage.setItem('selectedTheme', themeName);
        
        // Apply theme-specific classes
        document.body.className = `theme-${themeName}`;
    }

    applyFontSize(size) {
        this.fontSize = size;
        const root = document.documentElement;
        
        const fontSizes = {
            small: {
                base: '14px',
                heading: '1.2rem',
                large: '1.1rem'
            },
            medium: {
                base: '16px',
                heading: '1.5rem',
                large: '1.3rem'
            },
            large: {
                base: '18px',
                heading: '1.8rem',
                large: '1.5rem'
            }
        };
        
        const sizes = fontSizes[size];
        root.style.setProperty('--font-size-base', sizes.base);
        root.style.setProperty('--font-size-heading', sizes.heading);
        root.style.setProperty('--font-size-large', sizes.large);
        
        // Update active font size indicator
        document.querySelectorAll('.font-size-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-size="${size}"]`).classList.add('active');
        
        // Save preference
        localStorage.setItem('fontSize', size);
    }

    // Custom theme creator
    createCustomTheme(name, colors) {
        this.themes[name] = {
            name: name,
            colors: colors
        };
        
        // Add to theme selector
        this.addThemeOption(name);
        
        // Save custom themes
        const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
        customThemes[name] = this.themes[name];
        localStorage.setItem('customThemes', JSON.stringify(customThemes));
    }

    addThemeOption(themeName) {
        const themeContainer = document.querySelector('.theme-options');
        const themeOption = document.createElement('div');
        themeOption.className = 'theme-option';
        themeOption.dataset.theme = themeName;
        themeOption.innerHTML = `
            <div class="theme-preview" style="background: ${this.themes[themeName].colors.primary}"></div>
            <span>${this.themes[themeName].name}</span>
        `;
        
        themeOption.addEventListener('click', () => {
            this.applyTheme(themeName);
        });
        
        themeContainer.appendChild(themeOption);
    }

    // Load custom themes from localStorage
    loadCustomThemes() {
        const customThemes = JSON.parse(localStorage.getItem('customThemes') || '{}');
        Object.entries(customThemes).forEach(([name, theme]) => {
            this.themes[name] = theme;
            this.addThemeOption(name);
        });
    }

    // Reset to default theme
    resetTheme() {
        this.applyTheme('light');
        this.applyFontSize('medium');
    }

    // Get current theme info
    getCurrentTheme() {
        return {
            theme: this.currentTheme,
            fontSize: this.fontSize,
            themeData: this.themes[this.currentTheme]
        };
    }
}

// Custom Theme Creator Component
class CustomThemeCreator {
    constructor(themeManager) {
        this.themeManager = themeManager;
        this.setupCreator();
    }

    setupCreator() {
        const createBtn = document.getElementById('createCustomTheme');
        createBtn.addEventListener('click', () => {
            this.showCreator();
        });
    }

    showCreator() {
        const modal = document.createElement('div');
        modal.className = 'custom-theme-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Create Custom Theme</h3>
                <form id="customThemeForm">
                    <div class="form-group">
                        <label>Theme Name:</label>
                        <input type="text" id="themeName" required>
                    </div>
                    <div class="form-group">
                        <label>Primary Color:</label>
                        <input type="color" id="primaryColor" value="#6c5ce7">
                    </div>
                    <div class="form-group">
                        <label>Background Color:</label>
                        <input type="color" id="backgroundColor" value="#ffffff">
                    </div>
                    <div class="form-group">
                        <label>Surface Color:</label>
                        <input type="color" id="surfaceColor" value="#f8f9fa">
                    </div>
                    <div class="form-group">
                        <label>Text Color:</label>
                        <input type="color" id="textColor" value="#333333">
                    </div>
                    <div class="form-actions">
                        <button type="submit">Create Theme</button>
                        <button type="button" onclick="this.closest('.custom-theme-modal').remove()">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('customThemeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleThemeCreation(modal);
        });
    }

    handleThemeCreation(modal) {
        const name = document.getElementById('themeName').value.toLowerCase().replace(/\s+/g, '-');
        const colors = {
            primary: document.getElementById('primaryColor').value,
            background: document.getElementById('backgroundColor').value,
            surface: document.getElementById('surfaceColor').value,
            text: document.getElementById('textColor').value
        };
        
        this.themeManager.createCustomTheme(name, colors);
        modal.remove();
        
        // Apply the new theme
        this.themeManager.applyTheme(name);
        
        alert('Custom theme created and applied!');
    }
}

// Initialize theme management
document.addEventListener('DOMContentLoaded', () => {
    const themeManager = new ThemeManager();
    themeManager.loadCustomThemes();
    
    const customThemeCreator = new CustomThemeCreator(themeManager);
    
    // Expose theme manager globally
    window.themeManager = themeManager;
});
```

---

## Complete Workflow Examples

### 1. User Registration to Post Creation Flow

```javascript
class CompleteUserFlow {
    constructor() {
        this.associationManager = new AssociationManager();
        this.postManager = new PostManager();
        this.currentUser = null;
        
        this.initializeFlow();
    }

    initializeFlow() {
        // Check if user is already logged in
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard();
        } else {
            this.showLanding();
        }
    }

    // Step 1: Landing Page
    showLanding() {
        document.getElementById('app').innerHTML = `
            <div class="landing-page">
                <h1>Welcome to Sports Connect</h1>
                <p>Connect with athletes, share your journey, and track your progress</p>
                <div class="landing-actions">
                    <button onclick="userFlow.showRegistration()" class="btn-primary">
                        Join as Association
                    </button>
                    <button onclick="userFlow.showLogin()" class="btn-secondary">
                        Login
                    </button>
                </div>
            </div>
        `;
    }

    // Step 2: Registration
    showRegistration() {
        document.getElementById('app').innerHTML = `
            <div class="registration-page">
                <h2>Association Registration</h2>
                <form id="registrationForm">
                    <div class="form-group">
                        <label>Association Name:</label>
                        <input type="text" id="associationName" required>
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label>Contact Number:</label>
                        <input type="tel" id="contactNumber" required>
                    </div>
                    <div class="form-group">
                        <label>Association Type:</label>
                        <select id="associationType" required>
                            <option value="">Select Type</option>
                            <option value="Sports Club">Sports Club</option>
                            <option value="Fitness Center">Fitness Center</option>
                            <option value="School">School</option>
                            <option value="University">University</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Registration Number:</label>
                        <input type="text" id="registrationNumber" required>
                    </div>
                    <div class="credentials-section">
                        <button type="button" onclick="userFlow.generateCredentials()">
                            Generate Login Credentials
                        </button>
                        <div class="credentials-display" id="credentialsDisplay" style="display: none;">
                            <div class="form-group">
                                <label>Generated ID:</label>
                                <input type="text" id="generatedId" readonly>
                            </div>
                            <div class="form-group">
                                <label>Generated Password:</label>
                                <input type="text" id="generatedPassword" readonly>
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Register Association</button>
                        <button type="button" onclick="userFlow.showLanding()">Back</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            this.handleRegistration(e);
        });
    }

    generateCredentials() {
        const credentials = this.associationManager.generateCredentials();
        document.getElementById('generatedId').value = credentials.id;
        document.getElementById('generatedPassword').value = credentials.password;
        document.getElementById('credentialsDisplay').style.display = 'block';
    }

    async handleRegistration(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('associationName').value,
            email: document.getElementById('email').value,
            contactNumber: document.getElementById('contactNumber').value,
            associationType: document.getElementById('associationType').value,
            registrationNumber: document.getElementById('registrationNumber').value,
            generatedId: document.getElementById('generatedId').value,
            password: document.getElementById('generatedPassword').value
        };

        if (!formData.generatedId) {
            alert('Please generate login credentials first');
            return;
        }

        try {
            const result = await this.associationManager.registerAssociation(formData);
            if (result.success) {
                alert('Registration successful! You can now login with your credentials.');
                this.showLogin();
            } else {
                alert('Registration failed: ' + result.message);
            }
        } catch (error) {
            alert('Registration error: ' + error.message);
        }
    }

    // Step 3: Login
    showLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-page">
                <h2>Login to Sports Connect</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Association Name:</label>
                        <input type="text" id="loginName" required>
                    </div>
                    <div class="form-group">
                        <label>Association ID:</label>
                        <input type="text" id="loginId" required>
                    </div>
                    <div class="form-group">
                        <label>Password:</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Login</button>
                        <button type="button" onclick="userFlow.showRegistration()">
                            Need to Register?
                        </button>
                        <button type="button" onclick="userFlow.showLanding()">Back</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginName').value;
        const id = document.getElementById('loginId').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const result = await this.associationManager.loginAssociation(username, id, password);
            if (result.success) {
                this.currentUser = { username, id };
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showDashboard();
            } else {
                alert('Login failed: ' + result.message);
            }
        } catch (error) {
            alert('Login error: ' + error.message);
        }
    }

    // Step 4: Main Dashboard
    showDashboard() {
        document.getElementById('app').innerHTML = `
            <div class="dashboard">
                <header class="dashboard-header">
                    <h1>Sports Connect Dashboard</h1>
                    <div class="user-info">
                        <span>Welcome, ${this.currentUser.username}</span>
                        <button onclick="userFlow.logout()" class="btn-secondary">Logout</button>
                    </div>
                </header>
                
                <nav class="dashboard-nav">
                    <button onclick="userFlow.showCreatePost()" class="nav-btn active">Create Post</button>
                    <button onclick="userFlow.showPosts()" class="nav-btn">View Posts</button>
                    <button onclick="userFlow.showJourney()" class="nav-btn">My Journey</button>
                    <button onclick="userFlow.showFitness()" class="nav-btn">Fitness Tracker</button>
                </nav>
                
                <main class="dashboard-content" id="dashboardContent">
                    <!-- Content will be loaded here -->
                </main>
            </div>
        `;

        // Load default view
        this.showCreatePost();
    }

    // Step 5: Create Post Interface
    showCreatePost() {
        this.updateNavActive('Create Post');
        document.getElementById('dashboardContent').innerHTML = `
            <div class="create-post-section">
                <h2>Share Your Sports Moment</h2>
                <form id="createPostForm" class="post-form">
                    <div class="form-group">
                        <textarea 
                            id="postDescription" 
                            placeholder="What's happening in your sports world?"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="postFiles" class="file-upload-label">
                            📷 Add Photos/Videos
                        </label>
                        <input 
                            type="file" 
                            id="postFiles" 
                            multiple 
                            accept="image/*,video/*"
                            style="display: none;"
                        >
                    </div>
                    
                    <div id="filePreview" class="file-preview"></div>
                    
                    <button type="submit" class="btn-primary">Share Post</button>
                </form>
                
                <div id="postSuccess" class="success-message" style="display: none;">
                    Post shared successfully! 🎉
                </div>
            </div>
        `;

        // Setup file preview
        document.getElementById('postFiles').addEventListener('change', (e) => {
            this.previewFiles(e.target.files);
        });

        // Setup form submission
        document.getElementById('createPostForm').addEventListener('submit', (e) => {
            this.handlePostCreation(e);
        });
    }

    previewFiles(files) {
        const preview = document.getElementById('filePreview');
        preview.innerHTML = '';

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                if (file.type.startsWith('image/')) {
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <span class="file-name">${file.name}</span>
                    `;
                } else if (file.type.startsWith('video/')) {
                    previewItem.innerHTML = `
                        <video src="${e.target.result}" controls></video>
                        <span class="file-name">${file.name}</span>
                    `;
                }
                
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    async handlePostCreation(e) {
        e.preventDefault();
        
        const description = document.getElementById('postDescription').value;
        const files = document.getElementById('postFiles').files;
        
        if (files.length === 0) {
            alert('Please select at least one file to share');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Sharing...';
        submitBtn.disabled = true;

        try {
            await this.postManager.createPost(description, files);
            
            // Show success message
            document.getElementById('postSuccess').style.display = 'block';
            
            // Reset form
            e.target.reset();
            document.getElementById('filePreview').innerHTML = '';
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                document.getElementById('postSuccess').style.display = 'none';
            }, 3000);
            
        } catch (error) {
            alert('Error sharing post: ' + error.message);
        } finally {
            submitBtn.textContent = 'Share Post';
            submitBtn.disabled = false;
        }
    }

    // View Posts
    async showPosts() {
        this.updateNavActive('View Posts');
        document.getElementById('dashboardContent').innerHTML = `
            <div class="posts-section">
                <h2>Community Posts</h2>
                <div id="postsContainer" class="posts-container">
                    <div class="loading">Loading posts...</div>
                </div>
                <button onclick="userFlow.refreshPosts()" class="btn-secondary">
                    🔄 Refresh Posts
                </button>
            </div>
        `;

        try {
            const posts = await this.postManager.getPosts();
            this.displayPosts(posts);
        } catch (error) {
            document.getElementById('postsContainer').innerHTML = `
                <div class="error">Error loading posts: ${error.message}</div>
            `;
        }
    }

    displayPosts(posts) {
        const container = document.getElementById('postsContainer');
        
        if (posts.length === 0) {
            container.innerHTML = '<div class="no-posts">No posts yet. Be the first to share!</div>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="post-item">
                <div class="post-header">
                    <div class="post-author">Sports Connect Member</div>
                    <div class="post-date">${new Date(post._id).toLocaleDateString()}</div>
                </div>
                <div class="post-content">
                    <p>${post.description}</p>
                    <div class="post-media">
                        ${post.files.map(file => 
                            file.type.startsWith('image/') 
                                ? `<img src="${file.url}" alt="Post image" class="post-image">`
                                : `<video src="${file.url}" controls class="post-video"></video>`
                        ).join('')}
                    </div>
                </div>
                <div class="post-actions">
                    <button class="action-btn">👍 Like</button>
                    <button class="action-btn">💬 Comment</button>
                    <button class="action-btn">📤 Share</button>
                </div>
            </div>
        `).join('');
    }

    async refreshPosts() {
        document.getElementById('postsContainer').innerHTML = '<div class="loading">Refreshing...</div>';
        try {
            const posts = await this.postManager.getPosts();
            this.displayPosts(posts);
        } catch (error) {
            document.getElementById('postsContainer').innerHTML = `
                <div class="error">Error refreshing posts: ${error.message}</div>
            `;
        }
    }

    // Utility methods
    updateNavActive(activeText) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === activeText) {
                btn.classList.add('active');
            }
        });
    }

    logout() {
        sessionStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLanding();
    }

    // Additional dashboard views would be implemented similarly...
    showJourney() {
        this.updateNavActive('My Journey');
        // Implementation for journey view
    }

    showFitness() {
        this.updateNavActive('Fitness Tracker');
        // Implementation for fitness tracker
    }
}

// Initialize the complete user flow
document.addEventListener('DOMContentLoaded', () => {
    window.userFlow = new CompleteUserFlow();
});
```

This comprehensive documentation provides complete examples of how to integrate and use all the APIs and components in the Sports Connect application. Each example includes error handling, user feedback, and real-world usage patterns that developers can follow to build robust features.