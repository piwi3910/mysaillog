import { useCallback } from 'react';
import { Platform } from 'react-native';
import { EventName, AnalyticsEventProperties } from '../types/analytics';
import { useErrorHandler } from './useErrorHandler';

export function useAnalytics() {
  const { handleError } = useErrorHandler();

  const trackEvent = useCallback(async (
    name: EventName,
    properties?: Partial<AnalyticsEventProperties>
  ) => {
    try {
      // In a real app, you would send this to your analytics service
      // For this demo, we'll just log to console in development
      if (__DEV__) {
        console.log('[Analytics]', {
          eventName: name,
          timestamp: Date.now(),
          platform: Platform.OS,
          ...properties,
        });
      }
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const trackScreen = useCallback(async (screenName: string) => {
    await trackEvent('screen_view', {
      screen: screenName,
      platform: Platform.OS,
    });
  }, [trackEvent]);

  const trackError = useCallback(async (error: Error, context?: string) => {
    await trackEvent('app_error', {
      error: error.message,
      stack: error.stack,
      context,
      platform: Platform.OS,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackScreen,
    trackError,
  };
}