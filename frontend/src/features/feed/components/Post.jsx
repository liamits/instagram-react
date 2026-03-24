import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Post.css';

function Post({ post }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.id));

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options).toUpperCase();
  };

  const toggleLike = async () => {
    // Optimistic UI
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikes(prev => wasLiked 
      ? prev.filter(id => id !== user.id) 
      : [...prev, user.id]
    );

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
    } catch (err) {
      // Revert if error
      setIsLiked(wasLiked);
      setLikes(post.likes);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <article className="post">
      <header className="post-header">
        <div className="post-user">
          <div className="post-avatar">
            <img src={post.user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt={post.user.username} />
          </div>
          <div className="post-user-info">
            <span className="post-username">{post.user.username}</span>
            {post.location && <span className="post-location">{post.location}</span>}
          </div>
        </div>
        <button className="post-more">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="post-image" onDoubleClick={toggleLike}>
        <img src={post.image} alt="Post content" />
      </div>

      <div className="post-actions">
        <div className="post-actions-left">
          <button 
            className={`action-btn ${isLiked ? 'liked animate-heart' : ''}`} 
            onClick={toggleLike}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button className="action-btn">
            <MessageCircle size={24} />
          </button>
          <button className="action-btn">
            <Send size={24} />
          </button>
        </div>
        <button className="action-btn">
          <Bookmark size={24} />
        </button>
      </div>

      <section className="post-details">
        <p className="post-likes">{(likes.length).toLocaleString()} likes</p>
        <div className="post-caption">
          <span className="post-username">{post.user.username}</span> {post.caption}
        </div>
        
        {comments.length > 0 && (
          <div className="post-comments-preview">
            {comments.slice(-2).map((comment, index) => (
              <div key={index} className="comment-item">
                <span className="comment-username">{comment.user?.username || 'user'}</span> {comment.text}
              </div>
            ))}
            {comments.length > 2 && <button className="view-all-comments">View all {comments.length} comments</button>}
          </div>
        )}
        
        <p className="post-time">{formatDate(post.createdAt)}</p>
      </section>

      <form className="post-comment-input" onSubmit={handleCommentSubmit}>
        <input 
          type="text" 
          placeholder="Add a comment..." 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit" className="post-btn" disabled={!commentText.trim()}>Post</button>
      </form>
    </article>
  );
}

export default Post;
