import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

/* Get Tasks */
app.get("/tasks", async (req, res) => {
  const tasks = await db.query("SELECT * FROM tasks WHERE active=true");
  res.json(tasks.rows);
});

/* Submit Screenshot (URL for now) */
app.post("/submit", async (req, res) => {
  const { telegram_id, task_id, screenshot } = req.body;

  const user = await db.query(
    "INSERT INTO users (telegram_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id",
    [telegram_id]
  );

  const uid = user.rows[0]?.id ||
    (await db.query("SELECT id FROM users WHERE telegram_id=$1", [telegram_id])).rows[0].id;

  await db.query(
    "INSERT INTO submissions (user_id, task_id, screenshot) VALUES ($1,$2,$3)",
    [uid, task_id, screenshot]
  );

  res.json({ success: true });
});

/* Admin: Pending */
app.get("/admin/submissions", async (req, res) => {
  const data = await db.query(`
    SELECT s.id, u.telegram_id, t.amount, s.screenshot
    FROM submissions s
    JOIN users u ON u.id=s.user_id
    JOIN tasks t ON t.id=s.task_id
    WHERE s.status='pending'
  `);
  res.json(data.rows);
});

/* Approve */
app.post("/admin/approve", async (req, res) => {
  const { id } = req.body;

  const s = await db.query(`
    SELECT s.user_id, t.amount
    FROM submissions s
    JOIN tasks t ON t.id=s.task_id
    WHERE s.id=$1
  `,[id]);

  await db.query("UPDATE submissions SET status='approved' WHERE id=$1",[id]);
  await db.query("UPDATE users SET balance = balance + $1 WHERE id=$2",
    [s.rows[0].amount, s.rows[0].user_id]);

  res.json({ approved:true });
});

app.listen(3000);
