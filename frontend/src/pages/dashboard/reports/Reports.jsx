import { useState, useRef, useCallback } from "react"
import api from "@/lib/axios"
import { toast } from "sonner"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js"

import { Bar, Line, Doughnut } from "react-chartjs-2"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title
)

/* ─────────────────────────────────────────────
   CHART DEFAULTS
───────────────────────────────────────────── */

const CHART_COLORS = {
  blue:    "#2563eb",
  indigo:  "#4f46e5",
  violet:  "#7c3aed",
  amber:   "#d97706",
  emerald: "#059669",
  rose:    "#e11d48",
  sky:     "#0284c7",
  slate:   "#475569",
}

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        font: { family: "'DM Sans', sans-serif", size: 11 },
        color: "#374151",
        boxWidth: 12,
        padding: 12,
      },
    },
    tooltip: {
      backgroundColor: "#1e293b",
      titleFont: { family: "'DM Sans', sans-serif", size: 12, weight: "600" },
      bodyFont:  { family: "'DM Sans', sans-serif", size: 11 },
      padding: 10,
      cornerRadius: 6,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: "'DM Sans', sans-serif", size: 10 }, color: "#6b7280" },
    },
    y: {
      grid: { color: "#f1f5f9" },
      ticks: { font: { family: "'DM Sans', sans-serif", size: 10 }, color: "#6b7280" },
      beginAtZero: true,
    },
  },
}

const pieDefaults = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "right",
      labels: {
        font: { family: "'DM Sans', sans-serif", size: 11 },
        color: "#374151",
        boxWidth: 12,
        padding: 10,
      },
    },
    tooltip: {
      backgroundColor: "#1e293b",
      titleFont: { family: "'DM Sans', sans-serif", size: 12, weight: "600" },
      bodyFont:  { family: "'DM Sans', sans-serif", size: 11 },
      padding: 10,
      cornerRadius: 6,
    },
  },
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

const fmt = (n) => (n ?? 0).toLocaleString()
const fmtPct = (n) => `${((n ?? 0) * 100).toFixed(1)}%`
const fmtMin = (sec) => `${((sec ?? 0) / 60).toFixed(1)} min`
const fmtConf = (n) => `${((n ?? 0) * 100).toFixed(1)}%`

const statusColor = {
  OPEN:         "bg-red-100 text-red-700",
  ACKNOWLEDGED: "bg-amber-100 text-amber-700",
  RESOLVED:     "bg-emerald-100 text-emerald-700",
  DISMISSED:    "bg-gray-100 text-gray-500",
}

const detStatusColor = {
  CONFIRMED:     "bg-emerald-100 text-emerald-700",
  POSSIBLE:      "bg-amber-100 text-amber-700",
  FALSE_POSITIVE:"bg-red-100 text-red-700",
  REVIEWED:      "bg-blue-100 text-blue-700",
  UNKNOWN:       "bg-gray-100 text-gray-400",
}

/* strip "Unknown" / empty entries from chart objects */
const cleanObj = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([k]) =>
        k &&
        k.toLowerCase() !== "unknown" &&
        k.toLowerCase() !== "unknown camera" &&
        k.toLowerCase() !== "unknown person"
    )
  )

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

const Reports = () => {
  const reportRef  = useRef()
  const [startDate, setStartDate] = useState("")
  const [endDate,   setEndDate]   = useState("")
  const [report,    setReport]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [pdfLoading,setPdfLoading]= useState(false)

  /* ── quick filters ── */
  const setToday = () => {
    const t = new Date().toISOString().split("T")[0]
    setStartDate(t); setEndDate(t)
  }
  const setThisWeek = () => {
    const now  = new Date()
    const mon  = new Date(now)
    mon.setDate(now.getDate() - now.getDay() + 1)
    setStartDate(mon.toISOString().split("T")[0])
    setEndDate(now.toISOString().split("T")[0])
  }
  const setThisMonth = () => {
    const now = new Date()
    setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0])
    setEndDate(now.toISOString().split("T")[0])
  }

  /* ── fetch ── */
  const generateReport = async () => {
    setLoading(true)
    try {
      const res = await api.get("/reports", { params: { startDate, endDate } })
      setReport(res.data)
    } catch {
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  /* ── CSV ── */
  const downloadCSV = () => {
    if (!report) return

    // Sheet 1: Alerts
    const alertRows = [
      ["=== ALERTS ==="],
      ["Time", "Alert Type", "Camera", "Person", "Confidence (%)", "Status", "Acknowledged At", "Resolved At", "Message"],
      ...report.alerts.map(a => [
        new Date(a.created_at).toLocaleString(),
        a.alert_type || "-",
        a.cctv_cameras?.camera_name || a.cctv_cameras?.camera_code || "-",
        a.case_person?.full_name || a.case_person?.alias || "-",
        a.confidence != null ? (a.confidence * 100).toFixed(1) : "-",
        a.status || "-",
        a.acknowledged_at ? new Date(a.acknowledged_at).toLocaleString() : "-",
        a.resolved_at     ? new Date(a.resolved_at).toLocaleString()     : "-",
        `"${(a.message || "").replace(/"/g, "'")}"`,
      ]),
    ]

    // Sheet 2: CCTV Logs
    const logRows = [
      [],
      ["=== CCTV DETECTION LOGS ==="],
      ["Time", "Camera", "Detection Status", "Confidence (%)", "Model", "Model Version", "Reviewed At"],
      ...report.logs
        .filter(l => l.detection_status !== "UNKNOWN")
        .map(l => [
          new Date(l.detected_at).toLocaleString(),
          l.cctv_cameras?.camera_name || l.cctv_cameras?.camera_code || "-",
          l.detection_status || "-",
          l.confidence != null ? (l.confidence * 100).toFixed(1) : "-",
          l.model_name || "-",
          l.model_version || "-",
          l.reviewed_at ? new Date(l.reviewed_at).toLocaleString() : "-",
        ]),
    ]

    // Summary block
    const s = report.summary
    const summaryRows = [
      [],
      ["=== SUMMARY ==="],
      ["Metric", "Value"],
      ["Total Detections",   s.totalDetections],
      ["Possible Matches",   s.possibleDetections],
      ["Confirmed Matches",  s.confirmedDetections],
      ["Total Alerts",       s.totalAlerts],
      ["Open Alerts",        s.openAlerts],
      ["Acknowledged Alerts",s.acknowledgedAlerts],
      ["Resolved Alerts",    s.resolvedAlerts],
      ["AI Accuracy (%)",    (s.detectionAccuracy * 100).toFixed(1)],
      ["Avg Confidence (%)", (s.avgConfidence * 100).toFixed(1)],
      ["Avg Response Time (min)", (s.avgResponseTime / 60).toFixed(1)],
      ["Date Range", `${startDate || "All"} to ${endDate || "All"}`],
      ["Generated At", new Date().toLocaleString()],
    ]

    const allRows = [...summaryRows, ...alertRows, ...logRows]
    const csv = allRows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url
    a.download = `surveillance_report_${startDate || "all"}_${endDate || "all"}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported successfully")
  }

  /* ── PDF (multi-page, oklch-safe) ── */
  const downloadPDF = useCallback(async () => {
    if (!report || !reportRef.current) return
    setPdfLoading(true)
    try {
      const el = reportRef.current

      // Temporarily force all colors to be hex-safe for html2canvas
      // (oklch is not supported by html2canvas)
      const originalBg = el.style.backgroundColor
      el.style.backgroundColor = "#f8fafc"

      // Patch any computed oklch colors on child elements before capture
      const allEls = el.querySelectorAll("*")
      const patches = []
      allEls.forEach(child => {
        const cs = window.getComputedStyle(child)
        const bg = cs.backgroundColor
        const col = cs.color
        const border = cs.borderColor
        const patch = { el: child, bg: child.style.backgroundColor, color: child.style.color, border: child.style.borderColor }
        let changed = false
        if (bg && bg.includes("oklch")) { child.style.backgroundColor = "#ffffff"; changed = true }
        if (col && col.includes("oklch")) { child.style.color = "#0f172a"; changed = true }
        if (border && border.includes("oklch")) { child.style.borderColor = "#e2e8f0"; changed = true }
        if (changed) patches.push(patch)
      })

      const canvas = await html2canvas(el, {
        scale: 1.8,
        useCORS: true,
        backgroundColor: "#f8fafc",
        logging: false,
        allowTaint: false,
        foreignObjectRendering: false,
        ignoreElements: (element) => element.hasAttribute("data-pdf-ignore"),
      })

      // Restore patched elements
      patches.forEach(p => {
        p.el.style.backgroundColor = p.bg
        p.el.style.color = p.color
        p.el.style.borderColor = p.border
      })
      el.style.backgroundColor = originalBg

      const imgData = canvas.toDataURL("image/jpeg", 0.92)
      const pdf     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      const pageW   = pdf.internal.pageSize.getWidth()   // 210
      const pageH   = pdf.internal.pageSize.getHeight()  // 297
      const margin  = 8
      const headerH = 10
      const footerH = 8
      const usableW = pageW - margin * 2
      const usableH = pageH - headerH - footerH - margin

      // total rendered image height in mm
      const totalMmH = (canvas.height * usableW) / canvas.width
      const totalPages = Math.ceil(totalMmH / usableH)

      // Plain ASCII date — no special chars to avoid jsPDF encoding bugs
      const safeDate = startDate && endDate ? `${startDate} to ${endDate}` : "All Time"

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage()

        /* ── HEADER ── */
        pdf.setFillColor(15, 23, 42)
        pdf.rect(0, 0, pageW, headerH, "F")

        // "SafeCity" in white bold
        pdf.setFontSize(9)
        pdf.setTextColor(255, 255, 255)
        pdf.setFont("helvetica", "bold")
        pdf.text("SafeCity", margin, 6.5)
        const safeW = pdf.getTextWidth("SafeCity")

        // "AI" in sky-blue
        pdf.setTextColor(56, 189, 248)
        pdf.text("AI", margin + safeW, 6.5)
        const aiW = pdf.getTextWidth("AI")

        // Subtitle
        pdf.setTextColor(71, 85, 105)
        pdf.setFontSize(6.5)
        pdf.setFont("helvetica", "normal")
        pdf.text("   |   Surveillance Intelligence Report", margin + safeW + aiW, 6.5)

        // Date — plain ASCII on right
        pdf.setTextColor(148, 163, 184)
        pdf.setFontSize(7)
        pdf.text(safeDate, pageW - margin, 6.5, { align: "right" })

        /* ── IMAGE SLICE ── */
        const yMmStart  = page * usableH
        const yPxStart  = (yMmStart / totalMmH) * canvas.height
        const sliceMmH  = Math.min(usableH, totalMmH - yMmStart)
        const yPxHeight = (sliceMmH / totalMmH) * canvas.height

        const sliceData = sliceCanvas(canvas, yPxStart, yPxHeight)
        pdf.addImage(sliceData, "JPEG", margin, headerH + 2, usableW, sliceMmH, undefined, "FAST")

        /* ── WATERMARK ── */
        pdf.saveGraphicsState()
        pdf.setGState(new pdf.GState({ opacity: 0.035 }))
        pdf.setFontSize(42)
        pdf.setTextColor(15, 23, 42)
        pdf.setFont("helvetica", "bold")
        pdf.text("SafeCityAI", pageW / 2, pageH / 2, { align: "center", angle: 45 })
        pdf.restoreGraphicsState()

        /* ── FOOTER ── */
        pdf.setFillColor(241, 245, 249)
        pdf.rect(0, pageH - footerH, pageW, footerH, "F")
        pdf.setFontSize(6.5)
        pdf.setTextColor(100, 116, 139)
        pdf.setFont("helvetica", "normal")
        pdf.text(
          `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          margin, pageH - 2.8
        )
        pdf.text(`Page ${page + 1} of ${totalPages}`, pageW / 2, pageH - 2.8, { align: "center" })
        pdf.setFont("helvetica", "bold")
        pdf.text("CONFIDENTIAL", pageW - margin, pageH - 2.8, { align: "right" })
      }

      pdf.save(`surveillance_report_${startDate || "all"}_${endDate || "all"}.pdf`)
      toast.success(`PDF exported — ${totalPages} page${totalPages > 1 ? "s" : ""}`)
    } catch (e) {
      console.error(e)
      toast.error("PDF export failed: " + e.message)
    } finally {
      setPdfLoading(false)
    }
  }, [report, startDate, endDate])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .rep-root { font-family: 'DM Sans', sans-serif; }
        .rep-root * { box-sizing: border-box; }
        .chip { display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.3px; }
        .stat-card { background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;position:relative;overflow:hidden; }
        .stat-card::before { content:'';position:absolute;inset:0 0 auto;height:3px; }
        .stat-card.blue::before   { background:#2563eb }
        .stat-card.violet::before { background:#7c3aed }
        .stat-card.emerald::before{ background:#059669 }
        .stat-card.amber::before  { background:#d97706 }
        .stat-card.rose::before   { background:#e11d48 }
        .stat-card.sky::before    { background:#0284c7 }
        .chart-card { background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 22px; }
        .section-label { font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:4px; }
        .section-title { font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px; }
        .section-desc  { font-size:12px;color:#94a3b8;margin-bottom:16px;line-height:1.5; }
        table.rep-table { width:100%;border-collapse:collapse;font-size:12px; }
        table.rep-table thead th { background:#f8fafc;padding:9px 12px;text-align:left;font-weight:600;color:#475569;border-bottom:1px solid #e2e8f0;font-size:11px;letter-spacing:.3px; }
        table.rep-table tbody tr { border-bottom:1px solid #f1f5f9;transition:background .12s; }
        table.rep-table tbody tr:hover { background:#f8fafc; }
        table.rep-table tbody td { padding:9px 12px;color:#334155; }
        .btn { display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s; }
        .btn:disabled { opacity:.55;cursor:not-allowed; }
        .btn-primary   { background:#0f172a;color:#fff; }
        .btn-primary:hover:not(:disabled) { background:#1e293b; }
        .btn-ghost     { background:#f1f5f9;color:#334155; }
        .btn-ghost:hover:not(:disabled) { background:#e2e8f0; }
        .btn-green     { background:#059669;color:#fff; }
        .btn-green:hover:not(:disabled) { background:#047857; }
        .btn-blue      { background:#2563eb;color:#fff; }
        .btn-blue:hover:not(:disabled) { background:#1d4ed8; }
        .funnel-bar { height:36px;border-radius:6px;display:flex;align-items:center;padding:0 14px;color:#fff;font-size:13px;font-weight:600;transition:width .6s ease; }
      `}</style>

      <div className="rep-root" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 4px" }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#94a3b8", marginBottom: 4 }}>
            Analytics & Intelligence
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Surveillance Report
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Generate detailed insights from CCTV detection data and alert activity
          </p>
        </div>

        {/* ── CONTROLS ── */}
        <div style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "18px 22px",
          marginBottom: 28,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
        }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#0f172a", outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#0f172a", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={setToday}>Today</button>
            <button className="btn btn-ghost" onClick={setThisWeek}>This Week</button>
            <button className="btn btn-ghost" onClick={setThisMonth}>This Month</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 12, height: 12, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }}/>
                  Generating…
                </span>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  Generate Report
                </>
              )}
            </button>
            {report && (
              <>
                <button className="btn btn-green" onClick={downloadCSV}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Export CSV
                </button>
                <button className="btn btn-blue" onClick={downloadPDF} disabled={pdfLoading}>
                  {pdfLoading ? "Exporting…" : (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                      Export PDF
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── REPORT CONTENT ── */}
        {report && (
          <div ref={reportRef} style={{ background: "#f8fafc", padding: "24px 0" }}>

            {/* ── DATE RANGE BADGE ── */}
            {(startDate || endDate) && (
              <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: "#0f172a", color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                  {startDate || "—"} → {endDate || "—"}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  {report.logs.length.toLocaleString()} log entries · {report.alerts.length.toLocaleString()} alerts
                </span>
              </div>
            )}

            {/* ── SUMMARY CARDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
              <StatCard accent="blue"    label="Total Detections"  value={fmt(report.summary.totalDetections)}   sub="All camera events" />
              <StatCard accent="amber"   label="Possible Matches"  value={fmt(report.summary.possibleDetections)} sub="Flagged by AI" />
              <StatCard accent="emerald" label="Confirmed Matches" value={fmt(report.summary.confirmedDetections)} sub="Verified detections" />
              <StatCard accent="rose"    label="Alerts Generated"  value={fmt(report.summary.totalAlerts)}        sub={`${fmt(report.summary.openAlerts)} still open`} />
              <StatCard accent="violet"  label="AI Accuracy"       value={fmtPct(report.summary.detectionAccuracy)}  sub="Confirmed ÷ Possible" />
              <StatCard accent="sky"     label="Avg Confidence"    value={fmtConf(report.summary.avgConfidence)}  sub="Mean model score" />
              <StatCard accent="blue"    label="Avg Response Time" value={fmtMin(report.summary.avgResponseTime)} sub="Alert → Acknowledge" />
              <StatCard accent="emerald" label="Resolved Alerts"   value={fmt(report.summary.resolvedAlerts)}     sub={`${fmt(report.summary.acknowledgedAlerts)} acknowledged`} />
            </div>

            {/* ── ALERT LIFECYCLE ── */}
            <div style={{ marginBottom: 28 }} className="chart-card">
              <p className="section-label">Alert Lifecycle</p>
              <p className="section-title">Alert Status Breakdown</p>
              <p className="section-desc">
                Shows how alerts are distributed across their lifecycle stages — Open (unaddressed), Acknowledged (under review), and Resolved (closed). A high Open count signals response bottlenecks.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "Open",         value: report.summary.openAlerts,         color: "#e11d48", bg: "#fff1f2" },
                  { label: "Acknowledged", value: report.summary.acknowledgedAlerts, color: "#d97706", bg: "#fffbeb" },
                  { label: "Resolved",     value: report.summary.resolvedAlerts,     color: "#059669", bg: "#f0fdf4" },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 10, padding: "14px 18px", borderLeft: `4px solid ${s.color}` }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{fmt(s.value)}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                    <div style={{ marginTop: 8, height: 4, background: "#e2e8f0", borderRadius: 999 }}>
                      <div style={{
                        height: "100%", borderRadius: 999, background: s.color,
                        width: report.summary.totalAlerts
                          ? `${(s.value / report.summary.totalAlerts * 100).toFixed(1)}%`
                          : "0%",
                        transition: "width .6s ease"
                      }}/>
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                      {report.summary.totalAlerts
                        ? `${(s.value / report.summary.totalAlerts * 100).toFixed(1)}% of total`
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── DETECTION FUNNEL ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              <div className="chart-card">
                <p className="section-label">Pipeline</p>
                <p className="section-title">Detection Funnel</p>
                <p className="section-desc">
                  Tracks how raw detections progress through the AI pipeline — from all camera events to possible matches, confirmed identities, and generated alerts.
                </p>
                <FunnelChart
                  data={[
                    { label: "Total Detections",  value: report.summary.totalDetections,    color: "#475569" },
                    { label: "Possible Matches",   value: report.summary.possibleDetections, color: "#d97706" },
                    { label: "Confirmed Matches",  value: report.summary.confirmedDetections,color: "#059669" },
                    { label: "Alerts Generated",   value: report.summary.totalAlerts,        color: "#2563eb" },
                  ]}
                  max={report.summary.totalDetections}
                />
              </div>

              <div className="chart-card">
                <p className="section-label">Confidence</p>
                <p className="section-title">AI Confidence Distribution</p>
                <p className="section-desc">
                  Distribution of AI confidence scores at the time of detection. Higher confidence buckets indicate stronger, more reliable matches.
                </p>
                <div style={{ maxHeight: 200 }}>
                  <Doughnut
                    data={{
                      labels: Object.keys(report.charts.confidenceDistribution).map(k => `Score ${k}`),
                      datasets: [{
                        data: Object.values(report.charts.confidenceDistribution),
                        backgroundColor: ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6"],
                        borderWidth: 2,
                        borderColor: "#fff",
                      }]
                    }}
                    options={{ ...pieDefaults, cutout: "58%" }}
                  />
                </div>
              </div>
            </div>

            {/* ── TRENDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              <div className="chart-card">
                <p className="section-label">Timeline</p>
                <p className="section-title">Daily Detection Trend</p>
                <p className="section-desc">
                  Number of detection events per day across the selected date range. Spikes indicate periods of heightened surveillance activity.
                </p>
                <div style={{ maxHeight: 180 }}>
                  <Line
                    data={{
                      labels: Object.keys(report.charts.detectionTrend),
                      datasets: [{
                        label: "Detections",
                        data: Object.values(report.charts.detectionTrend),
                        borderColor: "#2563eb",
                        backgroundColor: "rgba(37,99,235,0.08)",
                        tension: 0.35,
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: "#2563eb",
                      }]
                    }}
                    options={{ ...chartDefaults, aspectRatio: 2.2 }}
                  />
                </div>
              </div>

              <div className="chart-card">
                <p className="section-label">Timeline</p>
                <p className="section-title">Daily Alert Trend</p>
                <p className="section-desc">
                  Number of alerts generated per day. Compare against the detection trend to understand alert conversion rates over time.
                </p>
                <div style={{ maxHeight: 180 }}>
                  <Line
                    data={{
                      labels: Object.keys(report.charts.alertTrend),
                      datasets: [{
                        label: "Alerts",
                        data: Object.values(report.charts.alertTrend),
                        borderColor: "#e11d48",
                        backgroundColor: "rgba(225,29,72,0.08)",
                        tension: 0.35,
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: "#e11d48",
                      }]
                    }}
                    options={{ ...chartDefaults, aspectRatio: 2.2 }}
                  />
                </div>
              </div>
            </div>

            {/* ── CAMERA RANKING + HOURLY ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              {Object.keys(cleanObj(report.charts.cameraActivity)).length > 0 && (
                <div className="chart-card">
                  <p className="section-label">Infrastructure</p>
                  <p className="section-title">Camera Activity Ranking</p>
                  <p className="section-desc">
                    Detection counts per camera. High-ranking cameras are surveillance hot zones and may need additional monitoring resources.
                  </p>
                  <div style={{ maxHeight: 200 }}>
                    <Bar
                      data={{
                        labels: Object.keys(cleanObj(report.charts.cameraActivity)),
                        datasets: [{
                          label: "Detections",
                          data: Object.values(cleanObj(report.charts.cameraActivity)),
                          backgroundColor: "#e11d48",
                          borderRadius: 4,
                        }]
                      }}
                      options={{ ...chartDefaults, aspectRatio: 1.8, indexAxis: "y" }}
                    />
                  </div>
                </div>
              )}

              <div className="chart-card">
                <p className="section-label">Patterns</p>
                <p className="section-title">Hourly Detection Activity</p>
                <p className="section-desc">
                  Distribution of detections by hour of day (0–23). Identifies peak activity windows to optimize patrol scheduling and camera alerting.
                </p>
                <div style={{ maxHeight: 200 }}>
                  <Bar
                    data={{
                      labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,"0")}:00`),
                      datasets: [{
                        label: "Detections",
                        data: Array.from({ length: 24 }, (_, i) => report.charts.hourlyActivity[i] || 0),
                        backgroundColor: (ctx) => {
                          const v = ctx.raw
                          const max = Math.max(...Object.values(report.charts.hourlyActivity))
                          const ratio = max > 0 ? v / max : 0
                          return ratio > 0.7 ? "#7c3aed" : ratio > 0.4 ? "#8b5cf6" : "#c4b5fd"
                        },
                        borderRadius: 3,
                      }]
                    }}
                    options={{ ...chartDefaults, aspectRatio: 1.8 }}
                  />
                </div>
              </div>
            </div>

            {/* ── MOST DETECTED PERSONS ── */}
            {Object.keys(cleanObj(report.charts.personDetections)).length > 0 && (
              <div className="chart-card" style={{ marginBottom: 28 }}>
                <p className="section-label">Subjects</p>
                <p className="section-title">Most Frequently Detected Persons</p>
                <p className="section-desc">
                  Individuals recorded most often by the system during the selected period. Repeated detections across multiple cameras may indicate heightened risk.
                </p>
                <div style={{ maxHeight: 200 }}>
                  <Bar
                    data={{
                      labels: Object.keys(cleanObj(report.charts.personDetections)),
                      datasets: [{
                        label: "Sightings",
                        data: Object.values(cleanObj(report.charts.personDetections)),
                        backgroundColor: "#f97316",
                        borderRadius: 4,
                      }]
                    }}
                    options={{ ...chartDefaults, aspectRatio: 3 }}
                  />
                </div>
              </div>
            )}

            {/* ── ALERTS TABLE ── */}
            {report.alerts.filter(a => a.case_person?.full_name || a.case_person?.alias).length > 0 && (
              <div className="chart-card" style={{ marginBottom: 28 }}>
                <p className="section-label">Records</p>
                <p className="section-title">Alert Log</p>
                <p className="section-desc">
                  Complete list of alerts generated during this period, including the triggering camera, matched individual, confidence score, and resolution status.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table className="rep-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Camera</th>
                        <th>Person</th>
                        <th>Confidence</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.alerts
                        .filter(a => a.case_person?.full_name || a.case_person?.alias)
                        .map(a => {
                          const person = a.case_person?.full_name || a.case_person?.alias
                          const camera = a.cctv_cameras?.camera_name || a.cctv_cameras?.camera_code || "—"
                          return (
                            <tr key={a.id}>
                              <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                                {new Date(a.created_at).toLocaleString()}
                              </td>
                              <td>
                                <span style={{ fontSize: 10, fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "2px 7px", borderRadius: 999 }}>
                                  {a.alert_type}
                                </span>
                              </td>
                              <td>{camera}</td>
                              <td style={{ fontWeight: 600, color: "#0f172a" }}>{person}</td>
                              <td>
                                <ConfBar value={a.confidence} />
                              </td>
                              <td>
                                <span className={`chip ${statusColor[a.status] || "bg-gray-100 text-gray-500"}`}>
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── CCTV LOGS TABLE ── */}
            {report.logs.filter(l => l.detection_status !== "UNKNOWN").length > 0 && (
              <div className="chart-card" style={{ marginBottom: 8 }}>
                <p className="section-label">Records</p>
                <p className="section-title">CCTV Detection Logs</p>
                <p className="section-desc">
                  Raw detection events captured by cameras, showing the time, source camera, AI detection status, and model confidence score.
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table className="rep-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Camera</th>
                        <th>Model</th>
                        <th>Detection Status</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.logs
                        .filter(l => l.detection_status !== "UNKNOWN")
                        .slice(0, 200)
                        .map(l => {
                          const camera = l.cctv_cameras?.camera_name || l.cctv_cameras?.camera_code || "—"
                          return (
                            <tr key={l.id}>
                              <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                                {new Date(l.detected_at).toLocaleString()}
                              </td>
                              <td>{camera}</td>
                              <td style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
                                {l.model_name} {l.model_version}
                              </td>
                              <td>
                                <span className={`chip ${detStatusColor[l.detection_status] || "bg-gray-100 text-gray-400"}`}>
                                  {l.detection_status}
                                </span>
                              </td>
                              <td>
                                <ConfBar value={l.confidence} />
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                  {report.logs.filter(l => l.detection_status !== "UNKNOWN").length > 200 && (
                    <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", padding: "12px 0 4px" }}>
                      Showing 200 of {report.logs.filter(l => l.detection_status !== "UNKNOWN").length.toLocaleString()} logs — export CSV for full data
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Empty state */}
        {!report && !loading && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: "0 auto 16px" }}>
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#64748b" }}>No report generated yet</p>
            <p style={{ fontSize: 13 }}>Select a date range and click Generate Report</p>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

const StatCard = ({ label, value, sub, accent }) => (
  <div className={`stat-card ${accent}`}>
    <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: .3 }}>{label}</p>
    <p style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</p>}
  </div>
)

const FunnelBar = ({ label, value, color, pct }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{(value ?? 0).toLocaleString()}</span>
    </div>
    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width .6s ease" }}/>
    </div>
  </div>
)

const FunnelChart = ({ data, max }) => (
  <div>
    {data.map(d => (
      <FunnelBar key={d.label} label={d.label} value={d.value} color={d.color}
        pct={max > 0 ? Math.round((d.value / max) * 100) : 0} />
    ))}
  </div>
)

const ConfBar = ({ value }) => {
  if (value == null) return <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? "#059669" : pct >= 60 ? "#d97706" : "#e11d48"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ width: 52, height: 5, background: "#f1f5f9", borderRadius: 999 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }}/>
      </div>
      <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#334155" }}>{pct}%</span>
    </div>
  )
}

/* ── helper: slice a canvas vertically ── */
function sliceCanvas(source, srcY, srcH) {
  const c   = document.createElement("canvas")
  c.width   = source.width
  c.height  = Math.ceil(srcH)
  const ctx = c.getContext("2d")
  ctx.fillStyle = "#f8fafc"
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(source, 0, -Math.floor(srcY))
  return c.toDataURL("image/jpeg", 0.92)
}

export default Reports