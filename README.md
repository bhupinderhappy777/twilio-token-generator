# twilio-caller-backend

Cloudflare Worker for generating Twilio access tokens to enable browser-based calling.

## Setup

### Prerequisites

1. A Cloudflare account
2. A Twilio account with:
   - Account SID
   - API Key and Secret
   - TwiML App SID

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Wrangler CLI (if not already installed):
```bash
npm install -g wrangler
```

3. Login to Cloudflare:
```bash
wrangler login
```

### Configuration

1. Update `wrangler.toml` with your Twilio Account SID:
```toml
[vars]
TWILIO_ACCOUNT_SID = "your-account-sid"
```

2. Set your Twilio secrets using Wrangler:
```bash
wrangler secret put TWILIO_API_KEY
# Enter your Twilio API Key (e.g., SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)

wrangler secret put TWILIO_API_SECRET
# Enter your Twilio API Secret

wrangler secret put TWILIO_TWIML_APP_SID
# Enter your TwiML App SID (e.g., APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
```

### Deployment

To deploy to Cloudflare Workers:

```bash
npm run deploy
```

Or using Wrangler directly:
```bash
wrangler deploy
```

### Development

To run the worker locally:

```bash
npm run dev
```

Or:
```bash
wrangler dev
```

## Usage

### Generate a Token

**GET Request:**
```bash
curl https://your-worker-url.workers.dev?identity=user123
```

**POST Request:**
```bash
curl -X POST https://your-worker-url.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"identity": "user123"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "identity": "user123"
}
```

### Integration with HTML

Use the generated token in your HTML page:

```javascript
fetch('https://your-worker-url.workers.dev?identity=myuser')
  .then(response => response.json())
  .then(data => {
    const token = data.token;
    // Initialize Twilio Device with the token
    const device = new Twilio.Device(token);
    // ... rest of your Twilio setup
  });
```

## Environment Variables

The following environment variables are required:

- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID (set in wrangler.toml)
- `TWILIO_API_KEY`: Your Twilio API Key SID (set as secret)
- `TWILIO_API_SECRET`: Your Twilio API Secret (set as secret)
- `TWILIO_TWIML_APP_SID`: Your Twilio TwiML App SID (set as secret)

## Security Notes

- Never commit secrets to version control
- Use Wrangler secrets management for sensitive data
- Consider implementing authentication/authorization for production use
- The current implementation allows CORS from any origin - restrict this in production
