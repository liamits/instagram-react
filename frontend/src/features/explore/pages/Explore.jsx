import React, { useState, useEffect } from 'react';
import { API } from '../../../utils/api';
import PostModal from '../../../components/common/PostModal';

function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(API.posts.base);
        const json = await res.json();
        setPosts(json.data);
      } catch (err) {
        console.error('Error fetching explore posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = (postId) => setPosts(prev => prev.filter(p => p._id !== postId));

  if (loading) return <div className="explore-loading">Loading explore...</div>;

  return (
    <div className="explore-page">
      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post._id} className="grid-item" onClick={() => setSelectedPost(post)}>
              <img src={post.image} alt="Explore" />
              <div className="grid-overlay">
                <span>❤️ {post.likes?.length || 0}</span>
                <span>💬 {post.comments?.length || 0}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts-grid">
            <p>No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Explore;
