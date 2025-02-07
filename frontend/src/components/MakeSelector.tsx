import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Menu, Searchbar, useTheme } from 'react-native-paper';
import { vesselMakes } from '../data/vesselMakes';

interface MakeSelectorProps {
  value: string;
  onSelect: (make: string) => void;
}

export default function MakeSelector({ value, onSelect }: MakeSelectorProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const filteredMakes = vesselMakes.filter(make =>
    make.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            style={styles.button}
          >
            {value || 'Select Make'}
          </Button>
        }
        contentStyle={styles.menuContent}
      >
        <Searchbar
          placeholder="Search makes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView style={styles.scrollView}>
          {filteredMakes.map((make) => (
            <Menu.Item
              key={make}
              onPress={() => {
                onSelect(make);
                closeMenu();
              }}
              title={make}
            />
          ))}
        </ScrollView>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
  menuContent: {
    maxHeight: 400,
    width: 300,
  },
  searchBar: {
    margin: 8,
  },
  scrollView: {
    maxHeight: 300,
  },
});