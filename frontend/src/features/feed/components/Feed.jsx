import React, { useState, useEffect } from 'react';
import StoryRow from './StoryRow';
import Post from './Post';
import { API } from '../../../utils/api';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const [feedRes, savedRes] = await Promise.all([
          fetch(API.posts.feed, { headers }),
          fetch(API.posts.saved, { headers }),
        ]);
        const [feedJson, savedJson] = await Promise.all([feedRes.json(), savedRes.json()]);
        if (feedRes.ok) setPosts(feedJson.data);
        if (savedRes.ok) setSavedIds(savedJson.data.map(p => p._id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDeletePost = (postId) => setPosts(prev => prev.filter(p => p._id !== postId));

  if (loading) return <div className="feed-loading">Loading feed...</div>;

  return (
    <div className="feed">
      <StoryRow />
      <div className="posts-container">
        {posts.length > 0 ? (
          posts.map(post => (
            <Post key={post._id} post={post} onDelete={handleDeletePost} savedPostIds={savedIds} />
          ))
        ) : (
          <div className="no-posts"><p>No posts yet. Be the first to share!</p></div>
        )}
      </div>
    </div>
  );
}

export default Feed;
