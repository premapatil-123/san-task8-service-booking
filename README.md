# QuickBook - Service Booking System

A full-stack service booking web application developed using React, TypeScript, Node.js, Express, and PostgreSQL.

## Project Overview

QuickBook is a service booking system that allows customers to select a service, choose a date and time slot, enter their details, review the booking, and confirm the booking.

After confirmation, the booking is sent to the Node.js and Express backend and stored in a PostgreSQL database.

The application also provides a customer dashboard for viewing booking information.

---

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

### Development Tools
- Visual Studio Code
- pgAdmin
- npm

---

## Main Features

- Service selection
- Date selection
- Time-slot selection
- Customer details form
- Client-side validation
- Booking review
- Booking confirmation
- PostgreSQL database storage
- Customer dashboard
- Recent booking display
- Booking status display
- REST API for booking operations
- Error handling
- Loading states

---

## Available Services

The application currently provides the following sample services:

1. Home Cleaning
2. Computer Repair
3. Car Wash
4. Haircut

---

## Available Time Slots

The application provides sample booking time slots:

- 10:00 AM
- 12:00 PM
- 2:00 PM
- 4:00 PM

---

## Booking Flow

The application follows this complete booking journey:

```text
Service Selection
       ↓
Date Selection
       ↓
Time Slot Selection
       ↓
Customer Details
       ↓
Review Booking
       ↓
Confirm Booking
       ↓
Node.js + Express API
       ↓
PostgreSQL Database
       ↓
Booking Confirmation
       ↓
Customer Dashboard