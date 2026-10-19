const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class ResumeParserService {
  /**
   * Extracts clean text from uploaded file buffer
   * @param {Object} file - Multer file object (buffer, originalname, mimetype)
   * @returns {Promise<{ text: string, format: string, wordCount: number, pageCount: number, isScanned: boolean }>}
   */
  async extractText(file) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new Error('Uploaded document is empty or corrupted (0 bytes).');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    let rawText = '';
    let pageCount = 1;

    try {
      if (ext === '.pdf') {
        const uint8 = new Uint8Array(file.buffer);
        if (pdfParse && pdfParse.PDFParse) {
          const parser = new pdfParse.PDFParse(uint8);
          await parser.load();
          const parsed = await parser.getText();
          rawText = parsed?.text || (typeof parsed === 'string' ? parsed : '');
          pageCount = parsed?.pages?.length || 1;
        } else if (typeof pdfParse === 'function') {
          const pdfData = await pdfParse(file.buffer);
          rawText = pdfData.text || '';
          pageCount = pdfData.numpages || 1;
        } else {
          throw new Error('PDF parsing engine could not be initialized.');
        }
      } else if (ext === '.docx' || ext === '.doc') {
        const docxData = await mammoth.extractRawText({ buffer: file.buffer });
        rawText = docxData.value || '';
      } else {
        throw new Error(`Unsupported file extension '${ext}'. Only .pdf and .docx are supported.`);
      }
    } catch (err) {
      if (err.message && err.message.includes('Password') || err.message.includes('encrypted')) {
        throw new Error('The document is password-protected or encrypted. Please remove password protection and re-upload.');
      }
      throw new Error(`Failed to extract text from ${ext.toUpperCase()} file: ${err.message}`);
    }

    // Sanitize text: remove null bytes and excessive whitespace
    const cleanedText = rawText
      .replace(/\0/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Word count calculation
    const words = cleanedText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Detect scanned or image-based PDF
    if (wordCount < 30 || cleanedText.length < 150) {
      const isScanned = ext === '.pdf';
      const msg = isScanned
        ? 'This PDF appears to be a scanned image with no selectable text layer. Please upload a digital PDF (exported directly from Word/Canva/Google Docs) or a DOCX file.'
        : 'The uploaded document contains insufficient text content to perform a meaningful career analysis.';
      
      const error = new Error(msg);
      error.isScanned = isScanned;
      error.wordCount = wordCount;
      throw error;
    }

    return {
      text: cleanedText,
      format: ext.replace('.', '').toUpperCase(),
      wordCount,
      pageCount,
      isScanned: false,
    };
  }
}

module.exports = new ResumeParserService();
