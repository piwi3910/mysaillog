import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';
import {
  calculateSailingStats,
  getWindRose,
  getPopularSailingTimes,
  SailingStats,
} from '../utils/analytics';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<SailingStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [timeData, setTimeData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({
    labels: [],
    datasets: [{ data: [] }],
  });

  const loadData = async () => {
    try {
      const tripsData = await AsyncStorage.getItem('trips');
      if (tripsData) {
        const loadedTrips: Trip[] = JSON.parse(tripsData);
        setTrips(loadedTrips);

        const calculatedStats = calculateSailingStats(loadedTrips);
        setStats(calculatedStats);

        // Prepare monthly data
        const monthLabels = Object.keys(calculatedStats.monthlyActivity)
          .slice(-6)
          .map(key => key.split('-')[1]); // Show only month part
        const monthlyDistances = Object.values(calculatedStats.monthlyActivity)
          .slice(-6)
          .map(data => data.distance);

        setMonthlyData({
          labels: monthLabels,
          datasets: [{ data: monthlyDistances }],
        });

        // Prepare time of day data
        const timeLabels = ['Morning', 'Afternoon', 'Evening', 'Night'];
        const timeValues = [
          calculatedStats.timeOfDay.morning,
          calculatedStats.timeOfDay.afternoon,
          calculatedStats.timeOfDay.evening,
          calculatedStats.timeOfDay.night,
        ];

        setTimeData({
          labels: timeLabels,
          datasets: [{ data: timeValues }],
        });
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noDataText}>No sailing data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Sailing Analytics</Text>

          {/* Overview Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalTrips}</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalDistance.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total NM</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{(stats.totalDuration / 60).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
          </View>

          {/* Monthly Distance Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Monthly Distance (NM)</Text>
            <LineChart
              data={monthlyData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=" nm"
            />
          </View>

          {/* Sailing Time Distribution */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Sailing Time Distribution</Text>
            <BarChart
              data={timeData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=" trips"
              fromZero
            />
          </View>

          {/* Weather Stats */}
          <View style={styles.weatherStats}>
            <Text style={styles.sectionTitle}>Average Conditions</Text>
            <Text style={styles.weatherText}>
              Wind Speed: {stats.mostFrequentConditions.windSpeed.toFixed(1)} knots
            </Text>
            <Text style={styles.weatherText}>
              Temperature: {stats.mostFrequentConditions.temperature.toFixed(1)}°C
            </Text>
            <Text style={styles.weatherText}>Max Speed: {stats.maxSpeed.toFixed(1)} knots</Text>
          </View>

          {/* Performance Stats */}
          <View style={styles.performanceStats}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <Text style={styles.performanceText}>
              Average Trip Length: {stats.averageTripLength.toFixed(1)} nm
            </Text>
            <Text style={styles.performanceText}>
              Average Speed: {stats.averageSpeed.toFixed(1)} knots
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    marginTop: 50,
    textAlign: 'center',
  },
  performanceStats: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  performanceText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 5,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  statValue: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  weatherStats: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  weatherText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default AnalyticsScreen;
