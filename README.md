# First Principles - Tutorial Website

A minimal, Kindle-like reading experience for collaborative learning through first principles thinking. Users can explore tutorials sourced from GitHub markdown files, managed through a simple admin panel.

## Features

### Public Website
- **Clean Reading Interface**: Kindle-inspired design optimized for focus and readability
- **Tutorial Listings**: Browse all available tutorials with metadata
- **Responsive Design**: Works seamlessly across devices
- **Markdown Rendering**: Full support for GitHub flavored markdown with syntax highlighting

### Admin Panel
- **Simple Authentication**: Secure login for content management
- **GitHub Integration**: Add tutorials by pasting GitHub markdown URLs
- **Content Management**: View and delete existing tutorials
- **Automatic Processing**: System fetches, parses, and organizes content automatically

## Getting Started

### 1. Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free tier works)

### 2. Environment Setup

Copy the `.env.local` file and update the values:

```bash
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/first-principles?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 3. Installation

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### 5. Access Admin Panel

Visit [http://localhost:3000/admin](http://localhost:3000/admin) and login with:
- **Email**: admin@example.com
- **Password**: admin123

## How It Works

1. **Admin adds content**: Paste a GitHub markdown URL in the admin panel
2. **System processes**: Automatically fetches the raw markdown from GitHub
3. **Content parsed**: Extracts title, description, author, and content
4. **Database storage**: Saves processed tutorial to MongoDB
5. **Public display**: Tutorial appears on the main website instantly

## Supported GitHub URL Formats

- `https://github.com/user/repo/blob/main/tutorial.md`
- `https://github.com/user/repo/blob/main/docs/guide.md`
- Any public GitHub markdown file

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Markdown**: react-markdown with GitHub flavored markdown support
- **Authentication**: Simple admin login system

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Homepage with tutorial listings
│   ├── tutorial/[id]/page.tsx   # Individual tutorial reading page
│   ├── admin/page.tsx           # Admin login
│   └── admin/dashboard/page.tsx # Admin management panel
├── lib/
│   ├── mongodb.ts               # Database connection
│   └── github.ts                # GitHub markdown fetching
├── models/
│   └── Tutorial.ts              # MongoDB schema
└── api/
    ├── tutorials/               # Public tutorial endpoints
    └── admin/                   # Protected admin endpoints
```

## Design Philosophy

Following Don Norman's design principles:
- **Visibility**: Clear information hierarchy and status feedback
- **Affordance**: Intuitive interactions and navigation
- **Feedback**: Loading states and success/error messages
- **Constraints**: Minimal interface reduces cognitive load
- **Consistency**: Uniform styling and behavior patterns

## Deployment

### MongoDB Atlas Setup
1. Create a free MongoDB Atlas cluster
2. Get your connection string
3. Update `MONGODB_URI` in `.env.local`

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

## Contributing

This project is designed for collaborative content creation:

1. **Content Contributors**: Share GitHub markdown URLs with the admin
2. **Developers**: Submit issues and pull requests for improvements
3. **Designers**: Suggest UX improvements while maintaining minimalist focus

## License

MIT License - Feel free to use this for your own learning projects.# first-principles-web
