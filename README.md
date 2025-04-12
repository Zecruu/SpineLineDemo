# SpineLine - Chiropractic Clinic Management System

SpineLine is a modern, role-based chiropractic clinic management system that uses Firebase Authentication for secure user login and session management, and MongoDB Atlas as the primary data store for all application records.

## Architecture

- **Authentication Layer**: Firebase Auth
- **Database**: MongoDB Atlas
- **Backend**: Node.js/Express

## Features

- Secure authentication with Firebase
- Role-based access control (secretary, doctor, admin)
- Patient management
- Appointment scheduling
- Visit documentation
- Billing and payment processing
- Package management
- Comprehensive audit logging

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Firebase project with Authentication enabled

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables in `.env` file:
   ```
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   ```
4. Start the server:
   ```
   npm start
   ```
   For development with auto-reload:
   ```
   npm run dev
   ```

## API Documentation

### Authentication

All API endpoints require Firebase authentication. The client must include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <idToken>
```

### Endpoints

#### Users
- `GET /api/users/me` - Get current user
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only for role changes)
- `PUT /api/users/:id/deactivate` - Deactivate user (admin only)
- `PUT /api/users/:id/reactivate` - Reactivate user (admin only)

#### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `POST /api/patients/:id/insurance` - Add insurance to patient
- `POST /api/patients/:id/referral` - Add referral to patient (doctor/admin only)
- `POST /api/patients/:id/alert` - Add alert to patient

#### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/checkin` - Check in patient for appointment
- `PUT /api/appointments/:id/complete` - Mark appointment as completed (doctor/admin only)

## Security

- Authentication is validated with Firebase on every request
- Only admins can change user roles
- Secretaries cannot see doctor notes or ICD codes
- Doctors can't update billing manually
- All access/actions are logged to audit_logs

## License

This project is proprietary and confidential.