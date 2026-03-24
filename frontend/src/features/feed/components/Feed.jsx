import React, { useState, useEffect } from 'react';
import StoryRow from './StoryRow';
import Post from './Post';
import { API } from '../../../utils/api';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API.posts.feed, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (res.ok) setPosts(json.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDeletePost = (postId) => setPosts(prev => prev.filter(p => p._id !== postId));

  if (loading) return <div className="feed-loading">Loading feed...</div>;

  return (
    <div className="feed">
      <StoryRow />
      <div className="posts-container">
        {posts.length > 0 ? (
          posts.map(post => <Post key={post._id} post={post} onDelete={handleDeletePost} />)
        ) : (
          <div className="no-posts"><p>No posts yet. Be the first to share!</p></div>
        )}
      </div>
    </div>
  );
}

export default Feed;
