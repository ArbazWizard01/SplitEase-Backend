



# SplitEase Backend

SplitEase is a simple group expense sharing application.  
This is the backend server built with **Node.js**, **Express**, and **MongoDB**.

## Features
- User registration and login (with JWT authentication)
- Create and manage groups
- Add members to groups
- Members can leave groups
- (Expense management coming soon)

## Tech Stack
- Node.js
- Express.js
- MongoDB (Native driver)
- JWT for authentication
- Bcrypt for password hashing

## Getting Started
1. Clone the repo  
   `git clone https://github.com/your-username/splitease-backend.git`
2. Install dependencies  
   `npm install`
3. Set up your `.env` file:
   ```
   MONGODB_URI=your_mongo_uri
   JWT_SECRET=your_secret_key
   PORT=8000
   ```
4. Start the server  
   `npm run dev`

---

