import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { getMessages, sendMessage, markMessagesAsRead, subscribeToMessages, Message } from '../../services/messageService';
import { uploadImage } from '../../services/authService';
import { Colors } from '../../constants/Colors';
import { formatTime } from '../../utils/formatDate';

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, otherUserId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();

    const channel = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  const loadMessages = async () => {
    const { data, error } = await getMessages(conversationId);
    if (!error && data) {
      setMessages(data);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const markAsRead = async () => {
    if (user) {
      await markMessagesAsRead(conversationId, user.id);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    setLoading(true);
    const { error } = await sendMessage(conversationId, user.id, inputText.trim());
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to send message');
    } else {
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const handleAttachFile = async () => {
    Alert.alert(
      'Attach File',
      'Choose an option',
      [
        {
          text: 'Photo',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
              Alert.alert('Permission Required', 'Permission to access gallery is required!');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
              allowsEditing: true,
            });

            if (!result.canceled && user) {
              const imageUri = result.assets[0].uri;
              setLoading(true);
              
              // Upload image
              const imageUrl = await uploadImage(imageUri, 'chat', user.id);
              
              if (imageUrl) {
                // Send image URL as message
                await sendMessage(conversationId, user.id, `[IMAGE]${imageUrl}`);
              } else {
                Alert.alert('Error', 'Failed to upload image');
              }
              
              setLoading(false);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    const isImage = item.content.startsWith('[IMAGE]');
    const imageUrl = isImage ? item.content.replace('[IMAGE]', '') : null;

    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
          {isImage && imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.messageImage} />
          ) : (
            <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
              {item.content}
            </Text>
          )}
          <Text style={[styles.messageTime, isMyMessage ? styles.myMessageTime : styles.otherMessageTime]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert('Report', 'Report functionality coming soon');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert(
            'More Options',
            '',
            [
              { text: 'Delete', onPress: handleDeleteConversation, style: 'destructive' },
              { text: 'Report', onPress: handleReport },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}>
          <Text style={styles.moreButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachFile}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity style={styles.micButton}>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  moreButton: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    marginVertical: 5,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
  },
  myBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.white,
  },
  otherMessageText: {
    color: Colors.text.primary,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
  },
  myMessageTime: {
    color: Colors.white,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  attachIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  micButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  micIcon: {
    fontSize: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.5,
  },
  sendIcon: {
    color: Colors.white,
    fontSize: 18,
  },
});