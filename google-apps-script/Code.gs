/**
 * Google Apps Script - Code.gs
 * Backend script to handle POST requests from the website contact form
 * and append data to a Google Sheet.
 */

const SHEET_NAME = 'Enquiries'; // Make sure a sheet with this name exists
const RATE_LIMIT_MINUTES = 2; // Allow 1 request per IP/Email every X minutes

function doPost(e) {
  try {
    // 1. Basic check
    if (typeof e === 'undefined' || typeof e.postData === 'undefined') {
      throw new Error('Invalid request format.');
    }

    // 2. Parse JSON body
    const bodyString = e.postData.contents;
    const data = JSON.parse(bodyString);
    
    // Extract fields
    const name = data.name || '';
    const email = data.email || '';
    const phone = data.phone || '';
    const message = data.message || '';
    
    // Optional: Get caller IP if provided by Apps Script environment (not always reliable, fallback to email)
    const ip = e.parameter.sourceIp || email; 

    // 3. Server-side Validation
    if (!name || name.trim().length < 2 || name.length > 100) {
      return buildResponse('error', 'Invalid name length.');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 150) {
      return buildResponse('error', 'Invalid email format.');
    }
    
    if (phone && phone.length > 20) {
      return buildResponse('error', 'Phone number too long.');
    }
    
    if (!message || message.trim().length < 10 || message.length > 2000) {
      return buildResponse('error', 'Message length must be between 10 and 2000 characters.');
    }

    // 4. Rate Limiting Check
    const cache = CacheService.getScriptCache();
    const cacheKey = 'rate_limit_' + encodeURIComponent(ip);
    const cachedRequest = cache.get(cacheKey);
    
    if (cachedRequest) {
      // Too many requests
      return buildResponse('error', 'You are sending messages too quickly. Please wait a few minutes.');
    }
    
    // Set cache limit (time in seconds)
    cache.put(cacheKey, 'true', RATE_LIMIT_MINUTES * 60);

    // 5. Append to Google Sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(`Sheet named "${SHEET_NAME}" not found. Please create it.`);
    }

    // Prepare row: [Timestamp, Name, Email, Phone, Message]
    const rowData = [
      new Date(),
      sanitizeText(name),
      sanitizeText(email),
      sanitizeText(phone),
      sanitizeText(message)
    ];

    sheet.appendRow(rowData);

    // 6. Return Success
    return buildResponse('success', 'Data saved successfully.');

  } catch (error) {
    // Log error internally in Apps Script executions
    console.error(error.toString());
    
    // Return safe generic error to client
    return buildResponse('error', 'Server processing error.');
  }
}

/**
 * Handle OPTIONS requests for CORS (if needed, though client uses text/plain)
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * Helper to build JSON response
 */
function buildResponse(status, message) {
  const result = {
    status: status,
    message: message
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Basic sanitization helper to strip potential formula injections
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return text;
  // Prevent CSV injection by stripping leading =, +, -, @
  if (text.match(/^[=+\-@]/)) {
    return "'" + text;
  }
  return text.replace(/[<>]/g, ''); // Strip basic HTML tags
}
