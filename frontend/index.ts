import { registerRootComponent } from 'expo';
import 'react-native-gesture-handler';
import App from './App';

// Initialize gesture handler before registering the root component
registerRootComponent(App);
