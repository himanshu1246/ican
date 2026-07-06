/**
 * form-handler.js - Handles contact form validation and submission
 * to Google Apps Script Web App.
 */

// ============================================================================
// PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE
// Replace the URL below with your deployed Google Apps Script Web App URL.
// ============================================================================
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbzDTpf9zcw5sIE0LlwSOW1KDyeCWyFMNA3_VxiHj7QWchx18iGA9Lo0XgPuopGmD-bG/exec";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('.btn-submit');
  const statusMsg = document.getElementById('formStatus');
  const btnText = submitBtn.querySelector('.btn-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Hide previous status
    statusMsg.style.display = 'none';
    statusMsg.className = 'form-status';

    // 1. Check Honeypot (Anti-spam)
    const honeypot = form.querySelector('input[name="website_url"]').value;
    if (honeypot) {
      // Bot detected, silently reject but pretend it worked
      console.warn("Spam detected");
      showStatus('Message sent successfully.', 'success');
      form.reset();
      return;
    }

    // 2. Client-side Validation
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    delete data.website_url; // Remove honeypot before sending

    // Validate Name
    if (!data.name || data.name.trim().length < 2 || data.name.length > 100) {
      showStatus('Please enter a valid name (2-100 characters).', 'error');
      return;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email) || data.email.length > 150) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Validate Phone (Optional but max length check if provided)
    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
    if (data.phone && !phoneRegex.test(data.phone)) {
      showStatus('Please enter a valid phone number.', 'error');
      return;
    }

    // Validate Message
    if (!data.message || data.message.trim().length < 10 || data.message.length > 2000) {
      showStatus('Please enter a message between 10 and 2000 characters.', 'error');
      return;
    }

    // 3. Prepare for submission
    setLoadingState(true);

    try {
      const sendData = new FormData();
      for (const key in data) {
        sendData.append(key, data[key]);
      }

      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: sendData,
      });

      const result = await response.json();

      if (result.status === 'success' || result.result === 'success') {
        showStatus('Thank you! Your message has been sent successfully.', 'success');
        form.reset();
      } else {
        throw new Error(result.message || 'Server returned an error.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showStatus('There was a problem sending your message. Please try again later.', 'error');
    } finally {
      setLoadingState(false);
    }
  });

  function showStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = `form-status ${type}`;
    statusMsg.style.display = 'block';
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      btnText.textContent = 'Sending...';
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      btnText.textContent = 'Send Message';
    }
  }
});
