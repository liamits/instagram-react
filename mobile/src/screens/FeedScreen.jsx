import React, { useState, useEffect, useCallback } from 'react';
import {
  View, FlatList, Text, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Heart, MessageCircle, Bookmark } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { API } from '../api/api';

function PostItem({ post, currentUserId, onLike, onSave }) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUserId));
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(false);

  const handleLike = async () => {
    setLiked(p => !p);
    setLikes(p => liked ? p - 1 : p + 1);
    await onLike(post._id);
  };

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.user?.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{post.user?.username}</Text>
      </View>
      <Image source={{ uri: post.image || post.images?.[0] }} style={styles.postImage} resizeMode="cover" />
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Heart size={24} color={liked ? '#ed4956' : '#000'} fill={liked ? '#ed4956' : 'none'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => onSave(post._id)}>
          <Bookmark size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <Text style={styles.likes}>{likes} likes</Text>
      {post.caption ? (
        <Text style={styles.caption}><Text style={styles.username}>{post.user?.username} </Text>{post.caption}</Text>
      ) : null}
    </View>
  );
}

export default function FeedScreen() {
  const { getToken, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async (pageNum, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API.posts.feed}?page=${pageNum}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setPosts(prev => reset ? json.data : [...prev, ...json.data]);
        setHasMore(json.meta?.hasMore ?? false);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFeed(1, true); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchFeed(1, true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const next = page + 1;
      setPage(next);
      fetchFeed(next);
    }
  };

  const handleLike = async (postId) => {
    const token = await getToken();
    await fetch(API.posts.like(postId), { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
  };

  const handleSave = async (postId) => {
    const token = await getToken();
    await fetch(API.posts.save(postId), { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
        <PostItem post={item} currentUserId={user?.id} onLike={handleLike} onSave={handleSave} />
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 16 }} /> : null}
    />
  );
}

const styles = StyleSheet.create({
  post: { backgroundColor: '#fff', marginBottom: 8 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: '600', fontSize: 13 },
  postImage: { width: '100%', aspectRatio: 1 },
  actions: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  actionBtn: { marginRight: 16 },
  likes: { paddingHorizontal: 12, fontWeight: '600', fontSize: 13, marginBottom: 4 },
  caption: { paddingHorizontal: 12, paddingBottom: 8, fontSize: 13 },
});
