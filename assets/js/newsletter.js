/**
 * Newsletter Subscription with Brevo API Integration
 * Handles email subscription to Brevo mailing list
 */

class NewsletterSubscription {
    constructor() {
        this.apiKey = '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';
        this.apiUrl = 'https://api.brevo.com/v3/contacts';
        this.listId = 2;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        });
    }

    async handleSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();

        // Validate email
        if (!this.isValidEmail(email)) {
            this.showMessage(form, 'Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(submitBtn, true);

        try {
            await this.subscribeToBrevo(email);
            this.showMessage(form, 'Successfully subscribed! Welcome to SharaSpot updates.', 'success');
            emailInput.value = ''; // Clear the input
        } catch (error) {
            console.error('Subscription error:', error);

            // Handle specific error cases
            if (error.message.includes('already exists')) {
                this.showMessage(form, 'You are already subscribed to our newsletter!', 'info');
            } else {
                this.showMessage(form, 'Something went wrong. Please try again later.', 'error');
            }
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    async subscribeToBrevo(email) {
        const contactData = {
            email: email,
            listIds: [this.listId],
            updateEnabled: true,
            attributes: {
                FNAME: '', // Can be expanded later
                LNAME: '',
                SOURCE: 'Website Newsletter'
            }
        };

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': this.apiKey
            },
            body: JSON.stringify(contactData)
        });

        if (!response.ok) {
            const errorData = await response.json();

            // Check if contact already exists
            if (response.status === 400 && errorData.message && errorData.message.includes('already exists')) {
                throw new Error('Contact already exists');
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          Subscribing...
        </span>
      `;
        } else {
            button.disabled = false;
            button.innerHTML = 'Subscribe';
        }
    }

    showMessage(form, message, type) {
        // Remove existing message
        const existingMessage = form.querySelector('.newsletter-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageEl = document.createElement('div');
        messageEl.className = `newsletter-message newsletter-message--${type}`;
        messageEl.textContent = message;

        // Style the message
        const styles = {
            success: {
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: '1px solid #22c55e'
            },
            error: {
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: '1px solid #ef4444'
            },
            info: {
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: '1px solid #3b82f6'
            }
        };

        Object.assign(messageEl.style, {
            padding: '12px 16px',
            borderRadius: '8px',
            marginTop: '12px',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            ...styles[type]
        });

        // Insert message after the form
        form.appendChild(messageEl);

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.transition = 'opacity 0.3s ease';
                messageEl.style.opacity = '0';
                setTimeout(() => messageEl.remove(), 300);
            }
        }, 5000);
    }
}

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .newsletter-form button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
document.head.appendChild(style);

// Initialize the newsletter subscription
new NewsletterSubscription();