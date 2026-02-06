'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReviewDashboard from './components/ReviewDashboard';
import AnalysisProgressModal from './components/AnalysisProgressModal';
import NotAContractPage from './components/NotAContractPage';
import AuthScreen from './components/AuthScreen';
import UploadPanel from './components/UploadPanel';
import { DEMO_DATA } from './lib/demo-data';
import { formatFileSize } from './lib/utils';
import { generateReportHTML } from './lib/report-generator';

export default function Home() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App state
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [parsedDocument, setParsedDocument] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');

  // View state: 'input' | 'results' | 'not-contract'
  const [viewMode, setViewMode] = useState('input');
  const [analysisPhase, setAnalysisPhase] = useState('parse');
  const [notContractInfo, setNotContractInfo] = useState(null);
  const [streamProgress, setStreamProgress] = useState(0);

  // New UI state
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check for stored auth on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('legal-app-auth');
    if (stored) {
      setIsAuthenticated(true);
      setPassword(stored);
    }
    setMounted(true);
  }, []);

  // Auth handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem('legal-app-auth', password);
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid password');
      }
    } catch (err) {
      setAuthError('Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // File handling
  const handleFileUpload = useCallback(async (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];

    if (!validExtensions.includes(ext)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setSelectedFile(file);
    setSelectedSample(null);
    setCurrentDocument({
      name: file.name,
      size: formatFileSize(file.size),
      rawFile: file,
    });
    setParsedDocument(null);
    setResults(null);
    setError('');
    setViewMode('input');

    if (ext === '.txt') {
      const content = await file.text();
      setDocumentContent(content);
    } else if (ext === '.docx') {
      setIsParsing(true);
      try {
        const buffer = await file.arrayBuffer();
        const res = await fetch(`/api/parse-docx?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-app-password': password,
          },
          body: buffer,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to parse DOCX');
        }

        setParsedDocument(data.document);
        setDocumentContent(data.document.fullText);
      } catch (err) {
        setError(`DOCX parsing failed: ${err.message}`);
        setDocumentContent(`[DOCX parsing error - ${err.message}]`);
      } finally {
        setIsParsing(false);
      }
    } else if (ext === '.pdf') {
      setIsParsing(true);
      try {
        const buffer = await file.arrayBuffer();
        const res = await fetch(`/api/parse-pdf?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-app-password': password,
          },
          body: buffer,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to parse PDF');
        }

        setParsedDocument(data.document);
        setDocumentContent(data.document.fullText);
      } catch (err) {
        setError(`PDF parsing failed: ${err.message}`);
        setDocumentContent(`[PDF parsing error - ${err.message}]`);
      } finally {
        setIsParsing(false);
      }
    } else {
      setDocumentContent(`[${ext.toUpperCase()} file uploaded - DOC parsing coming soon]`);
    }
  }, [password]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  // Sample selection
  const handleSampleSelect = async (sampleId) => {
    setSelectedSample(sampleId);
    setSelectedFile(null);

    const filename = sampleId === 'standard' ? 'standard-nda.txt' : 'problematic-nda.txt';
    try {
      const res = await fetch(`/sample-ndas/${filename}`);
      const content = await res.text();
      setCurrentDocument({ name: filename, size: formatFileSize(content.length) });
      setDocumentContent(content);
      setParsedDocument(null);
      setResults(null);
      setError('');
      setViewMode('input');
    } catch (err) {
      setError('Could not load sample document');
    }
  };

  // Clear document and start fresh
  const startNewDocument = () => {
    setSelectedFile(null);
    setSelectedSample(null);
    setCurrentDocument(null);
    setDocumentContent('');
    setParsedDocument(null);
    setResults(null);
    setError('');
    setViewMode('input');
    setNotContractInfo(null);
    setStreamProgress(0);
  };

  // Run demo (no API call)
  const runDemo = (type) => {
    setResults(DEMO_DATA[type]);
    setViewMode('results');
  };

  // Run analysis via API
  const runAnalysis = async () => {
    if (!documentContent) {
      setError('Please upload a document first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisPhase('parse');
    setStreamProgress(0);
    setError('');

    try {
      setAnalysisPhase('analyze');

      const docContent = parsedDocument ? parsedDocument.annotatedText : documentContent;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-password': password,
        },
        body: JSON.stringify({
          document: docContent,
          filename: currentDocument?.name,
        }),
      });

      // Check if response is SSE stream
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        // SSE streaming response
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalResult = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === 'progress') {
                  setStreamProgress(event.progress || 0);
                } else if (event.type === 'complete') {
                  finalResult = event.result;
                } else if (event.type === 'error') {
                  throw new Error(event.message || 'Analysis failed');
                }
              } catch (parseErr) {
                if (parseErr.message !== 'Analysis failed') continue;
                throw parseErr;
              }
            }
          }
        }

        if (!finalResult) throw new Error('Stream ended without result');

        if (finalResult.isContract === false) {
          setNotContractInfo({
            documentType: finalResult.documentType,
            reason: finalResult.notContractReason,
            filename: currentDocument?.name,
          });
          setViewMode('not-contract');
          return;
        }

        setStreamProgress(100);
        setResults({
          ...finalResult.analysis,
          rawAnalysis: finalResult.rawAnalysis || JSON.stringify(finalResult.analysis, null, 2),
        });
        setViewMode('results');
      } else {
        // Standard JSON response (fallback)
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Analysis failed');
        }

        if (data.isContract === false) {
          setNotContractInfo({
            documentType: data.documentType,
            reason: data.notContractReason,
            filename: currentDocument?.name,
          });
          setViewMode('not-contract');
          return;
        }

        setAnalysisPhase('identify');
        await new Promise(r => setTimeout(r, 300));
        setAnalysisPhase('recommend');
        await new Promise(r => setTimeout(r, 300));

        setResults({
          ...data.analysis,
          rawAnalysis: data.rawAnalysis || JSON.stringify(data.analysis, null, 2),
        });
        setViewMode('results');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export report
  const exportReport = () => {
    if (!results) return;
    const html = generateReportHTML(results);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-analysis-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <AuthScreen
        password={password}
        setPassword={setPassword}
        authError={authError}
        authLoading={authLoading}
        onLogin={handleLogin}
      />
    );
  }

  // Not a contract page
  if (viewMode === 'not-contract' && notContractInfo) {
    return (
      <NotAContractPage
        documentType={notContractInfo.documentType}
        reason={notContractInfo.reason}
        filename={notContractInfo.filename}
        onTryAgain={startNewDocument}
      />
    );
  }

  // Results view
  if (viewMode === 'results' && results) {
    return (
      <ReviewDashboard
        parsedDocument={parsedDocument}
        analysisResult={results}
        onBack={startNewDocument}
        onExport={exportReport}
      />
    );
  }

  // Main input view
  return (
    <>
      <AnalysisProgressModal
        isOpen={isAnalyzing}
        currentPhase={analysisPhase}
        streamProgress={streamProgress}
        documentInfo={parsedDocument?.metadata ? {
          ...parsedDocument.metadata,
          filename: currentDocument?.name,
        } : null}
        onCancel={() => setIsAnalyzing(false)}
      />

      <header className="header">
        <div className="logo">
          <Image
            src="/consello-logo.jpg"
            alt="Consello"
            width={140}
            height={40}
            className="logo-image"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <nav className="nav">
          <Link href="/" className="nav-btn active">Analyze</Link>
          <Link href="/playbook" className="nav-btn">Playbook</Link>
          <Link href="/about" className="nav-btn">About</Link>
        </nav>
        <div className="header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              sessionStorage.removeItem('legal-app-auth');
              setIsAuthenticated(false);
              setPassword('');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <UploadPanel
        selectedFile={selectedFile}
        selectedSample={selectedSample}
        isDragging={isDragging}
        isParsing={isParsing}
        isAnalyzing={isAnalyzing}
        mounted={mounted}
        error={error}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={handleFileSelect}
        onSampleSelect={handleSampleSelect}
        onClear={startNewDocument}
        onAnalyze={runAnalysis}
      />

      <footer className="footer">
        <p>© {new Date().getFullYear()} Consello. This tool assists with legal workflows but does not constitute legal advice.</p>
      </footer>
    </>
  );
}
