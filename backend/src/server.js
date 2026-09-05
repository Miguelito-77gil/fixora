const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const db = require("./db/database");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `repairer-${req.user?.id || "unknown"}-${Date.now()}${ext}`);
  },
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// ==========================================
// AUTH MIDDLEWARE
// ==========================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  });
}

function requireAdmin(req, res, next) {
  const user = db
    .prepare("SELECT role FROM users WHERE id = ?")
    .get(req.user.id);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

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

    if (!normalizedEmail.endsWith("@gmail.com")) {
      return res.status(400).json({
        error: "Only Gmail addresses are allowed to register",
      });
    }

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
        SELECT id, name, email, role, verification_status, created_at
        FROM users
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      user,
      token,
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
        SELECT id, name, email, password, role, verification_status, created_at
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
      role: user.role,
      verification_status: user.verification_status,
      created_at: user.created_at,
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Failed to login",
    });
  }
});

// GET CURRENT USER (protected - requires valid token)
app.get("/api/auth/me", authenticateToken, (req, res) => {
  try {
    const user = db
      .prepare(`
        SELECT id, name, email, role, verification_status, created_at
        FROM users
        WHERE id = ?
      `)
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      error: "Failed to fetch user",
    });
  }
});

// ==========================================
// REPAIRER APPLICATION
// ==========================================

// APPLY TO BECOME A REPAIRER (protected - any logged-in user)
app.post("/api/repairers/apply", authenticateToken, (req, res) => {
  try {
    const { category, bio, years_experience, location, price, phone } = req.body;

    if (!category?.trim()) {
      return res.status(400).json({
        error: "Category is required",
      });
    }

    const existingProfile = db
      .prepare("SELECT id FROM repairer_profiles WHERE user_id = ?")
      .get(req.user.id);

    if (existingProfile) {
      return res.status(409).json({
        error: "You have already applied to become a repairer",
      });
    }

    const autoVerified = years_experience != null && Number(years_experience) >= 5;
    const initialStatus = autoVerified ? "verified" : "pending";

    db.prepare(`
      UPDATE users
      SET role = 'repairer', verification_status = ?
      WHERE id = ?
    `).run(initialStatus, req.user.id);

    db.prepare(`
      INSERT INTO repairer_profiles (user_id, category, bio, years_experience)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, category.trim(), bio || null, years_experience || null);

    res.status(201).json({
      message: autoVerified
        ? "Repairer application approved automatically based on experience."
        : "Repairer application submitted. Awaiting verification.",
      autoVerified,
    });
  } catch (error) {
    console.error("Repairer application error:", error);

    res.status(500).json({
      error: "Failed to submit application",
    });
  }
});

// UPDATE OWN REPAIRER PROFILE (protected)
app.put("/api/repairers/me", authenticateToken, (req, res) => {
  try {
    const { category, bio, years_experience, location, price, phone, available } = req.body;

    const profile = db
      .prepare("SELECT id FROM repairer_profiles WHERE user_id = ?")
      .get(req.user.id);

    if (!profile) {
      return res.status(404).json({
        error: "No repairer profile found for this account",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        error: "Category is required",
      });
    }

    db.prepare(`
      UPDATE repairer_profiles
      SET category = ?, bio = ?, years_experience = ?, location = ?, price = ?, phone = ?, available = ?
      WHERE user_id = ?
    `).run(
      category.trim(),
      bio || null,
      years_experience || null,
      location || null,
      price || null,
      phone || null,
      available ? 1 : 0,
      req.user.id
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update repairer profile error:", error);

    res.status(500).json({
      error: "Failed to update profile",
    });
  }
});

// GET OWN REPAIRER PROFILE (protected)
app.get("/api/repairers/me", authenticateToken, (req, res) => {
  try {
    const profile = db
      .prepare(`
        SELECT category, bio, years_experience, location, price, phone, photo_url, available
        FROM repairer_profiles
        WHERE user_id = ?
      `)
      .get(req.user.id);

    if (!profile) {
      return res.status(404).json({
        error: "No repairer profile found for this account",
      });
    }

    res.json(profile);
  } catch (error) {
    console.error("Get own repairer profile error:", error);

    res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
});

// UPLOAD OWN REPAIRER PHOTO (protected)
app.post(
  "/api/repairers/me/photo",
  authenticateToken,
  uploadPhoto.single("photo"),
  (req, res) => {
    try {
      const profile = db
        .prepare("SELECT id FROM repairer_profiles WHERE user_id = ?")
        .get(req.user.id);

      if (!profile) {
        return res.status(404).json({
          error: "No repairer profile found for this account",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "No photo file was uploaded",
        });
      }

      const photoUrl = `/uploads/${req.file.filename}`;

      db.prepare(`
        UPDATE repairer_profiles
        SET photo_url = ?
        WHERE user_id = ?
      `).run(photoUrl, req.user.id);

      res.json({
        message: "Photo uploaded successfully",
        photo_url: photoUrl,
      });
    } catch (error) {
      console.error("Upload repairer photo error:", error);

      res.status(500).json({
        error: "Failed to upload photo",
      });
    }
  }
);

// ==========================================
// PORTFOLIO
// ==========================================

// ADD A PORTFOLIO PHOTO (protected)
app.post(
  "/api/repairers/me/portfolio",
  authenticateToken,
  uploadPhoto.single("photo"),
  (req, res) => {
    try {
      const profile = db
        .prepare("SELECT id FROM repairer_profiles WHERE user_id = ?")
        .get(req.user.id);

      if (!profile) {
        return res.status(404).json({
          error: "No repairer profile found for this account",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "No photo file was uploaded",
        });
      }

      const { caption } = req.body;
      const imageUrl = `/uploads/${req.file.filename}`;

      const result = db.prepare(`
        INSERT INTO portfolio_items (user_id, image_url, caption)
        VALUES (?, ?, ?)
      `).run(req.user.id, imageUrl, caption?.trim() || null);

      const item = db
        .prepare("SELECT * FROM portfolio_items WHERE id = ?")
        .get(result.lastInsertRowid);

      res.status(201).json(item);
    } catch (error) {
      console.error("Add portfolio item error:", error);

      res.status(500).json({
        error: "Failed to add portfolio item",
      });
    }
  }
);

// GET OWN PORTFOLIO (protected)
app.get("/api/repairers/me/portfolio", authenticateToken, (req, res) => {
  try {
    const items = db
      .prepare(`
        SELECT * FROM portfolio_items
        WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .all(req.user.id);

    res.json(items);
  } catch (error) {
    console.error("Get own portfolio error:", error);

    res.status(500).json({
      error: "Failed to fetch portfolio",
    });
  }
});

// DELETE A PORTFOLIO ITEM (protected)
app.delete("/api/repairers/me/portfolio/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const item = db
      .prepare("SELECT * FROM portfolio_items WHERE id = ?")
      .get(id);

    if (!item || item.user_id !== req.user.id) {
      return res.status(404).json({
        error: "Portfolio item not found",
      });
    }

    db.prepare("DELETE FROM portfolio_items WHERE id = ?").run(id);

    const filePath = path.join(uploadsDir, path.basename(item.image_url));
    fs.unlink(filePath, () => {});

    res.json({ message: "Portfolio item deleted" });
  } catch (error) {
    console.error("Delete portfolio item error:", error);

    res.status(500).json({
      error: "Failed to delete portfolio item",
    });
  }
});

// GET A REPAIRER'S PORTFOLIO (public)
app.get("/api/repairers/:id/portfolio", (req, res) => {
  try {
    const { id } = req.params;

    const items = db
      .prepare(`
        SELECT * FROM portfolio_items
        WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .all(id);

    res.json(items);
  } catch (error) {
    console.error("Get public portfolio error:", error);

    res.status(500).json({
      error: "Failed to fetch portfolio",
    });
  }
});

// ==========================================
// PUBLIC REPAIRERS
// ==========================================

// GET ALL VERIFIED REPAIRERS (public)
app.get("/api/repairers", (req, res) => {
  try {
    const repairers = db
      .prepare(`
        SELECT
          u.id,
          u.name,
          u.email,
          u.created_at,
          rp.category,
          rp.bio,
          rp.years_experience,
          rp.location,
          rp.price,
          rp.phone,
          rp.photo_url,
          rp.available,
          COALESCE(ROUND(AVG(rv.rating), 1), 0) AS rating,
          COUNT(rv.id) AS reviews
        FROM users u
        JOIN repairer_profiles rp
          ON rp.user_id = u.id
        LEFT JOIN reviews rv
          ON rv.repairer_id = u.id
        WHERE u.role = 'repairer'
          AND u.verification_status = 'verified'
        GROUP BY
          u.id,
          u.name,
          u.email,
          u.created_at,
          rp.category,
          rp.bio,
          rp.years_experience,
          rp.location,
          rp.price,
          rp.phone,
          rp.photo_url,
          rp.available
        ORDER BY u.created_at DESC
      `)
      .all();

    res.json(repairers);
  } catch (error) {
    console.error("Get public repairers error:", error);

    res.status(500).json({
      error: "Failed to fetch repairers",
    });
  }
});

// ==========================================
// ADMIN
// ==========================================

// GET REPAIRERS (protected - admin only), optional ?status=pending|verified|rejected
app.get("/api/admin/repairers", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.verification_status, u.created_at,
             rp.category, rp.bio, rp.years_experience
      FROM users u
      JOIN repairer_profiles rp ON rp.user_id = u.id
      WHERE u.role = 'repairer'
    `;
    const params = [];

    if (status) {
      query += " AND u.verification_status = ?";
      params.push(status);
    }

    query += " ORDER BY u.created_at DESC";

    const repairers = db.prepare(query).all(...params);

    res.json(repairers);
  } catch (error) {
    console.error("Get repairers error:", error);

    res.status(500).json({
      error: "Failed to fetch repairers",
    });
  }
});

// VERIFY / REJECT A REPAIRER (protected - admin only)
app.put("/api/admin/repairers/:id/verify", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        error: "Status must be 'verified' or 'rejected'",
      });
    }

    const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(id);

    if (!user || user.role !== "repairer") {
      return res.status(404).json({ error: "Repairer not found" });
    }

    db.prepare("UPDATE users SET verification_status = ? WHERE id = ?").run(status, id);

    res.json({ message: `Repairer ${status}` });
  } catch (error) {
    console.error("Verify repairer error:", error);

    res.status(500).json({
      error: "Failed to update verification status",
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
        SELECT id, name, email, role, verification_status, created_at
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

// ==========================================
// CUSTOMER PROFILE
// ==========================================

app.get("/api/users/me", authenticateToken, (req, res) => {
  try {
    const user = db
      .prepare(`
        SELECT id, name, email, role, verification_status, phone, created_at
        FROM users
        WHERE id = ?
      `)
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get customer profile error:", error);

    res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
});

app.put("/api/users/me", authenticateToken, (req, res) => {
  try {
    const { phone } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({
        error: "Only customers can update this profile",
      });
    }

    const cleanPhone = String(phone || "").trim();

    if (!cleanPhone) {
      return res.status(400).json({
        error: "Mobile number is required",
      });
    }

    if (!/^[0-9+()\-\s]{7,20}$/.test(cleanPhone)) {
      return res.status(400).json({
        error: "Please enter a valid mobile number",
      });
    }

    db.prepare(`
      UPDATE users
      SET phone = ?
      WHERE id = ?
    `).run(cleanPhone, req.user.id);

    const user = db
      .prepare(`
        SELECT id, name, email, role, verification_status, phone, created_at
        FROM users
        WHERE id = ?
      `)
      .get(req.user.id);

    res.json({
      message: "Mobile number updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update customer profile error:", error);

    res.status(500).json({
      error: "Failed to update profile",
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


/* =========================
   REPAIR REQUESTS
========================= */

app.post("/api/repair-requests", authenticateToken, (req, res) => {
  try {
    const { repairer_id, service, description } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({
        error: "Only customers can create repair requests",
      });
    }

    if (!repairer_id || !service?.trim()) {
      return res.status(400).json({
        error: "Repairer and service are required",
      });
    }

    const repairer = db.prepare(`
      SELECT u.id, u.name, u.role, u.verification_status, rp.available
      FROM users u
      JOIN repairer_profiles rp ON rp.user_id = u.id
      WHERE u.id = ? AND u.role = 'repairer'
    `).get(repairer_id);

    if (!repairer) {
      return res.status(404).json({
        error: "Repairer not found",
      });
    }

    if (repairer.verification_status !== "verified") {
      return res.status(400).json({
        error: "This repairer is not verified",
      });
    }

    if (repairer.available === 0) {
      return res.status(400).json({
        error: "This repairer is currently unavailable",
      });
    }

    const result = db.prepare(`
      INSERT INTO repair_requests (
        customer_id,
        repairer_id,
        service,
        description
      )
      VALUES (?, ?, ?, ?)
    `).run(
      req.user.id,
      repairer_id,
      service.trim(),
      description?.trim() || null
    );

    const request = db.prepare(`
      SELECT
        rr.*,
        customer.name AS customer_name,
        repairer.name AS repairer_name
      FROM repair_requests rr
      JOIN users customer ON customer.id = rr.customer_id
      JOIN users repairer ON repairer.id = rr.repairer_id
      WHERE rr.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(request);
  } catch (error) {
    console.error("Create repair request error:", error);

    res.status(500).json({
      error: "Failed to create repair request",
    });
  }
});


app.get("/api/repair-requests/mine", authenticateToken, (req, res) => {
  try {
    let requests;

    if (req.user.role === "customer") {
      requests = db.prepare(`
        SELECT
          rr.*,
          u.name AS repairer_name,
          rp.category AS repairer_category,
          rp.photo_url AS repairer_photo,
          CASE
            WHEN rr.status IN ('accepted', 'on_the_way', 'arrived', 'in_progress', 'completed')
            THEN rp.phone
            ELSE NULL
          END AS repairer_phone
        FROM repair_requests rr
        JOIN users u ON u.id = rr.repairer_id
        LEFT JOIN repairer_profiles rp ON rp.user_id = u.id
        WHERE rr.customer_id = ?
        ORDER BY rr.created_at DESC
      `).all(req.user.id);
    } else if (req.user.role === "repairer") {
      requests = db.prepare(`
        SELECT
          rr.*,
          u.name AS customer_name,
          CASE
            WHEN rr.status IN ('accepted', 'on_the_way', 'arrived', 'in_progress', 'completed')
            THEN u.phone
            ELSE NULL
          END AS customer_phone
        FROM repair_requests rr
        JOIN users u ON u.id = rr.customer_id
        WHERE rr.repairer_id = ?
        ORDER BY rr.created_at DESC
      `).all(req.user.id);
    } else {
      requests = [];
    }

    res.json(requests);
  } catch (error) {
    console.error("Get repair requests error:", error);

    res.status(500).json({
      error: "Failed to fetch repair requests",
    });
  }
});


app.put("/api/repair-requests/:id/status", authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    const requestId = Number(req.params.id);

    const allowedStatuses = [
      "pending",
      "accepted",
      "on_the_way",
      "arrived",
      "in_progress",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    const request = db.prepare(`
      SELECT *
      FROM repair_requests
      WHERE id = ?
    `).get(requestId);

    if (!request) {
      return res.status(404).json({
        error: "Repair request not found",
      });
    }

    if (
      req.user.role === "repairer" &&
      request.repairer_id !== req.user.id
    ) {
      return res.status(403).json({
        error: "You cannot update this repair request",
      });
    }

    if (
      req.user.role === "customer" &&
      request.customer_id !== req.user.id
    ) {
      return res.status(403).json({
        error: "You cannot update this repair request",
      });
    }

    if (
      req.user.role !== "repairer" &&
      status !== "cancelled"
    ) {
      return res.status(403).json({
        error: "Only the repairer can update this status",
      });
    }

    if (status === "completed") {
      db.prepare(`
        UPDATE repair_requests
        SET status = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, requestId);
    } else {
      db.prepare(`
        UPDATE repair_requests
        SET status = ?
        WHERE id = ?
      `).run(status, requestId);
    }

    const updated = db.prepare(`
      SELECT *
      FROM repair_requests
      WHERE id = ?
    `).get(requestId);

    res.json(updated);
  } catch (error) {
    console.error("Update repair request error:", error);

    res.status(500).json({
      error: "Failed to update repair request",
    });
  }
});


/* =========================
   REVIEWS
========================= */

app.post("/api/reviews", authenticateToken, (req, res) => {
  try {
    const { repair_request_id, rating, comment } = req.body;
    const requestId = Number(repair_request_id);
    const numericRating = Number(rating);

    if (req.user.role !== "customer") {
      return res.status(403).json({
        error: "Only customers can submit reviews",
      });
    }

    if (
      !requestId ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    const request = db.prepare(`
      SELECT *
      FROM repair_requests
      WHERE id = ?
    `).get(requestId);

    if (!request) {
      return res.status(404).json({
        error: "Repair request not found",
      });
    }

    if (request.customer_id !== req.user.id) {
      return res.status(403).json({
        error: "You cannot review this repair request",
      });
    }

    if (request.status !== "completed") {
      return res.status(400).json({
        error: "You can only review completed repairs",
      });
    }

    const existingReview = db.prepare(`
      SELECT id
      FROM reviews
      WHERE repair_request_id = ?
    `).get(requestId);

    if (existingReview) {
      return res.status(400).json({
        error: "You have already reviewed this repair",
      });
    }

    const result = db.prepare(`
      INSERT INTO reviews (
        repair_request_id,
        customer_id,
        repairer_id,
        rating,
        comment
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
      requestId,
      req.user.id,
      request.repairer_id,
      numericRating,
      comment?.trim() || null
    );

    const review = db.prepare(`
      SELECT
        r.*,
        u.name AS customer_name
      FROM reviews r
      JOIN users u ON u.id = r.customer_id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);

    res.status(500).json({
      error: "Failed to submit review",
    });
  }
});


app.get("/api/repairers/:id/reviews", (req, res) => {
  try {
    const repairerId = Number(req.params.id);

    const reviews = db.prepare(`
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS customer_name
      FROM reviews r
      JOIN users u ON u.id = r.customer_id
      WHERE r.repairer_id = ?
      ORDER BY r.created_at DESC
    `).all(repairerId);

    const summary = db.prepare(`
      SELECT
        COUNT(*) AS total_reviews,
        COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating
      FROM reviews
      WHERE repairer_id = ?
    `).get(repairerId);

    res.json({
      summary,
      reviews,
    });
  } catch (error) {
    console.error("Get repairer reviews error:", error);

    res.status(500).json({
      error: "Failed to fetch reviews",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Fixora backend running on port ${PORT}`);
});
