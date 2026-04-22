# PoolUp Render Deployment Guide

## Prerequisites
- GitHub account with your PoolUp repo pushed
- Render account (sign up at https://render.com)
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)

---

## Step 1: Set Up MongoDB Atlas (if not already done)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project
4. Create a cluster (M0 Free tier is fine)
5. Create a database user:
   - Go to Database Access → Add New Database User
   - Username: `poolup_user`
   - Password: (generate a strong one, copy it)
6. Whitelist IP addresses:
   - Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
7. Get connection string:
   - Go to Clusters → Connect
   - Choose "Drivers" → Node.js
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `poolup`
   - Example: `mongodb+srv://poolup_user:PASSWORD@cluster0.xxxxx.mongodb.net/poolup?retryWrites=true&w=majority`

---

## Step 2: Create Render Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Select the PoolUp repo
   - Branch: `main` (or your default branch)
4. Configure the service:
   - **Name**: `poolup` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter)

---

## Step 3: Set Environment Variables

On the Render dashboard, go to your service → Environment tab and add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `PORT` | `3000` | Default |
| `NODE_ENV` | `production` | Important for security |
| `MONGODB_URI` | MongoDB Atlas connection string | From Step 1 |
| `JWT_SECRET` | A random strong string (e.g., `your-very-secret-jwt-key-change-this`) | Use a strong random value |
| `ADMIN_EMAIL` | `admin@university.edu` | Change if desired |
| `ADMIN_PASSWORD` | A strong password | Change from default |
| `EMAIL_USER` | `tamannachopra001@gmail.com` | Your Gmail |
| `EMAIL_PASS` | Your Gmail App Password | See below for Gmail setup |
| `REDIS_URL` | (Optional) Redis connection string | See Step 4 if using Redis |

---

## Step 4: Gmail Configuration for Email

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail → Windows Computer
   - Copy the generated 16-character password
3. Use this password as `EMAIL_PASS` in Render environment

---

## Step 5: Optional - Add Redis (Render Key-Value Store)

If you want Redis caching/pub-sub on Render:

1. In Render dashboard, click **"New +"** → **"Redis"**
2. Configure:
   - **Name**: `poolup-redis`
   - **Plan**: Free
3. After creation, copy the Redis URL (Internal or External URL)
4. In your Web Service Environment, add:
   - **REDIS_URL**: Paste the Redis URL

---

## Step 6: Deploy

1. On the Render dashboard, your Web Service should auto-deploy when you push to GitHub
2. To manually trigger:
   - Go to your Web Service → Click **"Deploy Latest"**
3. Monitor the deployment:
   - Go to **Logs** tab
   - Look for: `✅ MongoDB Connected`
   - Look for: `✅ Redis Connected` (if configured)
   - Look for: `🚀 Server running on port 3000`

---

## Step 7: Access Your App

Your app will be live at: `https://poolup.onrender.com` (or your custom domain)

**Test it:**
1. Visit the URL
2. Register a new account
3. Login
4. Create a carpool offer
5. Check your email for notifications

---

## Troubleshooting

### MongoDB Connection Failed
- Check MongoDB Atlas connection string is correct
- Verify IP whitelist includes `0.0.0.0/0`
- Check database user credentials

### Emails Not Sending
- Verify Gmail App Password (not regular password)
- Check EMAIL_USER and EMAIL_PASS are set
- Gmail may need "Less secure apps" or App Passwords enabled

### Redis Connection Failed (if using Redis)
- Verify REDIS_URL is correct
- Redis is optional - app still works without it

### Admin Login Not Working
- Verify ADMIN_EMAIL and ADMIN_PASSWORD are set
- Clear browser cookies and try again

---

## Important Notes

1. **Free Plan Limits:**
   - Render free tier: Spins down after 15 minutes of inactivity
   - MongoDB Atlas free: 512MB storage, 5 connections
   - Redis free: 30MB memory

2. **Production Recommendations:**
   - Use paid Render plans for always-on service
   - Set up a custom domain
   - Enable auto-deployment from GitHub
   - Monitor app logs regularly

3. **Environment Variables Should Never Be in Code**
   - Keep .env local only
   - Use Render environment variables instead

---

## Next Steps

1. Set up MongoDB Atlas (Step 1)
2. Create Render Web Service (Step 2)
3. Add all environment variables (Step 3)
4. Deploy and test
5. Share your live URL!
