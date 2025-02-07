import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const { trackEvent } = useAnalytics();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      await updateUserProfile({ name: name.trim() });
      void trackEvent('user_update', {
        updatedFields: ['name'],
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setIsEditing(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="account" size={64} color="#FFFFFF" />
          </View>
          {!isEditing ? (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => setIsEditing(true)}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={colors.error}
                />
                <Text style={[styles.actionButtonText, { color: colors.error }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Profile Information
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              ) : (
                <Text style={[styles.fieldValue, { color: colors.text }]}>
                  {user?.name}
                </Text>
              )}
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Email
              </Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Account Information
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Account ID
              </Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {user?.id}
              </Text>
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Created
              </Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {new Date(user?.createdAt || '').toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});