import { useState } from "react";
import "./App.css";
import { FilePreview } from "./components/FilePreview";
import { FileUpload } from "./components/FileUpload";
import { HeaderConfiguration } from "./components/HeaderConfiguration";
import { HeaderDetectionDialog } from "./components/HeaderDetectionDialog";
import { MergeConfiguration } from "./components/MergeConfiguration";
import { MergeResult } from "./components/MergeResult";
import type { SpreadsheetFile } from "./types";
import { mergeSpreadsheets } from "./utils/mergeLogic";
import { parseFile } from "./utils/spreadsheetParser";

type AppState = "upload" | "configuring-headers" | "merging" | "result";

interface FileWithHeaderState {
  file: File;
  index: number;
  total: number;
}

export default function App() {
  const [state, setState] = useState<AppState>("upload");
  const [files, setFiles] = useState<SpreadsheetFile[]>([]);
  const [mergedData, setMergedData] = useState<
    Record<string, unknown>[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // For header detection flow
  const [headerFiles, setHeaderFiles] = useState<File[]>([]);
  const [currentHeaderFile, setCurrentHeaderFile] =
    useState<FileWithHeaderState | null>(null);

  // For header configuration flow
  const [configuringHeaderFiles, setConfiguringHeaderFiles] = useState<
    SpreadsheetFile[]
  >([]);
  const handleFilesSelected = async (selectedFiles: File[]) => {
    setError("");
    setLoading(true);

    try {
      // Start header detection flow
      setHeaderFiles(selectedFiles);
      setCurrentHeaderFile({
        file: selectedFiles[0],
        index: 0,
        total: selectedFiles.length,
      });
      setState("configuring-headers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process files");
      setLoading(false);
    }
  };

  const handleHeaderDetection = async (hasHeader: boolean) => {
    try {
      const currentFile = currentHeaderFile?.file;
      if (!currentFile) return;

      const parsed = await parseFile(currentFile, hasHeader);

      // If no header row and user didn't provide headers, show configuration dialog
      if (!hasHeader) {
        setConfiguringHeaderFiles([parsed]);
        // Keep in configuring-headers state to show HeaderConfiguration
      } else {
        // Move to next file or start merging
        if (currentHeaderFile.index < headerFiles.length - 1) {
          const nextFile = headerFiles[currentHeaderFile.index + 1];
          setCurrentHeaderFile({
            file: nextFile,
            index: currentHeaderFile.index + 1,
            total: headerFiles.length,
          });
          setFiles((prev) => [...prev, parsed]);
        } else {
          setFiles((prev) => [...prev, parsed]);
          setState("merging");
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    }
  };

  const handleHeaderConfiguration = (configuredFile: SpreadsheetFile) => {
    setConfiguringHeaderFiles([]);
    setFiles((prev) => [...prev, configuredFile]);

    // Move to next file or start merging
    if (currentHeaderFile && currentHeaderFile.index < headerFiles.length - 1) {
      const nextFile = headerFiles[currentHeaderFile.index + 1];
      setCurrentHeaderFile({
        file: nextFile,
        index: currentHeaderFile.index + 1,
        total: headerFiles.length,
      });
    } else {
      setState("merging");
      setLoading(false);
    }
  };

  const handleSkipFile = () => {
    if (currentHeaderFile && currentHeaderFile.index < headerFiles.length - 1) {
      const nextFile = headerFiles[currentHeaderFile.index + 1];
      setCurrentHeaderFile({
        file: nextFile,
        index: currentHeaderFile.index + 1,
        total: headerFiles.length,
      });
      setConfiguringHeaderFiles([]);
    } else {
      setState("merging");
      setLoading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleMerge = (keyColumn: string, selectedColumns: Set<string>) => {
    try {
      setLoading(true);
      setError("");

      const result = mergeSpreadsheets(files, keyColumn, selectedColumns);
      setMergedData(result);
      setState("result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to merge spreadsheets",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setMergedData(null);
    setState("upload");
    setError("");
    setHeaderFiles([]);
    setCurrentHeaderFile(null);
    setConfiguringHeaderFiles([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 Spreadsheet Merger</h1>
        <p>Upload multiple spreadsheets and merge them by a common column</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner" onClick={() => setError("")}>
            <strong>Error:</strong> {error}
            <button className="dismiss-btn">✕</button>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Processing files...</p>
          </div>
        )}

        {state === "upload" && (
          <>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              disabled={loading}
            />
            {files.length > 0 && (
              <>
                <FilePreview files={files} onRemoveFile={handleRemoveFile} />
                {files.length > 1 && (
                  <MergeConfiguration files={files} onMerge={handleMerge} />
                )}
              </>
            )}
          </>
        )}

        {state === "configuring-headers" && currentHeaderFile && (
          <HeaderDetectionDialog
            fileName={currentHeaderFile.file.name}
            onConfirm={handleHeaderDetection}
          />
        )}

        {configuringHeaderFiles.length > 0 && (
          <HeaderConfiguration
            file={configuringHeaderFiles[0]}
            onHeadersConfigured={handleHeaderConfiguration}
            onSkip={handleSkipFile}
          />
        )}

        {state === "merging" && (
          <div className="merging-state">
            {files.length < 2 ? (
              <div className="info-message">
                <p>📁 Upload at least 2 files to merge</p>
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  disabled={loading}
                />
              </div>
            ) : (
              <>
                <p>Ready to merge {files.length} files</p>
                <FilePreview files={files} onRemoveFile={handleRemoveFile} />
                <MergeConfiguration files={files} onMerge={handleMerge} />
              </>
            )}
          </div>
        )}

        {state === "result" && mergedData && (
          <MergeResult data={mergedData} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>Supports CSV, XLS, and XLSX formats</p>
      </footer>
    </div>
  );
}
