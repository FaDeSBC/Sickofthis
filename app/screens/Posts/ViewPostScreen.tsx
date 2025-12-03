import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getPostById, deletePost, Post } from '../../services/postService';
import { createClaim } from '../../services/claimService';
import { createConversation } from '../../services/messageService';
import { Colors } from '../../constants/Colors';
import { formatDate, formatTime } from '../../utils/formatDate';
import PrimaryButton from '../../components/ui/PrimaryButton';

export default function ViewPostScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    const { data, error } = await getPostById(postId);
    if (!error && data) {
      setPost(data);
    }
    setLoading(false);
  };

  const handleClaim = async () => {
    if (!user || !post) return;

    Alert.alert(
      'Claim Item',
      'Are you sure you want to claim this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            setActionLoading(true);
            const { error } = await createClaim(post.id, user.id, post.user_id);
            setActionLoading(false);

            if (error) {
              Alert.alert('Error', 'Failed to create claim');
            } else {
              Alert.alert('Success', 'Claim submitted successfully!');
            }
          },
        },
      ]
    );
  };

  const handleMessage = async () => {
    if (!user || !post) return;

    setActionLoading(true);
    const { data, error } = await createConversation(post.id, user.id, post.user_id);
    setActionLoading(false);

    if (!error && data) {
      navigation.navigate('Chat', { 
        conversationId: data.id, 
        otherUserId: post.user_id 
      });
    } else {
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditPost', { postId: post?.id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!post) return;
            setActionLoading(true);
            const { error } = await deletePost(post.id);
            setActionLoading(false);

            if (error) {
              Alert.alert('Error', 'Failed to delete post');
            } else {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          {post.image_urls && post.image_urls.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {post.image_urls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.image} />
              ))}
            </ScrollView>
          ) : (
            <Image source={require('../../assets/lostitem.png')} style={styles.image} />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.badge, post.type === 'lost' ? styles.lostBadge : styles.foundBadge]}>
              <Text style={styles.badgeText}>{post.type === 'lost' ? 'LOST' : 'FOUND'}</Text>
            </View>
            <Text style={styles.category}>{post.category}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.description}>{post.description}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/loclogo.png')} style={styles.icon} />
              <Text style={styles.detailText}>{post.location_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/datelogo.png')} style={styles.icon} />
              <Text style={styles.detailText}>{formatDate(post.date_lost_found)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/timelogo.png')} style={styles.icon} />
              <Text style={styles.detailText}>{formatTime(post.date_lost_found)}</Text>
            </View>
          </View>

          {isOwner ? (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actions}>
              <PrimaryButton
                title="Message Owner"
                onPress={handleMessage}
                loading={actionLoading}
                style={styles.actionButton}
              />
              <PrimaryButton
                title="Claim Item"
                onPress={handleClaim}
                loading={actionLoading}
                style={styles.actionButton}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
  imageContainer: {
    height: 300,
    backgroundColor: Colors.lightGray,
  },
  image: {
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  lostBadge: {
    backgroundColor: Colors.error,
  },
  foundBadge: {
    backgroundColor: Colors.success,
  },
  badgeText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text.primary,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 20,
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    marginVertical: 5,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.error,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});