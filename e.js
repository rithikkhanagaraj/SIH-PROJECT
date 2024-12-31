document.getElementById('registration-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Gather form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const eventSelected = document.getElementById('event').value;

    // Display success message
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = `Thank you, ${name}, for registering for the ${eventSelected} event!`;
    successMessage.style.display = 'block';

    // Clear form
    this.reset();
});
