import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Constants from 'expo-constants';

// Get the version from app.json if available, otherwise use default
const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
const BUILD_NUMBER = Platform.select({
  ios: Constants.expoConfig?.ios?.buildNumber,
  android: Constants.expoConfig?.android?.versionCode?.toString(),
}) || '1';

interface LinkItem {
  icon: string;
  label: string;
  url: string;
}

const links: LinkItem[] = [
  {
    icon: 'web',
    label: 'Website',
    url: 'https://mysaillog.com',
  },
  {
    icon: 'email',
    label: 'Contact Support',
    url: 'mailto:support@mysaillog.com',
  },
  {
    icon: 'shield',
    label: 'Privacy Policy',
    url: 'https://mysaillog.com/privacy',
  },
  {
    icon: 'file-document',
    label: 'Terms of Service',
    url: 'https://mysaillog.com/terms',
  },
];

export default function AboutScreen() {
  const { colors } = useTheme();

  const handleOpenLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="sail-boat"
          size={80}
          color={colors.primary}
        />
        <Text style={[styles.appName, { color: colors.text }]}>
          MySailLog
        </Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Version {APP_VERSION} ({BUILD_NUMBER})
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          About
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.description, { color: colors.text }]}>
            MySailLog is your digital companion for sailing adventures. Keep track
            of your trips, monitor weather conditions, and maintain your vessel
            information all in one place.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Links
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {links.map((link, index) => (
            <TouchableOpacity
              key={link.url}
              style={[
                styles.link,
                index < links.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={() => handleOpenLink(link.url)}
            >
              <MaterialCommunityIcons
                name={link.icon as any}
                size={24}
                color={colors.primary}
                style={styles.linkIcon}
              />
              <Text style={[styles.linkText, { color: colors.text }]}>
                {link.label}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Credits
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.credits, { color: colors.text }]}>
            Developed with ❤️ by the MySailLog team.{'\n\n'}
            Weather data provided by OpenWeather.{'\n'}
            Icons by Material Design Icons.
          </Text>
        </View>
      </View>

      <Text style={[styles.copyright, { color: colors.textSecondary }]}>
        © {new Date().getFullYear()} MySailLog. All rights reserved.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  linkIcon: {
    marginRight: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
  },
  credits: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    padding: 16,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 32,
  },
});