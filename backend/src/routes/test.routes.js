import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/role.middleware.js";
import bot from "../services/telegramBot.js"
import { ROLES } from "../constants/roles.js";

const router = Router();

router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

router.get("/admin-only",authMiddleware,
  requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  (req, res) => {
    res.json({ message: "Welcome Admin", user: req.user });
  }
);

export const testTelegramAlert = async (req, res) => {

  const admin = {
    telegram_chat_id: "5849633329"
  }

  const camera = {
    camera_code: "CAM-01",
    latitude: 15.4909,
    longitude: 73.8278
  }

  const person = {
    full_name: "Test Person",
    alias: "TP",
    cases: {
      case_number: "CASE-123"
    }
  }

  const similarity = 0.87

  const mapLink = `https://maps.google.com/?q=${camera.latitude},${camera.longitude}`

  const message = `
🚨 SafeCity AI Alert

Person: ${person.full_name}
Case: ${person.cases.case_number}

Camera: ${camera.camera_code}

Confidence: ${(similarity * 100).toFixed(1)}%

Location:
${mapLink}
`

  try {

    await bot.sendMessage(admin.telegram_chat_id, message)

    res.json({ success: true })

  } catch (err) {

    console.error(err)

    res.status(500).json({ error: "Telegram failed" })

  }
}

router.get("/test-alert", testTelegramAlert)

export default router;
