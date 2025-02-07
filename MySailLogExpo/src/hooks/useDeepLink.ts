import { useEffect, useCallback, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { useAnalytics } from './useAnalytics';
import { EventName, DeepLinkEvent } from '../types/analytics';
import { RootStackParamList } from '../navigation/types';
import type { NavigationProp } from '@react-navigation/native';

interface DeepLinkConfig {
  screens: {
    [key: string]: {
      path: string;
      parse?: (params: Record<string, string>) => any;
      navigationParams?: Record<string, any>;
    };
  };
}

interface DeepLinkHookResult {
  handleDeepLink: (url: string) => Promise<boolean>;
  getInitialDeepLink: () => Promise<string | null>;
  createDeepLink: (screen: string, params?: Record<string, any>) => string;
}

interface ParsedDeepLink {
  screen: keyof RootStackParamList;
  params: RootStackParamList[keyof RootStackParamList];
}

type ScreenConfig = {
  path: string;
  parse?: (params: Record<string, string>) => any;
  navigationParams?: Record<string, any>;
};

const APP_SCHEME = 'mysaillog://';
const WEB_URL = 'https://mysaillog.app';

const defaultConfig: DeepLinkConfig = {
  screens: {
    'Auth/Login': {
      path: 'login'
    },
    'Auth/Register': {
      path: 'register'
    },
    'Auth/ForgotPassword': {
      path: 'forgot-password'
    },
    'Main/Home': {
      path: 'home'
    },
    'Main/Vessels/VesselList': {
      path: 'vessels'
    },
    'Main/Vessels/VesselDetail': {
      path: 'vessel/:vesselId',
      parse: (params) => ({ vesselId: params.vesselId })
    },
    'Main/Vessels/AddVessel': {
      path: 'vessels/add'
    },
    'Main/Vessels/EditVessel': {
      path: 'vessel/:vesselId/edit',
      parse: (params) => ({ vesselId: params.vesselId })
    },
    'Main/Trips/TripList': {
      path: 'trips'
    },
    'Main/Trips/TripDetail': {
      path: 'trip/:tripId',
      parse: (params) => ({ tripId: params.tripId })
    },
    'Main/Trips/StartTrip': {
      path: 'trips/start',
      parse: (params) => params.vesselId ? { vesselId: params.vesselId } : undefined
    },
    'Main/Trips/ActiveTrip': {
      path: 'trip/:tripId/active',
      parse: (params) => ({ tripId: params.tripId })
    },
    'Main/Settings': {
      path: 'settings'
    }
  }
};

export const useDeepLink = (config: DeepLinkConfig = defaultConfig): DeepLinkHookResult => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { trackEvent } = useAnalytics();
  const initialUrlProcessed = useRef(false);

  const parseUrl = useCallback((url: string): ParsedDeepLink | null => {
    let path = url.replace(APP_SCHEME, '').replace(`${WEB_URL}/`, '');
    const [route, queryString] = path.split('?');
    const params: Record<string, string> = {};

    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }

    // Find matching screen configuration
    const screens = config.screens;
    const screenEntries: Array<[string, ScreenConfig]> = Object.entries(screens);

    for (const [screen, screenConfig] of screenEntries) {
      const pathParts = screenConfig.path.split('/');
      const routeParts = route.split('/');

      if (pathParts.length === routeParts.length) {
        const matchParams: Record<string, string> = {};
        let isMatch = true;

        for (let j = 0; j < pathParts.length; j++) {
          if (pathParts[j].startsWith(':')) {
            // This is a parameter
            const paramName = pathParts[j].slice(1);
            matchParams[paramName] = routeParts[j];
          } else if (pathParts[j] !== routeParts[j]) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          const parsedParams = screenConfig.parse ? screenConfig.parse(matchParams) : matchParams;
          const [stack, ...screenParts] = screen.split('/');
          return {
            screen: stack as keyof RootStackParamList,
            params: {
              screen: screenParts.join('/'),
              params: {
                ...params,
                ...parsedParams,
                ...screenConfig.navigationParams
              }
            } as RootStackParamList[keyof RootStackParamList]
          };
        }
      }
    }

    void trackEvent('deep_link_not_found', { url });
    return null;
  }, [config, trackEvent]);

  const handleDeepLink = useCallback(async (url: string): Promise<boolean> => {
    try {
      const parsed = parseUrl(url);
      if (!parsed) {
        void trackEvent('deep_link_invalid', { url });
        return false;
      }

      void trackEvent('deep_link_opened', {
        url,
        screen: parsed.screen,
        params: parsed.params
      });

      try {
        navigation.navigate(parsed.screen, parsed.params);
        return true;
      } catch (navError) {
        void trackEvent('deep_link_navigation_failed', {
          url,
          error: navError instanceof Error ? navError.message : 'Navigation failed'
        });
        return false;
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      void trackEvent('deep_link_error', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }, [navigation, parseUrl, trackEvent]);

  const getInitialDeepLink = useCallback(async (): Promise<string | null> => {
    try {
      // Check for deep link from app launch
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        return initialUrl;
      }

      // Check for deep link from notification
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response?.notification.request.content.data?.url) {
        return response.notification.request.content.data.url as string;
      }

      return null;
    } catch (error) {
      console.error('Error getting initial deep link:', error);
      return null;
    }
  }, []);

  const createDeepLink = useCallback((screen: string, params?: Record<string, any>): string => {
    const screenConfig = config.screens[screen];
    if (!screenConfig) return '';

    let path = screenConfig.path;
    const queryParams: string[] = [];

    if (params) {
      const paramEntries: Array<[string, string]> = Object.entries(params).map(
        ([key, value]) => [key, String(value)]
      );

      for (const [key, value] of paramEntries) {
        const pathParam = `:${key}`;
        if (path.includes(pathParam)) {
          path = path.replace(pathParam, encodeURIComponent(value));
        } else {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      }
    }

    const base = Platform.select({
      web: WEB_URL,
      default: APP_SCHEME
    });

    return `${base}${path}${queryParams.length ? `?${queryParams.join('&')}` : ''}`;
  }, [config]);

  // Handle deep links while app is running
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleDeepLink(url);
    });

    // Handle initial deep link
    if (!initialUrlProcessed.current) {
      initialUrlProcessed.current = true;
      void getInitialDeepLink().then(url => {
        if (url) {
          void handleDeepLink(url);
        }
      });
    }

    return () => {
      subscription.remove();
    };
  }, [handleDeepLink, getInitialDeepLink]);

  return {
    handleDeepLink,
    getInitialDeepLink,
    createDeepLink
  };
};