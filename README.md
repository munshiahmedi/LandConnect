**# LandConnect – Land Marketplace Mobile App**

LandConnect is a mobile land marketplace application built with React Native and Expo. It allows buyers, sellers, and brokers to explore land listings, manage properties, communicate through messaging, and connect through audio and video calls.

**## Features**

**### Authentication and User Roles**
\- User registration and login
\- JWT-based authentication
\- Buyer, Seller, and Broker roles
\- Role-based access control

**### Land Listings**
\- Browse available land listings
\- View land details, descriptions, prices, and locations
\- Sellers and Brokers can create land listings
\- Edit and delete owned listings
\- Upload and display land images
\- Listing ownership verification

**### Location**
\- Capture location using device GPS
\- Store land latitude and longitude
\- Open land locations using Google Maps

Note: An embedded map inside the application is not currently implemented.

**### Messaging**
\- Buyer and Seller messaging
\- Backend messaging APIs
\- Real-time communication support through Socket.IO

**### Audio and Video Calling**
\- LiveKit-based audio and video calls
\- Incoming call handling
\- Accept and reject calls
\- End calls
\- Two-way audio and video communication
\- Private call rooms without sharing phone numbers

**### Security and Privacy**
\- JWT authentication
\- Role-based authorization
\- Listing ownership checks
\- Buyers cannot create or manage listings
\- Only Sellers and Brokers can upload listing images
\- Users cannot update or delete listings owned by other users
\- Seller phone numbers are not exposed in public listing details

**## Technology Stack**

**\*\*Frontend\*\***
\- React Native
\- Expo
\- Expo Router
\- JavaScript / TypeScript

**\*\*Backend\*\***
\- Node.js
\- Express.js
\- REST APIs
\- Socket.IO
\- JWT Authentication

**\*\*Database\*\***
\- MySQL

**\*\*Audio and Video\*\***
\- LiveKit

**\*\*Development Tools\*\***
\- Git and GitHub
\- Postman
\- VS Code
\- EAS Build

**## Project Structure**

\`\`\`text
LandConnect/
├── src/
│   └── app/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── assets/
├── app.json
├── package.json
└── README.md
\`\`\`

**## Installation and Setup**

**### Prerequisites**

\- Node.js
\- npm
\- MySQL
\- Expo development environment
\- Android device or emulator

**### 1. Clone the Repository**

\`\`\`bash
git clone [https://github.com/munshiahmedi/LandConnect.git](https://github.com/munshiahmedi/LandConnect.git)
cd LandConnect
\`\`\`

**### 2. Frontend Setup**

\`\`\`bash
npm install
\`\`\`

**### 3. Backend Setup**

\`\`\`bash
cd server
npm install
\`\`\`

Create a \`.env\` file inside the \`server\` directory and configure your local database and authentication settings.

Required configuration keys:

\`\`\`env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=landconnect_db
JWT_SECRET=your_secure_jwt_secret
\`\`\`

Configure the LiveKit credentials required by the call token service using the variable names expected by the backend.

Do not commit \`.env\` files or secret credentials to GitHub.

**### 4. Database Setup**

Create a MySQL database named:

\`\`\`sql
CREATE DATABASE landconnect_db;
\`\`\`

Import or execute the project's database schema to create the required tables.

**### 5. Start the Backend**

From the \`server\` directory:

\`\`\`bash
node server.js
\`\`\`

The backend runs on port \`5000\` by default.

**### 6. Start the Frontend**

Open a new terminal in the project root:

\`\`\`bash
npx expo start --dev-client --lan
\`\`\`

Use the development build on your Android device.

For a physical device, configure the frontend API base URL to use your computer's local network IP address instead of \`localhost\`.

**## Audio**