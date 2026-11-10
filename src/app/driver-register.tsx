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

const cooperatives = [
  {
    value: 'libtransco',
    label: 'Libtransco',
  },
  {
    value: 'mafortransco',
    label: 'Mafortransco',
  },
  {
    value: 'macatransco',
    label: 'Macatransco',
  },
  {
    value: 'suv',
    label: 'SUV',
  },
];

const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    (globalThis as any).alert?.(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function DriverRegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [cooperative, setCooperative] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState('');

  const selectedCooperative = cooperatives.find(
    (item) => item.value === cooperative
  );

  const clearMessage = () => {
    if (message) setMessage('');
  };

  const handleRegister = () => {
    setMessage('');
    setDropdownOpen(false);

    if (
      !fullName.trim() ||
      !mobile.trim() ||
      !cooperative ||
      !licenseId.trim() ||
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

    if (password.length < 6) {
      setMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Your passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      setMessage(
        'Please agree to the Driver Terms of Service and Dispatch Route Code of Conduct.'
      );
      return;
    }

    Keyboard.dismiss();

    showMessage(
      'Driver Registration Form Validated',
      'Your information is ready. Connect Firebase or Supabase to securely create your driver account and handle any required credential verification.'
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

            <Text style={styles.title}>REGISTER AS DRIVER</Text>

            <Text style={styles.description}>
              Create your driver account and manage your transport information.
            </Text>
          </View>

          {/* ACCOUNT TYPE SELECTOR */}
          <View style={styles.accountTypeContainer}>
            <Text style={styles.accountTypeHeading}>
              SELECT ACCOUNT TYPE
            </Text>

            <View style={styles.accountTypeOptions}>
              <Pressable
                onPress={() => router.replace('/register')}
                style={styles.accountTypeOption}
              >
                <View style={styles.accountTypeIcon}>
                  <Ionicons
                    name="walk-outline"
                    size={21}
                    color="#0875E8"
                  />
                </View>

                <Text style={styles.accountTypeOptionText}>
                  Commuter
                </Text>
              </Pressable>

              <View
                style={[
                  styles.accountTypeOption,
                  styles.accountTypeOptionActive,
                ]}
              >
                <View style={styles.accountTypeIcon}>
                  <Ionicons
                    name="car-outline"
                    size={21}
                    color="#0875E8"
                  />
                </View>

                <Text
                  style={[
                    styles.accountTypeOptionText,
                    styles.accountTypeOptionTextActive,
                  ]}
                >
                  Driver
                </Text>

                <Ionicons
                  name="checkmark-circle"
                  size={17}
                  color="#0875E8"
                  style={styles.accountTypeCheck}
                />
              </View>
            </View>
          </View>

          {/* DRIVER REGISTRATION FORM */}
          <View style={styles.formCard}>
            {/* SELECTED ACCOUNT */}
            <View style={styles.selectedAccountRow}>
              <View style={styles.accountTypeIcon}>
                <Ionicons
                  name="car-outline"
                  size={19}
                  color="#0875E8"
                />
              </View>

              <View style={styles.accountTypeInfo}>
                <Text style={styles.accountTypeLabel}>
                  ACCOUNT TYPE
                </Text>

                <Text style={styles.accountTypeName}>Driver</Text>
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
              Driver Information
            </Text>

            {/* FULL LEGAL NAME */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>FULL LEGAL NAME</Text>
                <Text style={styles.fieldHint}>
                  AS PER DRIVER'S LICENSE
                </Text>
              </View>

              <View style={styles.inputRow}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color="#0875E8"
                />

                <TextInput
                  style={styles.input}
                  placeholder="e.g., Junrey M. Dael"
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
                  placeholder="917 554 8920"
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

            {/* FLEET COOPERATIVE */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>FLEET COOPERATIVE</Text>

              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setDropdownOpen(!dropdownOpen);
                  clearMessage();
                }}
                style={styles.dropdownButton}
              >
                <Ionicons
                  name="business-outline"
                  size={19}
                  color="#0875E8"
                />

                <Text
                  style={[
                    styles.dropdownText,
                    !selectedCooperative && styles.dropdownPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {selectedCooperative
                    ? selectedCooperative.label
                    : 'Select transport cooperative'}
                </Text>

                <Ionicons
                  name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={19}
                  color="#64748B"
                />
              </Pressable>

              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {cooperatives.map((item) => (
                    <Pressable
                      key={item.value}
                      onPress={() => {
                        setCooperative(item.value);
                        setDropdownOpen(false);
                        clearMessage();
                      }}
                      style={[
                        styles.dropdownItem,
                        cooperative === item.value &&
                          styles.dropdownItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          cooperative === item.value &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {cooperative === item.value && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color="#0875E8"
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* LICENSE / LTFRB ID */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>LICENSE / LTFRB ID</Text>
                <Text style={styles.fieldHint}>
                  PROFESSIONAL LICENSE
                </Text>
              </View>

              <View style={styles.inputRow}>
                <Ionicons
                  name="card-outline"
                  size={19}
                  color="#0875E8"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter license or LTFRB ID"
                  placeholderTextColor="#94A3B8"
                  value={licenseId}
                  onChangeText={(value) => {
                    setLicenseId(value);
                    clearMessage();
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.formDivider} />

            <Text style={styles.formHeading}>
              Account Security
            </Text>

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

            {/* DRIVER TERMS */}
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
                      'Driver Terms of Service',
                      'Connect your Driver Terms of Service page here.'
                    )
                  }
                >
                  Driver Terms of Service
                </Text>
                {' '}and Dispatch Route Code of Conduct.
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

            {/* CREATE DRIVER ACCOUNT */}
            <Pressable
              onPress={handleRegister}
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="car-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.registerButtonText}>
                CREATE DRIVER ACCOUNT
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
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
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

          {/* SIGN IN */}
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>
              Already have an active driver account?
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
            TRANSITTRACK
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
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
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
    color: '#111827',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    textAlign: 'center',
  },

  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },

  description: {
    color: '#737985',
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
    fontWeight: '700',
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
    fontSize: 11,
    color: '#8290A4',
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  accountTypeName: {
    color: '#182437',
    fontSize: 15,
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#182437',
    marginBottom: 1,
  },

  fieldContainer: {
    gap: 6,
  },

  label: {
    color: '#454C59',
    fontSize: 15,
    lineHeight: 20,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
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
    color: '#303743',
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

  dropdownButton: {
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

  dropdownText: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: '#303743',
  },

  dropdownPlaceholder: {
    color: '#94A3B8',
  },

  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5F0',
    borderRadius: 7,
    overflow: 'hidden',
  },

  dropdownItem: {
    minHeight: 43,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
    gap: 8,
  },

  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },

  dropdownItemText: {
    flex: 1,
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },

  dropdownItemTextActive: {
    color: '#0875E8',
    fontWeight: '700',
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
    color: '#737985',
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
    gap: 7,
    marginTop: 2,
    paddingHorizontal: 8,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 1,
  },

  pressed: {
    opacity: 0.7,
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
    color: '#9AA0AA',
    fontSize: 10,
    fontWeight: '500',
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
    paddingHorizontal: 14,
  },

  signInText: {
    color: '#737985',
    fontSize: 14,
  },

  signInLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  signInLinkText: {
    color: '#2864E8',
    fontSize: 14,
    fontWeight: '700',
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