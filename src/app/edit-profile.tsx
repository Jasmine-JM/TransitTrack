
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditProfileScreen() {
  const params = useLocalSearchParams<{
    name?: string;
    email?: string;
    phone?: string;
  }>();

  const [name, setName] = React.useState(params.name || 'Jasmine');
  const [email, setEmail] = React.useState(
    params.email || 'jasmine@gmail.com'
  );
  const [phone, setPhone] = React.useState(
    params.phone || '+63 917 842 5912'
  );
  const [message, setMessage] = React.useState('');

  const goHome = () => router.replace('/home');
  const go = (path: string) => router.navigate(path as any);

  const saveChanges = () => {
    if (!name.trim()) {
      setMessage('Please enter your full name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Please enter a valid email address.');
      return;
    }

    if (!phone.trim()) {
      setMessage('Please enter your mobile number.');
      return;
    }

    Keyboard.dismiss();

    router.replace({
      pathname: '/profile',
      params: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      },
    });
  };

  const uploadPhoto = () => {
    setMessage('Photo selection is not connected yet.');
  };

  const removePhoto = () => {
    setMessage('Your default profile icon is currently being used.');
  };

  const comingSoon = (screen: string) => {
    setMessage(`The ${screen} screen is not connected yet.`);
  };

  const appContent = (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={goHome} style={styles.headerBrand}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <View>
              <Text style={styles.brandName}>TransitTrack</Text>
              <Text style={styles.headerSubtitle}>PROFILE</Text>
            </View>
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => comingSoon('Search')}
              style={styles.headerIcon}
              accessibilityRole="button"
            >
              <Ionicons
                name="search-outline"
                size={21}
                color="#64748B"
              />
            </Pressable>

            <Pressable
              style={styles.smallAvatar}
              onPress={() => setMessage(`Signed in as ${name}`)}
              accessibilityRole="button"
            >
              <Ionicons name="person" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* EDIT PROFILE CONTENT */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* INLINE MESSAGE */}
          {message !== '' && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>

              <Pressable
                onPress={() => setMessage('')}
                accessibilityRole="button"
                accessibilityLabel="Dismiss message"
              >
                <Ionicons
                  name="close"
                  size={16}
                  color="#334155"
                />
              </Pressable>
            </View>
          )}

          {/* TITLE */}
          <View style={styles.titleRow}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color="#0875E8"
              />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <Text style={styles.screenTitle}>EDIT PROFILE</Text>
            <View style={styles.titleSpacer} />
          </View>

          {/* PROFILE PHOTO */}
          <View style={styles.photoSection}>
            <View style={styles.photoWrapper}>
              <View style={styles.profilePhoto}>
                <Ionicons
                  name="person"
                  size={65}
                  color="#FFFFFF"
                />
              </View>

              <Pressable
                style={styles.cameraButton}
                onPress={uploadPhoto}
                accessibilityRole="button"
                accessibilityLabel="Upload profile photo"
              >
                <Ionicons
                  name="camera"
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <View style={styles.photoActions}>
              <Pressable
                onPress={uploadPhoto}
                style={styles.photoAction}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={13}
                  color="#0875E8"
                />
                <Text style={styles.uploadText}>Upload new</Text>
              </Pressable>

              <Text style={styles.photoDot}>·</Text>

              <Pressable
                onPress={removePhoto}
                style={styles.photoAction}
              >
                <Ionicons
                  name="trash-outline"
                  size={13}
                  color="#DC2626"
                />
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          </View>

          {/* FULL NAME */}
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>

            <View style={styles.inputRow}>
              <Ionicons
                name="person"
                size={17}
                color="#0875E8"
              />

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                returnKeyType="next"
              />

              <Pressable
                onPress={() => setName('')}
                accessibilityRole="button"
                accessibilityLabel="Clear name"
              >
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color="#64748B"
                />
              </Pressable>
            </View>
          </View>

          {/* EMAIL ADDRESS */}
          <View style={styles.fieldCard}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>

              <View style={styles.verified}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={12}
                  color="#059669"
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <View style={styles.inputRow}>
              <Ionicons
                name="at-outline"
                size={18}
                color="#0875E8"
              />

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* MOBILE CONTACT */}
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>MOBILE CONTACT</Text>

            <View style={styles.inputRow}>
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color="#0875E8"
              />

              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Your mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </View>

          {/* SAVE CHANGES */}
          <Pressable
            onPress={saveChanges}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={17}
              color="#FFFFFF"
            />
            <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
          </Pressable>

          {/* CANCEL */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </Pressable>
        </ScrollView>

        {/* BOTTOM NAVIGATION */}
        <View style={styles.bottomNav}>
          <Pressable style={styles.navItem} onPress={goHome}>
            <Ionicons
              name="home-outline"
              size={20}
              color="#8290A4"
            />
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => go('/map')}
          >
            <Ionicons
              name="map-outline"
              size={20}
              color="#8290A4"
            />
            <Text style={styles.navLabel}>Map</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => go('/alerts')}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color="#8290A4"
            />
            <Text style={styles.navLabel}>Alerts</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => go('/saved')}
          >
            <Ionicons
              name="bookmark-outline"
              size={20}
              color="#8290A4"
            />
            <Text style={styles.navLabel}>Saved</Text>
          </Pressable>
        </View>
      </View>
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
  /* WEB PHONE MOCKUP — MATCH HOME SCREEN */
  webBackground: {
    flex: 1,
    width: '100%',
    height: '100vh' as any,
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
    backgroundColor: '#F5F8FC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },

  /* MAIN LAYOUT */
  safeArea: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F8F7FC',
  },

  page: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    backgroundColor: '#F8F7FC',
    overflow: 'hidden',
  },

  /* HEADER — MATCH HOME SCREEN */
  header: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF1',
  },

  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#D7E8FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoImage: {
    width: 31,
    height: 31,
  },

  brandName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#182437',
  },

  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0875E8',
    marginTop: 2,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerIcon: {
    padding: 5,
  },

  smallAvatar: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SCROLL AREA */
  scroll: {
    flex: 1,
    minHeight: 0,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
  },

  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#E8F2FF',
    borderWidth: 1,
    borderColor: '#C7DFFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },

  messageText: {
    flex: 1,
    color: '#334155',
    fontSize: 11,
  },

  /* TITLE */
  titleRow: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 65,
    paddingVertical: 5,
  },

  backText: {
    color: '#0875E8',
    fontSize: 12,
  },

  screenTitle: {
    color: '#182437',
    fontSize: 13,
    fontWeight: '800',
  },

  titleSpacer: {
    width: 65,
  },

  /* PROFILE PHOTO */
  photoSection: {
    alignItems: 'center',
    marginBottom: 14,
  },

  photoWrapper: {
    position: 'relative',
  },

  profilePhoto: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#1D3553',
    borderWidth: 2,
    borderColor: '#E3EAF4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraButton: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: '#0875E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },

  photoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    padding: 3,
  },

  uploadText: {
    fontSize: 10,
    color: '#0875E8',
  },

  removeText: {
    fontSize: 10,
    color: '#DC2626',
  },

  photoDot: {
    color: '#94A3B8',
  },

  /* FORM FIELDS */
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 9,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fieldLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },

  verifiedText: {
    color: '#059669',
    fontSize: 9,
  },

  inputRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F3FF',
    borderRadius: 4,
    paddingHorizontal: 8,
  },

  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 7,
    fontSize: 11,
    color: '#243247',
    outlineStyle: 'none',
  } as any,

  /* SAVE AND CANCEL */
  saveButton: {
    minHeight: 38,
    backgroundColor: '#0758CE',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  cancelButton: {
    minHeight: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },

  cancelButtonText: {
    color: '#182437',
    fontSize: 11,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },

  /* BOTTOM NAVIGATION */
  bottomNav: {
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5EAF1',
    paddingBottom: 3,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },

  navLabel: {
    fontSize: 9,
    color: '#8290A4',
  },
});
