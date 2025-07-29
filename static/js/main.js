/**
 * IntruderVision - Main JavaScript File
 * Handles client-side functionality for the IntruderVision security system
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Handle flash message dismissal
    const flashMessages = document.querySelectorAll('.alert-dismissible');
    flashMessages.forEach(function(message) {
        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            const closeButton = message.querySelector('.btn-close');
            if (closeButton) {
                closeButton.click();
            }
        }, 5000);
    });

    // Handle form validation
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Handle password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const passwordField = document.querySelector(toggle.getAttribute('data-target'));
            if (passwordField) {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                
                // Toggle icon
                const icon = toggle.querySelector('i');
                if (icon) {
                    if (type === 'password') {
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    } else {
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    }
                }
            }
        });
    });

    // Handle dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Save preference to localStorage
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            
            // Update icon
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                if (isDarkMode) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
        });
        
        // Check for saved preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'enabled') {
            document.body.classList.add('dark-mode');
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }

    // Handle video feed error recovery
    const videoFeed = document.getElementById('video-feed');
    if (videoFeed) {
        videoFeed.addEventListener('error', function() {
            console.log('Video feed error detected, attempting to reconnect...');
            const statusIndicator = document.getElementById('status-indicator');
            if (statusIndicator) {
                statusIndicator.className = 'badge bg-warning';
                statusIndicator.textContent = 'Reconnecting...';
            }
            
            // Try to reconnect after a delay
            setTimeout(function() {
                videoFeed.src = videoFeed.src.split('?')[0] + '?' + new Date().getTime();
            }, 3000);
        });
    }

    // Handle image lightbox
    const eventImages = document.querySelectorAll('.event-image-link');
    eventImages.forEach(function(image) {
        image.addEventListener('click', function(e) {
            e.preventDefault();
            const imageUrl = this.getAttribute('href');
            const timestamp = this.getAttribute('data-timestamp');
            
            // Create lightbox elements
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox-overlay';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <div class="lightbox-header">
                        <h5>Motion Detected at ${timestamp}</h5>
                        <button class="lightbox-close">&times;</button>
                    </div>
                    <div class="lightbox-body">
                        <img src="${imageUrl}" alt="Motion Event">
                    </div>
                </div>
            `;
            
            // Add to document
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';
            
            // Handle close button
            const closeButton = lightbox.querySelector('.lightbox-close');
            closeButton.addEventListener('click', function() {
                document.body.removeChild(lightbox);
                document.body.style.overflow = '';
            });
            
            // Close on background click
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    document.body.removeChild(lightbox);
                    document.body.style.overflow = '';
                }
            });
        });
    });

    // Update current time in real-time
    const currentTimeElement = document.getElementById('current-time');
    if (currentTimeElement) {
        function updateTime() {
            const now = new Date();
            currentTimeElement.textContent = now.toLocaleTimeString();
        }
        
        // Update immediately and then every second
        updateTime();
        setInterval(updateTime, 1000);
    }

    // Handle refresh button for motion events
    const refreshButton = document.getElementById('refresh-events');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // Add spinner to button
            const originalContent = refreshButton.innerHTML;
            refreshButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';
            refreshButton.disabled = true;
            
            // Fetch updated events
            fetch('/api/motion_events')
                .then(response => response.json())
                .then(data => {
                    // Reload the page to show updated events
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error fetching events:', error);
                    refreshButton.innerHTML = originalContent;
                    refreshButton.disabled = false;
                    
                    // Show error message
                    const alertContainer = document.querySelector('.card-body');
                    const alertElement = document.createElement('div');
                    alertElement.className = 'alert alert-danger alert-dismissible fade show mt-3';
                    alertElement.innerHTML = `
                        <strong>Error!</strong> Failed to refresh events. Please try again.
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
                    alertContainer.prepend(alertElement);
                });
        });
    }

    // Handle test email button
    const testEmailButton = document.getElementById('test-email');
    if (testEmailButton) {
        testEmailButton.addEventListener('click', function() {
            // In a real implementation, this would send an AJAX request to test email
            alert('This feature is not implemented in the demo version.');
        });
    }

    // Handle test SMS button
    const testSmsButton = document.getElementById('test-sms');
    if (testSmsButton) {
        testSmsButton.addEventListener('click', function() {
            // In a real implementation, this would send an AJAX request to test SMS
            alert('This feature is not implemented in the demo version.');
        });
    }
});