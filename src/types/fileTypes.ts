export interface SupportedFile {
  name: string;
  extension: string;
  type: 'pdf' | 'epub' | 'kindle';
  size: number;
  lastModified: Date;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: SupportedFile;
}

export interface DropZoneState {
  isDragOver: boolean;
  isProcessing: boolean;
  droppedFiles: SupportedFile[];
  validationResults: FileValidationResult[];
}

export interface FileProcessingProgress {
  fileId: string;
  progress: number;
  stage: 'validating' | 'processing' | 'queued' | 'completed' | 'error';
}

// Event types for Tauri communication
export interface FileDroppedEvent {
  type: 'file-dropped';
  payload: {
    files: SupportedFile[];
    timestamp: Date;
  };
}

export interface FileValidatedEvent {
  type: 'file-validated';
  payload: {
    results: FileValidationResult[];
    timestamp: Date;
  };
}

// Type assertion helper for file type detection
export function createSupportedFile(
  name: string,
  extension: string,
  type: 'pdf' | 'epub' | 'kindle',
  size: number,
  lastModified: Date
): SupportedFile {
  return {
    name,
    extension,
    type,
    size,
    lastModified
  };
}
