
import { router } from 'expo-router';
import { useState } from 'react';

import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

type AccountType = 'commuter' | 'driver';

export default function Index() {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] =
    useState<AccountType>('commuter');
  const [message, setMessage] = useState('');

  // SIGN IN
  const handleSignIn = () => {
    const value = emailOrMobile.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10,15}$/;

    if (!value) {
      setMessage('Please enter your email or mobile number.');
      return;
    }

    if (!emailRegex.test(value) && !mobileRegex.test(value)) {
      setMessage('Please enter a valid email or mobile number.');
      return;
    }

    if (!password.trim()) {
      setMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setMessage('');

    // REDIRECT BASED ON ACCOUNT TYPE
    if (selectedRole === 'driver') {
      router.replace('/driver-home');
    } else {
      router.replace('/home');
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  // GOOGLE SIGN IN
  const handleGoogleSignIn = () => {
    setMessage('Google sign-in has not been connected yet.');
  };

  // SIGN UP
  const handleSignUp = () => {
    router.push('/register');
  };

  const appContent = (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>

          {/* LOGO */}
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* APP TITLE */}
          <Text style={styles.appTitle}>
            TransitTrack
          </Text>

          <Text style={styles.subtitle}>
            Sign in to access your saved routes &{'\n'}
            commute alerts
          </Text>

          {/* LOGIN CARD */}
          <View style={styles.loginCard}>

            {/* ACCOUNT TYPE SELECTOR */}
            <Text style={styles.roleHeading}>
              SIGN IN AS
            </Text>

            <View style={styles.roleSelector}>

              {/* COMMUTER */}
              <Pressable
                style={[
                  styles.roleOption,
                  selectedRole === 'commuter' &&
                    styles.roleOptionActive,
                ]}
                onPress={() => {
                  setSelectedRole('commuter');
                  setMessage('');
                }}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: selectedRole === 'commuter',
                }}
              >
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={[
                    styles.roleIcon,
                    selectedRole !== 'commuter' &&
                      styles.inactiveRoleIcon,
                  ]}
                  resizeMode="contain"
                />

                <Text
                  style={[
                    styles.roleText,
                    selectedRole === 'commuter' &&
                      styles.roleTextActive,
                  ]}
                >
                  Commuter
                </Text>

                {selectedRole === 'commuter' && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>
                      ✓
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* DRIVER */}
              <Pressable
                style={[
                  styles.roleOption,
                  selectedRole === 'driver' &&
                    styles.roleOptionActive,
                ]}
                onPress={() => {
                  setSelectedRole('driver');
                  setMessage('');
                }}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: selectedRole === 'driver',
                }}
              >
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={[
                    styles.roleIcon,
                    selectedRole !== 'driver' &&
                      styles.inactiveRoleIcon,
                  ]}
                  resizeMode="contain"
                />

                <Text
                  style={[
                    styles.roleText,
                    selectedRole === 'driver' &&
                      styles.roleTextActive,
                  ]}
                >
                  Driver
                </Text>

                {selectedRole === 'driver' && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>
                      ✓
                    </Text>
                  </View>
                )}
              </Pressable>

            </View>

            {/* ACCOUNT DESCRIPTION */}
            <Text style={styles.roleDescription}>
              {selectedRole === 'commuter'
                ? 'Access your routes, saved trips, and commute alerts.'
                : 'Access your driving schedule, assigned trips, and route updates.'}
            </Text>

            {/* EMAIL / MOBILE */}
            <Text style={styles.label}>
              Email or Mobile Number
            </Text>

            <View style={styles.inputContainer}>
              <Image
                source={require('../../assets/images/email.png')}
                style={styles.inputIcon}
                resizeMode="contain"
              />

              <TextInput
                style={styles.input}
                value={emailOrMobile}
                onChangeText={(value) => {
                  setEmailOrMobile(value);
                  setMessage('');
                }}
                placeholder="name@example.com or mobile"
                placeholderTextColor="#A1A7B2"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* PASSWORD LABEL */}
            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>
                Password
              </Text>

              <Pressable onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            {/* PASSWORD INPUT */}
            <View style={styles.inputContainer}>
              <Image
                source={require('../../assets/images/lock.png')}
                style={styles.inputIcon}
                resizeMode="contain"
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setMessage('');
                }}
                placeholder="••••••••"
                placeholderTextColor="#A1A7B2"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={
                  showPassword ? 'Hide password' : 'Show password'
                }
              >
                <Image
                  source={
                    showPassword
                      ? require('../../assets/images/eye-off.png')
                      : require('../../assets/images/eye.png')
                  }
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            {/* REMEMBER ME */}
            <View style={styles.rememberRow}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{
                  false: '#D1D5DB',
                  true: '#2864E8',
                }}
                thumbColor="#FFFFFF"
              />

              <Text style={styles.rememberText}>
                Remember me
              </Text>
            </View>

            {/* SIGN IN BUTTON */}
            <Pressable
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.pressedButton,
              ]}
              onPress={handleSignIn}
            >
              <Text style={styles.signInText}>
                Sign In as {selectedRole === 'commuter'
                  ? 'Commuter'
                  : 'Driver'}
              </Text>
            </Pressable>

            {/* MESSAGE */}
            {message !== '' && (
              <Text style={styles.messageText}>
                {message}
              </Text>
            )}

            {/* DIVIDER */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />

              <Text style={styles.orText}>
                OR CONTINUE WITH
              </Text>

              <View style={styles.orLine} />
            </View>

            {/* GOOGLE */}
            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.pressedButton,
              ]}
              onPress={handleGoogleSignIn}
            >
              <Image
                source={require('../../assets/images/google-logo.png')}
                style={styles.googleIcon}
                resizeMode="contain"
              />

              <Text style={styles.googleText}>
                Google
              </Text>
            </Pressable>

          </View>

          {/* SIGN UP */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <Pressable onPress={handleSignUp}>
              <Text style={styles.signupLink}>
                {' '}Sign up
              </Text>
            </Pressable>
          </View>

          {/* POLICY */}
          <Text style={styles.policyText}>
            By continuing, you agree to the{' '}

            <Text style={styles.policyLink}>
              Terms of Service
            </Text>

            {' & '}

            <Text style={styles.policyLink}>
              Privacy Policy
            </Text>

            .
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );

  /*
   * WEB PHONE FRAME
   */
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webBackground}>
        <View style={styles.phoneFrame}>
          {appContent}
        </View>
      </View>
    );
  }

  return appContent;
}

const styles = StyleSheet.create({

  /*
   * WEB PHONE FRAME
   */
  webBackground: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  phoneFrame: {
    width: 390,
    height: 844,
    maxWidth: 'calc(100vw - 48px)' as any,
    maxHeight: 'calc(100vh - 48px)' as any,
    overflow: 'hidden',
    borderRadius: 42,
    borderWidth: 8,
    borderColor: '#111827',
    backgroundColor: '#F7F9FC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },

  /*
   * MAIN APP
   */
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },

  scrollContainer: {
    flexGrow: 1,
  },

  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    backgroundColor: '#F8F9FC',
  },

  /*
   * LOGO
   */
  logo: {
    width: 92,
    height: 92,
    marginBottom: 10,
  },

  /*
   * TITLE
   */
  appTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: '#737985',
    textAlign: 'center',
    marginBottom: 24,
  },

  /*
   * LOGIN CARD
   */
  loginCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE1E7',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },

  /*
   * ACCOUNT TYPE SELECTOR
   */
  roleHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#454C59',
    marginBottom: 10,
  },

  roleSelector: {
    flexDirection: 'row',
    gap: 10,
  },

  roleOption: {
    flex: 1,
    minHeight: 62,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDE1E7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 8,
    position: 'relative',
  },

  roleOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0875E8',
  },

  roleIcon: {
    width: 23,
    height: 23,
  },

  inactiveRoleIcon: {
    opacity: 0.55,
  },

  roleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#737985',
  },

  roleTextActive: {
    color: '#0875E8',
  },

  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 5,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#0875E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  roleDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#737985',
    marginTop: 9,
    marginBottom: 20,
  },

  /*
   * LABELS
   */
  label: {
    fontSize: 15,
    lineHeight: 20,
    color: '#454C59',
    marginBottom: 9,
  },

  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },

  forgotPassword: {
    color: '#356CC7',
    fontSize: 14,
    marginBottom: 9,
  },

  /*
   * INPUTS
   */
  inputContainer: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4D6DA',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },

  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },

  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 15,
    color: '#303743',
    paddingVertical: 0,
  },

  eyeButton: {
    padding: 5,
    marginLeft: 6,
  },

  eyeIcon: {
    width: 23,
    height: 23,
  },

  /*
   * REMEMBER ME
   */
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },

  rememberText: {
    fontSize: 15,
    color: '#737985',
    marginLeft: 8,
  },

  /*
   * SIGN IN BUTTON
   */
  signInButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#2864E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  pressedButton: {
    opacity: 0.75,
  },

  /*
   * MESSAGE
   */
  messageText: {
    color: '#2864E8',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
  },

  /*
   * OR DIVIDER
   */
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 22,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E3E7',
  },

  orText: {
    color: '#9AA0AA',
    fontSize: 10,
    marginHorizontal: 8,
    fontWeight: '500',
  },

  /*
   * GOOGLE BUTTON
   */
  googleButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDE1E7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },

  googleText: {
    fontSize: 17,
    color: '#454C59',
  },

  /*
   * SIGN UP
   */
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
  },

  signupText: {
    fontSize: 14,
    color: '#737985',
  },

  signupLink: {
    fontSize: 14,
    color: '#2864E8',
    fontWeight: '700',
  },

  /*
   * TERMS / PRIVACY
   */
  policyText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#A1A7B2',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },

  policyLink: {
    color: '#356CC7',
  },
});
