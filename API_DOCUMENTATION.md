# Sports Connect - Comprehensive API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Backend APIs](#backend-apis)
3. [Frontend Components](#frontend-components)
4. [Database Schemas](#database-schemas)
5. [Authentication](#authentication)
6. [File Upload System](#file-upload-system)
7. [Usage Examples](#usage-examples)
8. [Error Handling](#error-handling)

## Overview

Sports Connect is a comprehensive social media platform for sports enthusiasts, associations, and athletes. It provides functionality for user registration, authentication, post creation, fitness tracking, journey documentation, and event management.

### Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer
- **Authentication**: bcrypt, JWT
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **File Handling**: FileReader API, html2canvas

---

## Backend APIs

### 1. Posts API (server.js - Port 5000)

#### Base URL: `http://localhost:5000`

#### Create Post
```http
POST /api/posts
```

**Description**: Creates a new post with media files and description.

**Content-Type**: `multipart/form-data`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| files | File[] | Yes | Array of image/video files |
| description | String | Yes | Post description text |

**Request Example**:
```javascript
const formData = new FormData();
formData.append('description', 'My latest training session!');
formData.append('files', imageFile);
formData.append('files', videoFile);

fetch('/api/posts', {
    method: 'POST',
    body: formData
})
```

**Response**:
```json
{
    "post": {
        "_id": "64f8a1b2c3d4e5f6789012ab",
        "description": "My latest training session!",
        "files": [
            {
                "url": "/uploads/1726736160797.jpg",
                "type": "image/jpeg"
            }
        ],
        "__v": 0
    }
}
```

#### Get Posts
```http
GET /api/posts
```

**Description**: Retrieves all posts sorted by newest first.

**Response**:
```json
[
    {
        "_id": "64f8a1b2c3d4e5f6789012ab",
        "description": "My latest training session!",
        "files": [
            {
                "url": "/uploads/1726736160797.jpg",
                "type": "image/jpeg"
            }
        ]
    }
]
```

### 2. Association Management API (serverNew.js - Port 3000)

#### Base URL: `http://localhost:3000`

#### Register Association
```http
POST /saveAssociation
```

**Description**: Registers a new sports association.

**Content-Type**: `application/json`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | Yes | Association name |
| generatedId | String | Yes | Auto-generated unique ID |
| password | String | Yes | Hashed password |
| associationType | String | Yes | Type of association |
| registrationNumber | String | Yes | Official registration number |
| email | String | Yes | Contact email |
| contactNumber | String | Yes | Contact phone number |

**Request Example**:
```javascript
const associationData = {
    name: "City Sports Club",
    generatedId: "ASSOC_ABC123",
    password: "hashedPassword123",
    associationType: "Sports Club",
    registrationNumber: "REG001",
    email: "contact@citysports.com",
    contactNumber: "+1234567890"
};

fetch('/saveAssociation', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(associationData)
})
```

**Response**: `Association Saved` (Status: 200)

#### Login
```http
POST /login
```

**Description**: Authenticates users (associations/athletes).

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | String | Yes | User's name |
| id | String | Yes | Generated ID |
| password | String | Yes | User's password |
| type | String | Yes | User type ('association', 'athlete') |

**Request Example**:
```javascript
const loginData = {
    username: "City Sports Club",
    id: "ASSOC_ABC123",
    password: "userPassword123",
    type: "association"
};

fetch('/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
})
```

**Response**: `Login successful.` (Status: 200)

#### Get Association Profile
```http
GET /getAssociationProfile?userId=ASSOC_XYZ123
```

**Description**: Retrieves association profile information.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | String | Yes | Association's generated ID |

**Response**:
```json
{
    "name": "City Sports Club",
    "generatedId": "ASSOC_XYZ123",
    "photoUrl": "/path/to/profile-photo.jpg"
}
```

### 3. Journey API (serverjourney.js - Port 9000)

#### Base URL: `http://localhost:9000`

#### Create Journey Post
```http
POST /api/posts
```

**Description**: Creates a journey post with files stored as binary data in MongoDB.

**Content-Type**: `multipart/form-data`

**File Restrictions**:
- Maximum file size: 10MB
- Accepted types: Images and videos only
- Storage: Binary data in MongoDB

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| files | File[] | Yes | Array of image/video files |
| description | String | Yes | Journey description |

**Response**:
```json
{
    "post": {
        "_id": "64f8a1b2c3d4e5f6789012cd",
        "description": "My fitness journey progress",
        "files": [
            {
                "data": "Binary data buffer",
                "type": "image/jpeg",
                "filename": "progress.jpg"
            }
        ]
    }
}
```

#### Get Journey Posts
```http
GET /api/posts
```

**Description**: Retrieves all journey posts.

#### Get Journey File
```http
GET /api/posts/:id/file/:fileIndex
```

**Description**: Retrieves a specific file from a journey post.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | String | Post ID |
| fileIndex | Number | Index of file in the files array |

**Response**: Binary file data with appropriate MIME type

---

## Frontend Components

### 1. Navigation Component

#### Functions

##### `changeActiveItem()`
**Description**: Removes active class from all menu items.
```javascript
const changeActiveItem = () => {
    menuItems.forEach(item => {
        item.classList.remove('active');
    })
}
```

**Usage**:
```javascript
// Called before setting a new active menu item
changeActiveItem();
item.classList.add('active');
```

### 2. Registration Components

#### Functions

##### `openRegisterModal()`
**Description**: Opens the registration modal dialog.
```javascript
function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
}
```

##### `closeRegisterModal()`
**Description**: Closes the registration modal dialog.
```javascript
function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}
```

##### `generateId()`
**Description**: Generates random ID and password for new registrations.
```javascript
function generateId() {
    const generatedId = 'ID-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const generatedPassword = Math.random().toString(36).substr(2, 10);
    
    document.getElementById('generatedId').value = generatedId;
    document.getElementById('generatedPassword').value = generatedPassword;
}
```

**Usage Example**:
```html
<button onclick="generateId()">Generate ID</button>
<input type="text" id="generatedId" readonly>
<input type="text" id="generatedPassword" readonly>
```

### 3. Fitness Tracking Components

#### Functions

##### `showGoalPopup()`
**Description**: Displays the fitness goal setting popup.
```javascript
function showGoalPopup() {
    document.getElementById('goalPopup').style.display = 'block';
}
```

##### `showProgressBar(steps, distance)`
**Description**: Shows progress bar based on fitness goals.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| steps | Number | Number of steps taken |
| distance | Number | Distance covered in km |

```javascript
function showProgressBar(steps, distance) {
    const progressBar = document.getElementById('goalProgressBar');
    const progress = document.getElementById('goalProgress');
    
    const progressValue = Math.min((steps / 10000) * 100, 100);
    progress.style.width = `${progressValue}%`;
    progressBar.style.display = 'block';
}
```

##### `selectDay(day)`
**Description**: Selects a specific day for fitness tracking.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| day | String | Day of the week |

```javascript
function selectDay(day) {
    selectedDay = day;
    document.getElementById('selectedDay').innerText = day;
    document.getElementById('dayPopup').style.display = 'none';
    document.getElementById('dailyGoalPopup').style.display = 'block';
}
```

##### `updateCharts()`
**Description**: Updates fitness charts with new data.
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

##### `downloadStatus()`
**Description**: Downloads fitness status as PNG image.
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

### 4. Journey Components

#### Functions

##### `addContent(containerId)`
**Description**: Opens modal to add content to a journey container.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| containerId | String | ID of the container to add content to |

```javascript
function addContent(containerId) {
    currentContainerId = containerId;
    document.getElementById('modal').style.display = 'flex';
}
```

##### `submitMedia()`
**Description**: Submits media content to the journey.
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

### 5. Image Management Components

#### Functions

##### `changeImage(imageId)`
**Description**: Changes an image in the profile or content area.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| imageId | String | ID of the image element to change |

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

##### `editText(textId)`
**Description**: Allows inline text editing.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| textId | String | ID of the text element to edit |

```javascript
function editText(textId) {
    const textElement = document.getElementById(textId);
    const newText = prompt("Edit the text:", textElement.innerText);
    if (newText !== null) {
        textElement.innerText = newText;
    }
}
```

### 6. Chart Components

#### Fitness Charts Initialization

##### Calories Chart
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

##### Steps and Distance Chart
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

---

## Database Schemas

### 1. Post Schema (Posts API)
```javascript
const postSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    files: [{
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    }]
});
```

### 2. Association Schema
```javascript
const associationSchema = new mongoose.Schema({
    name: String,
    generatedId: String,
    password: String,
    associationType: String,
    registrationNumber: String,
    email: String,
    contactNumber: String
});
```

### 3. Journey Post Schema
```javascript
const postSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    files: [{
        data: {
            type: Buffer,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        }
    }]
}, { collection: 'serverjourney' });
```

---

## Authentication

### Password Hashing
The application uses bcrypt for password hashing:

```javascript
const bcrypt = require('bcrypt');

// Hashing (during registration)
const hashedPassword = await bcrypt.hash(password, 10);

// Verification (during login)
const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
```

### Login Process
1. User submits credentials (username, id, password, type)
2. System queries appropriate collection based on user type
3. Password is compared using bcrypt
4. Success/failure response is sent

---

## File Upload System

### 1. Filesystem Storage (Posts API)
```javascript
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
```

### 2. Memory Storage (Journey API)
```javascript
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('File type not supported'), false);
        }
    }
});
```

---

## Usage Examples

### 1. Creating a Post with Multiple Files
```javascript
// HTML
<form id="postForm" enctype="multipart/form-data">
    <input type="file" id="files" multiple accept="image/*,video/*">
    <textarea id="description" placeholder="Enter description"></textarea>
    <button type="submit">Create Post</button>
</form>

// JavaScript
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const files = document.getElementById('files').files;
    const description = document.getElementById('description').value;
    
    formData.append('description', description);
    for (let file of files) {
        formData.append('files', file);
    }
    
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        console.log('Post created:', result);
    } catch (error) {
        console.error('Error creating post:', error);
    }
});
```

### 2. Association Registration
```javascript
async function registerAssociation(formData) {
    try {
        const response = await fetch('/saveAssociation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.name,
                generatedId: formData.generatedId,
                password: formData.password,
                associationType: formData.associationType,
                registrationNumber: formData.registrationNumber,
                email: formData.email,
                contactNumber: formData.contactNumber
            })
        });
        
        if (response.ok) {
            alert('Association registered successfully!');
        }
    } catch (error) {
        console.error('Registration error:', error);
    }
}
```

### 3. Fitness Data Tracking
```javascript
// Update daily fitness data
function updateDailyStats(day, stats) {
    dailyData[day] = {
        steps: stats.steps,
        distance: stats.distance
    };
    
    updateCharts();
    
    // Save to localStorage for persistence
    localStorage.setItem('fitnessData', JSON.stringify(dailyData));
}

// Load fitness data on page load
window.addEventListener('load', () => {
    const savedData = localStorage.getItem('fitnessData');
    if (savedData) {
        Object.assign(dailyData, JSON.parse(savedData));
        updateCharts();
    }
});
```

### 4. Journey Content Management
```javascript
// Add media to journey
async function addJourneyContent(containerId, file, description) {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('description', description);
    
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        // Update UI with new content
        displayJourneyContent(containerId, result.post);
    } catch (error) {
        console.error('Error adding journey content:', error);
    }
}
```

---

## Error Handling

### Backend Error Responses

#### Posts API Errors
```javascript
// File upload error
{
    "error": "No files uploaded"
}

// Database error
{
    "error": "Error saving post"
}

// File retrieval error
{
    "error": "Error retrieving posts"
}
```

#### Association API Errors
```javascript
// Registration error
"Error saving association data: [error details]"

// Login errors
"User not found."
"Invalid username or password."
"Error logging in: [error details]"
```

#### Journey API Errors
```javascript
// File type error
{
    "error": "File type not supported"
}

// File size error
{
    "error": "File too large"
}

// Post not found
"Post not found"

// File not found
"File not found"
```

### Frontend Error Handling

#### Form Validation
```javascript
function validateRegistrationForm(formData) {
    let errorMessage = '';
    
    if (!formData.name) {
        errorMessage += 'Name is required.\n';
    }
    if (!formData.email) {
        errorMessage += 'Email is required.\n';
    }
    if (!formData.contact) {
        errorMessage += 'Contact number is required.\n';
    }
    
    if (errorMessage) {
        alert(errorMessage);
        return false;
    }
    return true;
}
```

#### API Error Handling
```javascript
async function handleApiCall(url, options) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        alert('An error occurred. Please try again.');
        throw error;
    }
}
```

---

## Development Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- Modern web browser

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start MongoDB service
mongod

# Start the servers
node server.js          # Posts API (Port 5000)
node serverNew.js       # Association API (Port 3000)
node serverjourney.js   # Journey API (Port 9000)
```

### Environment Configuration
```javascript
// MongoDB connections
const POSTS_DB = 'mongodb://localhost:27017/postsDB';
const ASSOCIATION_DB = 'mongodb://localhost:27017/sportsConnectDB';
const JOURNEY_DB = 'mongodb://localhost:27017/serverjourney';

// Server ports
const POSTS_PORT = 5000;
const ASSOCIATION_PORT = 3000;
const JOURNEY_PORT = 9000;
```

---

## Contributing

### Code Standards
- Use ES6+ JavaScript features
- Follow RESTful API conventions
- Implement proper error handling
- Add JSDoc comments for functions
- Use semantic HTML and CSS

### Testing
- Test all API endpoints with different data types
- Validate file upload functionality
- Verify authentication flows
- Test responsive design on multiple devices

This documentation provides comprehensive coverage of all public APIs, functions, and components in the Sports Connect application. For additional support or feature requests, please refer to the project repository or contact the development team.