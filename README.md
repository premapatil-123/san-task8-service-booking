# QuickBook - Service Booking System

A full-stack service booking web application built using React, TypeScript, Node.js, Express, and PostgreSQL.

## Project Overview

QuickBook allows customers to select a service, choose a date and time slot, enter their details, review their booking, and confirm it. Booking information is sent to the backend REST API and stored in a PostgreSQL database.

The application also provides a customer dashboard for viewing booking information.

## Technologies Used

### Frontend
- React
- TypeScript
- HTML
- CSS
- Vite

### Backend
- Node.js
- Express.js
- REST API
- CORS

### Database
- PostgreSQL

### Development and Testing Tools
- Visual Studio Code
- npm
- Thunder Client
- pgAdmin (if used for database management)

## Main Features

- Service selection
- Date and time-slot selection
- Customer details form
- Client-side validation
- Booking review and confirmation
- PostgreSQL database storage
- Customer dashboard
- Recent booking display
- Booking status display
- Booking status updates
- Booking deletion
- REST API integration
- Loading and error states

## Available Sample Services

1. Home Cleaning
2. Computer Repair
3. Car Wash
4. Haircut

## Available Sample Time Slots

- 10:00 AM
- 12:00 PM
- 2:00 PM
- 4:00 PM

## Booking Workflow

1. Select a service.
2. Choose a date.
3. Select a time slot.
4. Enter customer details.
5. Review the booking.
6. Confirm the booking.
7. Send the booking to the Express API.
8. Store the booking in PostgreSQL.
9. Display the confirmation and booking information on the dashboard.

## Project Structure

```text
san-task8-service-booking/
├── database/
├── public/
├── server/
├── src/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── .gitignore
└── README.md
```

## Prerequisites

Before running the application locally, install:

- Node.js and npm
- PostgreSQL or access to the configured hosted PostgreSQL database
- Visual Studio Code (recommended)

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/premapatil-123/san-task8-service-booking.git
```

### 2. Open the project folder

```bash
cd san-task8-service-booking
```

### 3. Install dependencies

```bash
npm install
```

If the backend has its own `package.json`, open the `server` folder and install its dependencies separately as required by that configuration.

### 4. Configure environment variables

Create the required local environment file based on the backend configuration.

Set the database connection string, port, authentication secret, and any other variables required by the application.

Use `.env.example` as a reference if it is provided. Replace placeholder values only in your local environment file.

**Never commit real database credentials, passwords, or authentication secrets to GitHub.**

### 5. Configure the database

Set up the PostgreSQL database using the SQL schema or database setup instructions in the `database` folder.

Make sure the backend environment variables point to the correct database.

### 6. Run the application

Use the scripts defined in the relevant `package.json` files to start the frontend and backend.

The frontend development server may be available at:

`http://localhost:5173`

The actual backend port and start command depend on the backend configuration.

## API Information

### Live Backend

`https://san-task8-service-booking.onrender.com`

### Health Check

`GET https://san-task8-service-booking.onrender.com/api/health`

The health endpoint can be used to check backend availability and database connectivity.

### Authentication

`POST /api/auth/login`

Use the login endpoint with valid registered credentials to obtain the authentication information required by protected endpoints.

### Booking Operations

The booking API supports the booking operations implemented by the backend, including viewing bookings and managing their status.

Use Thunder Client to test the actual endpoints and request formats defined in the backend routes.

## Testing

The following areas should be tested before submission:

- Service selection and booking creation
- Required-field validation
- Booking confirmation
- Database persistence
- Dashboard booking display
- Booking status updates
- Booking deletion
- Login and protected API access
- Error handling
- Desktop and mobile responsiveness

Thunder Client is used for API testing.

## Deployment

- **GitHub repository:** https://github.com/premapatil-123/san-task8-service-booking
- **Backend API:** https://san-task8-service-booking.onrender.com
- **Frontend URL:** Add the public frontend URL here if the frontend has been deployed.

The local development URL is not a public deployment URL.

## Security

- Keep secrets in environment variables.
- Do not commit `.env` files or real credentials.
- Use placeholder values in `.env.example`.
- Protect endpoints that require authentication.
- Avoid including private customer information or authentication tokens in screenshots.

## Screenshots

Create a `screenshots` folder in the project root and add screenshots of the actual application, such as:

- Service selection page
- Booking form
- Booking confirmation
- Customer dashboard
- Mobile layout
- Successful Thunder Client health check
- Successful login response with