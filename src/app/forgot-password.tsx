import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetPassword = () => {
    if (emailOrPhone.trim() === '') {
      setMessage(
        'Please enter your registered email or phone number.'
      );
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        'Your new password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(
        'Please make sure both passwords are the same.'
      );
      return;
    }

    setMessage('Password reset successfully!');

    setTimeout(() => {
      router.replace('/');
    }, 1200);
  };

  const appContent = (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* TOP BAR */}
        <View style={styles.topBar}>

          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/')}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#1F2937"
            />

            <Text style={styles.backText}>
              Back to Sign In
            </Text>
          </Pressable>

          <View style={styles.brand}>

            {/* SAME LOGO USED ON LOGIN + HOME */}
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />

            <Text style={styles.brandText}>
              TransitTrack
            </Text>

          </View>

        </View>

        {/* LOCK ICON */}
        <View style={styles.lockBox}>
          <Ionicons
            name="lock-closed-outline"
            size={39}
            color="#172030"
          />
        </View>

        {/* TITLE */}
        <Text style={styles.title}>
          Reset Password
        </Text>

        {/* DESCRIPTION */}
        <Text style={styles.description}>
          Enter your registered email or phone,{'\n'}
          then choose a new password (at least 6 characters).
        </Text>

        {/* FORM */}
        <View style={styles.formCard}>

          {/* EMAIL OR PHONE */}
          <View style={styles.labelRow}>

            <Text style={styles.label}>
              Email or Phone Number
            </Text>

            <Text style={styles.rightLabel}>
              Verified profile
            </Text>

          </View>

          <View style={styles.inputContainer}>

            <Text style={styles.atIcon}>
              @
            </Text>

            <TextInput
              style={styles.input}
              value={emailOrPhone}
              onChangeText={(value) => {
                setEmailOrPhone(value);
                setMessage('');
              }}
              placeholder="e.g. jasmine@commute.ph or 0917..."
              placeholderTextColor="#6F7783"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

          </View>

          {/* NEW PASSWORD */}
          <View
            style={[
              styles.labelRow,
              styles.passwordLabelRow,
            ]}
          >

            <Text style={styles.label}>
              New Password
            </Text>

            <Text style={styles.rightLabel}>
              Min. 6 chars
            </Text>

          </View>

          <View style={styles.inputContainer}>

            <Ionicons
              name="lock-closed-outline"
              size={21}
              color="#273342"
              style={styles.leftIcon}
            />

            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setMessage('');
              }}
              placeholder="At least 6 characters"
              placeholderTextColor="#6F7783"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() =>
                setShowPassword(!showPassword)
              }
            >
              <Ionicons
                name={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={23}
                color="#273342"
              />
            </Pressable>

          </View>

          

          {/* CONFIRM PASSWORD */}
          <View style={styles.confirmLabel}>

            <Text style={styles.label}>
              Confirm New Password
            </Text>

          </View>

          <View style={styles.inputContainer}>

            <MaterialCommunityIcons
              name="lock-reset"
              size={22}
              color="#273342"
              style={styles.leftIcon}
            />

            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setMessage('');
              }}
              placeholder="Re-enter new password"
              placeholderTextColor="#6F7783"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              <Ionicons
                name={
                  showConfirmPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={23}
                color="#273342"
              />
            </Pressable>

          </View>

          {/* RESET PASSWORD BUTTON */}
          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.pressed,
            ]}
            onPress={handleResetPassword}
          >
            <Text style={styles.resetText}>
              RESET PASSWORD
            </Text>

            <Ionicons
              name="arrow-forward"
              size={25}
              color="#FFFFFF"
            />
          </Pressable>

          {/* MESSAGE */}
          {message !== '' && (
            <Text style={styles.messageText}>
              {message}
            </Text>
          )}

        </View>

        {/* SUPPORT */}
        <View style={styles.supportRow}>

          <Ionicons
            name="headset-outline"
            size={20}
            color="#273342"
          />

          <Text style={styles.supportText}>
            Need help? Contact Commuter Support
          </Text>

        </View>

        {/* REMEMBER PASSWORD */}
        <View style={styles.rememberRow}>

          <Text style={styles.rememberText}>
            Remember your password?
          </Text>

          <Pressable
            onPress={() => router.replace('/')}
          >
            <Text style={styles.signInLink}>
              {' '}Sign In
            </Text>
          </Pressable>

        </View>

      </ScrollView>
    </SafeAreaView>
  );

  /*
   * WEB
   *
   * Shows the Forgot Password screen
   * inside the same realistic phone frame
   * used by Login and Home.
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

  /*
   * MOBILE
   *
   * On an actual phone, render normally.
   */
  return appContent;
}

const styles = StyleSheet.create({

  /* ==================================================
     WEB PHONE FRAME
     ================================================== */

  webBackground: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  phoneFrame: {
    width: 390,
    height: 844,
    maxWidth: 'calc(100vw - 40px)' as any,
    maxHeight: 'calc(100vh - 40px)' as any,
    overflow: 'hidden',
    borderRadius: 42,
    borderWidth: 8,
    borderColor: '#111827',
    backgroundColor: '#F8F9FC',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },

  /* ==================================================
     MAIN
     ================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 35,
  },

  /* ==================================================
     TOP BAR
     ================================================== */

  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 48,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backText: {
    fontSize: 14,
    color: '#273342',
    marginLeft: 8,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandLogo: {
    width: 30,
    height: 30,
    marginRight: 5,
  },

  brandText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172030',
    letterSpacing: 1,
  },

  /* ==================================================
     LOCK
     ================================================== */

  lockBox: {
    width: 80,
    height: 76,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  /* ==================================================
     TITLE
     ================================================== */

  title: {
    fontSize: 19,
    color: '#1E2734',
    textAlign: 'center',
    marginTop: 22,
    fontWeight: '500',
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#252E3A',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 43,
    paddingHorizontal: 8,
  },

  /* ==================================================
     FORM
     ================================================== */

  formCard: {
    width: '100%',
    maxWidth: 510,
    alignSelf: 'center',
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  passwordLabelRow: {
    marginTop: 22,
  },

  confirmLabel: {
    marginTop: 22,
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26313F',
  },

  rightLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#26313F',
  },

  inputContainer: {
    width: '100%',
    height: 53,
    borderWidth: 1.3,
    borderColor: '#606772',
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  atIcon: {
    fontSize: 27,
    fontWeight: '600',
    color: '#273342',
    width: 34,
    textAlign: 'center',
  },

  leftIcon: {
    width: 34,
    textAlign: 'center',
  },

  input: {
    flex: 1,
    height: 51,
    fontSize: 16,
    color: '#273342',
    paddingHorizontal: 5,
  },

  eyeButton: {
    padding: 5,
  },

  helperText: {
    fontSize: 15,
    color: '#293341',
    marginTop: 7,
  },

  /* ==================================================
     RESET BUTTON
     ================================================== */

  resetButton: {
    height: 58,
    width: '100%',
    backgroundColor: '#1475E8',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 32,
    borderRadius: 10,
  },

  resetText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.7,
    marginRight: 10,
  },

  pressed: {
    opacity: 0.65,
  },

  /* ==================================================
     MESSAGE
     ================================================== */

  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2876D7',
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '600',
  },

  /* ==================================================
     SUPPORT
     ================================================== */

  supportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 42,
  },

  supportText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#273342',
    marginLeft: 7,
  },

  /* ==================================================
     SIGN IN
     ================================================== */

  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 27,
  },

  rememberText: {
    fontSize: 14,
    color: '#273342',
  },

  signInLink: {
    fontSize: 14,
    color: '#273342',
    fontWeight: '700',
  },
});