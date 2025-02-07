import React, { useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

interface AlphabeticalListProps<T> {
  data: T[];
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  selectedValue?: string;
}

interface Section {
  title: string;
  data: any[];
}

export default function AlphabeticalList<T>({ data, getLabel, onSelect, selectedValue }: AlphabeticalListProps<T>) {
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);

  // Group items by first letter and flatten with headers
  const sections = data.reduce((acc: Section[], item) => {
    const label = getLabel(item);
    const firstLetter = label.charAt(0).toUpperCase();
    const section = acc.find(s => s.title === firstLetter);
    
    if (section) {
      section.data.push(item);
    } else {
      acc.push({ title: firstLetter, data: [item] });
    }
    
    return acc;
  }, []).sort((a, b) => a.title.localeCompare(b.title));

  const flatData = sections.reduce((acc: (string | T)[], section) => {
    return [...acc, section.title, ...section.data];
  }, []);

  const alphabet = sections.map(section => section.title);

  const getItemLayout = (_: any, index: number) => ({
    length: 50,
    offset: 50 * index,
    index,
  });

  const scrollToLetter = (letter: string) => {
    const index = flatData.findIndex(item => item === letter);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0
      });
    }
  };

  const renderItem = ({ item }: { item: string | T }) => {
    if (typeof item === 'string' && item.length === 1) {
      // Render section header
      return (
        <View style={[styles.sectionHeader, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionHeaderText, { color: theme.colors.primary }]}>{item}</Text>
        </View>
      );
    }

    // Render list item
    const label = getLabel(item as T);
    return (
      <TouchableOpacity
        style={[
          styles.item,
          selectedValue === label && { backgroundColor: theme.colors.primaryContainer }
        ]}
        onPress={() => onSelect(item as T)}
      >
        <Text style={[
          styles.itemText,
          selectedValue === label && { color: theme.colors.onPrimaryContainer }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={flatData}
        renderItem={renderItem}
        keyExtractor={(item, index) => 
          typeof item === 'string' ? `header_${item}` : `item_${getLabel(item as T)}_${index}`
        }
        getItemLayout={getItemLayout}
      />
      <View style={styles.alphabetList}>
        {alphabet.map((letter) => (
          <TouchableOpacity
            key={letter}
            onPress={() => scrollToLetter(letter)}
            style={styles.letterButton}
          >
            <Text style={[styles.letter, { color: theme.colors.primary }]}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  item: {
    padding: 15,
    paddingRight: 40,
    height: 50,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
  sectionHeader: {
    padding: 10,
    height: 50,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alphabetList: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  letterButton: {
    padding: 4,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});