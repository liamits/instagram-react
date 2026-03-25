import React, { useState, useEffect, useRef } from 'react';
import { X, Search, User } from 'lucide-react';
import { API } from '../../utils/api';
import './TagSelector.css';

function TagSelector({ selectedTags, onTagsChange }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.startsWith('@') ? query.slice(1) : query;
    
    // If it's just '@' or empty, we could show suggestions
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const url = trimmedQuery.length > 0 
          ? API.users.search(trimmedQuery) 
          : API.users.suggestions;
          
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok) {
          // Filter out already selected tags
          const filtered = json.data.filter(u => !selectedTags.some(tag => tag._id === u._id));
          setSuggestions(filtered);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedTags]);

  const handleSelect = (user) => {
    onTagsChange([...selectedTags, user]);
    setQuery('');
    setShowSuggestions(false);
  };

  const handleRemove = (userId) => {
    onTagsChange(selectedTags.filter(t => t._id !== userId));
  };

  return (
    <div className="tag-selector-container" ref={containerRef}>
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <span key={tag._id} className="tag-badge">
            @{tag.username}
            <button onClick={() => handleRemove(tag._id)}><X size={12} /></button>
          </span>
        ))}
        <div className="tag-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Tag friends..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => (query.length >= 1 || query === '@') && setShowSuggestions(true)}
          />
        </div>
      </div>

      {showSuggestions && (
        <div className="tag-suggestions">
          {loading ? (
            <div className="suggestion-loading">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="suggestion-empty">No users found</div>
          ) : (
            suggestions.map(user => (
              <div key={user._id} className="suggestion-item" onClick={() => handleSelect(user)}>
                <img src={user.avatar} alt={user.username} className="suggestion-avatar" />
                <div className="suggestion-info">
                  <span className="suggestion-username">{user.username}</span>
                  <span className="suggestion-fullname">{user.fullName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TagSelector;
