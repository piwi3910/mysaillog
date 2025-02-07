import React, { useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme, List, Text, Surface, TouchableRipple } from 'react-native-paper';

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
    length: 48, // Match List.Item default height
    offset: 48 * index,
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
        <List.Subheader
          style={[styles.sectionHeader, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          {item}
        </List.Subheader>
      );
    }

    // Render list item
    const label = getLabel(item as T);
    return (
      <List.Item
        title={label}
        style={[
          styles.item,
          selectedValue === label && { backgroundColor: theme.colors.primaryContainer }
        ]}
        titleStyle={[
          selectedValue === label && { color: theme.colors.onPrimaryContainer }
        ]}
        onPress={() => onSelect(item as T)}
      />
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
        style={styles.list}
      />
      <Surface style={[styles.alphabetList, { elevation: 1 }]}>
        <FlatList
          data={alphabet}
          renderItem={({ item: letter }) => (
            <TouchableRipple
              onPress={() => scrollToLetter(letter)}
              style={styles.letterButton}
              borderless
            >
              <Text variant="labelMedium" style={[styles.letter, { color: theme.colors.primary }]}>
                {letter}
              </Text>
            </TouchableRipple>
          )}
          keyExtractor={letter => letter}
          showsVerticalScrollIndicator={false}
          style={styles.letterList}
        />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  list: {
    flex: 1,
  },
  item: {
    paddingRight: 40,
    height: 48,
  },
  sectionHeader: {
    height: 48,
    justifyContent: 'center',
  },
  alphabetList: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 38,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  letterList: {
    flex: 1,
    paddingVertical: 8,
  },
  letterButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    alignSelf: 'center',
    marginVertical: 2,
  },
  letter: {
    fontWeight: 'bold',
  },
});