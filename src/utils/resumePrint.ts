import { PERSONAL_INFO, EXPERIENCES_DATA, CERTIFICATIONS_DATA, LANGUAGES_DATA } from '../data/portfolioData';

/**
 * Generates an executive, pristine A4/Letter-optimized HTML document for Vishwajit Pawar's Resume.
 * Features ultra-clean typography, professional margins, high-contrast dark text on crisp white background,
 * and page-break rules optimized for Chrome/Firefox/Safari "Save as PDF".
 */
export function generateResumeHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vishwajit_Pawar_Resume.pdf</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.45;
      font-size: 11.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .resume-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 28px;
      background: #ffffff;
    }

    /* Header */
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }

    .name {
      font-size: 20pt;
      font-weight: 800;
      color: #0c4a6e;
      letter-spacing: -0.02em;
      line-height: 1.1;
      text-transform: uppercase;
    }

    .title {
      font-size: 11pt;
      font-weight: 600;
      color: #0284c7;
      margin-top: 3px;
    }

    .contact-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 18px;
      margin-top: 8px;
      font-size: 9pt;
      color: #475569;
      font-family: 'JetBrains Mono', monospace;
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .contact-item a {
      color: #0284c7;
      text-decoration: none;
    }

    /* Section Styles */
    .section {
      margin-bottom: 13px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .section-title {
      font-size: 10pt;
      font-weight: 700;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section-title::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #0284c7;
      border-radius: 1px;
    }

    .summary-text {
      font-size: 9.5pt;
      color: #334155;
      line-height: 1.5;
      text-align: justify;
    }

    /* Grid / List Layouts */
    .edu-item, .project-item, .exp-item {
      margin-bottom: 8px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 10pt;
    }

    .item-title {
      font-weight: 700;
      color: #0f172a;
    }

    .item-period {
      font-size: 8.5pt;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      font-weight: 600;
    }

    .item-subtitle {
      font-size: 9pt;
      color: #475569;
      margin-top: 1px;
    }

    .item-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 8pt;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 3px;
      margin-left: 6px;
    }

    .tech-tags {
      font-size: 8.5pt;
      font-family: 'JetBrains Mono', monospace;
      color: #0284c7;
      font-weight: 600;
      margin: 2px 0 3px 0;
    }

    .bullet-list {
      list-style-type: disc;
      padding-left: 18px;
      margin-top: 3px;
      font-size: 9pt;
      color: #334155;
    }

    .bullet-list li {
      margin-bottom: 2px;
      line-height: 1.4;
    }

    /* Skills Grid */
    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px 16px;
      font-size: 9pt;
    }

    .skill-category {
      color: #0f172a;
    }

    .skill-label {
      font-weight: 700;
      color: #0369a1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
    }

    .skill-val {
      color: #334155;
    }

    /* Two column section */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .mini-list {
      list-style: none;
      font-size: 8.5pt;
      color: #334155;
    }

    .mini-list li {
      margin-bottom: 3px;
      display: flex;
      align-items: baseline;
      gap: 5px;
    }

    .mini-list li::before {
      content: '▪';
      color: #0284c7;
      font-size: 10pt;
    }

    /* Print Specific Tweaks */
    @media print {
      body {
        background: #ffffff !important;
      }
      .resume-container {
        padding: 0 !important;
        max-width: 100% !important;
      }
      .no-print {
        display: none !important;
      }
      a {
        text-decoration: none !important;
        color: #0f172a !important;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <header class="header">
      <h1 class="name">${PERSONAL_INFO.name}</h1>
      <div class="title">${PERSONAL_INFO.title}</div>
      <div class="contact-bar">
        <span class="contact-item">📍 ${PERSONAL_INFO.location}</span>
        <span class="contact-item">✉️ <a href="mailto:${PERSONAL_INFO.email}">${PERSONAL_INFO.email}</a></span>
        <span class="contact-item">📞 ${PERSONAL_INFO.phone}</span>
        <span class="contact-item">🔗 <a href="${PERSONAL_INFO.linkedin}" target="_blank">${PERSONAL_INFO.linkedinDisplay}</a></span>
      </div>
    </header>

    <!-- Professional Profile -->
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">${PERSONAL_INFO.bio}</p>
    </section>

    <!-- Education -->
    <section class="section">
      <h2 class="section-title">Education</h2>
      <div class="edu-item">
        <div class="item-header">
          <div>
            <span class="item-title">${PERSONAL_INFO.education.degree}</span>
            <span class="item-badge">CGPA: ${PERSONAL_INFO.education.cgpa}</span>
          </div>
          <span class="item-period">${PERSONAL_INFO.education.period}</span>
        </div>
        <div class="item-subtitle">${PERSONAL_INFO.education.institution}</div>
      </div>
    </section>

    <!-- Technical Skills -->
    <section class="section">
      <h2 class="section-title">Technical Skills</h2>
      <div class="skills-grid">
        <div class="skill-category">
          <span class="skill-label">Programming:</span>
          <span class="skill-val"> C, Python, Java, SQL</span>
        </div>
        <div class="skill-category">
          <span class="skill-label">Embedded Systems:</span>
          <span class="skill-val"> Embedded C, ESP32, Microcontrollers, FreeRTOS, IoT</span>
        </div>
        <div class="skill-category">
          <span class="skill-label">AI &amp; Robotics:</span>
          <span class="skill-val"> OpenCV, Computer Vision, AI Integration, Kinematics</span>
        </div>
        <div class="skill-category">
          <span class="skill-label">Hardware &amp; Sensors:</span>
          <span class="skill-val"> DHT11, BMP180, Ultrasonic, WiFi, Bluetooth, I2C, SPI, PWM</span>
        </div>
        <div class="skill-category">
          <span class="skill-label">Tools &amp; IDEs:</span>
          <span class="skill-val"> Git, Arduino IDE, VS Code, Linux, MS Office</span>
        </div>
        <div class="skill-category">
          <span class="skill-label">Operating Systems:</span>
          <span class="skill-val"> Linux (Ubuntu/Debian), Windows</span>
        </div>
      </div>
    </section>

    <!-- Key Engineering Projects -->
    <section class="section">
      <h2 class="section-title">Key Engineering Projects</h2>
      
      <div class="project-item">
        <div class="item-header">
          <span class="item-title">AI-Assisted Robot for Personal Assistance</span>
          <span class="item-period">2025</span>
        </div>
        <div class="tech-tags">Tech Stack: Python • OpenCV • IoT • Ultrasonic Sensors • Embedded C</div>
        <ul class="bullet-list">
          <li>Architected intelligent voice interaction and autonomous room navigation routines.</li>
          <li>Integrated OpenCV vision pipeline for object classification and real-time facial recognition.</li>
          <li>Implemented ultrasonic sensor arrays for low-latency obstacle detection and collision avoidance.</li>
          <li>Developed modular embedded software firmware bridging sensory inputs to actuation logic.</li>
        </ul>
      </div>

      <div class="project-item">
        <div class="item-header">
          <span class="item-title">IoT-Based Weather Monitoring System</span>
          <span class="item-period">2025</span>
        </div>
        <div class="tech-tags">Tech Stack: ESP32 SoC • DHT11 • BMP180 • FreeRTOS • WiFi / Bluetooth BLE</div>
        <ul class="bullet-list">
          <li>Engineered autonomous micro-weather telemetry station collecting temperature, humidity, and barometric pressure.</li>
          <li>Established low-power wireless transmission over Wi-Fi TCP/IP and Bluetooth Low Energy (BLE).</li>
          <li>Configured optimized power states (Light &amp; Deep Sleep modes) reducing idle energy draw significantly.</li>
          <li>Provided live analytical telemetry dashboard with real-time threshold alerting mechanisms.</li>
        </ul>
      </div>
    </section>

    <!-- Virtual Experiences & Simulations -->
    <section class="section">
      <h2 class="section-title">Industry Job Simulations &amp; Experience</h2>
      ${EXPERIENCES_DATA.map(
        (exp) => `
        <div class="exp-item">
          <div class="item-header">
            <span class="item-title">${exp.role}</span>
            <span class="item-period">${exp.period}</span>
          </div>
          <div class="item-subtitle">${exp.company} — <em>${exp.type}</em></div>
          <ul class="bullet-list">
            ${exp.highlights.map((h) => `<li>${h}</li>`).join('')}
          </ul>
        </div>
      `
      ).join('')}
    </section>

    <!-- Certifications & Languages -->
    <section class="section">
      <div class="two-col">
        <div>
          <h2 class="section-title">Certifications</h2>
          <ul class="mini-list">
            ${CERTIFICATIONS_DATA.map(
              (c) => `<li><strong>${c.title}</strong> (${c.issuer})</li>`
            ).join('')}
          </ul>
        </div>

        <div>
          <h2 class="section-title">Languages</h2>
          <ul class="mini-list">
            ${LANGUAGES_DATA.map(
              (l) => `<li><strong>${l.name}</strong> — ${l.proficiency}</li>`
            ).join('')}
          </ul>
        </div>
      </div>
    </section>
  </div>
</body>
</html>`;
}

/**
 * Triggers printing using a sandboxed-safe hidden iframe.
 * Falls back cleanly to opening a dedicated printable popup window or triggering window.print().
 */
export function printResumeDocument(): boolean {
  try {
    const htmlContent = generateResumeHTML();

    // 1. Try printing via hidden iframe (cleanest in-page experience)
    const existingFrame = document.getElementById('resume-print-iframe');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'resume-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.warn('Iframe print failed, falling back to window.open or window.print', err);
          fallbackPrint(htmlContent);
        }
      }, 350);
      return true;
    }
  } catch (error) {
    console.warn('Direct iframe print encountered error:', error);
  }

  // Fallback
  return fallbackPrint(generateResumeHTML());
}

/**
 * Fallback mechanism: tries window.open printable tab, or triggers direct window.print()
 */
function fallbackPrint(htmlContent: string): boolean {
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
      return true;
    }
  } catch (e) {
    console.warn('Popup window blocked, triggering native window.print()', e);
  }

  window.print();
  return true;
}

/**
 * Opens a dedicated, clean, standalone printable document in a new browser tab.
 */
export function openPrintableTab(): void {
  const htmlContent = generateResumeHTML();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    // If popup blocked, create link download
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.click();
  }
}

/**
 * Downloads a standalone, styled HTML file ready for printing to PDF in any browser.
 */
export function downloadPrintableHTML(): void {
  const htmlContent = generateResumeHTML();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Vishwajit_Pawar_Resume_Printable.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
