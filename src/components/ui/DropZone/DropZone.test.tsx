import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DropZone } from '../DropZone';

describe('DropZone Component', () => {
  beforeEach(() => {
    // Mock console.log to test Tauri event emission
    vi.spyOn(console, 'log');
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
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(console.log).toHaveBeenCalledWith('Files dropped:', expect.arrayContaining([
      expect.objectContaining({
        type: 'pdf'
      })
    ]));
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
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText('Résultats de Validation')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
    expect(screen.getByText('Unsupported file type: test.txt')).toBeInTheDocument();
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
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
