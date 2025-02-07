import { useCallback, useEffect, useRef } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { useAnalytics } from './useAnalytics';
import { EventName } from '../types/analytics';

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  name: string;
  metadata?: Record<string, any>;
}

interface PerformanceHookResult {
  startMeasurement: (name: string, metadata?: Record<string, any>) => void;
  endMeasurement: (name: string, additionalMetadata?: Record<string, any>) => void;
  trackInteraction: (name: string, callback: () => Promise<void>) => Promise<void>;
  getMetrics: () => PerformanceMetrics[];
  clearMetrics: () => void;
}

const MAX_METRICS = 100;

export const usePerformance = (): PerformanceHookResult => {
  const { trackEvent } = useAnalytics();
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const activeMetricsRef = useRef<Map<string, number>>(new Map());

  // Clean up old metrics
  const cleanupMetrics = useCallback(() => {
    if (metricsRef.current.length > MAX_METRICS) {
      metricsRef.current = metricsRef.current.slice(-MAX_METRICS);
    }
  }, []);

  const startMeasurement = useCallback((name: string, metadata?: Record<string, any>) => {
    const startTime = performance.now();
    activeMetricsRef.current.set(name, startTime);

    void trackEvent('performance_measurement_start', {
      name,
      startTime,
      ...metadata
    });
  }, [trackEvent]);

  const endMeasurement = useCallback((name: string, additionalMetadata?: Record<string, any>) => {
    const startTime = activeMetricsRef.current.get(name);
    if (!startTime) {
      console.warn(`No active measurement found for: ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetrics = {
      name,
      startTime,
      endTime,
      duration,
      metadata: additionalMetadata
    };

    metricsRef.current.push(metric);
    activeMetricsRef.current.delete(name);
    cleanupMetrics();

    void trackEvent('performance_measurement_end', {
      name,
      duration,
      ...additionalMetadata
    });

    // Alert if duration is unusually long (> 500ms)
    if (duration > 500) {
      void trackEvent('performance_warning', {
        name,
        duration,
        threshold: 500,
        ...additionalMetadata
      });
    }
  }, [trackEvent, cleanupMetrics]);

  const trackInteraction = useCallback(async (
    name: string,
    callback: () => Promise<void>
  ) => {
    return new Promise<void>((resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {
        startMeasurement(name);
        try {
          await callback();
          endMeasurement(name);
          resolve();
        } catch (error) {
          endMeasurement(name, { error: error instanceof Error ? error.message : 'Unknown error' });
          reject(error);
        }
      });
    });
  }, [startMeasurement, endMeasurement]);

  const getMetrics = useCallback((): PerformanceMetrics[] => {
    return [...metricsRef.current];
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
    activeMetricsRef.current.clear();
  }, []);

  // Track app startup time
  useEffect(() => {
    const trackStartupPerformance = async () => {
      if (Platform.OS === 'web') return;

      const startupMetric: PerformanceMetrics = {
        name: 'app_startup',
        startTime: 0, // We don't have the actual start time
        endTime: performance.now(),
        duration: performance.now(),
        metadata: {
          platform: Platform.OS,
          version: Platform.Version
        }
      };

      metricsRef.current.push(startupMetric);
      void trackEvent('performance_app_startup', {
        duration: startupMetric.duration,
        ...startupMetric.metadata
      });
    };

    trackStartupPerformance();
  }, [trackEvent]);

  // Track frame drops
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let frameCount = 0;
    let lastFrameTime = Date.now();
    let droppedFrames = 0;
    let totalFrames = 0;

    const checkFrameRate = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastFrameTime;
      
      // Expected frame time at 60fps is ~16.67ms
      if (timeDiff > 20) { // Frame drop threshold
        droppedFrames++;
      }
      
      totalFrames++;
      frameCount++;
      lastFrameTime = currentTime;

      // Report metrics every 60 frames
      if (frameCount >= 60) {
        const frameDropRate = (droppedFrames / totalFrames) * 100;
        
        if (frameDropRate > 5) { // More than 5% frames dropped
          void trackEvent('performance_frame_drop', {
            droppedFrames,
            totalFrames,
            frameDropRate: `${frameDropRate.toFixed(2)}%`
          });
        }

        // Reset counters
        frameCount = 0;
        droppedFrames = 0;
        totalFrames = 0;
      }
    };

    const frameCallback = InteractionManager.createInteractionHandle();
    const interval = setInterval(checkFrameRate, 16); // ~60fps

    return () => {
      InteractionManager.clearInteractionHandle(frameCallback);
      clearInterval(interval);
    };
  }, [trackEvent]);

  return {
    startMeasurement,
    endMeasurement,
    trackInteraction,
    getMetrics,
    clearMetrics
  };
};