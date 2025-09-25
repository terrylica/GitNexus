import React, { useState, useCallback, useRef } from 'react';

interface RepositoryInputProps {
  onZipFileSubmit: (file: File) => void;
  disabled?: boolean;
}

const RepositoryInput: React.FC<RepositoryInputProps> = ({
  onZipFileSubmit,
  disabled = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = useCallback((file: File) => {
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
      onZipFileSubmit(file);
    } else {
      alert('Please select a valid ZIP file (.zip extension required)');
    }
  }, [onZipFileSubmit]);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDropZoneClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="repository-input">
      <div className="upload-header">
        <h3>📦 Upload Project ZIP File</h3>
        <p>Drag and drop your project ZIP file below or click to browse</p>
      </div>
      
      <div
        className={`zip-drop-zone ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleDropZoneClick}
      >
        <div className="drop-zone-content">
          {!selectedFile ? (
            <>
              <div className="drop-zone-icon">
                {dragOver ? '📥' : '📁'}
              </div>
              <div className="drop-zone-text">
                <div className="drop-zone-primary">
                  {dragOver ? 'Drop your ZIP file here!' : 'Drop a ZIP file here or click to browse'}
                </div>
                <div className="drop-zone-secondary">
                  Upload a ZIP file containing your project source code
                </div>
              </div>
              <div className="browse-button">
                📂 Browse Files
              </div>
            </>
          ) : (
            <div className="selected-file-info">
              <div className="file-icon">✅</div>
              <div className="file-details">
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-size">{formatFileSize(selectedFile.size)}</div>
              </div>
              <div className="file-actions">
                <button 
                  className="change-file-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={disabled}
                >
                  🔄 Change File
                </button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileInput}
            disabled={disabled}
            className="file-input"
            id="zip-file-input"
          />
        </div>
      </div>
      
      <div className="upload-tips">
        <div className="tip-item">
          <span className="tip-icon">💡</span>
          <span>Supported format: ZIP files only</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">⚡</span>
          <span>Processing typically takes just a few seconds</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">🔒</span>
          <span>Your files are processed locally in your browser</span>
        </div>
      </div>
      
      <style>{`
        .repository-input {
          margin-bottom: 2rem;
          background-color: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .upload-header {
          padding: 2rem 2rem 1rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #ff9a56 0%, #ffad56 50%, #ffc947 100%);
          color: white;
        }
        
        .upload-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .upload-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
        }
        
        .zip-drop-zone {
          margin: 2rem;
          border: 3px dashed #d1d5db;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          background: #fafafa;
        }
        
        .zip-drop-zone:hover {
          border-color: #ff9a56;
          background: #fff8f0;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -8px rgba(255, 154, 86, 0.3);
        }
        
        .zip-drop-zone.drag-over {
          border-color: #10b981;
          background: #f0fdf4;
          transform: scale(1.02);
          box-shadow: 0 12px 30px -8px rgba(16, 185, 129, 0.4);
        }
        
        .zip-drop-zone.has-file {
          border-color: #10b981;
          background: #f0fdf4;
          border-style: solid;
        }
        
        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        
        .drop-zone-icon {
          font-size: 4rem;
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        
        .zip-drop-zone:hover .drop-zone-icon,
        .zip-drop-zone.drag-over .drop-zone-icon {
          transform: scale(1.1);
          opacity: 1;
        }
        
        .drop-zone-text {
          text-align: center;
        }
        
        .drop-zone-primary {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .drop-zone-secondary {
          font-size: 1rem;
          color: #6b7280;
        }
        
        .browse-button {
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #ff9a56 0%, #ffad56 50%, #ffc947 100%);
          color: white;
          border-radius: 8px;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .zip-drop-zone:hover .browse-button {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.15);
        }
        
        .selected-file-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          min-width: 300px;
        }
        
        .file-icon {
          font-size: 2rem;
        }
        
        .file-details {
          flex: 1;
          text-align: left;
        }
        
        .file-name {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.25rem;
          word-break: break-word;
        }
        
        .file-size {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .change-file-button {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .change-file-button:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
        
        .change-file-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .file-input {
          display: none;
        }
        
        .upload-tips {
          padding: 1.5rem 2rem 2rem 2rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        
        .tip-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .tip-item:last-child {
          margin-bottom: 0;
        }
        
        .tip-icon {
          font-size: 1rem;
          opacity: 0.8;
        }
        
        @media (max-width: 640px) {
          .zip-drop-zone {
            margin: 1rem;
            padding: 2rem 1rem;
          }
          
          .upload-header {
            padding: 1.5rem 1rem 1rem 1rem;
          }
          
          .selected-file-info {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
            min-width: auto;
          }
          
          .file-details {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default RepositoryInput;