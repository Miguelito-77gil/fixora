const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = require("./db/database");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Fixora API is running",
    database: "SQLite",
  });
});

// ==========================================
// AUTHENTICATION
// ==========================================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db
      .prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `)
      .run(
        name.trim(),
        normalizedEmail,
        hashedPassword
      );

    const user = db
      .prepare(`
        SELECT id, name, email, created_at
        FROM users
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      error: "Failed to register user",
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = db
      .prepare(`
        SELECT id, name, email, password, created_at
        FROM users
        WHERE email = ?
      `)
      .get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };

    res.json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Failed to login",
    });
  }
});

// ==========================================
// USERS
// ==========================================

// GET USERS
app.get("/api/users", (req, res) => {
  try {
    const users = db
      .prepare(`
        SELECT id, name, email, created_at
        FROM users
        ORDER BY id DESC
      `)
      .all();

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
});

// CREATE USER
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db
      .prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `)
      .run(
        name.trim(),
        normalizedEmail,
        hashedPassword
      );

    const user = db
      .prepare(`
        SELECT id, name, email, created_at
        FROM users
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create user",
    });
  }
});

// ==========================================
// REPORTS
// ==========================================

// GET REPORTS
app.get("/api/reports", (req, res) => {
  try {
    const reports = db
      .prepare(`
        SELECT *
        FROM reports
        ORDER BY id DESC
      `)
      .all();

    res.json(reports);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch reports",
    });
  }
});

// CREATE REPORT
app.post("/api/reports", (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const result = db
      .prepare(`
        INSERT INTO reports (user_id, title, description)
        VALUES (?, ?, ?)
      `)
      .run(
        user_id || null,
        title.trim(),
        description || null
      );

    const report = db
      .prepare(`
        SELECT *
        FROM reports
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    res.status(201).json(report);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create report",
    });
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Fixora backend running on port ${PORT}`);
});

