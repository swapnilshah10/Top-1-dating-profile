import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResumeViewer } from './components/ResumeViewer';
import { Dashboard } from './components/Dashboard';
import { extractPDFData, PdfDocumentData } from './services/pdf';
import { analyzeResume, ResumeAnalysis } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Sparkles, AlertTriangle, Key } from 'lucide-react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'analyzing' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [pdfData, setPdfData] = useState<PdfDocumentData | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race conditions as per guidelines
        setHasApiKey(true);
      } catch (error) {
        console.error('Failed to select API key:', error);
      }
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('parsing');
    setErrorMsg('');

    try {
      // 1. Extract text and bounding boxes from PDF
      const data = await extractPDFData(selectedFile);
      setPdfData(data);

      // 2. Analyze text with Gemini
      setStatus('analyzing');
      const result = await analyzeResume(data.text);
      setAnalysis(result);
      setStatus('done');
    } catch (error: any) {
      console.error(error);
      // If the error is related to a missing entity/key, reset the key state
      if (error.message?.includes('Requested entity was not found') || error.message?.includes('API_KEY')) {
        setHasApiKey(false);
      }
      setErrorMsg(error.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setPdfData(null);
    setAnalysis(null);
    setErrorMsg('');
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">API Key Required</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            To use the Top 1% Optimizer, please select your Google Cloud API key. This ensures you only use your own quota and keeps your data secure.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Key className="w-5 h-5" />
            Select API Key
          </button>
          <p className="mt-6 text-xs text-slate-400">
            Need a key? Visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">billing documentation</a>.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Top 1% Optimizer</span>
          </div>
          {status === 'done' && (
            <button
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Upload New Resume
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mt-12"
            >
              <div className="text-center mb-12">
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-6">
                  Is your resume holding you back?
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Get a brutally honest, line-by-line analysis of your resume powered by elite recruiting standards.
                </p>
              </div>
              
              <FileUpload onFileSelect={handleFileSelect} />
              
              <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900">1. Upload PDF</div>
                  <div className="text-sm text-slate-500">Secure & private parsing</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-900">2. AI Analysis</div>
                  <div className="text-sm text-slate-500">Deep ATS keyword matching</div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-900">3. Get Hired</div>
                  <div className="text-sm text-slate-500">Actionable improvements</div>
                </div>
              </div>
            </motion.div>
          )}

          {(status === 'parsing' || status === 'analyzing') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto mt-32 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {status === 'parsing' ? 'Extracting text...' : 'Analyzing your career...'}
              </h2>
              <p className="text-slate-500">
                {status === 'parsing'
                  ? 'Reading PDF contents securely.'
                  : 'Applying elite recruiting standards to your experience.'}
              </p>
              
              {/* Fake Progress Bar for UX */}
              <div className="mt-8 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-600"
                  initial={{ width: '0%' }}
                  animate={{ width: status === 'parsing' ? '30%' : '85%' }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mt-32 text-center"
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Analysis Failed</h2>
              <p className="text-slate-600 mb-8">{errorMsg}</p>
              <button
                onClick={reset}
                className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {status === 'done' && analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-16"
            >
              <Dashboard analysis={analysis} />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    Line-by-Line Analysis
                  </h2>
                  <div className="flex gap-4 text-sm font-medium">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Strong</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Polish</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-400"></span> Fix</div>
                  </div>
                </div>
                <ResumeViewer file={file!} pdfData={pdfData!} highlights={analysis.highlights} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
