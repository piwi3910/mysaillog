import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implement password reset functionality
      // await auth.resetPassword(email);
      setResetSent(true);
    } catch (error) {
      Alert.alert(
        'Reset Failed',
        error instanceof Error ? error.message : 'Please try again'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <MaterialCommunityIcons
            name="email-check"
            size={64}
            color={colors.primary}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Check Your Email
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            We've sent password reset instructions to your email address. Please check
            your inbox and follow the instructions to reset your password.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Return to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <MaterialCommunityIcons
            name="lock-reset"
            size={64}
            color={colors.primary}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Reset Password
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email address and we'll send you instructions to reset your
            password.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={24}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backButtonText, { color: colors.primary }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
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
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 48,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});