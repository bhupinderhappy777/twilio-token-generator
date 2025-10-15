# Deployment Guide

This guide walks you through deploying the Twilio token generation worker to Cloudflare.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

## Step 3: Update Configuration

Edit `wrangler.toml` and replace `your-account-sid` with your actual Twilio Account SID:

```toml
[vars]
TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## Step 4: Set Secrets

Set your Twilio secrets using the following commands:

```bash
npx wrangler secret put TWILIO_API_KEY
```
When prompted, enter your Twilio API Key (e.g., `SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

```bash
npx wrangler secret put TWILIO_API_SECRET
```
When prompted, enter your Twilio API Secret (e.g., `your_api_secret_here`)

```bash
npx wrangler secret put TWILIO_TWIML_APP_SID
```
When prompted, enter your TwiML App SID (e.g., `APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Step 5: Deploy

```bash
npm run deploy
```

Or:

```bash
npx wrangler deploy
```

## Step 6: Test

After deployment, Wrangler will provide a URL like:
```
https://twilio-caller-backend.<your-subdomain>.workers.dev
```

Test the endpoint:

```bash
curl "https://twilio-caller-backend.<your-subdomain>.workers.dev?identity=testuser"
```

You should receive a JSON response with a token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "identity": "testuser"
}
```

## Step 7: Update Your HTML Page

Update the `WORKER_URL` in your HTML page (or in `example.html`) with your deployed worker URL:

```javascript
const WORKER_URL = 'https://twilio-caller-backend.<your-subdomain>.workers.dev';
```

## Local Development

For local development, create a `.dev.vars` file based on `.dev.vars.example`:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and fill in your actual values, then run:

```bash
npm run dev
```

This will start a local development server at `http://localhost:8787`

## Troubleshooting

### Error: Missing environment variables

Make sure all secrets are set:
```bash
npx wrangler secret list
```

You should see:
- TWILIO_API_KEY
- TWILIO_API_SECRET
- TWILIO_TWIML_APP_SID

### Error: Authentication failed

Check that your API Key and Secret are correct in the Cloudflare dashboard under Workers & Pages > Your Worker > Settings > Variables.

### CORS errors

The worker is configured to allow CORS from any origin. If you need to restrict this, modify the `getCORSHeaders()` function in `src/index.js`.
