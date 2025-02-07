import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, MainTabParamList, TripStackParamList, VesselStackParamList } from '../navigation/types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const quickActions = [
    {
      title: 'Start New Trip',
      icon: 'sail-boat' as const,
      onPress: () => {
        navigation.navigate('Trips', {
          screen: 'NewTrip'
        });
      },
    },
    {
      title: 'Add Vessel',
      icon: 'ferry' as const,
      onPress: () => {
        navigation.navigate('Vessels', {
          screen: 'NewVessel'
        });
      },
    },
    {
      title: 'Check Weather',
      icon: 'weather-partly-cloudy' as const,
      onPress: () => navigation.navigate('Weather'),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Welcome back,{'\n'}
          <Text style={styles.name}>{user?.name}</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                { backgroundColor: colors.surface },
              ]}
              onPress={action.onPress}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={32}
                color={colors.primary}
                style={styles.actionIcon}
              />
              <Text
                style={[styles.actionTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Trips
        </Text>
        <TouchableOpacity
          style={[styles.emptyState, { backgroundColor: colors.surface }]}
          onPress={() => {
            navigation.navigate('Trips', {
              screen: 'NewTrip'
            });
          }}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={48}
            color={colors.primary}
            style={styles.emptyStateIcon}
          />
          <Text style={[styles.emptyStateText, { color: colors.text }]}>
            Start your first trip
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Tap here to create a new trip
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Weather Overview
        </Text>
        <TouchableOpacity
          style={[styles.weatherCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Weather')}
        >
          <MaterialCommunityIcons
            name="weather-partly-cloudy"
            size={48}
            color={colors.primary}
            style={styles.weatherIcon}
          />
          <View style={styles.weatherInfo}>
            <Text style={[styles.weatherLocation, { color: colors.text }]}>
              Check Weather
            </Text>
            <Text style={[styles.weatherSubtext, { color: colors.textSecondary }]}>
              Tap to view detailed forecast
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '600',
  },
  name: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyState: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  weatherIcon: {
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherLocation: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  weatherSubtext: {
    fontSize: 14,
  },
});