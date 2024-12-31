let currentContainerId = '';

function addContent(containerId) {
    currentContainerId = containerId;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('media-input').value = '';
    document.getElementById('description').value = '';
}

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

function goBack() {
    window.history.back();
}
