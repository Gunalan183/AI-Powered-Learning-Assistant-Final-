import React, { useState, useRef } from 'react';
import { IconUpload, IconFileText } from './icons/Icons';

interface DocumentInputProps {
  onSubmit: (text: string) => void;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = async (file: File) => {
    setFileName(`Processing ${file.name}...`);
    setIsProcessing(true);
    setFileError(null);
    setText('');

    try {
      let fileContent = '';
      if (file.type === 'application/pdf') {
        const pdfjsLib = (window as any).pdfjsLib;
        
        // Robust check to ensure the library is fully loaded before use
        if (typeof pdfjsLib === 'undefined' || typeof pdfjsLib.getDocument !== 'function') {
          throw new Error("PDF processing library is not available. Please check your internet connection and refresh the page.");
        }
        
        // Set worker path dynamically
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const pageTexts = await Promise.all(
          Array.from({ length: pdf.numPages }, (_, i) => i + 1).map(async (pageNum) => {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            return textContent.items.map((item: any) => item.str).join(' ');
          })
        );
        fileContent = pageTexts.join('\n\n');
      } else {
        // Handle .txt, .md, and other text files
        fileContent = await file.text();
      }
      setText(fileContent);
      setFileName(file.name);
    } catch (error) {
      console.error("Error processing file:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setFileError(errorMessage);
      setFileName(`Error reading ${file.name}`);
      setText(`Could not read the content of the file. ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUploadedFile = (file: File | undefined) => {
    if (!file) return;

    const acceptedExtensions = ['.txt', '.md', '.pdf'];
    const fileNameLower = file.name.toLowerCase();
    const isSupported = acceptedExtensions.some(ext => fileNameLower.endsWith(ext));

    if (isSupported) {
        setFileError(null);
        readFile(file);
    } else {
        setFileError("Unsupported file type. Please upload a .txt, .md, or .pdf file.");
        setFileName(file.name);
        setText('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processUploadedFile(e.target.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!isProcessing) {
        setIsDragOver(true);
        if (fileError) setFileError(null); // Clear error on new drag action
      }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (isProcessing) return;
      
      processUploadedFile(e.dataTransfer.files?.[0]);
  };

  const triggerFileSelect = () => {
      if (!isProcessing) {
        if (fileError) setFileError(null); // Clear error on new select action
        fileInputRef.current?.click();
      }
  };

  const handleSubmit = () => {
    if (text.trim() && !isProcessing && !fileError) {
      onSubmit(text);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-white dark:bg-gray-800">
        <div 
            role="button"
            tabIndex={isProcessing ? -1 : 0}
            aria-label="Upload document file"
            aria-disabled={isProcessing}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${
              isProcessing 
                ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 opacity-60' 
                : fileError
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : isDragOver 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 cursor-pointer' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileSelect(); }}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.pdf"
                disabled={isProcessing}
            />
            <IconUpload className={`w-10 h-10 mb-2 transition-colors ${fileError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}/>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                <span className={`font-semibold transition-colors ${fileError ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Supports .txt, .md, and .pdf files
            </p>
            {fileName && !isProcessing && (
                <div className={`mt-3 flex items-center text-sm px-3 py-1.5 rounded-full ${fileError ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    <IconFileText className="w-4 h-4 mr-2 flex-shrink-0"/>
                    <span className="truncate" title={fileName}>{fileName}</span>
                </div>
            )}
            {fileError && (
              <p className="mt-2 text-sm text-center font-medium text-red-600 dark:text-red-400">{fileError}</p>
            )}
        </div>

      <textarea
        value={text}
        onChange={(e) => {
            setText(e.target.value);
            // Clear file state if user starts typing manually
            if (fileName || fileError) {
                setFileName(null);
                setFileError(null);
            }
        }}
        placeholder="...or paste text here. File content will appear here after upload."
        className="flex-grow w-full p-3 mt-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:placeholder-gray-400 disabled:opacity-60"
        aria-label="Document content"
        disabled={isProcessing}
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isProcessing || !!fileError}
        className="mt-4 w-full flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <IconFileText className="h-5 w-5 mr-2" />
            Process Document
          </>
        )}
      </button>
    </div>
  );
};