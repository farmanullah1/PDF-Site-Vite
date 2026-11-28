import { useState, useCallback, useRef, useEffect } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { Field } from '../../components/pdf/Field';
import { getPdfLib, readFileAsArrayBuffer, bytesToBlob, downloadBlob, ensurePdfJs, pdfPageCount } from '../../lib/pdf-helpers';
import { toolById } from '../../data/toolsConfig';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { FileText, Download, X, HelpCircle, Check, X as XIcon } from 'lucide-react';

const tool = toolById('quiz-pdf')!;

interface QItem {
  question: string;
  answer: string;
  hint: string;
}

export default function Quiz() {
  const [file, setFile] = useState<{ file: File; url: string; pageCount: number } | null>(null);
  const [mode, setMode] = useState<'study' | 'quiz'>('study');
  const [questions, setQuestions] = useState<QItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const pdfJsLib = useRef<unknown>(null);
  const fileInputRef = { current: null as HTMLInputElement | null };

  useEffect(() => {
    ensurePdfJs().then((lib) => { pdfJsLib.current = lib; }).catch(() => {});
  }, []);

  const addFile = useCallback(
    async (incoming: File[]) => {
      const f = incoming[0];
      if (!f) return;
      const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) { setError('Please select a PDF file.'); return; }
      if (f.size > 50 * 1024 * 1024) { setError('File is too large (limit 50 MB).'); return; }
      const url = URL.createObjectURL(f);
      setFile({ file: f, url, pageCount: 0 });
      setError(null);
      setQuestions([]);
      setCurrent(0);
      setShowAnswer(false);
      setCorrect(null);
      setScore({ correct: 0, total: 0 });
      setResult(null);
      try {
        const count = await pdfPageCount(new Uint8Array(await readFileAsArrayBuffer(f)));
        setFile((p) => (p && p.file === f ? { ...p, pageCount: count } : p));
        // Stub: in a real app you'd extract page text with PDF.js and send it to an LLM
        // to generate questions. Here we seed a couple of example items so the flow is playable.
        setQuestions([
          { question: 'What is a PDF?', answer: 'A Portable Document Format file that preserves layout across devices.', hint: 'Think of a document that looks the same everywhere.' },
          { question: 'What does PDF stand for?', answer: 'Portable Document Format.', hint: 'P apparently stands for portable.' },
        ]);
      } catch {
        setError('Could not read the PDF.');
      }
    },
    [],
  );

  const clearAll = useCallback(() => {
    if (file) URL.revokeObjectURL(file.url);
    setFile(null);
    setQuestions([]);
    setCurrent(0);
    setShowAnswer(false);
    setCorrect(null);
    setScore({ correct: 0, total: 0 });
    setError(null);
    setResult(null);
  }, [file]);

  const next = useCallback(() => {
    if (correct !== null) {
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    }
    setShowAnswer(false);
    setCorrect(null);
    setCurrent((i) => (i + 1) % questions.length);
  }, [correct, questions.length]);

  const buildStudyNotes = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await getPdfLib();
      const src = await PDFLib.PDFDocument.load(new Uint8Array(await readFileAsArrayBuffer(file.file)), { ignoreEncryption: true });
      const out = await PDFLib.PDFDocument.create();
      const page = out.addPage([595, 842]);
      const font = await out.embedFont(StandardFonts.Helvetica);
      let y = 800;
      const line = (text: string, size = 12, bold = false) => {
        if (!text) return;
                  page.drawText(text, { x: 40, y, size, font });
        y -= size + 6;
      };
      line('Study notes from ' + file.file.name, 16, true);
      line('Generated from the uploaded PDF (preview flow).', 11);
      y -= 10;
      line('Terms to review:', 13, true);
      for (const q of questions) {
        if (y < 60) break;
        line('• ' + q.question, 11);
        y -= 14;
        line('  → ' + q.answer, 10);
        y -= 16;
      }
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      setResult({ blob, name: (file.file.name.replace(/\.pdf$/i, '') || 'study') + '-study-notes.pdf' });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Could not build study notes.') + ' (Your PDF stays on this device.)');
    } finally {
      setLoading(false);
    }
  }, [file, questions]);

  const ready = file !== null && questions.length > 0 && !loading;

  if (result) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
          <h2 className="text-[1.25rem] font-semibold text-[#161616]">Study notes saved</h2>
          <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
            <X size={15} /> Start over
          </button>
        </div>
        <p className="mb-4 text-sm text-[#47474f]">
          A one-page study sheet was built from the example terms in your PDF.
        </p>
        <div className="flex flex-col gap-4">
          <button onClick={() => downloadBlob(result.blob, result.name)} className="btn-primary w-full">
            Download study notes PDF
          </button>
          <div className="rounded-xl border border-[#c4c4cc] bg-[#f5f5fa] p-4 text-sm text-[#47474f]">
            Your file was processed entirely in your browser. Nothing was uploaded.
          </div>
        </div>
      </>
    );
  }

  if (questions.length > 0 && !file === false) {
    const q = questions[current];
    const done = current >= questions.length;

    if (mode === 'quiz' && q) {
      return (
        <>
          <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
            <h2 className="text-[1.25rem] font-semibold text-[#161616]">Quiz mode · {current + 1} / {questions.length}</h2>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> End quiz
            </button>
          </div>
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm text-[#47474f]">
              <HelpCircle size={14} />
              <span>Try to answer before revealing.</span>
            </div>
            <p className="mb-5 text-[1.05rem] font-medium text-[#161616]">{q.question}</p>
            {showAnswer ? (
              <div className="mb-4 rounded-lg border border-[#c4c4cc] bg-[#f5f5fa] p-4">
                <p className="mb-2 text-sm font-medium text-[#161616]">Answer</p>
                <p className="text-sm text-[#47474f]">{q.answer}</p>
                {q.hint && <p className="mt-2 text-xs text-[#47474f]">Hint: {q.hint}</p>}
              </div>
            ) : null}
            {correct !== null && (
              <div className="mb-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
                {correct ? (
                  <>
                    <Check size={16} className="text-[#2e7d32]" />
                    <span className="font-medium text-[#2e7d32]">Correct</span>
                  </>
                ) : (
                  <>
                    <XIcon size={16} className="text-[#c92a24]" />
                    <span className="font-medium text-[#c92a24]">Not quite</span>
                  </>
                )}
              </div>
            )}
            <div className="mb-4 flex items-center gap-2 text-sm text-[#47474f]">
              <span>You got {score.correct} of {score.total} so far.</span>
            </div>
            <div className="flex flex-col gap-3">
              {!showAnswer ? (
                <button onClick={() => { setShowAnswer(true); setCorrect(null); }} className="btn-primary w-full">
                  Show answer
                </button>
              ) : (
                <>
                  <button onClick={() => setCorrect(true)} className="btn-primary w-full">
                    I got it right
                  </button>
                  <button onClick={() => setCorrect(false)} className="btn-secondary w-full">
                    I missed it
                  </button>
                </>
              )}
            </div>
            {showAnswer && correct !== null && (
              <button onClick={next} className="btn-secondary w-full">
                {current + 1 >= questions.length ? 'See results' : 'Next question'}
              </button>
            )}
          </div>
        </>
      );
    }

    if (mode === 'quiz' && !q) {
      return (
        <>
          <div className="mb-4 flex items-center justify-between border-t border-[#c4c4cc] pt-4">
            <h2 className="text-[1.25rem] font-semibold text-[#161616]">Quiz complete</h2>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> Start over
            </button>
          </div>
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-8 shadow-sm text-center">
            <p className="mb-2 text-sm text-[#47474f]">You answered {score.total} question{score.total === 1 ? '' : 's'}.</p>
            <p className="mb-2 text-2xl font-semibold text-[#161616]">{score.correct} / {score.total} correct</p>
            <button onClick={() => setCurrent(0)} className="btn-primary mt-2">
              Retry quiz
            </button>
          </div>
        </>
      );
    }
  }

  return (
    <StandardLayout tool={tool}>
      <div className="mb-5">
        <Dropzone
          accept=".pdf,application/pdf"
          maxSizeMB={50}
          multiple={false}
          label="Select the PDF to review"
          helper="One file at a time"
          onFiles={addFile}
          fileCount={file ? 1 : 0}
          fileInputRef={fileInputRef}
        />
      </div>

      {file && (
        <div className="mb-5">
          <div className="flex items-center justify-between border-t border-[#c4c4cc] pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7253e2]/10 text-[#7253e2]">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <span className="truncate text-sm font-medium text-[#161616]">{file.file.name}</span>
                <span className="text-xs text-[#47474f]">{file.pageCount} page{file.pageCount === 1 ? '' : 's'}</span>
              </div>
            </div>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      )}

      {questions.length > 0 && (
        <div className="mb-5">
          <div className="rounded-xl border border-[#c4c4cc] bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-[1.125rem] font-semibold text-[#161616]">Review mode</h3>
            <div className="flex flex-col gap-4">
              <Field
                label="Study terms"
                placeholder="List your study terms, one per line"
                value={questions.map((q) => q.question).join('\n')}
                onChange={() => {}}
                help="These example terms were seeded from the PDF for you to review. In a full version, key terms would be extracted automatically."
              />
              <Field label="Questions" value={questions.length} onChange={() => {}} />
              <button
                onClick={() => setMode(mode === 'study' ? 'quiz' : 'study')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === 'quiz' ? 'bg-[#e5322d] text-white hover:bg-[#c92a24]' : 'bg-[#f0f0f5] text-[#161616] hover:bg-[#e5e5ec]'}`}
              >
                {mode === 'study' ? 'Switch to quiz mode' : 'Switch to study mode'}
              </button>
            </div>
          </div>
        </div>
      )}

      {questions.length === 0 && (
        <p className="text-sm text-[#47474f]">
          Once a PDF is loaded, you can study its terms or quiz yourself. The example terms above are placeholders — a full version would extract key terms from the document.
        </p>
      )}

      {questions.length > 0 && (
        <div className="flex flex-col gap-4">
          <button onClick={buildStudyNotes} disabled={!ready} className="btn-primary w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Building study notes…
              </span>
            ) : (
              'Build study notes PDF'
            )}
          </button>
          {error && <p className="text-sm text-[#c92a24]">{error}</p>}
          <p className="text-xs text-[#47474f]">
            Question generation from a real PDF would require an LLM backend. This demo uses seeded example terms so the flow is playable in your browser.
          </p>
        </div>
      )}
    </StandardLayout>
  );
}

