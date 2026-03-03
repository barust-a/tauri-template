import React, { useState, useCallback } from 'react';
import { validateFile, formatFileSize } from '../../../lib/fileManager/fileUtils';
import { SupportedFile, FileValidationResult, DropZoneState } from '../../../types/fileTypes';

export const DropZone: React.FC = () => {
  const [state, setState] = useState<DropZoneState>({
    isDragOver: false,
    isProcessing: false,
    droppedFiles: [],
    validationResults: []
  });

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setState(prev => ({ ...prev, isDragOver: false, isProcessing: true }));
    
    const files = Array.from(e.dataTransfer?.files || []);
    const supportedFiles: SupportedFile[] = [];
    
    for (const file of files) {
      const validatedFile = await validateFile(file);
      if (validatedFile.isValid && validatedFile.fileType) {
        supportedFiles.push({
          name: file.name,
          extension: file.name.split('.').pop() || '',
          type: validatedFile.fileType,
          size: file.size,
          lastModified: new Date(file.lastModified)
        });
      }
    }
    
    setState(prev => ({
      ...prev,
      droppedFiles: supportedFiles,
      validationResults: files.map(file => {
        const validation = supportedFiles.some(sf => sf.name === file.name) 
          ? { isValid: true } 
          : { isValid: false, error: 'Unsupported file type' };
        return {
          ...validation,
          fileType: validation.isValid ? validatedFile.fileType : undefined
        };
      })
    }));
    
    // Emit file dropped event for Tauri communication
    if (supportedFiles.length > 0) {
      // TODO: Add Tauri event emission
      console.log('Files dropped:', supportedFiles);
    }
    
    setState(prev => ({ ...prev, isProcessing: false }));
  }, []);

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'epub':
        return '📚';
      case 'kindle':
        return '📖';
      default:
        return '📄';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <div className="space-y-4">
          <div className="text-2xl font-semibold text-gray-700 mb-4">
            📁 Zone de Dépôt Magique
          </div>
          
          <p className="text-gray-600 mb-6">
            Glissez-déposez vos fichiers PDF, EPUB ou Kindle ici
          </p>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
              state.isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Zone de dépôt de fichiers"
          >
            <input
              type="file"
              multiple
              accept=".pdf,.epub,.mobi,.azw,.azw3,.kf8"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                // Handle file selection via click
                if (files.length > 0) {
                  handleDrop({ dataTransfer: { files } } as React.DragEvent<HTMLDivElement>);
                }
              }}
            />
            
            <div className="text-center">
              {state.isDragOver ? (
                <div className="space-y-2">
                  <div className="text-4xl">📁</div>
                  <p className="text-lg font-medium text-blue-600">
                    Relâchez pour déposer vos fichiers
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl text-gray-400">📁</div>
                  <p className="text-lg text-gray-600">
                    Glissez-déposez vos fichiers ici
                  </p>
                  <p className="text-sm text-gray-500">
                    ou cliquez pour sélectionner
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* File validation results */}
          {state.validationResults.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Résultats de Validation
              </h3>
              {state.validationResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-md ${
                    result.isValid ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {result.isValid ? '✅' : '❌'}
                    </span>
                    <span className="font-medium">
                      {result.error || 'Fichier valide'}
                    </span>
                  </div>
                  {result.fileType && (
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {getFileIcon(result.fileType.type)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {result.fileType.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({formatFileSize(result.fileType.size)})
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Processing indicator */}
          {state.isProcessing && (
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-blue-600 border-t-transparent"></div>
                <span className="text-lg text-blue-600">
                  Validation en cours...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropZone;
