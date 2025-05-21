import express, { Request, Response, Router } from "express";
import pool from "../db";
import asyncHandler from "../middlewares/asyncHandler";

const router: Router = express.Router();

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

type UserInput = Omit<User, "id"> & { password: string };

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstname, lastname, email, password]
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Error creating user
 */
router.post(
  "/",
  asyncHandler(async (req: Request<{}, {}, UserInput>, res: Response) => {
    const { firstname, lastname, email, password, role } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO users (firstname, lastname, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, firstname, lastname, email, role`,
        [firstname, lastname, email, password, role || "user"]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Error creating user" });
    }
  })
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error fetching users
 */
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        "SELECT id, firstname, lastname, email, role FROM users"
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Error fetching users" });
    }
  })
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching user
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "SELECT id, firstname, lastname, email, role FROM users WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Error fetching user" });
    }
  })
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { firstname, lastname, email, role } = req.body;

    try {
      const result = await pool.query(
        `UPDATE users 
       SET firstname = $1, lastname = $2, email = $3, role = $4
       WHERE id = $5 
       RETURNING id, firstname, lastname, email, role`,
        [firstname, lastname, email, role, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "Error updating user" });
    }
  })
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id, firstname, lastname, email, role",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User deleted", user: result.rows[0] });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Error deleting user" });
    }
  })
);

export default router;
