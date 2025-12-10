import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Animated, 
  PanResponder, 
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginWithEmail, signInWithGoogle, signInWithFacebook, signInWithApple } from '../../services/authService';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) pan.setValue({ x: 0, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(slideAnim, { toValue: height, duration: 200, useNativeDriver: false }).start();
          Animated.timing(logoAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
          pan.setValue({ x: 0, y: 0 });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const openPanel = () => {
    Animated.timing(slideAnim, { toValue: height / 2.5, duration: 300, useNativeDriver: false }).start();
    Animated.timing(logoAnim, { toValue: -100, duration: 300, useNativeDriver: false }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      // Navigation handled by AuthContext
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);

    if (!result.success) {
      Alert.alert('Google Sign In Failed', result.error);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    const result = await signInWithFacebook();
    setLoading(false);

    if (!result.success) {
      Alert.alert('Facebook Sign In Failed', result.error);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    const result = await signInWithApple();
    setLoading(false);

    if (!result.success) {
      Alert.alert('Apple Sign In Failed', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Image
        source={require('../../../app/assets/seekerLg.png')}
        style={[styles.logo, { transform: [{ translateY: logoAnim }] }]}
      />

      <Animated.View style={[styles.loginForm, { transform: [{ translateY: logoAnim }] }]}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          onPress={handleLogin} 
          style={styles.button}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity onPress={openPanel}>
        <Text style={styles.createAccountText}>Create an Account with</Text>
      </TouchableOpacity>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.panel, { top: Animated.add(slideAnim, pan.y) }]}
      >
        <View style={styles.panelHandle} />
        <Text style={styles.panelTitle}>Create an account with</Text>
        
        <TouchableOpacity onPress={handleGoogleSignIn} disabled={loading}>
          <Image source={require('../../../app/assets/googleoption.png')} style={styles.option}/>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleFacebookSignIn} disabled={loading}>
          <Image source={require('../../../app/assets/fboption.png')} style={styles.option}/>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleAppleSignIn} disabled={loading}>
          <Image source={require('../../../app/assets/appleoption.png')} style={styles.option}/>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
          style={styles.emailRegisterButton}
        >
          <Text style={styles.emailRegisterText}>Register with Email</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#D0E1D7'
  },
  logo: { 
    width: 310, 
    height: 200, 
    marginBottom: 15 
  },
  loginForm: {
    width: '80%',
    marginBottom: 20
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16
  },
  button: { 
    width: '100%', 
    alignItems: 'center', 
    backgroundColor: '#50A296', 
    marginBottom: 15,
    borderRadius: 10,
    padding: 15
  },
  buttonText: { 
    textAlign: 'center', 
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  createAccountText: {
    color: '#50A296',
    fontSize: 14,
    marginTop: 10
  },
  panel: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: height / 2,
    backgroundColor: '#50A296',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    marginBottom: 15
  },
  panelTitle: { 
    color: "#fff",
    textAlign: 'center',
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20,
  },
  option: { 
    height: 50,
    width: 335,
    marginTop: 10,
    marginBottom: 10
  },
  emailRegisterButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    width: '90%'
  },
  emailRegisterText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  }
});