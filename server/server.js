
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Service Booking API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");
    res.json({
      status: "OK",
      message: "Database connected successfully",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
    });
  }
});

// Register
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
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: "ERROR",
        message: "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await pool.query(
      "SELECT id FROM public.users WHERE email = $1",
      [normalizedEmail]
    );

    if (existing.rows.length) {
      return res.status(409).json({
        status: "ERROR",
        message: "Email is already registered",
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
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Registration failed",
    });
  }
});

// Login
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
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password
       FROM public.users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        status: "ERROR",
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: "ERROR",
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({
        status: "ERROR",
        message: "Authentication is not configured",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      status: "SUCCESS",
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Login failed",
    });
  }
});

// Create booking
app.post("/api/bookings", auth, async (req, res) => {
  try {
    const {
      customer_name,
      phone,
      service,
      booking_date,
      booking_time,
      address,
    } = req.body;

    if (
      typeof customer_name !== "string" ||
      typeof phone !== "string" ||
      typeof service !== "string" ||
      typeof booking_date !== "string" ||
      typeof booking_time !== "string" ||
      typeof address !== "string" ||
      !customer_name.trim() ||
      !phone.trim() ||
      !service.trim() ||
      !booking_date.trim() ||
      !booking_time.trim() ||
      !address.trim()
    ) {
      return res.status(400).json({
        status: "ERROR",
        message: "Please provide all booking details",
      });
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({
        status: "ERROR",
        message: "Please enter a valid 10-digit phone number",
      });
    }

    const result = await pool.query(
      `INSERT INTO public.bookings
       (user_id, customer_name, phone, service,
        booking_date, booking_time, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, customer_name, phone,
                 service, booking_date, booking_time,
                 address, status, created_at`,
      [
        req.user.id,
        customer_name.trim(),
        phone.trim(),
        service.trim(),
        booking_date,
        booking_time,
        address.trim(),
      ]
    );

    res.status(201).json({
      status: "SUCCESS",
      message: "Booking created successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to create booking",
    });
  }
});

// Get logged-in user's bookings, including address
app.get("/api/bookings", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, customer_name, phone,
              service, booking_date, booking_time,
              address, status, created_at
       FROM public.bookings
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    console.log(
      "Booking address check:",
      result.rows.map((b) => ({ id: b.id, address: b.address }))
    );

    res.status(200).json({
      status: "SUCCESS",
      bookings: result.rows.map((booking) => ({
        ...booking,
        address: booking.address ?? "",
      })),
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch bookings",
    });
  }
});

// Update booking status
app.put("/api/bookings/:id/status", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid booking ID",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid booking status",
      });
    }

    const result = await pool.query(
      `UPDATE public.bookings
       SET status = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, customer_name, phone,
                 service, booking_date, booking_time,
                 address, status, created_at`,
      [status, Number(id), req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: "ERROR",
        message: "Booking not found",
      });
    }

    res.json({
      status: "SUCCESS",
      message: "Booking status updated",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to update booking status",
    });
  }
});

// Delete booking
app.delete("/api/bookings/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Invalid booking ID",
      });
    }

    const result = await pool.query(
      `DELETE FROM public.bookings
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, customer_name, phone,
                 service, booking_date, booking_time,
                 address, status, created_at`,
      [Number(id), req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: "ERROR",
        message: "Booking not found",
      });
    }

    res.json({
      status: "SUCCESS",
      message: "Booking deleted successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Failed to delete booking",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
