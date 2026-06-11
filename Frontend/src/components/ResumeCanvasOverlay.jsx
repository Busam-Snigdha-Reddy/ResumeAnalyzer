import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../services/api.js';

// Set up worker path for PDF.js. We use CDN worker to avoid local bundle build issues.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const ResumeCanvasOverlay = ({ resumeId, fileType, suggestions = [] }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [docxText, setDocxText] = useState('');
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    if (!resumeId) return;

    if (fileType === 'application/pdf') {
      loadPdf();
    } else {
      loadDocx();
    }
  }, [resumeId, fileType, suggestions]);

  const loadDocx = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/resumes/${resumeId}`);
      setDocxText(response.data.rawText || '');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPdf = async () => {
    setLoading(true);
    setError(null);
    setHighlights([]);
    
    try {
      const response = await api.get(`/resumes/${resumeId}/file`, {
        responseType: 'arraybuffer'
      });
      
      const arrayBuffer = response.data;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // Render page 1 for analysis

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 1.5 }); // High-DPI scale

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF Page into Canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      // Extract Text Layer Details for coordinates
      const textContent = await page.getTextContent();
      const items = textContent.items;

      const computedHighlights = [];

      suggestions.forEach((suggestion, idx) => {
        const snippet = suggestion.textSnippet;
        if (!snippet) return;

        // Perform clean text matching
        const cleanSnippet = snippet.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!cleanSnippet) return;

        // Find the index of the matching text item
        const matchingItem = items.find(item => {
          const cleanItem = item.str.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanItem && (cleanItem.includes(cleanSnippet) || cleanSnippet.includes(cleanItem));
        });

        if (matchingItem) {
          const [scaleX, skewY, skewX, scaleY, tx, ty] = matchingItem.transform;
          const width = matchingItem.width;
          const height = matchingItem.height;

          // Convert PDF coordinates (origin bottom-left) to Viewport coordinates (origin top-left)
          const startPoint = viewport.convertToViewportPoint(tx, ty + height);
          const endPoint = viewport.convertToViewportPoint(tx + width, ty);

          computedHighlights.push({
            id: idx,
            top: startPoint[1],
            left: startPoint[0],
            width: endPoint[0] - startPoint[0],
            height: endPoint[1] - startPoint[1],
            suggestion,
          });
        }
      });

      setHighlights(computedHighlights);
    } catch (err) {
      console.error(err);
      setError('Could not render PDF. Falling back to plain text extraction.');
      loadDocx(); // Fallback to plain text DOCX layout
    } finally {
      setLoading(false);
    }
  };

  // Helper to color borders based on severity
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-rose-500/80 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.3)] hover:bg-rose-500/20';
      case 'medium':
        return 'border-amber-500/80 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.3)] hover:bg-amber-500/20';
      default:
        return 'border-violet-500/80 bg-violet-500/10 shadow-[0_0_12px_rgba(139,92,246,0.3)] hover:bg-violet-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-slate-800 bg-slate-900/50 rounded-2xl h-[600px] backdrop-blur">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-slate-400">Loading interactive resume canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-rose-950 bg-rose-950/20 text-rose-300 rounded-2xl mb-6">
        <p className="font-semibold mb-2">Notice: {error}</p>
        <p className="text-sm opacity-90">Switching to document text analyzer rendering mode.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-4">
      {fileType === 'application/pdf' && docxText === '' ? (
        /* PDF Canvas View */
        <div className="relative w-full overflow-auto bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 flex justify-center shadow-2xl">
          <div ref={containerRef} className="relative inline-block select-none">
            <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-xl" />
            
            {/* Interactive Coordinate Highlights */}
            {highlights.map((hl) => (
              <div
                key={hl.id}
                style={{
                  position: 'absolute',
                  top: `${hl.top}px`,
                  left: `${hl.left}px`,
                  width: `${hl.width + 4}px`,
                  height: `${hl.height + 4}px`,
                  transform: 'translate(-2px, -2px)', // offset border padding
                }}
                className={`border rounded cursor-pointer transition-all duration-200 ${getSeverityStyle(hl.suggestion.severity)}`}
                onMouseEnter={() => setActiveTooltip(hl)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {/* Embedded Floating Tooltip */}
                {activeTooltip && activeTooltip.id === hl.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 z-50 p-4 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md animate-fade-in">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        hl.suggestion.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                        hl.suggestion.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-violet-500/20 text-violet-400'
                      }`}>
                        {hl.suggestion.category || 'Feedback'} ({hl.suggestion.severity})
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-100 mb-2 leading-relaxed">
                      {hl.suggestion.message}
                    </p>
                    {hl.suggestion.textSnippet && (
                      <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-400 break-words leading-tight">
                        "{hl.suggestion.textSnippet}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DOCX Paper HTML View */
        <div className="w-full max-w-3xl bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 shadow-xl max-h-[600px] overflow-y-auto">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Interactive Content Highlight</h4>
          <div className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">
            {/* Highlighted text mapping inside DOCX */}
            {suggestions.length > 0 ? (
              (() => {
                let formatted = docxText;
                suggestions.forEach((sug) => {
                  if (!sug.textSnippet) return;
                  const idx = formatted.toLowerCase().indexOf(sug.textSnippet.toLowerCase());
                  if (idx !== -1) {
                    const exactSnippet = formatted.substring(idx, idx + sug.textSnippet.length);
                    // Match visual highlight class
                    const colorClass = sug.severity === 'high' ? 'bg-rose-500/20 text-rose-300 border-b border-rose-500' :
                                       sug.severity === 'medium' ? 'bg-amber-500/20 text-amber-300 border-b border-amber-500' :
                                       'bg-violet-500/20 text-violet-300 border-b border-violet-500';
                    
                    formatted = formatted.replace(
                      exactSnippet,
                      `<span class="${colorClass} px-1 rounded cursor-help font-semibold" title="${sug.category.toUpperCase()}: ${sug.message}">${exactSnippet}</span>`
                    );
                  }
                });
                return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
              })()
            ) : (
              docxText
            )}
          </div>
        </div>
      )}
    </div>
  );
};
