console.log("Telegram bot file loaded")
import TelegramBot from "node-telegram-bot-api"
import prisma from "../db/prisma.js"

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true
})

console.log("Telegram bot polling started")

bot.on("message", (msg) => {
  console.log("Telegram message:", msg.text)
})

bot.onText(/\/start(?: (.+))?/, async (msg, match) => {

  const chatId = msg.chat.id
  const userId = match[1]

  console.log("Telegram start received:", msg.text)

  // If user opened bot manually
  if (!userId) {

    bot.sendMessage(
      chatId,
      "Please connect Telegram from the SafeCity dashboard."
    )

    return
  }

  try {

    const user = await prisma.users.findUnique({
      where: { id: userId }
    })

    if (!user) {
      bot.sendMessage(chatId, "User not found.")
      return
    }

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      bot.sendMessage(chatId, "Only admins can connect Telegram.")
      return
    }

    console.log(chatId);

    await prisma.users.update({
      where: { id: userId },
      data: {
        telegram_chat_id: chatId.toString()
      }
    })

    bot.sendMessage(
      chatId,
      "✅ Telegram connected successfully to SafeCity AI alerts."
    )

  } catch (err) {

    console.error(err)
    bot.sendMessage(chatId, "Failed to connect Telegram.")

  }

})

export default bot