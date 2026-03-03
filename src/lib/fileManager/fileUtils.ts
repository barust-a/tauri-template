// File management utilities for audioBookApp

import { SupportedFile, FileValidationResult } from '../../types/fileTypes';

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

// File type detection
export const detectFileType = (fileName: string): SupportedFile['type'] | null => {
  const extension = fileName.toLowerCase().split('.').pop();

  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'epub':
      return 'epub';
    case 'mobi':
    case 'azw':
    case 'azw3':
    case 'kf8':
      return 'kindle';
    default:
      return null;
  }
};

// File validation
export const validateFile = async (file: File): Promise<FileValidationResult> => {
  const maxSize = 100 * 1024 * 1024; // 100MB in bytes

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 100MB`
    };
  }

  // Check file type
  const fileType = detectFileType(file.name);
  if (!fileType) {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.name}`
    };
  }

  // Additional validation can be added here
  // For now, basic validation passes
  return {
    isValid: true,
    fileType: createSupportedFile(
      file.name,
      file.name.split('.').pop() || '',
      fileType,
      file.size,
      new Date(file.lastModified)
    )
  };
};

// File processing utilities
export const createFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
