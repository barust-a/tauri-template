import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DropZone } from '../DropZone';

// Mock Tauri API
const mockTauriEvent = {
  emit: vi.fn()
};

// Mock window.__TAURI__
Object.defineProperty(window, '__TAURI__', {
  value: {
    event: mockTauriEvent
  },
  writable: true
});

describe('DropZone Component', () => {
  beforeEach(() => {
    // Mock console.log to test Tauri event emission
    vi.spyOn(console, 'log');
    vi.spyOn(console, 'warn');
    // Clear previous mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render drop zone correctly', () => {
    render(<DropZone />);
    
    expect(screen.getByText('📁 Zone de Dépôt Magique')).toBeInTheDocument();
    expect(screen.getByText('Glissez-déposez vos fichiers PDF, EPUB ou Kindle ici')).toBeInTheDocument();
  });

  it('should handle drag over events', () => {
    render(<DropZone />);
    const dropZone = screen.getByRole('button');
    
    fireEvent.dragOver(dropZone);
    
    expect(dropZone).toHaveClass('border-blue-500', 'bg-blue-50');
  });

  it('should handle drag leave events', () => {
    render(<DropZone />);
    const dropZone = screen.getByRole('button');
    
    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);
    
    expect(dropZone).not.toHaveClass('border-blue-500', 'bg-blue-50');
    expect(dropZone).toHaveClass('border-gray-300');
  });

  it('should handle file drop events', async () => {
    render(<DropZone />);
    const dropZone = screen.getByRole('button');
    
    const file = new File(['test.pdf'], 'test.pdf', { type: 'application/pdf' });
    const dropEvent = {
      dataTransfer: { files: [file] }
    } as any;
    
    fireEvent.drop(dropZone, dropEvent);
    
    // Wait for async processing
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Files dropped:', expect.arrayContaining([
        expect.objectContaining({
          type: 'pdf'
        })
      ]));
    });

    // Check Tauri event emission
    expect(mockTauriEvent.emit).toHaveBeenCalledWith('file-dropped', expect.objectContaining({
      files: expect.arrayContaining([
        expect.objectContaining({
          type: 'pdf'
        })
      ]),
      timestamp: expect.any(String)
    }));
  });

  it('should display validation results', async () => {
    render(<DropZone />);
    const dropZone = screen.getByRole('button');
    
    const file = new File(['test.txt'], 'test.txt', { type: 'text/plain' });
    const dropEvent = {
      dataTransfer: { files: [file] }
    } as any;
    
    fireEvent.drop(dropZone, dropEvent);
    
    // Wait for async processing
    await waitFor(() => {
      expect(screen.getByText('Résultats de Validation')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
      expect(screen.getByText('Unsupported file type')).toBeInTheDocument();
    });
  });

  it('should show processing indicator', async () => {
    render(<DropZone />);
    const dropZone = screen.getByRole('button');
    
    const file = new File(['test.pdf'], 'test.pdf', { type: 'application/pdf' });
    const dropEvent = {
      dataTransfer: { files: [file] }
    } as any;
    
    fireEvent.drop(dropZone, dropEvent);
    
    // Check for processing state
    expect(screen.getByText('Validation en cours...')).toBeInTheDocument();
  });

  it('should handle Tauri API errors gracefully', async () => {
    // Mock Tauri error
    mockTauriEvent.emit.mockImplementation(() => {
      throw new Error('Tauri API error');
    });

    render(<DropZone />);
    const dropZone = screen.getByRole('button');
    
    const file = new File(['test.pdf'], 'test.pdf', { type: 'application/pdf' });
    const dropEvent = {
      dataTransfer: { files: [file] }
    } as any;
    
    fireEvent.drop(dropZone, dropEvent);
    
    // Wait for async processing
    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith('Tauri event emission failed:', expect.any(Error));
    });
  });
});
