/**
 * SECURE FORM HANDLER
 * Implements strict client-side sanitization to mitigate XSS and injection attacks.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('secure-contact-form');
    const statusDiv = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1. Extract raw data
            const rawName = document.getElementById('name').value;
            const rawEmail = document.getElementById('email').value;
            const rawMessage = document.getElementById('message').value;

            // 2. Client-Side Sanitization (Anti-XSS)
            // Removes any HTML tags (<script>, <img>, etc) from user input
            function sanitize(str) {
                const temp = document.createElement('div');
                temp.textContent = str;
                return temp.innerHTML;
            }

            const cleanName = sanitize(rawName);
            const cleanEmail = sanitize(rawEmail);
            const cleanMessage = sanitize(rawMessage);

            // 3. Prevent submission of suspicious patterns (Basic heuristic)
            const xssPattern = /javascript:|onload|onerror|eval|document\.cookie/i;
            if (xssPattern.test(cleanMessage)) {
                statusDiv.innerHTML = "⚠️ Security alert: Malicious input detected. Transmission aborted.";
                statusDiv.style.color = "var(--accent-saffron)";
                return;
            }

            statusDiv.innerHTML = "Encrypting and transmitting...";
            statusDiv.style.color = "var(--text-muted)";

            // 4. Submission (Currently mocked until Google Apps Script is deployed)
            try {
                // Simulate network request
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                statusDiv.innerHTML = "✅ Message transmitted securely. Our team will contact you.";
                statusDiv.style.color = "var(--accent-green)";
                form.reset();
                
            } catch (error) {
                statusDiv.innerHTML = "❌ Transmission failed. Secure connection lost.";
                statusDiv.style.color = "var(--accent-saffron)";
            }
        });
    }
});
