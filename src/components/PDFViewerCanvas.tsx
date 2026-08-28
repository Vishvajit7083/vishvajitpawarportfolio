import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  FileText
} from 'lucide-react';
import { dataUrlToBlobUrl } from '../utils/pdfHelper';

// Configure worker for pdfjs-dist
if (typeof window !== 'undefined') {
  try {
    // Set fallback worker URL from unpkg / cdnjs matching pdfjs version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup warning:', e);
  }
}

interface PDFViewerCanvasProps {
  pdfDataUrl: string;
  fileName?: string;
  certificateId?: string;
  className?: string;
  onReplaceClick?: () => void;
}

export const PDFViewerCanvas: React.FC<PDFViewerCanvasProps> = ({
  pdfDataUrl,
  fileName = 'Document.pdf',
  certificateId,
  className = '',
  onReplaceClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const blobUrl = dataUrlToBlobUrl(pdfDataUrl);

  // Load Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const loadPDF = async () => {
      try {
        let loadingTask: any;

        if (pdfDataUrl.startsWith('data:application/pdf;base64,')) {
          const base64Data = pdfDataUrl.split(',')[1];
          const binaryStr = atob(base64Data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else {
          loadingTask = pdfjsLib.getDocument({ url: blobUrl || pdfDataUrl });
        }

        const loadedDoc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(loadedDoc);
          setTotalPages(loadedDoc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading PDF in PDF.js:', err);
        if (!isCancelled) {
          setError(err?.message || 'Could not parse PDF document.');
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isCancelled = true;
    };
  }, [pdfDataUrl, blobUrl]);

  // Render Page
  const renderPage = useCallback(
    async (pageNum: number, currentScale: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: currentScale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Support high-DPI displays for crisp seal & text rendering
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
          canvasContext: context,
          transform: transform || undefined,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      }
    },
    [pdfDoc]
  );

  useEffect(() => {
    if (pdfDoc && !loading && !error) {
      renderPage(currentPage, scale);
    }
  }, [pdfDoc, currentPage, scale, loading, error, renderPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleFit = () => {
    setScale(1.15);
  };

  return (
    <div className={`w-full h-full flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-cyan-500/30 ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono gap-2 shrink-0 z-10">
        <div className="flex items-center gap-2 truncate max-w-[260px] sm:max-w-sm">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-cyan-300 font-bold truncate">{fileName}</span>
          {certificateId && (
            <span className="text-slate-400 text-[10px] hidden md:inline px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
              ID: {certificateId}
            </span>
          )}
        </div>

        {/* Page Nav & Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {totalPages > 1 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-0.5 hover:text-cyan-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-semibold text-cyan-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-0.5 hover:text-cyan-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-cyan-400 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span
              onClick={handleFit}
              className="px-1 text-[10px] hover:text-cyan-300 cursor-pointer font-bold select-none"
              title="Click to reset scale"
            >
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-cyan-400 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href={blobUrl || pdfDataUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white text-[11px]"
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Tab</span>
          </a>

          <a
            href={blobUrl || pdfDataUrl}
            download={fileName || 'Certificate.pdf'}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Canvas Document Area */}
      <div className="flex-1 w-full bg-slate-950 overflow-auto flex items-center justify-center p-3 sm:p-6 relative">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 text-cyan-400 p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="font-mono text-xs text-slate-300 tracking-wider">
              RENDERING VECTOR PDF CANVAS...
            </span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-3 text-center p-6 max-w-md">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-xs font-mono text-rose-300">{error}</p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href={blobUrl || pdfDataUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono text-xs hover:bg-cyan-900"
              >
                Open in New Tab
              </a>
              {onReplaceClick && (
                <button
                  onClick={onReplaceClick}
                  className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs hover:bg-slate-700"
                >
                  Upload Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* The HTML5 Canvas for pure JavaScript rendering */}
        <canvas
          ref={canvasRef}
          className={`shadow-2xl rounded-sm transition-opacity duration-200 ${
            loading || error ? 'hidden' : 'block'
          }`}
          style={{ maxWidth: '100%' }}
        />
      </div>
    </div>
  );
};
