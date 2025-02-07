import React, { Component, ErrorInfo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAnalytics } from '../hooks/useAnalytics';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Since error boundaries must be class components, we create a wrapper
// for the functional components we want to use inside
function ErrorDisplay({ error, errorInfo, onReset }: {
  error: Error;
  errorInfo: ErrorInfo;
  onReset?: () => void;
}) {
  const { colors } = useTheme();
  const { trackError } = useAnalytics();

  // Track the error
  React.useEffect(() => {
    if (errorInfo.componentStack) {
      void trackError(error, errorInfo.componentStack);
    } else {
      void trackError(error);
    }
  }, [error, errorInfo, trackError]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.error }]}>
          Oops! Something went wrong
        </Text>
        
        <Text style={[styles.message, { color: colors.text }]}>
          {error.message || 'An unexpected error occurred'}
        </Text>

        {errorInfo.componentStack && (
          <ScrollView style={styles.detailsContainer}>
            <Text style={[styles.details, { color: colors.textSecondary }]}>
              {errorInfo.componentStack}
            </Text>
          </ScrollView>
        )}

        {onReset && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onReset}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      return (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsContainer: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
  },
  details: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ErrorBoundary;