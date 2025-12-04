# ResQ Connect - Emergency Response System

A production-grade safety portal where users can report emergencies with text, photos, or audio. The system routes alerts to appropriate administrators based on location and integrates with ML services for danger assessment.

## Tech Stack

### Frontend
- React (Vite)
- TailwindCSS
- Zustand (State Management)
- React Router DOM
- Socket.IO Client
- Axios
- Lucide React (Icons)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO Server
- JWT Authentication
- AWS S3 (Media Storage)
- Mailtrap (Email)
- Multer + Multer-S3 (File Uploads)

## Features

✅ **User Registration** - Name, Email, Password, Phone, City, State, Aadhar  
✅ **Role-Based Access** - User, City Admin, State Admin, Central Admin, News Admin  
✅ **Emergency SOS** - Text, Photo (Camera/Upload), Audio Recording  
✅ **Smart Alert Routing** - Based on City/State/Central hierarchy  
✅ **Real-time Alerts** - Socket.IO with blinking red/white screen  
✅ **Email Notifications** - Via Mailtrap  
✅ **ML Integration** - Placeholder for external ML service  
✅ **Admin Dashboard** - Manage alerts, send help, mark completed  
✅ **User Reviews** - Rate response after completion  
✅ **News Publishing** - Public news feed for safety updates  

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or MongoDB Atlas)
- AWS S3 Account (for media storage)
- Mailtrap Account (for email testing)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/resqq
JWT_SECRET=your_secret_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_password
ML_SERVICE_URL=http://localhost:5001/api/ml-mock
```

4. Start MongoDB:
```bash
mongod
```

5. Run backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Usage Guide

### 1. Register Users
- Open `http://localhost:5173/register`
- Create accounts with different roles:
  - **User** - Can create SOS reports
  - **City Admin** - Manages alerts for their city
  - **State Admin** - Manages alerts for their state
  - **Central Admin** - Manages all alerts
  - **News Admin** - Can publish news

### 2. Create Emergency SOS (User)
- Login as a user
- Click "REPORT EMERGENCY" or navigate to `/post/new`
- Choose mode:
  - **Text** - Type emergency description
  - **Photo** - Capture from camera or upload
  - **Audio** - Record audio message
- Submit SOS

### 3. Receive & Manage Alerts (Admin)
- Login as admin (city/state/central)
- When high-danger SOS is created, you'll see:
  - Full-screen red/white blinking alert
  - Audio notification
  - Alert details
- Click "ACKNOWLEDGE & VIEW"
- Navigate to Dashboard
- Manage alert:
  - **Investigate** - Mark as under investigation
  - **Send Help** - Add situation details and mark help sent
  - **Mark Completed** - Close the case

### 4. Review Response (User)
- Login as user
- Go to "My Posts"
- Click on completed post
- Add rating (1-5 stars) and review

### 5. Publish News (News Admin)
- Login as news admin or central admin
- Navigate to "Create News"
- Enter title and content
- Publish
- View on public `/news` page

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (Protected)

### Posts (SOS)
- `POST /api/posts` - Create SOS (Protected, Multipart)
- `GET /api/posts/my` - Get user's posts (Protected)
- `GET /api/posts/:id` - Get post details (Protected)
- `PUT /api/posts/:id/review` - Add review (Protected, User only)

### Admin
- `GET /api/admin/alerts` - Get alerts (Protected, Admin only)
- `POST /api/admin/posts/:id/status` - Update post status (Protected, Admin only)
- `POST /api/admin/broadcast` - Broadcast alert (Protected, Admin only)

### News
- `GET /api/news` - Get all news (Public)
- `POST /api/news` - Create news (Protected, News Admin only)

## Socket Events

### Client → Server
- `join_room` - Join role-based room `{ role, city, state }`

### Server → Client
- `new_alert` - New high-danger SOS alert
- `broadcast_msg` - Manual broadcast from admin
- `post_update` - Post status update

## Project Structure

```
resqq/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## ML Integration

The system includes a placeholder for ML integration:

1. Backend sends POST request to `ML_SERVICE_URL` with:
```json
{
  "content": "text or media URL",
  "type": "text|image|audio"
}
```

2. ML service should return:
```json
{
  "danger_score": 0-100,
  "tags": ["fire", "medical", "urgent"]
}
```

3. Currently uses mock endpoint at `/api/ml-mock` that returns random scores

## Deployment

### Backend
- Deploy to AWS EC2, Heroku, or Railway
- Use MongoDB Atlas for production database
- Configure environment variables
- Set up PM2 for process management

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- Update API URLs in production

## Security Notes

⚠️ **Important for Production:**
- Change `JWT_SECRET` to a strong random string
- Use real AWS credentials (not placeholders)
- Enable CORS only for your frontend domain
- Implement rate limiting
- Add input validation and sanitization
- Use HTTPS in production
- Implement proper error handling
- Add logging and monitoring

## License

MIT

## Support

For issues or questions, please contact the development team.
