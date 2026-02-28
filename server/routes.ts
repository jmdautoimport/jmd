import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import express from "express";
import multer from "multer";
import { storage } from "./storage";
import { insertCarSchema } from "@shared/schema";
import { z } from "zod";
import { upload, getImageUrl, extractFilenameFromUrl } from "./upload";
import type { Request, Response } from "express";
import { sendEmail, generateInquiryEmailContent, generateBookingEmailContent } from "./email";

// In-memory registry of admin device tokens
const adminTokens = new Set<string>();

const requireAdmin = (req: Request, res: Response, next: any) => {
  const secret = req.headers["x-admin-secret"];
  const adminSecret = process.env.ADMIN_API_SECRET;

  if (!adminSecret || secret !== adminSecret) {
    return res.status(401).json({ error: "Unauthorized: Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server | void> {
  // Serve attached_assets folder statically (includes uploads and generated_images)
  // Only in non-serverless environments (local dev)
  if (process.env.VERCEL !== "1") {
    const assetsPath = path.resolve(import.meta.dirname, "..", "attached_assets");
    app.use("/attached_assets", express.static(assetsPath));
  }

  // Test endpoint to verify route registration
  app.get("/api/upload/test", (req, res) => {
    res.json({ message: "Upload route is working" });
  });

  // Upload single image endpoint
  app.post("/api/upload/image", requireAdmin, (req, res, next) => {
    console.log("Upload route hit - Content-Type:", req.headers['content-type']);
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large. Maximum size is 5MB" });
          }
          return res.status(400).json({ error: err.message });
        }
        if (err) {
          return res.status(400).json({ error: err.message || "Upload failed" });
        }
        return next(err);
      }

      try {
        if (!req.file) {
          console.log("No file in request");
          return res.status(400).json({ error: "No image file provided" });
        }
        console.log("File uploaded successfully:", req.file.filename || "in-memory");
        const imageUrl = await getImageUrl(req.file.filename || req.file.buffer, req.file);
        const filename = req.file.filename || extractFilenameFromUrl(imageUrl) || "unknown";
        res.json({ url: imageUrl, filename });
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
        res.status(500).json({ error: errorMessage });
      }
    });
  });

  // Upload multiple images endpoint
  app.post("/api/upload/images", requireAdmin, async (req, res, next) => {
    upload.array("images", 10)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File too large. Maximum size is 5MB" });
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ error: "Too many files. Maximum is 10 files" });
          }
          return res.status(400).json({ error: err.message });
        }
        if (err) {
          return res.status(400).json({ error: err.message || "Upload failed" });
        }
        return next(err);
      }

      try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
          return res.status(400).json({ error: "No image files provided" });
        }
        const files = Array.isArray(req.files) ? req.files : [req.files];
        const urls = await Promise.all(
          files.map(async (file: any) => {
            const url = await getImageUrl(file.filename || file.buffer, file);
            const filename = file.filename || extractFilenameFromUrl(url) || "unknown";
            return { url, filename };
          })
        );
        res.json({ urls });
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload images";
        res.status(500).json({ error: errorMessage });
      }
    });
  });

  app.get("/api/cars", async (_req, res) => {
    try {
      const cars = await storage.getAllCars();
      res.json(cars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/by-slug/:slug", async (req, res) => {
    try {
      const car = await storage.getCarBySlug(req.params.slug);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch car" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const car = await storage.getCar(req.params.id);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCarSchema.parse(req.body);
      const car = await storage.createCar(validatedData);
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid car data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create car" });
    }
  });

  app.patch("/api/cars/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCarSchema.parse(req.body);
      const car = await storage.updateCar(req.params.id, validatedData);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid car data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update car" });
    }
  });

  app.delete("/api/cars/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCar(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete car" });
    }
  });

  // Register an admin device token for push notifications
  app.post("/api/notify/register-token", requireAdmin, (req: Request, res: Response) => {
    const token = (req.body && (req.body as any).token) as string | undefined;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Missing 'token' in body" });
    }
    adminTokens.add(token);
    const count = adminTokens.size;
    res.json({ ok: true, count });
  });

  // List registered admin tokens (for diagnostics)
  app.get("/api/notify/admin/tokens", requireAdmin, (_req: Request, res: Response) => {
    res.json({ tokens: Array.from(adminTokens) });
  });

  // Specialized notification for inquiries
  app.post("/api/notify/inquiry", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const { title, text } = generateInquiryEmailContent(data);
      const adminEmail = process.env.ADMIN_EMAIL;

      if (!adminEmail) {
        console.warn("ADMIN_EMAIL is missing in server environment - skipping email notification");
      } else {
        // 1. Send Email (non-blocking for the API response if we want, but here we wait and catch)
        try {
          await sendEmail({
            to: adminEmail,
            subject: title,
            text: text,
          });
        } catch (emailErr) {
          console.error("Email notification failed:", emailErr);
        }
      }

      // 2. Send Push Notification
      try {
        const tokens = Array.from(adminTokens);
        if (tokens.length > 0 && process.env.FCM_SERVER_KEY) {
          const payload = {
            registration_ids: tokens,
            notification: { title, body: text.substring(0, 100) + "..." },
            priority: "high",
          };
          await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              Authorization: `key=${process.env.FCM_SERVER_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        }
      } catch (fcmErr) {
        console.error("FCM notification failed:", fcmErr);
      }

      // Always return 200 OK if the request was processed, even if sub-notifications failed
      res.json({ ok: true });
    } catch (error: any) {
      console.error("Inquiry notification route error:", error);
      // We still return 200 to ensure the client doesn't block the user's success state
      res.json({ ok: false, error: error.message });
    }
  });

  // Specialized notification for bookings
  app.post("/api/notify/booking", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const { title, text } = generateBookingEmailContent(data);
      const adminEmail = process.env.ADMIN_EMAIL;

      if (!adminEmail) {
        console.warn("ADMIN_EMAIL is missing in server environment - skipping email notification");
      } else {
        // 1. Send Email
        try {
          await sendEmail({
            to: adminEmail,
            subject: title,
            text: text,
          });
        } catch (emailErr) {
          console.error("Email notification failed:", emailErr);
        }
      }

      // 2. Send Push Notification
      try {
        const tokens = Array.from(adminTokens);
        if (tokens.length > 0 && process.env.FCM_SERVER_KEY) {
          const payload = {
            registration_ids: tokens,
            notification: { title, body: text.substring(0, 100) + "..." },
            priority: "high",
          };
          await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              Authorization: `key=${process.env.FCM_SERVER_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        }
      } catch (fcmErr) {
        console.error("FCM notification failed:", fcmErr);
      }

      res.json({ ok: true });
    } catch (error: any) {
      console.error("Booking notification route error:", error);
      res.json({ ok: false, error: error.message });
    }
  });

  // Send a push notification to all registered admin devices
  app.post("/api/notify/admin", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { title, body, data } = (req.body || {}) as {
        title?: string;
        body?: string;
        data?: Record<string, string>;
      };
      const tokens = Array.from(adminTokens);
      if (tokens.length === 0) {
        return res.status(200).json({ ok: true, message: "No admin push tokens registered" });
      }
      const serverKey = process.env.FCM_SERVER_KEY;
      if (!serverKey) {
        return res.status(500).json({ error: "FCM_SERVER_KEY not configured" });
      }

      const payload = {
        registration_ids: tokens,
        notification: {
          title: title || "Admin Notification",
          body: body || "",
        },
        data: data || {},
        priority: "high",
      };

      const resp = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          Authorization: `key=${serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await resp.json().catch(() => ({ ok: false }));
      if (!resp.ok) {
        return res.status(resp.status).json({ error: "FCM send failed", result: json });
      }
      res.json({ ok: true, result: json });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to send notification" });
    }
  });

  // Only create HTTP server in non-serverless environments
  if (process.env.VERCEL !== "1") {
    const httpServer = createServer(app);
    return httpServer;
  }
  // For Vercel, just return void
  return;
}
