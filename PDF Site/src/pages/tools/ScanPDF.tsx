import { useState, useCallback, useRef, useEffect } from 'react';
import StandardLayout from '../../components/layout/StandardLayout';
import Dropzone from '../../components/ui/Dropzone';
import { bytesToBlob, downloadBlob } from '../../lib/pdf-helpers';
import { PDFDocument } from 'pdf-lib';
import { toolById } from '../../data/toolsConfig';
import { Camera, FileText, Image, RotateCw, X, Check, Loader2 } from 'lucide-react';

const tool = toolById('scan-pdf')!;

type ScanItem = {
  id: string;
  url: string;
  file: File;
  loading: boolean;
};

export default function ScanPDF() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOpen(true);
    } catch (e) {
      setError('Camera access denied. Please upload images instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = URL.createObjectURL(file);
      const newScan: ScanItem = { id: Date.now().toString(), url, file, loading: true };
      setScans((prev) => [...prev, newScan]);
      try {
        // Image will be embedded directly when building the PDF
      } catch {
        // ignore
      }
      setScans((prev) =>
        prev.map((s) => (s.id === newScan.id ? { ...s, loading: false } : s))
      );
    }, 'image/jpeg', 0.85);
    stopCamera();
  }, [stopCamera]);

  const addImages = useCallback(
    async (incoming: File[]) => {
      const valid: File[] = incoming.filter(
        (f) => f.type.startsWith('image/') || f.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)
      );
      if (valid.length === 0) return;
      setError(null);
      const newRows: ScanItem[] = valid.map((f) => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        url: URL.createObjectURL(f),
        file: f,
        loading: false,
      }));
      setScans((prev) => [...prev, ...newRows]);
    },
    []
  );

  const removeScan = useCallback((id: string) => {
    const scan = scans.find((s) => s.id === id);
    if (scan) URL.revokeObjectURL(scan.url);
    setScans((prev) => prev.filter((s) => s.id !== id));
    setResult(null);
  }, [scans]);

  const clearAll = useCallback(() => {
    scans.forEach((s) => URL.revokeObjectURL(s.url));
    setScans([]);
    setResult(null);
    setError(null);
  }, [scans]);

  const doScan = useCallback(async () => {
    if (scans.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const PDFLib = await import('pdf-lib');
      const { PDFDocument } = PDFLib;
      const out = await PDFDocument.create();
      for (const scan of scans) {
        const buf = await scan.file.arrayBuffer();
        const imgBytes = new Uint8Array(buf);
        const isJpeg = scan.file.type === 'image/jpeg' || scan.file.name.toLowerCase().endsWith('.jpg') || scan.file.name.toLowerCase().endsWith('.jpeg');
        let embeddedImage;
        if (isJpeg) {
          embeddedImage = out.embedJpg(imgBytes);
        } else if (scan.file.type === 'image/png') {
          embeddedImage = out.embedPng(imgBytes);
        } else {
          embeddedImage = out.embedJpg(imgBytes);
        }
        const page = out.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }
      const bytes = await out.save();
      const blob = bytesToBlob(bytes, 'application/pdf');
      setResult({ blob, name: 'scanned-document.pdf' });
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Scan failed.') + ' (Your files stay private.)');
    } finally {
      setLoading(false);
    }
  }, [scans]);

  const ready = scans.length > 0 && !loading;

  if (result) {
    return (
      <div className="text-center py-10">
        <h2 className="text-[1.25rem] font-semibold text-[#161616] mb-2">Your scanned PDF is ready</h2>
        <p className="mb-6 text-sm text-[#47474f]">
          {scans.length} page{scans.length === 1 ? '' : 's'} scanned from {scans.length} image{scans.length === 1 ? '' : 's'}.
        </p>
        <button
          onClick={() => downloadBlob(result.blob, result.name)}
          className="btn-primary w-full max-w-xs mx-auto"
        >
          Download scanned PDF
        </button>
        <button
          onClick={clearAll}
          className="mt-4 flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]"
        >
          <X size={15} /> Start over
        </button>
        <p className="mt-6 text-xs text-[#47474f]">
          Your files were processed entirely in your browser. Nothing was uploaded.
        </p>
      </div>
    );
  }

  return (
    <StandardLayout tool={tool}>
      {/* Scan options */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Dropzone
          accept="image/*"
          maxSizeMB={25}
          multiple
          label="Add images"
          helper="JPG, PNG, or WebP"
          onFiles={addImages}
          fileCount={scans.length}
        >
          {scans.length === 0 && (
            <p className="mt-2 text-xs text-[#47474f]">Drag & drop or click to browse images.</p>
          )}
        </Dropzone>
        <button
          onClick={startCamera}
          disabled={cameraOpen}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#c4c4cc] bg-white p-8 text-center transition-colors hover:border-[#EE6C4D]"
        >
          <Camera size={24} className="mb-2" />
          <span className="text-sm font-medium text-[#161616]">Scan with camera</span>
        </button>
      </div>

      {/* Camera modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="relative bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <button onClick={stopCamera} className="absolute top-4 right-4 text-[#161616] hover:text-[#EE6C4D]" aria-label="Close camera">
              <X size={20} />
            </button>
            <h3 className="mb-4 text-center font-semibold text-[#161616]">Point camera at document</h3>
            <div className="relative w-full aspect-video bg-[#f0f0f5] rounded-lg overflow-hidden mb-4">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <button
              onClick={capturePhoto}
              className="w-full rounded-lg bg-[#EE6C4D] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D0452D] hover:-translate-y-0.5"
            >
              Capture photo
            </button>
          </div>
        </div>
      )}

      {/* Scan list */}
      {scans.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between border-t border-[#c4c4cc] pt-2 mb-3">
            <h3 className="text-sm font-semibold text-[#161616]">Scans ({scans.length})</h3>
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-[#47474f] transition-colors hover:text-[#161616]">
              <X size={15} /> Clear all
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {scans.map((scan) => (
              <li key={scan.id} className="flex items-center gap-3 rounded-xl border border-[#c4c4cc] bg-white p-3">
                <img src={scan.url} alt="Scan preview" className="w-12 h-12 object-cover rounded-md" />
                <span className="flex-1 text-sm text-[#161616] truncate">{scan.file.name}</span>
                <button
                  onClick={() => removeScan(scan.id)}
                  className="rounded-lg p-1.5 text-[#47474f] transition-colors hover:bg-[#f0f0f5] hover:text-[#161616]"
                  aria-label={`Remove ${scan.file.name}`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action */}
      <div className="flex flex-col gap-4">
        <button
          onClick={doScan}
          disabled={!ready}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Creating PDF…
            </span>
          ) : (
            `Create PDF from ${scans.length} image${scans.length === 1 ? '' : 's'}`
          )}
        </button>
        {error && <p className="text-sm text-[#c92a24]">{error}</p>}
        <p className="text-xs text-[#47474f]">
          Images are converted to PDF pages in your browser. Nothing is uploaded.
        </p>
      </div>
    </StandardLayout>
  );
}
