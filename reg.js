function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

function goBack() {
    window.history.back();
}

// Close modal if the user clicks outside of it
window.onclick = function(event) {
    var modal = document.getElementById('registerModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Generate random ID and password
function generateId() {
    const generatedId = 'ID-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const generatedPassword = Math.random().toString(36).substr(2, 10);
    
    document.getElementById('generatedId').value = generatedId;
    document.getElementById('generatedPassword').value = generatedPassword;
}

// Form submission handler with validation
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent page reload

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const teamMembers = document.getElementById('team').value.trim();
    const generatedId = document.getElementById('generatedId').value;

    let errorMessage = '';

    // Validate required fields
    if (!name) {
        errorMessage += 'Name is required.\n';
    }
    if (!email) {
        errorMessage += 'Email is required.\n';
    }
    if (!contact) {
        errorMessage += 'Contact number is required.\n';
    }
    if (!teamMembers) {
        errorMessage += 'Please enter the names of your team members.\n';
    }

    // Check if the Generate ID button has been clicked
    if (!generatedId) {
        errorMessage += 'Please generate an ID before submitting the form.\n';
    }

    // If there are any errors, show alert and stop submission
    if (errorMessage) {
        alert(errorMessage);
        return;
    }

    // Show success message if all validations pass
    alert('Registration Submitted Successfully!');
    closeRegisterModal(); // Close modal after submission
});

// Remove preloader after page load
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'none'; // Hide preloader when the page is fully loaded
});
