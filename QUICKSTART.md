# Quick Start Guide

## Overview
This repository contains a Cloudflare Worker that generates Twilio access tokens for browser-based calling.

## Files Created
- `src/index.js` - Main worker code for token generation
- `wrangler.toml` - Cloudflare Worker configuration
- `package.json` - Dependencies and scripts
- `.gitignore` - Excludes build artifacts and dependencies
- `.dev.vars.example` - Template for local environment variables
- `example.html` - Sample integration example
- `DEPLOYMENT.md` - Detailed deployment guide
- `README.md` - Full documentation

## Quick Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```

3. **Update wrangler.toml with your Twilio Account SID**

4. **Set secrets:**
   ```bash
   npx wrangler secret put TWILIO_API_KEY
   npx wrangler secret put TWILIO_API_SECRET
   npx wrangler secret put TWILIO_TWIML_APP_SID
   ```
   
   Enter your actual Twilio credentials when prompted (from the problem statement):
   - API Key SID (Friendly name: cloudflare-worker-key)
   - API Secret
   - TwiML App SID (Friendly name: Browser Dialer App)

5. **Deploy:**
   ```bash
   npm run deploy
   ```

## Test the Worker

After deployment, test with:
```bash
curl "https://your-worker-url.workers.dev?identity=testuser"
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "identity": "testuser"
}
```

## Integration

Update your HTML page to use the worker URL:

```javascript
fetch('https://your-worker-url.workers.dev?identity=myuser')
  .then(response => response.json())
  .then(data => {
    const device = new Twilio.Device(data.token);
    // Continue with Twilio setup
  });
```

See `example.html` for a complete integration example.

## Next Steps

- Review `DEPLOYMENT.md` for detailed instructions
- Review `README.md` for full documentation
- Customize `example.html` for your use case
- Consider adding authentication for production use
