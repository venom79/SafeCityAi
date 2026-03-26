import twilio from "twilio"

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

/* ---------------- SMS ---------------- */

export const sendSMSAlert = async ({
  personName,
  cameraCode,
  caseNumber,
  confidence
}) => {

  const message = `
SafeCity AI ALERT

Person: ${personName}
Case: ${caseNumber}
Camera: ${cameraCode}

Confidence: ${(confidence * 100).toFixed(1)}%
`

  try {

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: process.env.ADMIN_PHONE
    })

    console.log("SMS sent")

  } catch (err) {
    console.error("SMS failed", err)
  }

}


/* ---------------- WHATSAPP ---------------- */

export const sendWhatsAppAlert = async ({
  personName,
  cameraCode,
  caseNumber,
  confidence,
  latitude,
  longitude,
  snapshotPath
}) => {

  const maps =
    latitude && longitude
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : "Location unavailable"

  const message = `
🚨 SafeCity AI Alert

Person: ${personName}
Case: ${caseNumber}
Camera: ${cameraCode}

Confidence: ${(confidence * 100).toFixed(1)}%

Location:
${maps}
`

  try {

    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${process.env.ADMIN_PHONE}`,
      body: message,
      mediaUrl: snapshotPath
        ? [`${process.env.SERVER_URL}/${snapshotPath}`]
        : undefined
    })

    console.log("WhatsApp sent")

  } catch (err) {
    console.error("WhatsApp failed", err)
  }

}