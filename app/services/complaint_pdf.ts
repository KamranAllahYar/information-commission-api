import puppeteer, { Browser, Page } from 'puppeteer'
import { DateTime } from 'luxon'

interface FormData {
  sampleID?: string
  type?: string
  dateOfIncident?: string
  description?: string
  fullName?: string
  remedySought?: string
  email?: string
  phone?: string
  address?: string
  nationalId?: string
  passportNumber?: string
  priority?: 'High' | 'Medium' | 'Low'
  status?: 'Open' | 'Investigating' | 'Resolved'
}

export default class AccessInfoFormPDFService {
  private browser: Browser | null = null

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
        ],
      })
    }
    return this.browser
  }

  public async generateFormPDF(formData: FormData): Promise<Uint8Array<ArrayBufferLike>> {
    const browser = await this.getBrowser()

    try {
      const html = this.generateHTML(formData)
      const page: Page = await browser.newPage()

      await page.setViewport({
        width: 794,
        height: 1123,
        deviceScaleFactor: 2,
      })

      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })

      const pdfBuffer = await page.pdf({
        width: '210mm',
        height: '297mm',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      })

      await page.close()

      return pdfBuffer
    } catch (error) {
      console.error('PDF Generation Error:', error)
      throw error
    }
  }

  private generateHTML(data: FormData): string {
    const formatDate = (date?: string): string => {
      if (!date) return ''
      return DateTime.fromJSDate(new Date(date)).toFormat('dd/MM/yyyy')
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complaint Form</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      background: white;
      padding: 15mm;
      font-size: 11pt;
      line-height: 1.4;
    }

    .form-container {
      width: 100%;
      max-width: 180mm;
      margin: 0 auto;
    }

    .form-header {
      text-align: center;
      margin-bottom: 10px;
    }

    .form-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .form-subtitle {
      font-size: 11pt;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .form-act {
      font-size: 10pt;
      margin-bottom: 8px;
    }

    .request-id {
      font-size: 12pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
      color: #1f296f;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid black;
      margin-bottom: 0;
    }

    td, th {
      border: 1px solid black;
      padding: 6px 8px;
      vertical-align: top;
    }

    .header-row {
      background-color: #1f296f;
      color: white;
      font-weight: bold;
      text-align: center;
    }

    .section-header {
      background-color: #1f296f;
      color: white;
      font-weight: bold;
      padding: 6px 8px;
    }

    .row-number {
      width: 30px;
      text-align: center;
      font-weight: bold;
      background-color: #f0f0f0;
    }

    .field-label {
      font-weight: bold;
      width: 45%;
    }

    .field-value {
      width: 55%;
      min-height: 20px;
    }

    .checkbox-container {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-right: 15px;
    }

    .checkbox {
      width: 14px;
      height: 14px;
      border: 1.5px solid black;
      display: inline-block;
      position: relative;
      vertical-align: middle;
    }

    .checkbox.checked::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: bold;
    }

    .large-field {
      min-height: 80px;
    }

    .medium-field {
      min-height: 50px;
    }

    .note-text {
      font-style: italic;
      font-size: 9pt;
      margin-top: 3px;
    }

    .empty-row {
      height: 8px;
      background-color: #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <div class="request-id">Complaint ID: ${data.sampleID || ''}</div>
    <div class="form-header">
      <div class="form-title">COMPLAINT FORM</div>
      <div class="form-subtitle">COMPLAINT TO THE INFORMATION COMMISSION</div>
      <div class="form-act">Persuant to the Access to Information Act 2021</div>
    </div>

    <table>
      <!-- Header Row -->
      <tr>
        <td colspan="2" class="header-row">COMPLAINT DETAILS</td>
      </tr>

      <!-- Row 1: Complaint Type -->
      <tr>
        <td class="row-number">1</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Type of Complaint</td>
              <td class="field-value" style="border: none;">${data.type || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 2: Date of Incident -->
      <tr>
        <td class="row-number">2</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Date of Incident</td>
              <td class="field-value" style="border: none;">${formatDate(data.dateOfIncident) || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 3: Description -->
      <tr>
        <td class="row-number">3</td>
        <td>
          <div style="margin-bottom: 5px;">
            <strong>Description of the Complaint:</strong>
          </div>
          <div class="large-field">${data.description || ''}</div>
        </td>
      </tr>

      <!-- Row 4: Remedy Sought -->
      <tr>
        <td class="row-number">4</td>
        <td>
          <div style="margin-bottom: 5px;">
            <strong>Remedy Sought:</strong>
          </div>
          <div class="medium-field">${data.remedySought || ''}</div>
        </td>
      </tr>



      <!-- Section Header -->
      <tr>
        <td colspan="2" class="header-row">COMPLAINANT INFORMATION</td>
      </tr>

      <!-- Row 5: Full Name -->
      <tr>
        <td class="row-number">5</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Full Name</td>
              <td class="field-value" style="border: none;">${data.fullName || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 6: Email -->
      <tr>
        <td class="row-number">6</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Email Address</td>
              <td class="field-value" style="border: none;">${data.email || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 7: Phone -->
      <tr>
        <td class="row-number">7</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Phone Number</td>
              <td class="field-value" style="border: none;">${data.phone || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 8: Address -->
      <tr>
        <td class="row-number">8</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Address</td>
              <td class="field-value" style="border: none;">${data.address || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 9: National ID -->
      <tr>
        <td class="row-number">9</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">National ID / Passport Number</td>
              <td class="field-value" style="border: none;">${data.nationalId || ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Acknowledgement Section -->
    <div style="margin-top: 20px;">
      <div style="font-size: 12pt; font-weight: bold; color: #1f296f; margin-bottom: 10px;">5. Acknowledgement</div>
      <div style="margin-bottom: 15px;">
        I hereby submit this complaint under the Access to Information Act, 2021.
      </div>
      <div style="margin-bottom: 8px;">
        <strong>Signature:</strong> _________________________________________
      </div>
      <div>
        <strong>Date:</strong> _________________________________________
      </div>
    </div>
  </div>
</body>
</html>
    `
  }

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}
