import React, { useState } from 'react';
import { 
  FaThumbtack, 
  FaEdit, 
  FaTrash, 
  FaClock,
  FaPaperclip,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFile,
  FaDownload,
  FaTimes,
  FaEye
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import './NoteModal.css';

const NoteModal = ({ note, onClose, onEdit, onDelete, onTogglePin }) => {
  const [showAttachments, setShowAttachments] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const attachments = note.attachments || [];
  const hasAttachments = attachments.length > 0;

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile />;
    if (fileType.startsWith('image/')) return <FaFileImage className="file-icon image" />;
    if (fileType.includes('pdf')) return <FaFilePdf className="file-icon pdf" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord className="file-icon word" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FaFileExcel className="file-icon excel" />;
    return <FaFile className="file-icon" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleImageClick = (url) => {
    setPreviewImage(url);
  };

  const handleDownload = (attachment) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>

          <div className="modal-header">
            <h2 className="modal-title">{note.title || 'Untitled Note'}</h2>
            <div className="modal-header-actions">
              <button 
                className="modal-action-btn pin-btn" 
                onClick={() => onTogglePin(note._id)}
                title={note.isPinned ? 'Unpin' : 'Pin'}
              >
                <FaThumbtack style={{ color: note.isPinned ? '#f59e0b' : '#6b7280' }} />
              </button>
              <button 
                className="modal-action-btn edit-btn" 
                onClick={() => {
                  onEdit(note);
                  onClose();
                }}
                title="Edit Note"
              >
                <FaEdit />
              </button>
              <button 
                className="modal-action-btn delete-btn" 
                onClick={() => {
                  if (window.confirm('Delete this note?')) {
                    onDelete(note._id);
                    onClose();
                  }
                }}
                title="Delete Note"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          <div className="modal-body">
            <div 
              className="modal-note-content"
              style={{ backgroundColor: note.color || '#ffffff' }}
            >
              {note.content || 'No content'}
            </div>

            {hasAttachments && (
              <div className="modal-attachments">
                <h3>
                  <FaPaperclip /> Attachments ({attachments.length})
                </h3>
                <div className="modal-attachments-list">
                  {attachments.map((att, index) => (
                    <div key={att.id || index} className="modal-attachment-item">
                      <div className="modal-attachment-icon">
                        {getFileIcon(att.type)}
                      </div>
                      <div className="modal-attachment-info">
                        <div className="modal-attachment-name">{att.name || 'Unnamed file'}</div>
                        <div className="modal-attachment-meta">
                          <span>{formatFileSize(att.size)}</span>
                          <span>{att.type?.split('/')[1] || 'file'}</span>
                        </div>
                      </div>
                      <div className="modal-attachment-actions">
                        {att.type?.startsWith('image/') ? (
                          <button 
                            className="modal-attachment-btn preview"
                            onClick={() => handleImageClick(att.url)}
                          >
                            <FaEye /> Preview
                          </button>
                        ) : (
                          <button 
                            className="modal-attachment-btn download"
                            onClick={() => handleDownload(att)}
                          >
                            <FaDownload /> Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <div className="modal-meta">
              <FaClock /> 
              <span>Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
            </div>
            {note.createdAt !== note.updatedAt && (
              <div className="modal-meta">
                <span>Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-container" onClick={e => e.stopPropagation()}>
            <button className="preview-close-btn" onClick={() => setPreviewImage(null)}>
              <FaTimes />
            </button>
            <img src={previewImage} alt="Preview" className="preview-image" />
          </div>
        </div>
      )}
    </>
  );
};

export default NoteModal;