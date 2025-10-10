import puppeteer, { Browser, Page } from 'puppeteer'
import { DateTime } from 'luxon'

interface FormData {
  sampleID?: string
  nameOfApplicant?: string
  dateOfBirth?: string
  address?: string
  telephoneNumber?: string
  email?: string
  typeOfApplicant?: 'individual' | 'organization'
  description?: string
  mannerOfAccess?: 'inspection' | 'copy' | 'viewing_listen' | 'written_transcript'
  isLifeLiberty?: boolean
  lifeLibertyDetails?: string
  formOfAccess?: 'hard_copy' | 'electronic_copy'
  dateOfSubmission?: string
  witnessSignature?: string
  witnessStatement?: string
  institutionStamp?: string
  officerName?: string
  dateOfReceipt?: string
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

    const formatDateOfBirth = (date?: string): string => {
      if (!date) return ''
      return DateTime.fromJSDate(new Date(date)).toFormat('dd/MM/yyyy')
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access to Information Form</title>
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
    <div class="request-id">Request ID: ${data.sampleID || ''}</div>
    <div class="form-header">
<!--      <div class="form-title">FORM NO. 1: Application for Access to Information</div>-->
      <div class="form-title">REQUEST FORM</div>
      <div class="form-subtitle">REQUEST FOR ACCESS TO INFORMATION</div>
      <div class="form-act">Persuant to the Access to Information Act 2021</div>
    </div>

    <table>
      <!-- Header Row -->
      <tr>
        <td colspan="2" class="header-row">APPLICANT INFORMATION</td>
      </tr>

      <!-- Row 1: Name -->
      <tr>
        <td class="row-number">1</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Name of Applicant</td>
              <td class="field-value" style="border: none;">${data.nameOfApplicant || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 2: Date of Birth -->
      <tr>
        <td class="row-number">2</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Date of Birth</td>
              <td class="field-value" style="border: none;">${formatDateOfBirth(data.dateOfBirth) || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 3: Address -->
      <tr>
        <td class="row-number">3</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Address</td>
              <td class="field-value" style="border: none;">${data.address || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 4: Telephone -->
      <tr>
        <td class="row-number">4</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Telephone number</td>
              <td class="field-value" style="border: none;">${data.telephoneNumber || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 5: Email -->
      <tr>
        <td class="row-number">5</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Email</td>
              <td class="field-value" style="border: none;">${data.email || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 6: Type of Applicant -->
      <tr>
        <td class="row-number">6</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Type of Applicant</td>
              <td style="border: none;">
                <div class="checkbox-container">
                  <span>Individual</span>
                  <span class="checkbox ${data.typeOfApplicant === 'individual' ? 'checked' : ''}"></span>
                </div>
                <div class="checkbox-container">
                  <span>Organization</span>
                  <span class="checkbox ${data.typeOfApplicant === 'organization' ? 'checked' : ''}"></span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Empty Section Row -->
      <tr>
        <td colspan="2" class="empty-row"></td>
      </tr>

      <!-- Section Header -->
      <tr>
        <td colspan="2" class="header-row">REQUEST DETAILS</td>
      </tr>

      <!-- Row 7: Description -->
      <tr>
        <td class="row-number">7</td>
        <td>
          <div style="margin-bottom: 5px;">
            <strong>Description of the Information):</strong>
<!--             being sought (specify the type and class of information including cover dates. Kindly fill multiple applications for multiple requests-->
          </div>
          <div class="large-field">${data.description || ''}</div>
        </td>
      </tr>

      <!-- Row 8: Manner of Access -->
      <tr>
        <td class="row-number">8</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Manner of Access:</td>
              <td style="border: none;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                  <div class="checkbox-container">
                    <span>Inspection of Information</span>
                    <span class="checkbox ${data.mannerOfAccess === 'inspection' ? 'checked' : ''}"></span>
                  </div>
                  <div class="checkbox-container">
                    <span>Copy of Information</span>
                    <span class="checkbox ${data.mannerOfAccess === 'copy' ? 'checked' : ''}"></span>
                  </div>
                  <div class="checkbox-container">
                    <span>Viewing/Listen</span>
                    <span class="checkbox ${data.mannerOfAccess === 'viewing_listen' ? 'checked' : ''}"></span>
                  </div>
                  <div class="checkbox-container">
                    <span>Written Transcript</span>
                    <span class="checkbox ${data.mannerOfAccess === 'written_transcript' ? 'checked' : ''}"></span>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 9: Safeguarding -->
      <tr>
        <td class="row-number">9</td>
        <td>
          <div style="margin-bottom: 5px;">
            <strong>Is the requested information necessary to safeguard life and liberty of person</strong>
          </div>
          <div style="margin-bottom: 8px;">
            <div class="checkbox-container">
              <span>Yes</span>
              <span class="checkbox ${data.isLifeLiberty === true ? 'checked' : ''}"></span>
            </div>
            <div class="checkbox-container">
              <span>No</span>
              <span class="checkbox ${data.isLifeLiberty === false ? 'checked' : ''}"></span>
            </div>
          </div>
          <div style="margin-top: 8px;">
            <strong>If Yes provide details:</strong>
            <div class="medium-field" style="margin-top: 5px;">${data.lifeLibertyDetails || ''}</div>
          </div>
        </td>
      </tr>

      <!-- Row 10: Form of Access -->
      <tr>
        <td class="row-number">10</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Form of Access:</td>
              <td style="border: none;">
                <div class="checkbox-container">
                  <span>Hard copy</span>
                  <span class="checkbox ${data.formOfAccess === 'hard_copy' ? 'checked' : ''}"></span>
                </div>
                <div class="checkbox-container">
                  <span>Electronic copy</span>
                  <span class="checkbox ${data.formOfAccess === 'electronic_copy' ? 'checked' : ''}"></span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 11: Date of Submission -->
      <tr>
        <td class="row-number">11</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Date of the submission of request</td>
              <td class="field-value" style="border: none;">${formatDate(data.dateOfSubmission) || ''}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 12: Signature of Witness -->
      <tr>
        <td class="row-number">12</td>
        <td>
          <div style="margin-bottom: 5px;">
            <strong>Signature of Witness (where applicable)</strong>
          </div>
          <div class="note-text">
            "This request was read to the applicant in the language the applicant understands, and the applicant appeared to have understood the content of the request."
          </div>
          <div class="medium-field" style="margin-top: 8px;">${data.witnessSignature || ''}</div>
          ${data.witnessStatement ? `<div style="margin-top: 8px;"><strong>Witness Statement:</strong><br>${data.witnessStatement}</div>` : ''}
        </td>
      </tr>

      <!-- Empty Section Row -->
      <tr>
        <td colspan="2" class="empty-row"></td>
      </tr>

      <!-- Section Header -->
      <tr>
        <td colspan="2" class="header-row">FOR OFFICIAL USE ONLY</td>
      </tr>

      <!-- Row 13: Confirmation -->
      <tr>
        <td class="row-number">13</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td style="border: none; width: 50%; padding-right: 10px;">
                <strong>Confirmation of the receipt of the request</strong>
              </td>
              <td style="border: none; width: 50%;">
                <div style="font-weight: normal;">
                  (institution's stamp and name of officer receiving the request)
                </div>
                <div class="medium-field" style="margin-top: 5px;">${data.institutionStamp || ''}<br>${data.officerName || ''}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Row 14: Date of Receipt -->
      <tr>
        <td class="row-number">14</td>
        <td>
          <table style="border: none; width: 100%;">
            <tr>
              <td class="field-label" style="border: none;">Date of the receipt</td>
              <td class="field-value" style="border: none;">${formatDate(data.dateOfReceipt) || ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Acknowledgement Section -->
    <div style="margin-top: 20px;">
      <div style="font-size: 12pt; font-weight: bold; color: #1f296f; margin-bottom: 10px;">6. Acknowledgement of Fees</div>
      <div style="margin-bottom: 10px;">
        This request was read to the applicant in the language the applicant understands, and the applicant appeared to have understood
the content of the request.
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
