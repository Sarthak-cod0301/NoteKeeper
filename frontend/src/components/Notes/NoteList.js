import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSearch, FaStickyNote, FaPlus } from 'react-icons/fa';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
import { API_URL } from '../../config';
import './NoteList.css';

const NoteList = ({ user, updateNoteCount, showCreateForm = false }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [showForm, setShowForm] = useState(showCreateForm);

  useEffect(() => {
    fetchNotes();
  }, [searchTerm]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${API_URL}/notes?`;
      if (searchTerm) url += `search=${searchTerm}&`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out deleted notes
      const activeNotes = response.data.filter(note => !note.deleted);
      setNotes(activeNotes);
      
      if (updateNoteCount) {
        updateNoteCount('notes', activeNotes.length);
        updateNoteCount('pinned', activeNotes.filter(n => n.isPinned).length);
      }
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/notes`,
        noteData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotes([response.data, ...notes]);
      setShowForm(false);
      toast.success('Note created successfully');
      
      if (updateNoteCount) {
        updateNoteCount('notes', notes.length + 1);
      }
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (id, noteData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/notes/${id}`,
        noteData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotes(notes.map(note => note._id === id ? response.data : note));
      setEditingNote(null);
      toast.success('Note updated successfully');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotes(notes.filter(note => note._id !== id));
      toast.success('Note moved to trash');
      
      if (updateNoteCount) {
        updateNoteCount('notes', notes.length - 1);
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/notes/${id}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotes(notes.map(note => note._id === id ? response.data : note));
      
      if (updateNoteCount) {
        const pinnedCount = notes.filter(n => n.isPinned).length;
        updateNoteCount('pinned', response.data.isPinned ? pinnedCount + 1 : pinnedCount - 1);
      }
    } catch (error) {
      toast.error('Failed to toggle pin');
    }
  };

  return (
    <div className="notes-container">
      {/* Search Note Section */}
      <section className="search-section">
        <h2 className="section-title">
          <FaSearch /> Search Notes
        </h2>
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Write a Note Section */}
      <section className="write-note-section">
        <h2 className="section-title">
          <FaStickyNote /> Write a Note
        </h2>
        {!showForm && !editingNote && (
          <button className="show-form-btn" onClick={() => setShowForm(true)}>
            <FaPlus /> Create New Note
          </button>
        )}
        {(showForm || editingNote) && (
          <NoteForm
            onSubmit={editingNote ? 
              (data) => handleUpdateNote(editingNote._id, data) : 
              handleCreateNote
            }
            initialData={editingNote}
            onCancel={() => {
              setEditingNote(null);
              setShowForm(false);
            }}
          />
        )}
      </section>

      {/* Your Notes Section */}
      <section className="notes-section">
        <h2 className="section-title">
          <FaStickyNote /> Your Notes ({notes.length})
        </h2>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <FaStickyNote />
            <h3>No notes yet</h3>
            <p>Click "Create New Note" to get started</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => setEditingNote(note)}
                onDelete={() => handleDeleteNote(note._id)}
                onTogglePin={() => handleTogglePin(note._id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NoteList;