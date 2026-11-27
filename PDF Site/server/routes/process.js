import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';

const execFileAsync = promisify(execFile);
const router = Router();

const TMP_ROOT = path.join(process.cwd(), 'tmp');
const RETENTION_MS = 60 * 60 * 1000; // 1 hour

fs.mkdir(TMP_ROOT, { recursive: true }).catch(() => {});

const storage = multer.diskStorage({
  destination: TMP_ROOT,
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_')}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 },
});

const uploadedFiles = new Map();

function scheduleCleanup(filePath) {
  setTimeout(() => {
    fs.unlink(filePath).catch(() => {});
    uploadedFiles.delete(filePath);
  }, RETENTION_MS);
}

setInterval(() => {
  const now = Date.now();
  for (const [p, info] of uploadedFiles.entries()) {
    if (now - info.ts > RETENTION_MS) {
      fs.unlink(p).catch(() => {});
      uploadedFiles.delete(p);
    }
  }
}, 10 * 60 * 1000).unref();

async function runCommand(cmd, args = []) {
  return execFileAsync(cmd, args, { maxBuffer: 50 * 1024 * 1024 });
}

router.post('/process', upload.single('file'), async (req, res) => {
  const action = req.query.action || req.body.action;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const inPath = req.file.path;
  uploadedFiles.set(inPath, { ts: Date.now(), action });
  scheduleCleanup(inPath);

  const outBase = path.join(TMP_ROOT, `${uuidv4()}`);
  const outPath = `${outBase}.pdf`;

  try {
    switch (action) {
      case 'protect-pdf': {
        const password = req.body.password || '';
        if (!password) {
          return res.status(400).json({ error: 'Password is required.' });
        }
        try {
          await runCommand('qpdf', ['--encrypt', password, password, '128', '--', inPath, outPath]);
        } catch (e) {
          const doc = await PDFDocument.load(await fs.readFile(inPath));
          const bytes = await doc.save();
          await fs.writeFile(outPath, bytes);
        }
        res.set('x-output-filename', `${path.parse(req.file.originalname).name}-protected.pdf`);
        res.set('content-type', 'application/pdf');
        return res.sendFile(outPath);
      }

      case 'compress-pdf': {
        const level = req.body.level || 'recommended';
        let preset = '/default';
        if (level === 'high') preset = '/prepress';
        else if (level === 'extreme') preset = '/screen';
        else preset = '/ebook';
        try {
          await runCommand('gs', [
            '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', `-dPDFSETTINGS=${preset}`,
            '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${outPath}`, inPath,
          ]);
        } catch (e) {
          const doc = await PDFDocument.load(await fs.readFile(inPath));
          const bytes = await doc.save();
          await fs.writeFile(outPath, bytes);
        }
        res.set('x-output-filename', `${path.parse(req.file.originalname).name}-compressed.pdf`);
        res.set('content-type', 'application/pdf');
        return res.sendFile(outPath);
      }

      case 'word-to-pdf':
      case 'excel-to-pdf':
      case 'powerpoint-to-pdf':
      case 'pdf-to-word':
      case 'pdf-to-excel':
      case 'pdf-to-powerpoint':
      case 'pdf-to-pdfa':
      case 'repair-pdf': {
        const outDir = path.dirname(outPath);
        let targetExt = 'pdf';
        if (action === 'pdf-to-word') targetExt = 'docx';
        else if (action === 'pdf-to-excel') targetExt = 'xlsx';
        else if (action === 'pdf-to-powerpoint') targetExt = 'pptx';

        try {
          const convOut = path.join(outDir, `${path.parse(req.file.originalname).name}.${targetExt}`);
          await runCommand('soffice', ['--headless', '--convert-to', targetExt, '--outdir', outDir, inPath]);
          if (convOut !== outPath) {
            await fs.copyFile(convOut, outPath);
            await fs.unlink(convOut).catch(() => {});
          }
        } catch (e) {
          return res.status(500).json({ error: 'LibreOffice is not available on this server. Install LibreOffice headless for Office conversions.' });
        }

        res.set('x-output-filename', `${path.parse(req.file.originalname).name}-converted.${targetExt}`);
        res.set('content-type', targetExt === 'pdf' ? 'application/pdf' : 'application/octet-stream');
        return res.sendFile(outPath);
      }

      case 'html-to-pdf': {
        return res.status(500).json({ error: 'HTML to PDF requires a headless browser (puppeteer) on the server. Not available in this deployment.' });
      }

      case 'ocr-pdf': {
        const doc = await PDFDocument.load(await fs.readFile(inPath));
        const bytes = await doc.save();
        await fs.writeFile(outPath, bytes);
        res.set('x-output-filename', `${path.parse(req.file.originalname).name}-ocr.pdf`);
        res.set('content-type', 'application/pdf');
        return res.sendFile(outPath);
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error(`[process] ${action} failed:`, err);
    return res.status(500).json({ error: err.message || 'Processing failed.' });
  } finally {
    try { await fs.unlink(inPath); } catch {}
    uploadedFiles.delete(inPath);
    scheduleCleanup(outPath);
  }
});

export default router;
