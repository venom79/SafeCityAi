import { jsPDF } from "jspdf"

/**
 * Downloads a beautifully formatted PDF alert report.
 * Matches the SafeCity AI Surveillance Report visual style.
 *
 * @param {object} id - object with at least { id }
 * @param {function} api       - axios-like instance with .get()
 */
export const DownloadAlertReport = async (id, api) => {
  try {
    const res  = await api.get(`/reports/${id}/report`)
    const data = res.data.report

    /* ── Destructure API response ── */
    const alert    = data.alert_information    ?? {}
    const caseInfo = data.case_information     ?? {}
    const person   = data.detected_person      ?? {}
    const detect   = data.detection_details    ?? {}
    const camera   = data.camera_information   ?? {}
    const officers = data.officers             ?? {}

    /* ──────────────────────────────────────────────
       FETCH SNAPSHOT -> base64
       detect.snapshot = "/snapshots/xxxx.jpg"
       Full URL: http://localhost:8080/snapshots/xxxx.jpg
    ────────────────────────────────────────────── */
    let snapshotBase64   = null
    let snapshotMimeType = "image/jpeg"

    if (detect.snapshot) {
      try {
        const snapUrl = `http://localhost:8080${detect.snapshot}`
        const imgRes  = await fetch(snapUrl)

        if (imgRes.ok) {
          const blob   = await imgRes.blob()
          snapshotMimeType = blob.type || "image/jpeg"
          snapshotBase64   = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              // result is "data:image/jpeg;base64,<data>" -- strip the prefix
              resolve(reader.result.split(",")[1])
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        }
      } catch (snapErr) {
        console.warn("Could not load snapshot image:", snapErr)
      }
    }

    /* ── Page geometry (mm) ── */
    const doc      = new jsPDF({ unit: "mm", format: "a4" })
    const pageW    = doc.internal.pageSize.getWidth()   // 210
    const pageH    = doc.internal.pageSize.getHeight()  // 297
    const margin   = 14
    const headerH  = 12
    const footerH  = 10
    const contentW = pageW - margin * 2

    /* ── Colour palette ── */
    const C = {
      navy:     [15,  23,  42],
      skyBlue:  [56,  189, 248],
      slate600: [71,  85,  105],
      slate400: [148, 163, 184],
      slate200: [226, 232, 240],
      slate100: [241, 245, 249],
      slate50:  [248, 250, 252],
      white:    [255, 255, 255],
      green:    [34,  197, 94],
      amber:    [245, 158, 11],
      red:      [239, 68,  68],
      indigo:   [99,  102, 241],
      charcoal: [30,  41,  59],
    }

    /* ── Helpers ── */
    const setFill   = (rgb) => doc.setFillColor(...rgb)
    const setStroke = (rgb) => doc.setDrawColor(...rgb)
    const setColor  = (rgb) => doc.setTextColor(...rgb)

    const fmt = (iso) => iso ? new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    }) : "N/A"

    const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    }) : "N/A"

    const createdStr  = fmtDate(alert.created_at)
    const resolvedStr = fmtDate(alert.resolved_at)

    /* ──────────────────────────────────────────────
       HEADER
    ────────────────────────────────────────────── */
    const drawHeader = () => {
      setFill(C.navy)
      doc.rect(0, 0, pageW, headerH, "F")

      doc.setFontSize(9)
      setColor(C.white)
      doc.setFont("helvetica", "bold")
      doc.text("SafeCity", margin, 7.5)
      const safeW = doc.getTextWidth("SafeCity")

      setColor(C.skyBlue)
      doc.text("AI", margin + safeW, 7.5)
      const aiW = doc.getTextWidth("AI")

      doc.setFontSize(6.5)
      doc.setFont("helvetica", "normal")
      setColor(C.slate600)
      doc.text("   |   Alert Detection Report", margin + safeW + aiW, 7.5)

      doc.setFontSize(7)
      setColor(C.slate400)
      doc.text(
        new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        pageW - margin, 7.5, { align: "right" }
      )
    }

    /* ──────────────────────────────────────────────
       FOOTER
    ────────────────────────────────────────────── */
    const drawFooter = (pageNum, totalPages) => {
      setFill(C.slate100)
      doc.rect(0, pageH - footerH, pageW, footerH, "F")

      doc.setFontSize(6.5)
      doc.setFont("helvetica", "normal")
      setColor([100, 116, 139])

      doc.text(
        `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        margin, pageH - 3
      )
      doc.text(`Page ${pageNum} of ${totalPages}`, pageW / 2, pageH - 3, { align: "center" })
      doc.setFont("helvetica", "bold")
      doc.text("CONFIDENTIAL", pageW - margin, pageH - 3, { align: "right" })
    }

    /* ──────────────────────────────────────────────
       WATERMARK
    ────────────────────────────────────────────── */
    const drawWatermark = () => {
      doc.saveGraphicsState()
      doc.setGState(new doc.GState({ opacity: 0.035 }))
      doc.setFontSize(42)
      setColor(C.navy)
      doc.setFont("helvetica", "bold")
      doc.text("SafeCityAI", pageW / 2, pageH / 2, { align: "center", angle: 45 })
      doc.restoreGraphicsState()
    }

    /* ──────────────────────────────────────────────
       SECTION LABEL helper
    ────────────────────────────────────────────── */
    const sectionLabel = (label, y) => {
      setFill(C.skyBlue)
      doc.rect(margin, y, 2, 4, "F")
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      setColor(C.navy)
      doc.text(label.toUpperCase(), margin + 5, y + 3.2)
      setStroke(C.slate200)
      doc.setLineWidth(0.2)
      doc.line(margin, y + 5, pageW - margin, y + 5)
      return y + 8
    }

    /* ──────────────────────────────────────────────
       KEY-VALUE row helper
    ────────────────────────────────────────────── */
    const kvRow = (key, value, x, y, colW, opts = {}) => {
      const { badge, badgeColor } = opts
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      setColor(C.slate400)
      doc.text(key, x, y)

      doc.setFont("helvetica", "bold")
      setColor(opts.valueColor ?? C.charcoal)

      if (badge) {
        const bW = doc.getTextWidth(String(value)) + 6
        setFill(badgeColor ?? C.indigo)
        doc.roundedRect(x, y + 1.5, bW, 4.5, 1.5, 1.5, "F")
        setColor(C.white)
        doc.text(String(value), x + 3, y + 4.8)
      } else {
        const wrapped = doc.splitTextToSize(String(value ?? "N/A"), colW - 2)
        doc.text(wrapped, x, y + 4.5)
        return y + 4.5 + (wrapped.length - 1) * 3.8
      }
      return y + 7
    }

    /* ──────────────────────────────────────────────
       TWO-COLUMN KV block
    ────────────────────────────────────────────── */
    const kvBlock = (pairs, startY) => {
      const colW = contentW / 2
      const rowH = 12
      let y = startY
      for (let i = 0; i < pairs.length; i += 2) {
        const left  = pairs[i]
        const right = pairs[i + 1]
        kvRow(left[0],  left[1],  margin,          y, colW, left[2]  ?? {})
        if (right) kvRow(right[0], right[1], margin + colW, y, colW, right[2] ?? {})
        y += rowH
      }
      return y
    }

    /* ──────────────────────────────────────────────
       STATUS badge colour
    ────────────────────────────────────────────── */
    const statusColor = (s) => {
      const m = { RESOLVED: C.green, ACTIVE: C.red, PENDING: C.amber, CONFIRMED: C.green }
      return m[String(s).toUpperCase()] ?? C.indigo
    }

    /* ──────────────────────────────────────────────
       SNAPSHOT SECTION
       Draws a dark framed evidence panel with the CCTV image.
       Returns new Y after panel.
    ────────────────────────────────────────────── */
    const drawSnapshotSection = (startY) => {
      let y = sectionLabel("Evidence Snapshot", startY)

      const frameP = 2      // padding inside dark card
      const imgH   = 82     // image display height in mm

      if (!snapshotBase64) {
        // Placeholder when snapshot is unavailable
        setFill(C.slate100)
        setStroke(C.slate200)
        doc.setLineWidth(0.3)
        doc.roundedRect(margin, y, contentW, imgH + frameP * 2 + 14, 3, 3, "FD")
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        setColor(C.slate400)
        doc.text("Snapshot not available", pageW / 2, y + (imgH / 2) + 5, { align: "center" })
        return y + imgH + frameP * 2 + 18
      }

      // Dark card background
      setFill(C.charcoal)
      doc.roundedRect(margin, y, contentW, imgH + frameP * 2 + 14, 3, 3, "F")

      // Thin sky-blue top accent line on card
      setFill(C.skyBlue)
      doc.roundedRect(margin, y, contentW, 1, 0, 0, "F")

      // Image coordinates
      const imgX = margin + frameP
      const imgY = y + frameP + 1   // +1 for accent line

      // Render snapshot
      const imgFormat = snapshotMimeType.includes("png") ? "PNG" : "JPEG"
      doc.addImage(
        snapshotBase64, imgFormat,
        imgX, imgY,
        contentW - frameP * 2, imgH,
        undefined, "FAST"
      )

      // Semi-transparent overlay strip at image bottom for caption
      const capY = imgY + imgH - 11
      doc.saveGraphicsState()
      doc.setGState(new doc.GState({ opacity: 0.62 }))
      setFill([0, 0, 0])
      doc.rect(imgX, capY, contentW - frameP * 2, 11, "F")
      doc.restoreGraphicsState()

      // Caption left: camera info
      doc.setFontSize(6.5)
      doc.setFont("helvetica", "bold")
      setColor(C.white)
      doc.text(
        `${camera.camera_name ?? "CCTV Camera"}  |  ${camera.location ?? "Unknown Location"}`,
        imgX + 3, capY + 4.5
      )

      // Caption right: timestamp in sky-blue
      setColor(C.skyBlue)
      doc.text(
        fmt(detect.detected_at),
        imgX + contentW - frameP * 2 - 3, capY + 4.5, { align: "right" }
      )

      // Second caption line: camera code
      doc.setFontSize(5.5)
      doc.setFont("helvetica", "normal")
      setColor(C.slate400)
      doc.text(
        `Cam: ${camera.camera_code ?? "N/A"}`,
        imgX + 3, capY + 9
      )

      /* ── Metadata row inside dark card, below image ── */
      const metaY = imgY + imgH + frameP + 2

      const metaItems = [
        { label: "Confidence", value: `${(detect.confidence * 100).toFixed(2)}%` },
        { label: "Model",      value: `${detect.ai_model ?? "N/A"} ${detect.model_version ?? ""}`.trim() },
        { label: "Status",     value: detect.detection_status ?? "N/A" },
        { label: "Cam GPS",    value: camera.latitude ? `${camera.latitude}, ${camera.longitude}` : "N/A" },
      ]

      const colW = (contentW - frameP * 2) / metaItems.length
      metaItems.forEach((item, i) => {
        const mx = imgX + i * colW

        doc.setFontSize(5.5)
        doc.setFont("helvetica", "normal")
        setColor(C.slate400)
        doc.text(item.label.toUpperCase(), mx, metaY + 2)

        doc.setFontSize(6.5)
        doc.setFont("helvetica", "bold")
        setColor(C.white)
        doc.text(item.value, mx, metaY + 7)
      })

      return metaY + 12
    }

    /* ════════════════════════════════════════════
       DETERMINE TOTAL PAGE COUNT
       - Content always starts on page 1
       - Overflow goes to page 2
       - Snapshot always gets its own final page
    ════════════════════════════════════════════ */
    const personPairs = [
      ["Full Name",    `${person.name ?? "Unknown"} (${person.alias ?? "-"})`],
      ["Gender / Age", `${person.gender ?? "N/A"} - ${person.age ?? "N/A"} yrs`],
      ["Height",       person.height_cm ? `${person.height_cm} cm` : "N/A"],
      ["Weight",       person.weight_kg ? `${person.weight_kg} kg` : "N/A"],
      ["Skin Tone",    person.skin_tone ?? "N/A"],
      ["Eye Color",    person.eye_color ?? "N/A"],
      ["Hair Color",   person.hair_color ?? "N/A"],
      ["Clothing",     person.clothing ?? "N/A"],
      ["Marks",        person.marks ?? "None"],
      ["Description",  person.description ?? "N/A"],
    ]

    const camPairs = [
      ["Detection Status", detect.detection_status ?? "N/A", { badge: true, badgeColor: statusColor(detect.detection_status) }],
      ["Detected At",      fmt(detect.detected_at)],
      ["Camera Code",      camera.camera_code ?? "N/A"],
      ["Camera Name",      camera.camera_name ?? "N/A"],
      ["Location",         camera.location ?? "N/A"],
      ["Coordinates",      camera.latitude ? `${camera.latitude}, ${camera.longitude}` : "N/A"],
      ["Acknowledged By",  officers.acknowledged_by ?? "N/A"],
      ["Resolved By",      officers.resolved_by ?? "N/A"],
    ]

    // Rough height of page-1 content above person section
    const prePersonH = headerH + 8 + 26 + 12   // header + hero + badge
                     + 8 + 8 * 12 + 4          // alert section
                     + 8 + 6 * 12 + 4          // case section

    const personSectionH = 8 + Math.ceil(personPairs.length / 2) * 12 + 4
    const camSectionH    = 8 + Math.ceil(camPairs.length / 2) * 12

    const fitsOnPage1 = (prePersonH + personSectionH + camSectionH) < (pageH - footerH - 8)
    const contentPages = fitsOnPage1 ? 1 : 2
    const totalPages   = contentPages + 1  // +1 for dedicated snapshot page

    /* ════════════════════════════════════════════
       PAGE 1 — Main content
    ════════════════════════════════════════════ */
    drawHeader()
    drawWatermark()

    let y = headerH + 8

    // Hero title card
    setFill(C.navy)
    doc.roundedRect(margin, y, contentW, 22, 3, 3, "F")
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    setColor(C.white)
    doc.text("AI Detection Alert Report", margin + 6, y + 8)
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "normal")
    setColor(C.skyBlue)
    doc.text(`Alert ID: ${data.report_id ?? "N/A"}`, margin + 6, y + 14)
    doc.setFontSize(7)
    setColor(C.slate400)
    doc.text(`Case: ${caseInfo.case_number ?? "N/A"}`, margin + 6, y + 19)
    y += 26

    // // Date range badge
    // const badgeLabel = `Alert Created At: ${createdStr}  -> Alert Resolved At: ${resolvedStr}`
    // const badgeW     = doc.getTextWidth(badgeLabel) + 14
    // setFill(C.charcoal)
    // doc.roundedRect(margin, y, badgeW, 6, 3, 3, "F")
    // doc.setFontSize(7)
    // doc.setFont("helvetica", "bold")
    // setColor(C.white)
    // doc.text(badgeLabel, margin + 7, y + 4.2)

    doc.setFont("helvetica", "normal")
    setColor(C.slate400)
    doc.text(
      `Confidence: ${(alert.confidence * 100).toFixed(1)}%   -   Type: ${alert.alert_type ?? "N/A"}`,
      margin  + 6, y + 4.2
    )
    y += 12

    // Alert Information
    y = sectionLabel("Alert Information", y)
    y = kvBlock([
      ["Alert Type",       alert.alert_type ?? "N/A"],
      ["Status",           alert.status ?? "N/A", { badge: true, badgeColor: statusColor(alert.status) }],
      ["Confidence Score", `${(alert.confidence * 100).toFixed(2)}%`],
      ["Message",          alert.message ?? "N/A"],
      ["Created At",       fmt(alert.created_at)],
      ["Acknowledged At",  fmt(alert.acknowledged_at)],
      ["Resolved At",      fmt(alert.resolved_at)],
      ["AI Model",         `${detect.ai_model ?? "N/A"} ${detect.model_version ?? ""}`],
    ], y)
    y += 4

    // Case Information
    y = sectionLabel("Case Information", y)
    y = kvBlock([
      ["Case Number",        caseInfo.case_number ?? "N/A"],
      ["Case Type",          caseInfo.case_type ?? "N/A", { badge: true, badgeColor: C.indigo }],
      ["Title",              caseInfo.title ?? "N/A"],
      ["Last Seen At",       fmt(caseInfo.last_seen_time)],
      ["Last Seen Location", caseInfo.last_seen_location ?? "N/A"],
      ["Assigned Officer",   `${caseInfo.assigned_officer?.name ?? "N/A"} (${caseInfo.assigned_officer?.email ?? ""})`],
    ], y)
    y += 4

    if (fitsOnPage1) {
      y = sectionLabel("Detected Person", y)
      y = kvBlock(personPairs, y)
      y += 4

      y = sectionLabel("Detection & Camera Details", y)
      y = kvBlock(camPairs, y)
    }

    drawFooter(1, totalPages)

    /* ════════════════════════════════════════════
       PAGE 2 — Overflow content (if needed)
    ════════════════════════════════════════════ */
    if (!fitsOnPage1) {
      doc.addPage()
      drawHeader()
      drawWatermark()
      y = headerH + 8

      y = sectionLabel("Detected Person", y)
      y = kvBlock(personPairs, y)
      y += 4

      y = sectionLabel("Detection & Camera Details", y)
      y = kvBlock(camPairs, y)

      drawFooter(2, totalPages)
    }

    /* ════════════════════════════════════════════
       FINAL PAGE — Dedicated Evidence / Snapshot
    ════════════════════════════════════════════ */
    doc.addPage()
    drawHeader()
    drawWatermark()

    y = headerH + 8

    // Page heading
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    setColor(C.navy)
    doc.text("Forensic Evidence", margin, y + 5)

    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    setColor(C.slate400)
    doc.text("CCTV frame captured at the moment of AI detection", margin, y + 11)

    // Status tag top-right
    const tagLabel = detect.detection_status ?? "CONFIRMED"
    setFill(C.skyBlue)
    const tagW = doc.getTextWidth(tagLabel) + 8
    doc.roundedRect(pageW - margin - tagW, y + 1, tagW, 6, 2, 2, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    setColor(C.navy)
    doc.text(tagLabel, pageW - margin - tagW + 4, y + 5.5)

    y += 16

    // Snapshot panel
    y = drawSnapshotSection(y)

    // GPS coordinates note (if available)
    if (camera.latitude && camera.longitude) {
      y += 4
      setFill(C.slate50)
      setStroke(C.slate200)
      doc.setLineWidth(0.2)
      doc.roundedRect(margin, y, contentW, 9, 2, 2, "FD")
      doc.setFontSize(6.5)
      doc.setFont("helvetica", "normal")
      setColor(C.slate400)
      doc.text(
        `GPS: ${camera.latitude}, ${camera.longitude}   |   ${camera.camera_name ?? ""}   |   ${camera.location ?? ""}`,
        pageW / 2, y + 5.8, { align: "center" }
      )
    }

    drawFooter(totalPages, totalPages)

    /* ── Save ── */
    doc.save(`alert-report-${data.report_id ?? id.id}.pdf`)
    // Optional: toast.success(`Report exported — ${totalPages} page${totalPages > 1 ? "s" : ""}`)

  } catch (err) {
    console.error("Failed to download report", err)
    // Optional: toast.error("Report export failed: " + err.message)
  }
}