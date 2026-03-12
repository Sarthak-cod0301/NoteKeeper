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
  FaEye,
  FaExpandAlt
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import NoteModal from './NoteModal';
import './NoteCard.css';

const NoteCard = ({ note, onEdit, onDelete, onTogglePin }) => {
  const [showAttachments, setShowAttachments] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Ensure attachments is always an array
  const attachments = note.attachments || [];
  const hasAttachments = attachments.length > 0;

  // Truncate content for preview
  const getContentPreview = (content, maxLength = 200) => {
    if (!content) return 'No content';
    if (content.length <= maxLength || isExpanded) return content;
    return content.substring(0, maxLength) + '...';
  };

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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div 
        className={`note-card ${note.isPinned ? 'pinned' : ''} ${isExpanded ? 'expanded' : ''}`}
        style={{ backgroundColor: note.color || '#ffffff' }}
      >
        {/* Button Container */}
        <div className="note-card-buttons">
          <button 
            className="icon-btn expand-view-btn" 
            onClick={() => setShowModal(true)} 
            title="Expand View"
          >
            <FaExpandAlt />
          </button>
          <button 
            className="icon-btn pin-btn" 
            onClick={() => onTogglePin(note._id)}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <FaThumbtack style={{ color: note.isPinned ? '#f59e0b' : '#6b7280' }} />
          </button>
        </div>
        
        <div className="note-card-header">
          <h3 className="note-title">{note.title || 'Untitled Note'}</h3>
        </div>
        
        <div className="note-card-body">
          <div className="note-content">
            {getContentPreview(note.content)}
          </div>
          
          {note.content && note.content.length > 200 && !isExpanded && (
            <button className="text-btn expand-btn" onClick={toggleExpand}>
              <FaExpandAlt /> Read more
            </button>
          )}
          
          {isExpanded && (
            <button className="text-btn expand-btn" onClick={toggleExpand}>
              <FaExpandAlt /> Show less
            </button>
          )}
        </div>
        
        {/* Attachments Section */}
        {hasAttachments && (
          <div className="note-attachments">
            <div 
              className="attachments-header"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <FaPaperclip className="attachments-icon" />
              <span className="attachments-count">
                {attachments.length} Attachment{attachments.length > 1 ? 's' : ''}
              </span>
              <span className="toggle-icon">{showAttachments ? '▼' : '▶'}</span>
            </div>
            
            {showAttachments && (
              <div className="attachments-list">
                {attachments.map((att, index) => (
                  <div key={att.id || index} className="attachment-item">
                    <div className="attachment-icon">
                      {getFileIcon(att.type)}
                    </div>
                    <div className="attachment-details">
                      <div className="attachment-name" title={att.name}>
                        {att.name || 'Unnamed file'}
                      </div>
                      <div className="attachment-meta">
                        <span className="attachment-size">{formatFileSize(att.size)}</span>
                        <span className="attachment-type">{att.type?.split('/')[1] || 'file'}</span>
                      </div>
                    </div>
                    <div className="attachment-actions">
                      {att.type?.startsWith('image/') ? (
                        <button 
                          className="attachment-btn preview"
                          onClick={() => handleImageClick(att.url)}
                          title="Preview Image"
                        >
                          <FaEye />
                        </button>
                      ) : (
                        <button 
                          className="attachment-btn download"
                          onClick={() => handleDownload(att)}
                          title="Download File"
                        >
                          <FaDownload />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="note-card-footer">
          <div className="note-meta">
            <FaClock className="meta-icon" />
            <span className="meta-text">
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>
          
          <div className="note-actions">
            <button className="action-btn edit" onClick={() => onEdit(note)} title="Edit Note">
              <FaEdit />
            </button>
            <button className="action-btn delete" onClick={() => onDelete(note._id)} title="Delete Note">
              <FaTrash />
            </button>
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

      {/* Note Modal for Full View */}
      {showModal && (
        <NoteModal 
          note={note} 
          onClose={() => setShowModal(false)}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
        />
      )}
    </>
  );
};

export default NoteCard;