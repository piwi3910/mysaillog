import React, { useRef } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, Text } from 'react-native';
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
  const sectionListRef = useRef<SectionList>(null);

  // Group items by first letter
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

  const alphabet = sections.map(section => section.title);

  const scrollToSection = (letter: string) => {
    const sectionIndex = sections.findIndex(section => section.title === letter);
    if (sectionIndex !== -1) {
      sectionListRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        animated: true,
        viewPosition: 0,
      });
    }
  };

  return (
    <View style={styles.container}>
      <SectionList
        ref={sectionListRef}
        sections={sections}
        keyExtractor={(item, index) => getLabel(item) + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selectedValue === getLabel(item) && { backgroundColor: theme.colors.primaryContainer }
            ]}
            onPress={() => onSelect(item)}
          >
            <Text style={[
              styles.itemText,
              selectedValue === getLabel(item) && { color: theme.colors.onPrimaryContainer }
            ]}>
              {getLabel(item)}
            </Text>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionHeaderText, { color: theme.colors.primary }]}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={true}
      />
      <View style={styles.alphabetList}>
        {alphabet.map((letter) => (
          <TouchableOpacity
            key={letter}
            onPress={() => scrollToSection(letter)}
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
  sectionHeader: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alphabetList: {
    position: 'absolute',
    right: 5,
    top: 0,
    bottom: 0,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 10,
  },
  letterButton: {
    padding: 2,
  },
  letter: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});