import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsList'>;

interface SettingItem {
  icon: string;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  textColor?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsListScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useUser();
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      await updateSettings({
        ...settings!,
        notifications: {
          ...settings!.notifications,
          enabled: value,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const settingsSections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'account-circle',
          label: 'Profile',
          onPress: () => navigation.navigate('Profile'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'bell-outline',
          label: 'Notifications',
          onPress: () => navigation.navigate('Notifications'),
          showChevron: true,
          rightElement: (
            <Switch
              value={settings?.notifications.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          ),
        },
        {
          icon: 'ruler',
          label: 'Units',
          onPress: () => navigation.navigate('Units'),
          showChevron: true,
        },
        {
          icon: 'shield-account',
          label: 'Privacy',
          onPress: () => navigation.navigate('Privacy'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information',
          label: 'About MySailLog',
          onPress: () => navigation.navigate('About'),
          showChevron: true,
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: 'logout',
          label: 'Sign Out',
          onPress: handleSignOut,
          textColor: colors.error,
        },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <MaterialCommunityIcons
            name="account-circle"
            size={64}
            color={colors.primary}
          />
          <View style={styles.userTextContainer}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {section.title && (
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
          )}
          <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.settingItem,
                  itemIndex < section.items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={item.onPress}
              >
                <View style={styles.settingItemLeft}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={item.textColor || colors.text}
                    style={styles.settingIcon}
                  />
                  <Text
                    style={[
                      styles.settingLabel,
                      { color: item.textColor || colors.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <View style={styles.settingItemRight}>
                  {item.rightElement}
                  {item.showChevron && (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={colors.textSecondary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
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
  sectionContent: {
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});