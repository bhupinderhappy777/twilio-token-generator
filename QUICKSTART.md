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
   
   Use your actual values:
   - API Key SID: `SK78b457c9ce6bfcdddc2326c3c25d146c`
   - API Secret: `gJ8Cs8fyVXvQVRgBk3xdEtSdKbrwG6cY`
   - TwiML App SID: `AP96fdf2fad91e02ef564d5353a7fd67a0`

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
