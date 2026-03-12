import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPalette, 
  FaCloudUploadAlt, 
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFile,
  FaTrash,
  FaTimes
} from 'react-icons/fa';
import Popup from '../UI/Popup';
import './NoteForm.css';

const NoteForm = ({ onSubmit, initialData, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [showPopup, setShowPopup] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const colors = [
    '#ffffff',
    '#fef3c7',
    '#fee2e2',
    '#dbeafe',
    '#dcfce7',
    '#f3e8ff',
    '#ffe4e6',
  ];

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setColor(initialData.color || '#ffffff');
      setAttachments(initialData.attachments || []);
    }
  }, [initialData]);

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile />;
    if (fileType.startsWith('image/')) return <FaFileImage />;
    if (fileType.includes('pdf')) return <FaFilePdf />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FaFileExcel />;
    return <FaFile />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  // ONLY ONE handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setShowPopup(true);
      return;
    }

    const noteData = { 
      title: title.trim(), 
      content: content.trim(), 
      color,
      attachments: attachments.map(({ id, name, type, size, url }) => ({
        id, name, type, size, url
      }))
    };
    
    console.log('Submitting note with attachments:', noteData.attachments);
    onSubmit(noteData);
    
    // Reset form
    setTitle('');
    setContent('');
    setColor('#ffffff');
    setAttachments([]);
  };

  return (
    <>
      <form 
        className={`note-form ${isDragging ? 'dragging' : ''}`} 
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="note-title-input"
        />
        
        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          className="note-content-input"
        />
        
        {/* File Upload Area */}
        <div className="file-upload-area">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            style={{ display: 'none' }}
          />
          
          <div className="upload-actions">
            <button 
              type="button" 
              className="upload-btn"
              onClick={() => fileInputRef.current.click()}
            >
              <FaCloudUploadAlt /> Upload Files
            </button>
            <span className="upload-hint">or drag and drop</span>
          </div>
          
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="attachments-preview">
              <h4>Attachments ({attachments.length})</h4>
              <div className="attachment-list">
                {attachments.map(att => (
                  <div key={att.id} className="attachment-item">
                    <div className="attachment-icon">
                      {getFileIcon(att.type)}
                    </div>
                    <div className="attachment-info">
                      <span className="attachment-name">{att.name || 'Unnamed file'}</span>
                      <span className="attachment-size">{formatFileSize(att.size)}</span>
                    </div>
                    {att.type && att.type.startsWith('image/') && att.url && (
                      <img 
                        src={att.url} 
                        alt={att.name} 
                        className="attachment-thumbnail"
                      />
                    )}
                    <button 
                      type="button"
                      className="attachment-remove"
                      onClick={() => removeAttachment(att.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="note-form-footer">
          <div className="color-picker">
            <span className="color-label">
              <FaPalette /> Color:
            </span>
            {colors.map(c => (
              <div
                key={c}
                className={`color-option ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={getColorName(c)}
              />
            ))}
          </div>
          
          <div className="form-actions">
            {initialData && (
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary">
              {initialData ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </div>
      </form>

      {showPopup && (
        <Popup 
          message="Please fill in both title and content before saving your note."
          type="error"
          onClose={() => setShowPopup(false)}
          duration={4000}
        />
      )}
    </>
  );
};

// Helper function to get color name
const getColorName = (hex) => {
  const colors = {
    '#ffffff': 'White',
    '#fef3c7': 'Yellow',
    '#fee2e2': 'Red',
    '#dbeafe': 'Blue',
    '#dcfce7': 'Green',
    '#f3e8ff': 'Purple',
    '#ffe4e6': 'Pink',
  };
  return colors[hex] || 'Custom';
};

export default NoteForm;