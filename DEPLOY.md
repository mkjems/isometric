# Deno Deploy Setup Guide

This guide will help you deploy the Isometric Multiplayer Game to Deno Deploy.

## Prerequisites

1. A [Deno Deploy](https://deno.com/deploy) account (sign up with GitHub)
2. Your game built and ready in the `dist/` directory
3. Code pushed to a GitHub repository

## Pre-Deployment Steps

### Prepare Your Repository

Ensure your code is pushed to GitHub. **Note:** The `dist/` directory is gitignored - Deno Deploy will build it automatically during deployment.

## Deployment Options

### Option A: Deploy via GitHub Integration (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Deno Deploy"
   git push origin main
   ```

2. **Connect to Deno Deploy:**
   - Go to [dash.deno.com](https://dash.deno.com)
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Authorize Deno Deploy to access your repository
   - Select your repository: `mkjems/isometric`

3. **Configure the deployment:**
   - **Entry Point:** `server/main.ts`
   - **Production Branch:** `main`
   - **Build Step:** `npm install && npm run build`
   - Click "Deploy"

4. **Automatic Deployments:**
   - Every push to `main` will trigger a new deployment
   - Deno Deploy will automatically build and redeploy your app

### Option B: Deploy via Deno CLI

1. **Install Deno CLI** (if not already installed):
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Login to Deno Deploy:**
   ```bash
   deno deploy --token=<your-token>
   ```
   Get your token from: https://dash.deno.com/account#access-tokens

3. **Deploy the project:**
   ```bash
   deno deploy --project=<your-project-name> server/main.ts
   ```

### Option C: Deploy via `deployctl`

1. **Install deployctl:**
   ```bash
   deno install -A --no-check -r -f https://deno.land/x/deploy/deployctl.ts
   ```

2. **Deploy:**
   ```bash
   deployctl deploy --project=<your-project-name> server/main.ts
   ```

## Important Configuration

### Environment Variables

Deno Deploy automatically sets the `PORT` environment variable. The server is now configured to use it:

```typescript
const PORT = parseInt(Deno.env.get("PORT") || "8000");
```

### Permissions

The server requires these permissions (automatically granted on Deno Deploy):
- `--allow-net` - For HTTP and WebSocket connections
- `--allow-read` - For serving static files from `dist/`
- `--allow-env` - For reading the PORT environment variable

### Static Files

The server serves static files from the `dist/` directory, which is built automatically during deployment. The `dist/` directory is gitignored and created fresh on each deployment via the build step.

## Post-Deployment

### 1. Access Your Game

After deployment, Deno Deploy will provide a URL like:
```
https://<your-project-name>.deno.dev
```

### 2. Test Multiplayer

Open two browser tabs/windows with:
```
https://<your-project-name>.deno.dev?multiplayer=true
```

Both players should connect and play together!

### 3. Monitor Logs

View real-time logs in the Deno Deploy dashboard:
- Go to your project
- Click "Logs" tab
- Monitor WebSocket connections and game sessions

## Troubleshooting

### Issue: "File not found" errors

**Solution:** Ensure the build step is configured in Deno Deploy:
- Go to your project settings
- Add build command: `npm install && npm run build`
- Redeploy the project

### Issue: WebSocket connection fails

**Solution:** Make sure your client code uses the correct WebSocket URL. For production, it should detect the hostname automatically:
```typescript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}`;
```

### Issue: Port conflicts

**Solution:** The server now uses `Deno.env.get("PORT")` which Deno Deploy sets automatically. No manual configuration needed.

## Rebuilding and Redeploying

Whenever you make changes to the frontend or backend:

1. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update game"
   git push
   ```

2. **Deno Deploy will automatically:**
   - Pull the latest code
   - Run `npm install && npm run build`
   - Restart the server with the new code

## Project Structure

```
isometric/
├── server/           # Deno backend (multiplayer server)
│   ├── main.ts      # Entry point for Deno Deploy ⭐
│   ├── game-loop.ts
│   ├── game-session.ts
│   └── websocket-handler.ts
├── dist/            # Built frontend (created by build step, gitignored)
│   ├── index.html
│   ├── assets/
│   └── ...
├── src/             # Frontend source
├── deno.json        # Deno configuration ⭐
└── .deployignore    # Files to exclude from deployment
```

## Custom Domain (Optional)

To use a custom domain:

1. Go to your project in Deno Deploy dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update your DNS records as instructed

## Cost

Deno Deploy offers:
- **Free Tier:** 100,000 requests/day, 100 GB bandwidth/month
- Perfect for small to medium multiplayer games
- See [pricing](https://deno.com/deploy/pricing) for details

## Need Help?

- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [Deno Discord](https://discord.gg/deno)
- Check the game logs in Deno Deploy dashboard

---

**Happy Deploying! 🚀**
