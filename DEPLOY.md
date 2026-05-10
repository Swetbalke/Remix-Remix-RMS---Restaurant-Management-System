# RMS Enterprise - Deployment Guide

## Quick Deploy to Render

### Option 1: Manual Deploy (Recommended)

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "FoodZone features and fixes"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - Build Command: `npm install && npx prisma generate && npm run build`
     - Start Command: `npx tsx server.ts`
   - Add these Environment Variables:
     - `MONGODB_URL`: `mongodb+srv://swetbalke2005_db_user:8clJNCSNGRVviNK3@cluster0.sowtcqz.mongodb.net/rms_database?retryWrites=true&w=majority&appName=Cluster0`
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `JWT_SECRET`: `rms-enterprise-secret-key-prod-2024`
     - `GEMINI_API_KEY`: `YOUR_API_KEY`
   - Click "Create Web Service"

3. **Auto-Deploy Setup**
   - In Render dashboard, enable "Auto-Deploy" for your service
   - Every push to main branch will auto-deploy

### Option 2: Using render.yaml

1. Push `render.yaml` to your GitHub repository
2. In Render, click "New" → "Blueprint"
3. Connect your GitHub and select the repository
4. Render will automatically create the service

## Database Setup (One-time)

After deployment, run the seed script to create menu items:

```bash
npm run setup
```

This will:
- Create admin user: `swetbalke2005@gmail.com` / `admin123`
- Create FoodZone categories (Breakfast, Burger, Pizza, Salad, Dessert, Drinks)
- Create 24 menu items with emojis
- Create 6 restaurant tables

## Test the APIs

- Menu API: `https://your-render-app.onrender.com/api/customer/menu`
- Categories: `https://your-render-app.onrender.com/api/categories`
- Place Order: `https://your-render-app.onrender.com/api/customer/orders`

## FoodZone Categories Mapping

The frontend expects these categories:
- `all` → All categories
- `breakfast` → Breakfast items
- `burger` → Burger items
- `pizza` → Pizza items
- `salad` → Salad items
- `dessert` → Dessert items
- `drinks` → Drinks items

All menu items include:
- Emoji icons for each dish
- Rating and review counts
- Preparation time
- Tags (Popular, Bestseller, etc.)

## Troubleshooting

**Issue: "My Google AI Studio App" shows**
- This means a different app is deployed on that URL
- Create a new service with a different name
- Or delete existing service and redeploy

**Issue: Menu shows empty**
- Run `npm run setup` to seed the database
- Check MongoDB connection in Render logs

**Issue: API returns 500**
- Check environment variables are set
- Check MongoDB URI is correct