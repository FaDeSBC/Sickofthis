import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../../components/ui/SearchBar';
import LostFoundToggle from '../../components/ui/LostFoundToggle';
import RecentItems from '../../components/posts/RecentItems';
import ItemList from '../../components/posts/ItemList';
import { getPosts, searchPosts } from '../../services/postService';
import { Post } from '../../services/postService';
import { Colors } from '../../constants/Colors';

export default function HomeScreen({ navigation }: any) {
  const [isLost, setIsLost] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [isLost]);

  useEffect(() => {
    if (searchText.length > 0) {
      performSearch();
    } else {
      setFilteredPosts([]);
    }
  }, [searchText, isLost]);

  const loadPosts = async () => {
    const type = isLost ? 'lost' : 'found';
    const { data, error } = await getPosts(type);
    if (!error && data) {
      setPosts(data);
    }
  };

  const performSearch = async () => {
    const type = isLost ? 'lost' : 'found';
    const { data, error } = await searchPosts(searchText, type);
    if (!error && data) {
      setFilteredPosts(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const displayData = isSearching && searchText.length > 0 ? filteredPosts : posts;
  const recentData = posts.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <SearchBar
          isLost={isLost}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        {!isSearching && <LostFoundToggle isLost={isLost} setIsLost={setIsLost} />}

        {!isSearching && <RecentItems horizontalData={recentData} navigation={navigation} />}

        <ItemList 
          data={displayData} 
          navigation={navigation}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: Colors.background,
  },
});