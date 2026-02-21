# Skillfinix 🚀

**Skillfinix** is a modern, interactive e-learning and skill-bartering platform designed to empower users to teach, learn, and connect. It combines traditional course management with a unique **Skill Bartering** system, allowing users to exchange knowledge directly.

## ✨ Key Features

### 🎓 Learn & Discover
-   **Course Enrollment**: Browse courses, enroll, and track your progress with real-time updates.
-   **Interactive Video Player**: Watch course videos with tracked watch time and auto-completion.
-   **Global Search**: Instantly find courses, instructors, and peers using the powerful search bar.
-   **Trending & Explore**: Discover popular content and browse categories.
-   **Personalized Dashboard**: View "In Progress" courses, recommended content, and recent activity.

### 🎥 Creator Studio
-   **Upload & Manage**: Instructors can upload video courses with thumbnails, descriptions, and tags.
-   **Studio Analytics**: Track total views, watch time, and student enrollment in real-time.
-   **Content Management**: Edit or delete your courses directly from the studio.

### 🤝 Skill Bartering & Community
-   **Skill Barter System**: Find users who want to learn what you teach, and vice-versa.
-   **Real-Time Chat**: Connect instantly with peers using the integrated chat system (Socket.io).
-   **File Sharing**: Share resources and images within the chat.

### 👤 User Experience
-   **Interactions**: Like, Favorite, and add courses to "Watch Later".
-   **History**: A dedicated history page to resume where you left off.
-   **Notifications**: Real-time alerts for enrollments, achievements, and messages.
-   **Profile Customization**: Update your avatar, bio, skills (Can Teach), and interests (Wants to Learn).

---

## 🛠️ Tech Stack

### **Frontend**
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS, Shadcn UI
-   **Icons**: Lucide React
-   **Animations**: Framer Motion
-   **State Management**: Context API (Auth, App, Socket)
-   **HTTP Client**: Axios

### **Backend**
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Real-Time**: Socket.io
-   **Authentication**: JWT (JSON Web Tokens)
-   **Storage**: Cloudinary (for images and videos)

---

## 🚀 Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/Sanjeev-Chakaravarthy/Skillfinix.git
cd Skillfinix
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5005
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173

# Cloudinary Config (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:
```bash
npm start
```
*The server will run on `http://localhost:5005` (or your specified PORT).*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```
*The app will generally open at `http://localhost:8080`.*

> **Note**: The frontend is currently configured to look for the API at `http://localhost:5005/api`. If you change the backend port, please update `frontend/src/api/axios.js`.

---

## 📂 Project Structure

```
skillup-hub-main/
├── backend/                # Node.js/Express Backend
│   ├── config/             # Database & Cloudinary config
│   ├── controllers/        # Route logic (Auth, Course, Chat, etc.)
│   ├── models/             # Mongoose Schemas (User, Course, Interaction, etc.)
│   ├── routes/             # API Routes
│   ├── socket/             # Socket.io handlers
│   └── server.js           # Entry point
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── api/            # Axios setup
│   │   ├── components/     # Reusable UI components (Navbar, Sidebar, Cards)
│   │   ├── context/        # Global State (Auth, App, Socket)
│   │   ├── Layouts/        # MainLayout, StudioLayout
│   │   ├── pages/          # Application Pages (Home, Studio, Chat, etc.)
│   │   └── App.jsx         # Main Routing
│   └── vite.config.js      # Vite Configuration
│
└── README.md               # You are here!
```

## 🤝 Contribution

Contributions are welcome! Please fork the repository and create a pull request for any feature enhancements or bug fixes.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
