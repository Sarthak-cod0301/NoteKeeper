const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all notes for user
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    const { search, color, pinned } = req.query;
    let query = { userId: req.userId };

    if (req.query.deleted === 'true') {
      query.deleted = true;
    } else {
      query.deleted = { $ne: true };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (color) {
      query.color = color;
    }

    if (pinned === 'true') {
      query.isPinned = true;
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .maxTimeMS(10000);

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, color, attachments } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Validate attachments if provided
    let validAttachments = [];
    if (attachments && Array.isArray(attachments)) {
      validAttachments = attachments.map(att => ({
        id: att.id || Math.random().toString(36).substr(2, 9),
        name: att.name || 'Unnamed file',
        type: att.type || 'application/octet-stream',
        size: att.size || 0,
        url: att.url || '',
        uploadedAt: new Date()
      }));
    }

    const note = new Note({
      title,
      content,
      color: color || '#ffffff',
      attachments: validAttachments,
      userId: req.userId
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, color, isPinned, attachments } = req.body;
    
    // Validate attachments if provided
    let validAttachments = [];
    if (attachments && Array.isArray(attachments)) {
      validAttachments = attachments.map(att => ({
        id: att.id || Math.random().toString(36).substr(2, 9),
        name: att.name || 'Unnamed file',
        type: att.type || 'application/octet-stream',
        size: att.size || 0,
        url: att.url || '',
        uploadedAt: att.uploadedAt || new Date()
      }));
    }

    const updateData = {
      title,
      content,
      color,
      isPinned,
      updatedAt: Date.now()
    };

    // Only update attachments if provided
    if (attachments) {
      updateData.attachments = validAttachments;
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { 
        new: true, // Keep using 'new' for now, we'll fix the warning later
        runValidators: true 
      }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Soft delete (move to trash)
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        deleted: true, 
        deletedAt: Date.now() 
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note moved to trash' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Restore from trash
router.patch('/:id/restore', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        deleted: false, 
        deletedAt: null 
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({ error: 'Failed to restore note' });
  }
});

// Permanently delete
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ error: 'Failed to permanently delete note' });
  }
});

// Toggle pin
router.patch('/:id/pin', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

module.exports = router;