import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API } from '../../../utils/api';
import TagSelector from '../../../components/common/TagSelector';
import './CreatePostModal.css'; // Reuse styles

function EditPostModal({ isOpen, onClose, post, onSuccess }) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (isOpen && post) {
      setCaption(post.caption || '');
      setLocation(post.location || '');
      setTags(post.tags || []);
      setError('');
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API.posts.update(post._id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          caption,
          location,
          tags: tags.map(t => t._id || t)
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update post');

      onSuccess(json.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <button className="close-modal" onClick={onClose}><X size={24} color="white" /></button>
      <div className="create-modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Edit post</h3>
          <button className="share-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Done'}
          </button>
        </header>

        <div className="modal-body">
          <div className="post-creation-container">
            <div className="image-preview">
              <img src={post.image} alt="Original" />
            </div>
            <div className="post-details">
              <textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={2200}
              />
              <input
                type="text"
                placeholder="Add location"
                className="location-input"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
              <TagSelector selectedTags={tags} onTagsChange={setTags} />
              {error && <p className="error-text">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPostModal;
