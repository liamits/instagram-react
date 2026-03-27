import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, Image as ImageIcon } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { API } from '../api/api';

export default function CreatePostScreen({ navigation }) {
  const { getToken } = useAuth();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleShare = async () => {
    if (!image) return Alert.alert('Please select an image');
    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('image', { uri: image.uri, type: 'image/jpeg', name: 'post.jpg' });

      const uploadRes = await fetch(API.upload, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error('Upload failed');

      const postRes = await fetch(API.posts.base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ images: [uploadJson.data.url], caption }),
      });
      if (!postRes.ok) throw new Error('Post failed');
      Alert.alert('Posted!');
      setImage(null);
      setCaption('');
      navigation?.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>New post</Text>
        <TouchableOpacity onPress={handleShare} disabled={loading}>
          {loading ? <ActivityIndicator color="#0095f6" /> : <Text style={styles.shareBtn}>Share</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <ImageIcon size={48} color="#555" />
              <Text style={styles.placeholderText}>Tap to select photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor="#666"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={2200}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.3, borderBottomColor: '#333',
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '600' },
  shareBtn: { color: '#0095f6', fontSize: 16, fontWeight: '600' },
  imagePicker: { width: '100%', aspectRatio: 1, backgroundColor: '#111' },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#555', marginTop: 12, fontSize: 15 },
  captionInput: {
    color: '#fff', fontSize: 15, padding: 16,
    borderTopWidth: 0.3, borderTopColor: '#333', minHeight: 80,
  },
});
