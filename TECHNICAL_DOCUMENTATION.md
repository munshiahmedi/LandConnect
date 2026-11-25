## 1. Project Overview

LandConnect is a mobile-based land marketplace application designed to connect land buyers, sellers, and brokers.

The application allows users to register, log in, explore land listings, manage their own listings, communicate with other users, and conduct audio/video calls through meeting rooms.

The project was developed as a functional mobile application prototype using React Native, Expo, Node.js, Express.js, and MySQL-compatible database services.

## 2. Technologies and Frameworks

### Mobile Application
- React Native
- Expo
- Expo Router
- TypeScript / JavaScript
- React Native WebView
- Expo Secure Store

### Backend
- Node.js
- Express.js
- REST APIs
- Socket.IO
- JSON Web Token (JWT)
- bcrypt

### Database
- TiDB Cloud (MySQL-compatible database)
- MySQL2

### Third-Party Services
- Cloudinary – image storage and delivery
- LiveKit – real-time audio and video communication
- Render – backend hosting
- EAS Build – Android application build
- OpenStreetMap and Leaflet – embedded map display

### Development Tools
- Visual Studio Code
- Git and GitHub
- Postman
- Expo CLI
- EAS CLI

## 3. Application Architecture

LandConnect follows a client-server architecture.

### Mobile Application
The React Native application provides the user interface. Users interact with authentication, land listings, images, maps, messaging, meeting rooms, and calling features.

### Backend Server
The Express.js backend handles API requests, authentication, authorization, land listing operations, image-related operations, messaging, and LiveKit token generation.

### Database
The MySQL-compatible database stores application information, including users, land listings, image references, and messages.

### External Services
- Cloudinary stores uploaded listing images and provides secure image URLs.
- LiveKit provides real-time audio/video communication.
- Render hosts the backend API.
- EAS Build generates the Android application package.

## 4. Main Features and Implementation

### 4.1 User Authentication
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- User roles: Buyer, Seller, and Broker.
- Protected API routes.

### 4.2 Land Listings
- Explore available land listings.
- View individual land details.
- Add new listings.
- Update and delete listings.
- Ownership checks for listing operations.

### 4.3 Image Upload and Display
- Listing images are uploaded to Cloudinary.
- The backend stores the image URLs in the database.
- The mobile application retrieves and displays listing images.

### 4.4 Location and Embedded Map
- Location information is associated with land listings.
- An embedded map is displayed inside the application using React Native WebView, OpenStreetMap, and Leaflet.

### 4.5 Messaging
- Users can communicate through the application's messaging functionality.
- Message data is stored in the database.
- Socket.IO is used for real-time communication events.

### 4.6 Meeting Rooms
- Users can access the meeting-room interface.
- Users can create and join meeting rooms.
- The meeting functionality connects with the calling implementation.

### 4.7 Audio and Video Calling
- LiveKit is integrated for real-time audio/video communication.
- The backend generates room access tokens.
- Participants can join a room and communicate through audio or video.
- Calling functionality was tested using two devices.

## 5. Database Design

The application uses a MySQL-compatible database hosted on TiDB Cloud.

The main database tables include:

| Table | Purpose |
|---|---|
| users | Stores user account and role information |
| lands | Stores land listing details |
| land_images | Stores land image URLs and related listing references |
| messages | Stores user messages |

The database uses relationships between users, listings, images, and messages to organize application data.

## 6. Backend API and Security

The backend exposes REST API routes, including:

- `/api/auth` – authentication-related operations
- `/api/lands` – land listing operations
- `/api/messages` – messaging operations
- `/api/calls/token` – LiveKit room token generation

Security measures include:
- Password hashing with bcrypt.
- JWT authentication for protected routes.
- Role-based access restrictions.
- Ownership validation for listing operations.
- Environment variables for sensitive configuration.
- Authentication checks for protected backend operations.

Sensitive credentials and API secrets are not included in the GitHub repository.

## 7. Deployment and Execution

### Backend Deployment
The backend is deployed on Render.

Backend URL:
https://landconnect-1yni.onrender.com

### Database
The application uses TiDB Cloud with a MySQL-compatible connection.

### Mobile Application
The Android application is built using Expo Application Services (EAS Build).

### Local Backend Setup

1. Clone the GitHub repository.
2. Open the project folder.
3. Navigate to the `server` directory.
4. Install dependencies:

```bash
npm install
```

5. Configure the required environment variables in a local `.env` file. Use your own credentials and configuration values.

```env
PORT=5000
DB_HOST=your_database_host
DB_PORT=4000
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=landconnect_db
DB_SSL=true
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

6. Start the backend using:

```bash
npm start
```

### Mobile Application Setup

1. Open the project root directory.
2. Install dependencies:

```bash
npm install
```

3. Start the Expo development server:

```bash
npx expo start
```

Use the appropriate development build to run the application.

## 8. Key Implementation Decisions

- React Native and Expo were selected to develop the Android mobile application.
- Express.js was used to create REST APIs and manage backend operations.
- JWT was selected for authentication.
- bcrypt was used to securely hash passwords.
- TiDB Cloud was used for MySQL-compatible database hosting.
- Cloudinary was selected for cloud-based image storage.
- LiveKit was integrated to support real-time audio/video communication.
- Socket.IO was used for communication events.
- OpenStreetMap and Leaflet were used to implement the embedded map.

## 9. Major Technical Challenges

During development, the following technical challenges were addressed:

1. **Backend and Database Connection:** Configuring the deployed backend to communicate with the cloud-hosted MySQL-compatible database.

2. **Mobile and Backend Integration:** Updating API configurations so that the mobile application communicates with the deployed backend.

3. **Cloud Image Handling:** Integrating Cloudinary uploads and displaying the returned image URLs in the mobile application.

4. **Native Mobile Dependencies:** Configuring native modules such as React Native WebView and using an appropriate Expo development or standalone build.

5. **Real-Time Communication:** Integrating LiveKit token generation and testing meeting-room audio/video communication across two devices.

6. **Deployment Configuration:** Managing environment variables and deployment settings for the backend and external services.

## 10. Testing and Verification

The following application workflows were tested:

- User registration and login.
- Land listing exploration and management.
- Cloudinary image display.
- Embedded map display.
- Meeting-room creation and joining on two devices.
- Messaging and chat.
- Audio and video calling using two devices.

Testing was performed on the mobile application and the deployed backend.

## 11. Development Approach

The project was developed incrementally:

1. Set up the mobile application and backend structure.
2. Implement user authentication and role handling.
3. Develop land listing APIs and mobile screens.
4. Integrate database operations.
5. Add Cloudinary image upload and display.
6. Implement location and map functionality.
7. Develop messaging and meeting-room interfaces.
8. Integrate LiveKit audio/video calling.
9. Deploy the backend and configure the mobile application.
10. Test the main application workflows.

## 12. Repository

GitHub Repository:

https://github.com/munshiahmedi/LandConnect

---

**Project:** LandConnect – Land Marketplace Mobile Application  
**Platform:** Android  
**Project Type:** Technical Assignment / Functional Prototype
:::