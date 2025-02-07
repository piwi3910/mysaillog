# MySailLog - Digital Sailing Logbook

A comprehensive mobile application for maintaining digital logbooks for sailing activities. Built with Expo (React Native) for the frontend and Express.js for the backend.

## Features

### Core Features
- Digital logbook for sailing trips
- Real-time GPS tracking and route recording
- Weather condition monitoring and logging
- Vessel management system
- Crew member tracking
- Trip statistics and history
- Offline-first architecture

### Advanced Features
- Real-time weather data integration
- Beaufort scale calculations
- Sea state information
- Wind direction indicators
- Detailed trip statistics
- Interactive maps with route visualization

## Project Structure

```
mysaillog/
├── frontend/           # Expo React Native application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── screens/     # Screen components
│   │   ├── navigation/  # Navigation configuration
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utility functions
│   └── App.tsx         # Root component
│
├── backend/            # Express.js server
│   ├── src/
│   │   └── server.ts   # Main server file
│   ├── data/           # SQLite database directory
│   └── .env           # Environment variables
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- OpenWeather API key (for weather data)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the .env file with your configuration:
   ```
   PORT=3000
   DB_PATH=./data/mysaillog.db
   JWT_SECRET=your_jwt_secret_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the .env file with your OpenWeather API key:
   ```
   EXPO_PUBLIC_WEATHER_API_KEY=your_openweather_api_key_here
   ```

   Get your API key at: https://openweathermap.org/api

5. Start the Expo development server:
   ```bash
   npm start
   ```

6. Use the Expo Go app on your mobile device or run in an emulator:
   - Press 'a' for Android
   - Press 'i' for iOS (requires macOS)

## Key Features Usage

### Trip Logging
- Start a new trip by selecting a vessel and adding crew members
- Automatic GPS tracking records your route
- Real-time weather data updates every 15 minutes
- End trip to save all data including route, weather conditions, and statistics

### Weather Integration
- Real-time weather data from OpenWeather API
- Displays temperature, wind speed, and direction
- Beaufort scale calculations
- Sea state information
- Automatic periodic updates during trips

### Vessel Management
- Add and manage multiple vessels
- Track vessel details and specifications
- Equipment logging capability
- Maintenance records

### Trip History
- View detailed trip logs with routes
- Interactive maps showing sailed routes
- Weather conditions throughout the trip
- Comprehensive trip statistics

## Development

### Backend Development
- Express.js with TypeScript
- SQLite database for data storage
- RESTful API endpoints
- Offline-first architecture

### Frontend Development
- Built with Expo and React Native
- TypeScript for type safety
- React Navigation for routing
- AsyncStorage for offline data
- MapView for route visualization
- Real-time weather integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenWeather API for weather data
- Expo team for the amazing mobile development framework
- React Navigation team for the navigation solution