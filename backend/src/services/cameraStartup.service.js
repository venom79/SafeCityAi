import prisma from "../db/prisma.js"

export const startAllCameras = async () => {
    const MODEL_SERVICE = process.env.MODEL_SERVICE_URL
    try {

        const cameras = await prisma.cctv_cameras.findMany({
        where: {
            status: "ACTIVE"
        }
        })

        console.log(`Found ${cameras.length} active cameras`)

        for (const cam of cameras) {

        try {

            await fetch(`${MODEL_SERVICE}/camera/start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                camera_id: cam.id,
                rtsp_url: cam.stream_url
            })
            })

            console.log(`Started camera ${cam.camera_code}`)

        } catch (err) {
            console.error(`Failed to start camera ${cam.camera_code}`, err)
        }

        }

    } catch (err) {
        console.error("Camera startup failed:", err)
    }

}