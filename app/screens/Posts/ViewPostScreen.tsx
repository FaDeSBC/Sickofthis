import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getPostById, deletePost, Post } from '../../services/postService';
import { createClaim } from '../../services/claimService';
import { createConversation } from '../../services/messageService';
import { supabase } from '../../config/supabase';
import { Colors } from '../../constants/Colors';
import { formatDate, formatTime } from '../../utils/formatDate';
import PrimaryButton from '../../components/ui/PrimaryButton';

interface UserProfile {
  full_name: string;
  label: string;
}

export default function ViewPostScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [postOwner, setPostOwner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    const { data, error } = await getPostById(postId);
    if (!error && data) {
      setPost(data);
      // Fetch post owner's profile
      await loadPostOwner(data.user_id);
    }
    setLoading(false);
  };

  const loadPostOwner = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('app_3f92f_profiles')
        .select('full_name, label')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setPostOwner(data);
      }
    } catch (error) {
      console.error('Error loading post owner:', error);
    }
  };

  const handleViewMap = () => {
    if (!post) return;
    navigation.navigate('MapViewPost', {
      latitude: post.latitude,
      longitude: post.longitude,
      locationName: post.location_name,
      title: post.title,
    });
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
  const ownerName = postOwner?.full_name || 'Unknown User';
  const actionLabel = post.type === 'found' ? 'Founded by' : 'Lost by';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Post</Text>
        <View style={{ width: 50 }} />
      </View>

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
          <View style={styles.headerRow}>
            <View style={[styles.badge, post.type === 'lost' ? styles.lostBadge : styles.foundBadge]}>
              <Text style={styles.badgeText}>{post.type === 'lost' ? 'LOST' : 'FOUND'}</Text>
            </View>
            <Text style={styles.category}>{post.category}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.description}>{post.description}</Text>

          <TouchableOpacity style={styles.mapLocationCard} onPress={handleViewMap}>
            <View style={styles.mapLocationHeader}>
              <Text style={styles.mapLocationLabel}>Last {post.type === 'found' ? 'found' : 'seen'} in</Text>
              <Text style={styles.viewMapText}>View Map →</Text>
            </View>
            <Text style={styles.mapLocationText}>{post.location_name}</Text>
          </TouchableOpacity>

          <View style={styles.detailsContainer}>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{actionLabel}</Text>
                <Text style={styles.detailValue}>{ownerName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{post.category}</Text>
              </View>
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Date {post.type === 'found' ? 'found' : 'lost'}</Text>
                <Text style={styles.detailValue}>{formatDate(post.date_lost_found)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Time {post.type === 'found' ? 'found' : 'lost'}</Text>
                <Text style={styles.detailValue}>{formatTime(post.date_lost_found)}</Text>
              </View>
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
                title="Confirm claim"
                onPress={handleClaim}
                loading={actionLoading}
                style={styles.actionButton}
              />
              <PrimaryButton
                title="Contact (message)"
                onPress={handleMessage}
                loading={actionLoading}
                style={[styles.actionButton, styles.secondaryButton]}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
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
  headerRow: {
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
  mapLocationCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  mapLocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapLocationLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  viewMapText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  mapLocationText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    marginVertical: 5,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
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