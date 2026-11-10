
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type AccountType = 'commuter' | 'driver';

const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    (globalThis as any).alert?.(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function RegisterScreen() {
  const [accountType, setAccountType] = useState<AccountType>('commuter');

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState('');

  const clearMessage = () => {
    if (message) setMessage('');
  };

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    setMessage('');
  };

  const handleRegister = () => {
    setMessage('');

    if (accountType === 'driver') {
      setMessage(
        'Driver registration is coming soon. Please select Commuter for now.'
      );
      return;
    }

    if (
      !fullName.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessage('Please complete all required fields.');
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage('Please enter a valid 10-digit mobile number after +63.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Your passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setMessage('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    Keyboard.dismiss();

    showMessage(
      'Registration Form Validated',
      'Your information is ready. Connect Firebase or Supabase to create your commuter account.'
    );
  };

  const handleGoogleRegister = () => {
    showMessage(
      'Google Sign-Up',
      'Google authentication has not been connected yet.'
    );
  };

  const appContent = (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              style={styles.headerBack}
              onPress={() => router.replace('/')}
            >
              <Ionicons name="arrow-back" size={22} color="#182437" />
            </Pressable>

            <Text style={styles.headerTitle}>CREATE ACCOUNT</Text>

            <View style={styles.headerSpacer} />
          </View>

          {/* BRAND */}
          <View style={styles.brandSection}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brandName}>TransitTrack</Text>

            <Text style={styles.brandSubtitle}>SAYRE CORRIDOR</Text>

            <Text style={styles.title}>CREATE ACCOUNT</Text>

            <Text style={styles.description}>
              Real-time tracking along Northern Mindanao Sayre Hwy
            </Text>
          </View>

          {/* ACCOUNT TYPE SELECTION */}
          <View style={styles.accountTypeContainer}>
            <Text style={styles.accountTypeHeading}>
              SELECT ACCOUNT TYPE
            </Text>

            <View style={styles.accountTypeOptions}>
              {/* COMMUTER OPTION */}
              <Pressable
                onPress={() => handleAccountTypeChange('commuter')}
                style={[
                  styles.accountTypeOption,
                  accountType === 'commuter' &&
                    styles.accountTypeOptionActive,
                ]}
              >
                <View style={styles.accountTypeIcon}>
                  <Ionicons
                    name="walk-outline"
                    size={21}
                    color="#0875E8"
                  />
                </View>

                <Text
                  style={[
                    styles.accountTypeOptionText,
                    accountType === 'commuter' &&
                      styles.accountTypeOptionTextActive,
                  ]}
                >
                  Commuter
                </Text>

                {accountType === 'commuter' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={17}
                    color="#0875E8"
                    style={styles.accountTypeCheck}
                  />
                )}
              </Pressable>

              {/* DRIVER OPTION */}
              <Pressable
                onPress={() => router.push('/driver-register')}
                style={styles.accountTypeOption}
              >
                <View style={styles.accountTypeIcon}>
                  <Ionicons
                    name="car-outline"
                    size={21}
                    color="#0875E8"
                  />
                </View>

                <Text style={styles.accountTypeOptionText}>
                  Driver
                </Text>
              </Pressable>
            </View>
          </View>

          {/* COMMUTER REGISTRATION FORM */}
          {accountType === 'commuter' ? (
            <>
              <View style={styles.formCard}>
                {/* SELECTED ACCOUNT */}
                <View style={styles.selectedAccountRow}>
                  <View style={styles.accountTypeIcon}>
                    <Ionicons
                      name="walk-outline"
                      size={19}
                      color="#0875E8"
                    />
                  </View>

                  <View style={styles.accountTypeInfo}>
                    <Text style={styles.accountTypeLabel}>
                      ACCOUNT TYPE
                    </Text>

                    <Text style={styles.accountTypeName}>
                      Commuter
                    </Text>
                  </View>

                  <View style={styles.selectedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#0875E8"
                    />
                    <Text style={styles.selectedText}>SELECTED</Text>
                  </View>
                </View>

                <View style={styles.formDivider} />

                <Text style={styles.formHeading}>
                  Personal Information
                </Text>

                {/* FULL NAME */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>FULL NAME</Text>

                  <View style={styles.inputRow}>
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color="#0875E8"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Jasmine Cruz"
                      placeholderTextColor="#94A3B8"
                      value={fullName}
                      onChangeText={(value) => {
                        setFullName(value);
                        clearMessage();
                      }}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* MOBILE NUMBER */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>MOBILE NUMBER</Text>

                  <View style={styles.mobileContainer}>
                    <View style={styles.countryCode}>
                      <Text style={styles.flag}>🇵🇭</Text>
                      <Text style={styles.countryCodeText}>+63</Text>
                    </View>

                    <TextInput
                      style={styles.mobileInput}
                      placeholder="917 123 4567"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={mobile}
                      onChangeText={(value) => {
                        setMobile(value.replace(/[^0-9]/g, ''));
                        clearMessage();
                      }}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* EMAIL */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>

                  <View style={styles.inputRow}>
                    <Ionicons
                      name="mail-outline"
                      size={19}
                      color="#0875E8"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        clearMessage();
                      }}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* PASSWORD */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <Text style={styles.fieldHint}>
                      MIN. 6 CHARACTERS
                    </Text>
                  </View>

                  <View style={styles.inputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={19}
                      color="#0875E8"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        clearMessage();
                      }}
                      returnKeyType="next"
                    />

                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      accessibilityLabel={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      <Ionicons
                        name={
                          showPassword ? 'eye-off-outline' : 'eye-outline'
                        }
                        size={19}
                        color="#64748B"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* CONFIRM PASSWORD */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>CONFIRM PASSWORD</Text>

                  <View style={styles.inputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={19}
                      color="#0875E8"
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Repeat your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        clearMessage();
                      }}
                      returnKeyType="done"
                    />

                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeButton}
                      accessibilityLabel={
                        showConfirmPassword
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        size={19}
                        color="#64748B"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* TERMS AND PRIVACY */}
                <View style={styles.termsRow}>
                  <Pressable
                    onPress={() => {
                      setAcceptedTerms(!acceptedTerms);
                      clearMessage();
                    }}
                    style={[
                      styles.checkbox,
                      acceptedTerms && styles.checkboxActive,
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: acceptedTerms }}
                  >
                    {acceptedTerms && (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>

                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text
                      style={styles.termsLink}
                      onPress={() =>
                        showMessage(
                          'Terms of Service',
                          'Connect your Terms of Service page here.'
                        )
                      }
                    >
                      Terms of Service
                    </Text>
                    {' '}and{' '}
                    <Text
                      style={styles.termsLink}
                      onPress={() =>
                        showMessage(
                          'Privacy Policy',
                          'Connect your Privacy Policy page here.'
                        )
                      }
                    >
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </View>

                {/* VALIDATION MESSAGE */}
                {message !== '' && (
                  <View style={styles.messageBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={17}
                      color="#DC2626"
                    />
                    <Text style={styles.messageText}>{message}</Text>
                  </View>
                )}

                {/* REGISTER BUTTON */}
                <Pressable
                  onPress={handleRegister}
                  style={({ pressed }) => [
                    styles.registerButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.registerButtonText}>
                    CREATE COMMUTER ACCOUNT
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              {/* DIVIDER */}
              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>
                  OR CONTINUE WITH
                </Text>
                <View style={styles.divider} />
              </View>

              {/* GOOGLE BUTTON */}
              <Pressable
                onPress={handleGoogleRegister}
                style={({ pressed }) => [
                  styles.googleButton,
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  source={require('../../assets/images/google-logo.png')}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />

                <Text style={styles.googleText}>Google</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.driverNotice}>
              <View style={styles.driverNoticeIcon}>
                <Ionicons
                  name="car-outline"
                  size={30}
                  color="#0875E8"
                />
              </View>

              <Text style={styles.driverNoticeTitle}>
                Driver Registration
              </Text>

              <Text style={styles.driverNoticeDescription}>
                You've selected a Driver account. The Driver registration
                form will be added separately.
              </Text>

              <View style={styles.driverNoticeInfo}>
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color="#0875E8"
                />
                <Text style={styles.driverNoticeInfoText}>
                  Driver registration will include additional driver and
                  vehicle information.
                </Text>
              </View>

              <Pressable
                onPress={() => handleAccountTypeChange('commuter')}
                style={styles.backToCommuterButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color="#0875E8"
                />
                <Text style={styles.backToCommuterText}>
                  Back to Commuter
                </Text>
              </Pressable>
            </View>
          )}

          {/* SIGN IN */}
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.replace('/')}
              style={styles.signInLink}
            >
              <Text style={styles.signInLinkText}>Sign In</Text>
              <Ionicons
                name="chevron-forward"
                size={15}
                color="#0875E8"
              />
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            TRANSITTRACK • SAYRE CORRIDOR
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webBackground}>
        <View style={styles.phoneFrame}>{appContent}</View>
      </View>
    );
  }

  return appContent;
}

const styles = StyleSheet.create({
  webBackground: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: '#E7EBF0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },

  phoneFrame: {
    width: 390,
    height: 844,
    maxWidth: '100%',
    maxHeight: '100%',
    flexShrink: 1,
    overflow: 'hidden',
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#151B29',
    backgroundColor: '#F8F7FC',
  },

  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7FC',
  },

  keyboardView: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 28,
  },

  header: {
    minHeight: 55,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF1',
  },

  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    color: '#182437',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  headerSpacer: {
    width: 25,
  },

  brandSection: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 17,
  },

  logo: {
    width: 48,
    height: 48,
    marginBottom: 5,
  },

  brandName: {
    color: '#182437',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: 0,
  },

  brandSubtitle: {
    color: '#0875E8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },

  title: {
    color: '#182437',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
  },

  description: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 5,
  },

  accountTypeContainer: {
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5EA',
    borderRadius: 9,
  },

  accountTypeHeading: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
  },

  accountTypeOptions: {
    flexDirection: 'row',
    gap: 9,
  },

  accountTypeOption: {
    flex: 1,
    minHeight: 65,
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5EA',
    backgroundColor: '#F8F9FC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  accountTypeOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0875E8',
  },

  accountTypeIcon: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  accountTypeOptionText: {
    flex: 1,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },

  accountTypeOptionTextActive: {
    color: '#0875E8',
  },

  accountTypeCheck: {
    marginLeft: 'auto',
  },

  selectedAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  accountTypeInfo: {
    flex: 1,
    marginLeft: 10,
  },

  accountTypeLabel: {
    fontSize: 10,
    color: '#8290A4',
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  accountTypeName: {
    color: '#182437',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },

  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  selectedText: {
    color: '#0875E8',
    fontSize: 10,
    fontWeight: '800',
  },

  formDivider: {
    height: 1,
    backgroundColor: '#E5EAF1',
    marginVertical: 12,
  },

  formCard: {
    marginHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5EA',
    borderRadius: 10,
    padding: 13,
    gap: 12,
  },

  formHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#182437',
    marginBottom: 1,
  },

  fieldContainer: {
    gap: 6,
  },

  label: {
    color: '#454C59',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fieldHint: {
    color: '#0875E8',
    fontSize: 10,
    fontWeight: '700',
  },

  inputRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#F0F3FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E8ECF7',
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: 43,
    paddingVertical: 7,
    fontSize: 15,
    color: '#303743',
  },

  eyeButton: {
    padding: 5,
  },

  mobileContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  countryCode: {
    minHeight: 43,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F0F3FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  flag: {
    fontSize: 15,
  },

  countryCodeText: {
    fontSize: 15,
    color: '#243247',
    fontWeight: '700',
  },

  mobileInput: {
    flex: 1,
    minWidth: 0,
    height: 43,
    paddingHorizontal: 11,
    backgroundColor: '#F0F3FF',
    borderRadius: 6,
    fontSize: 15,
    color: '#303743',
    borderWidth: 1,
    borderColor: '#E8ECF7',
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 2,
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#9AA5B5',
    backgroundColor: '#F0F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  checkboxActive: {
    backgroundColor: '#0875E8',
    borderColor: '#0875E8',
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },

  termsLink: {
    color: '#0875E8',
    fontWeight: '700',
  },

  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    padding: 9,
  },

  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#B91C1C',
  },

  registerButton: {
    minHeight: 45,
    backgroundColor: '#0875E8',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    marginTop: 2,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  pressed: {
    opacity: 0.7,
  },

  driverNotice: {
    marginHorizontal: 14,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5EA',
    borderRadius: 10,
    alignItems: 'center',
  },

  driverNoticeIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  driverNoticeTitle: {
    color: '#182437',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },

  driverNoticeDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },

  driverNoticeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 7,
    padding: 11,
    marginTop: 17,
  },

  driverNoticeInfoText: {
    flex: 1,
    color: '#475569',
    fontSize: 10,
    lineHeight: 16,
  },

  backToCommuterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0875E8',
  },

  backToCommuterText: {
    color: '#0875E8',
    fontSize: 11,
    fontWeight: '800',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 19,
    marginBottom: 15,
    gap: 10,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E5EA',
  },

  dividerText: {
    color: '#9AA5B5',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  googleButton: {
    alignSelf: 'stretch',
    minHeight: 56,
    marginHorizontal: 14,
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

  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 18,
  },

  signInText: {
    color: '#64748B',
    fontSize: 14,
  },

  signInLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  signInLinkText: {
    color: '#0875E8',
    fontSize: 14,
    fontWeight: '800',
  },

  footerText: {
    textAlign: 'center',
    color: '#9AA5B5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 18,
  },
});
