# Indian Civic Affairs Network (i-can)

Indian Civic Affairs Network is a web platform designed to facilitate secure communication and political partnership opportunities. It features advanced client-side sanitization, strict Content Security Policies, and dynamic 3D elements to create a modern, secure, and engaging user experience.

## Features

- **Secure Communications:** Integrated secure contact forms with honeypot validation and backend connection via Google Apps Script.
- **Dynamic 3D Engine:** Engaging visual elements powered by a custom 3D light engine (`engine-3d-light.js`).
- **Modern Responsive Design:** Glassmorphism UI, smooth animations, and mobile-responsive layouts.
- **Civic Services & Dashboards:** Detailed pages outlining civic technology services and political partnership opportunities.

## Technologies Used

- HTML5 / CSS3 (Vanilla, custom styles with CSS Variables)
- Vanilla JavaScript
- Google Apps Script (for secure backend form handling and Google Sheets integration)

## Setup

This is a static website. You can run it by simply opening the HTML files in a browser or by serving it via a local static web server.

1. Clone the repository:
   ```bash
   git clone https://github.com/himanshu1246/ican.git
   ```
2. Open `index.html` in your web browser.

## Contact Form Integration

The contact form is connected to a Google Sheet using Google Apps Script. 
To set up your own backend:
1. Create a Google Sheet and add headers (`timestamp`, `name`, `email`, `message`) to the first row.
2. Add the provided Apps Script code and deploy it as a Web App.
3. Update `FORM_ENDPOINT` in `js/form-handler.js` with your Web App URL.

## License

&copy; 2026 Indian Civic Affairs Network. All Rights Reserved.
