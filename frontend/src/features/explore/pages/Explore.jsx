import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../../../utils/api';

function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(API.posts.base);
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching explore posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="explore-loading">Loading explore...</div>;

  return (
    <div className="explore-page">
      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map(post => (
            <Link key={post._id} to={`/profile/${post.user.username}`} className="grid-item">
              <img src={post.image} alt="Explore" />
              <div className="grid-overlay">
                <span>❤️ {post.likes?.length || 0}</span>
                <span>💬 {post.comments?.length || 0}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-posts-grid">
            <p>No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
