GymBuddy
A smart workout planning and tracking application that helps you build personalized exercise routines, log your workouts, and maintain your fitness journey.

Features
Workout Generation: Automatically generate personalized workout plans based on your preferences
Exercise Logging: Log your exercises with sets, reps, and weights
Workout History: Track your past workouts and progress over time
Muscle Group Selection: Choose which muscle groups to target
Equipment Options: Select from available equipment for your workouts
Pattern Recognition: Smart combo selection for exercise combinations
Volume Tracking: Monitor and manage weekly training volume
Tech Stack
Frontend: React + Vite with Tailwind CSS
Backend: Node.js with Express
Database: SQLite with migrations
Build Tools: Vite, PostCSS, ESLint
Getting Started
Prerequisites
Node.js (v14 or higher)
npm or yarn
Installation
Install frontend dependencies:
cd web
npm install
Install backend dependencies:
cd ../server
npm install
Running the Application
Frontend:

cd web
npm run dev
Backend:

cd server
npm start
Project Structure
web/ - React frontend application
server/ - Node.js backend API
engine/ - Core workout generation and swap logic
muscle/ - Muscle group specific data
License
This project is licensed under the MIT License.
