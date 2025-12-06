import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface SearchBarProps {
  isLost: boolean;
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
  searchText: string;
  setSearchText: (value: string) => void;
}

export default function SearchBar({ isLost, isSearching, setIsSearching, searchText, setSearchText }: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      {isSearching ? (
        <View style={styles.searchBar}>
          <Text style={styles.searchLabel}>{isLost ? 'Lost' : 'Found'}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => { setIsSearching(false); setSearchText(''); }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setIsSearching(true)}
        >
          <Text>Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: { 
    marginBottom: 10, 
    paddingTop: 20, 
    paddingLeft: 20,
    paddingRight: 20 
  },
  searchButton: {
    padding: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    width: 310,
    alignSelf: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: Colors.white,
  },
  searchLabel: {  
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    padding: 3,
    paddingLeft: 10,
    paddingRight: 10,
    color: Colors.white,
  },
  searchInput: { 
    flex: 1, 
    height: 40 
  },
  cancelText: {
    marginLeft: 10,
    color: Colors.primary,
  },
});