
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Service Booking API is running",
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is healthy",
  });
});

// ==========================================
// DATABASE TEST
// ==========================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
    });
  }
});

// ==========================================
// CREATE BOOKING
// ==========================================

app.post("/api/bookings", async (req, res) => {
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
      !customer_name ||
      !phone ||
      !service ||
      !booking_date ||
      !booking_time ||
      !address
    ) {
      return res.status(400).json({
        status: "ERROR",
        message: "All booking fields are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO bookings
      (
        customer_name,
        phone,
        service,
        booking_date,
        booking_time,
        address
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        customer_name,
        phone,
        service,
        booking_date,
        booking_time,
        address,
      ]
    );

    res.status(201).json({
      status: "OK",
      message: "Booking created successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to create booking",
    });
  }
});

// ==========================================
// GET ALL BOOKINGS
// PRIVATE DETAILS ARE NOT INCLUDED
// ==========================================

app.get("/api/bookings", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        customer_name,
        service,
        booking_date,
        booking_time,
        status,
        created_at
       FROM bookings
       ORDER BY created_at DESC`
    );

    res.json({
      status: "OK",
      bookings: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to fetch bookings",
    });
  }
});

// ==========================================
// UPDATE BOOKING STATUS
// ==========================================

app.put("/api/bookings/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "ERROR",
        message:
          "Invalid status. Allowed values are Pending, Confirmed, Completed, Cancelled",
      });
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Booking not found",
      });
    }

    res.json({
      status: "OK",
      message: "Booking status updated successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to update booking status",
    });
  }
});

// ==========================================
// DELETE BOOKING
// ==========================================

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM bookings
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "ERROR",
        message: "Booking not found",
      });
    }

    res.json({
      status: "OK",
      message: "Booking deleted successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      message: "Failed to delete booking",
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});