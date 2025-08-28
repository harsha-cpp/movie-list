# MovieList - Full-Stack Movie Wishlist App

A simple and modern full-stack web application for managing movie wishlists with admin functionality.

## Features

### User Features
- **Google OAuth Authentication** - Secure sign-in with Google
- **Movie Browsing** - View all available movies with ratings and details
- **Personal Wishlist** - Add/remove movies from your personal watch-later list
- **Responsive Design** - Beautiful UI built with Tailwind CSS and shadcn/ui

### Admin Features
- **Movie Management** - Add, edit, and delete movies
- **Wishlist Analytics** - View which users have wishlisted specific movies
- **Admin Dashboard** - Comprehensive overview of all movies and user activity

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google OAuth
- **File Storage**: AWS S3 for movie poster images
- **UI Components**: shadcn/ui components with Lucide icons

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/movie-list

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Configuration
ADMIN_EMAIL=your-admin-email@example.com

# AWS S3 Configuration (for image uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
```

### 3. MongoDB Setup

**Option 1: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Database will be created automatically

**Option 2: MongoDB Atlas (Cloud)**
- Create a free MongoDB Atlas account
- Create a cluster and get connection string
- Replace `MONGODB_URI` with your Atlas connection string

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to your `.env.local`

### 5. AWS S3 Setup (for Image Uploads)

1. Create an AWS account if you don't have one
2. Create an S3 bucket named `moviesdb-bucket`
3. Create an IAM user with S3 permissions
4. Generate Access Key ID and Secret Access Key
5. Add the credentials to your `.env.local`

**Required S3 Permissions:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::moviesdb-bucket/*"
        }
    ]
}
```

### 6. Admin Access

You can configure one or multiple admin users:

**For multiple admins (recommended):**
- Set `ADMIN_EMAILS` in `.env.local` with comma-separated emails:
  ```
  ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com,poornikavanta06@gmail.com,sudeepthi924@gmail.com
  ```

**For single admin (legacy):**
- Set `ADMIN_EMAIL` in `.env.local` to your Google account email
- This email will have admin privileges to manage movies

**Note:** Admin users get access to:
- Add, edit, and delete movies
- View wishlist analytics
- Upload movie posters to S3

### 7. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Users
1. Visit the homepage and click "Sign In with Google"
2. Browse movies on the `/movies` page
3. Add movies to your wishlist using the heart button
4. View your wishlist at `/wishlist`

### For Admins
1. Sign in with the admin email configured in environment variables
2. Access admin features through the navigation bar:
   - **Admin: Movies** - Add, edit, delete movies
   - **Admin: Wishlists** - View wishlist analytics

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── movies/            # Movie listing page
│   ├── wishlist/          # User wishlist page
│   └── login/             # Login page
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions
├── models/                # MongoDB models
└── public/                # Static assets
```

## API Endpoints

- `GET /api/movies` - Get all movies
- `POST /api/movies` - Add new movie (admin only)
- `PUT /api/movies/[id]` - Update movie (admin only)
- `DELETE /api/movies/[id]` - Delete movie (admin only)
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add movie to wishlist
- `DELETE /api/wishlist` - Remove movie from wishlist
- `GET /api/admin/wishlists` - Get wishlist analytics (admin only)
- `POST /api/upload` - Upload movie poster images to S3 (admin only)

## Database Models

### User
- email, name, image, googleId, isAdmin, timestamps

### Movie
- title, description, releaseYear, genre, imageUrl, imageKey, rating, timestamps

### Wishlist
- userId (ref to User), movieId (ref to Movie), timestamps

## Contributing

This is a learning demo project. Feel free to fork and modify for your own use!

## License

MIT License