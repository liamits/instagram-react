import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API } from '../api/api';

const { width } = Dimensions.get('window');
const IMG_SIZE = width / 3;

export default function ProfileScreen() {
  const { user, getToken, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(API.users.profile(user?.username));
        const json = await res.json();
        if (res.ok) setProfileData(json.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (user?.username) fetch_();
  }, [user]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!profileData) return null;

  const { user: u, posts, postCount, followersCount, followingCount } = profileData;

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item._id}
      numColumns={3}
      ListHeaderComponent={() => (
        <View>
          <View style={styles.header}>
            <Image source={{ uri: u.avatar }} style={styles.avatar} />
            <View style={styles.stats}>
              <View style={styles.stat}><Text style={styles.statNum}>{postCount}</Text><Text style={styles.statLabel}>posts</Text></View>
              <View style={styles.stat}><Text style={styles.statNum}>{followersCount}</Text><Text style={styles.statLabel}>followers</Text></View>
              <View style={styles.stat}><Text style={styles.statNum}>{followingCount}</Text><Text style={styles.statLabel}>following</Text></View>
            </View>
          </View>
          <Text style={styles.fullName}>{u.fullName || u.username}</Text>
          {u.bio ? <Text style={styles.bio}>{u.bio}</Text> : null}
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      )}
      renderItem={({ item }) => (
        <Image source={{ uri: item.image || item.images?.[0] }} style={styles.gridImg} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontWeight: '700', fontSize: 16 },
  statLabel: { fontSize: 12, color: '#666' },
  fullName: { paddingHorizontal: 16, fontWeight: '600', fontSize: 14 },
  bio: { paddingHorizontal: 16, fontSize: 13, color: '#333', marginTop: 2 },
  logoutBtn: {
    margin: 16, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 10, alignItems: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '500' },
  gridImg: { width: IMG_SIZE, height: IMG_SIZE, margin: 0.5 },
});
