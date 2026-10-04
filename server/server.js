require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Service Booking API is running"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running"
  });
});

// Database connection test
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      status: "OK",
      message: "Database connected successfully",
      time: result.rows[0].time
    });
  } catch (error) {
    console.error("Database test error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed"
    });
  }
});

// Check database and users table
app.get("/api/check-users-table", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_schema() AS schema,
        to_regclass('public.users') AS users_table
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Users table check error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Database check failed"
    });
  }
});

// Register user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: "ERROR",
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: "ERROR",
        message: "Password must be at least 8 characters long"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM public.users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "ERROR",
        message: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO public.users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), normalizedEmail, hashedPassword]
    );

    res.status(201).json({
      status: "SUCCESS",
      message: "User registered successfully",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Registration failed"
    });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: "ERROR",
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, name, email, password
       FROM public.users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "ERROR",
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        status: "ERROR",
        message: "Invalid email or password"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        status: "ERROR",
        message: "Authentication is not configured"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    res.json({
      status: "SUCCESS",
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Login failed"
    });
  }
});

// Create a booking (login required)
app.post("/api/bookings", auth, async (req, res) => {
  try {
    const {
      customer_name,
      phone,
      service,
      booking_date,
      booking_time,
      address
    } = req.body;

    if (
      !customer_name ||
      !phone ||
      !service ||
      !booking_date ||
      !booking_time ||
      !address
    ) {
      return res.status(400).json({
        status: "ERROR",
        message: "Please provide all booking details"
      });
    }

    const result = await pool.query(
      `INSERT INTO bookings
       (customer_name, phone, service, booking_date, booking_time, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, customer_name, service, booking_date,
                 booking_time, status, created_at`,
      [
        customer_name,
        phone,
        service,
        booking_date,
        booking_time,
        address
      ]
    );

    res.status(201).json({
      status: "SUCCESS",
      message: "Booking created successfully",
      booking: result.rows[0]
    });
  } catch (error) {
    console.error("Create booking error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to create booking"
    });
  }
});

// Get bookings (login required)
app.get("/api/bookings", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, customer_name, service, booking_date,
              booking_time, status, created_at
       FROM bookings
       ORDER BY created_at DESC`
    );

    res.json({
      status: "SUCCESS",
      bookings: result.rows
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch bookings"
    });
  }
});

// Update booking status (login required)
app.put("/api/bookings/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled"
    ];

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid booking ID"
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid booking status"
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2
       RETURNING id, customer_name, service, booking_date,
                 booking_time, status, created_at`,
      [status, Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Booking not found"
      });
    }

    res.json({
      status: "SUCCESS",
      message: "Booking status updated",
      booking: result.rows[0]
    });
  } catch (error) {
    console.error("Update booking error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to update booking status"
    });
  }
});

// Delete booking (login required)
app.delete("/api/bookings/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid booking ID"
      });
    }

    const result = await pool.query(
      `DELETE FROM bookings
       WHERE id = $1
       RETURNING id, customer_name, service, booking_date,
                 booking_time, status, created_at`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Booking not found"
      });
    }

    res.json({
      status: "SUCCESS",
      message: "Booking deleted successfully",
      booking: result.rows[0]
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to delete booking"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});