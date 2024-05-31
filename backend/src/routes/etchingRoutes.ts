import express from "express";
import { createRuneToken } from "../controller/etchingController";

const router = express.Router();

// Middleware for logging requests to this router
router.use((req, res, next) => {
  console.log(`Etching request received: ${req.method} ${req.originalUrl}`);
  next();
});

router.post("/etch-token", async (req, res, next) => {
  try {
    await createRuneToken(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
