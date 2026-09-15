# Car Portfolio by Shiftautography

A Next.js 14 automotive photography portfolio with:
- Session-based photo galleries
- Immich API integration for image storage
- Turso (SQLite) database for session metadata
- Admin dashboard for content management
- SEO-optimized pages with Open Graph tags
- Responsive design with lightbox gallery

## 🚀 Environment Variables

Create a `.env.local` file with:

```env
ADMIN_PASSWORD=your_secure_password_here
IMMICH_BASE_URL=http://your-immich-instance  # e.g., http://localhost:3003
IMMICH_API_KEY=your_immich_api_key
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
RESEND_API_KEY=re_your_resend_api_key      # For contact form emails
CONTACT_EMAIL_TO=your@email.com            # Where contact forms are sent
INSTAGRAM_URL=https://instagram.com/yourprofile
```

## 🛠️ Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Turso database**:
   - Create a new Turso DB at [turso.tech](https://turso.tech)
   - Run migrations (if needed) using your SQLite tool of choice

3. **Configure Immich**:
   - Self-host Immich or use their hosted service
   - Create an API key in Immich settings

4. **Start development**:
   ```bash
   npm run dev
   ```

## ☁️ Deploy to Vercel

1. **Push to GitHub/GitLab** and connect to Vercel
2. **Set Environment Variables** in Vercel dashboard:
   - Add all variables from `.env.local`
3. **Add Turso Database Integration**:
   - In Vercel, go to project settings > Integrations
   - Connect your Turso database
   - Enable "Preview Databases" for PRs (optional)
4. **Deploy**:
   - Vercel will automatically build and deploy on push

## ✨ Features

- **SEO Metadata**: Dynamic Open Graph tags per session
- **Admin Dashboard**: Password-protected editing of sessions
- **Responsive Gallery**: Lightbox with arrow-key navigation
- **Contact Form**: Emails sent via Resend API
- **Image Optimization**: Proxy through Next.js with immutable caching
- **Empty States**: Graceful handling of no sessions/photos

## 📁 Project Structure

```
app/
  admin/           # Admin dashboard
  api/             # API routes
  sessions/[slug]/ # Session gallery pages
  page.tsx         # Homepage
  layout.tsx       # Root layout
lib/
  db.ts            # Turso database client
  immich.ts        # Immich API client
  grouping.ts      # Session logic
components/
  SessionCard.tsx  # Homepage cards
  Lightbox.tsx     # Image lightbox
  Layout.tsx       # Main layout with nav/footer
```