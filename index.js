import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./App.js";

import App from './App';

function RootApp() {
      return (
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>
      );
    }

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
