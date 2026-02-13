const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files (from parent folder "kalyana-mantap")
app.use(express.static(path.join(__dirname, "..")));

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

// ===== PostgreSQL Connection =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch(err => console.error("Connection error", err.stack));
pool.on('error', (err) => {
  console.error('Unexpected Postgres error', err);
});

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  pool.query(
    "INSERT INTO users (name,email,password) VALUES ($1,$2,$3)",
    [name, email, hashed],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ msg: "Email exists or processing error" });
      }
      res.json({ msg: "Signup successful" });
    }
  );
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ msg: "Database error" });
      if (result.rows.length === 0) return res.status(400).json({ msg: "User not found" });

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ msg: "Wrong password" });

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
      res.json({ msg: "Login success", token, role: user.role });
    }
  );
});

// ================= POST BOOKING =================
app.post("/booking", (req, res) => {
  console.log("📥 Booking request body:", req.body);

  const { user_id, fullName, phone, guests, date, notes, hallName, price } = req.body;

  pool.query(
    `INSERT INTO bookings (user_id, fullName, phone, guests, date, notes, hallName, price)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [user_id, fullName, phone, guests, date, notes, hallName, price],
    (err, result) => {
      if (err) {
        console.error("❌ Postgres INSERT ERROR:", err);
        return res.status(500).json({ msg: "Database insert failed" });
      }
      console.log("✅ Booking inserted with ID:", result.rows[0].id);
      res.status(201).json({ msg: "Booking stored successfully", bookingId: result.rows[0].id });
    }
  );
});

// ================= GET BOOKINGS =================
app.get("/booking", (req, res) => {
  pool.query("SELECT * FROM bookings ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error("❌ Error fetching bookings:", err);
      return res.status(500).json({ msg: "Error fetching bookings" });
    }
    res.json(result.rows);
  });
});

// ================= FEEDBACK =================
app.post("/feedback", (req, res) => {
  const { name, email, message } = req.body;

  pool.query(
    "INSERT INTO feedback (name,email,message) VALUES ($1,$2,$3)",
    [name, email, message],
    (err) => {
      if (err) return res.status(500).json({ msg: "Error saving feedback" });
      res.json({ msg: "Feedback saved" });
    }
  );
});

// ================= ADMIN ROUTES =================
app.get("/admin/bookings", (req, res) => {
  pool.query("SELECT * FROM bookings ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ msg: "Error fetching bookings" });
    res.json(result.rows);
  });
});

app.delete("/admin/bookings/:id", (req, res) => {
  const { id } = req.params;
  pool.query("DELETE FROM bookings WHERE id = $1", [id], (err) => {
    if (err) return res.status(500).json({ msg: "Error deleting booking" });
    res.json({ msg: "Booking deleted successfully" });
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
