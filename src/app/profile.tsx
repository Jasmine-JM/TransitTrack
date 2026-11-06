import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const params = useLocalSearchParams<{
    name?: string | string[];
    email?: string | string[];
    phone?: string | string[];
  }>();

  // Get profile information safely from route parameters.
  const name = Array.isArray(params.name)
    ? params.name[0]
    : params.name || 'Jasmine';

  const email = Array.isArray(params.email)
    ? params.email[0]
    : params.email || 'jasmine@gmail.com';

  const phone = Array.isArray(params.phone)
    ? params.phone[0]
    : params.phone || '+63 917 842 5912';

  const [message, setMessage] = React.useState('');

  // Navigate back to Home.
  const goHome = () => {
    router.replace('/home');
  };

  // Navigate to another main tab.
  const go = (path: string) => router.navigate(path as any);

  // Navigate to Edit Profile and pass the current information.
  const openEditProfile = () => {
    router.push({
      pathname: '/edit-profile',
      params: {
        name,
        email,
        phone,
      },
    });
  };

  // Log out and return to the Login screen.
  const handleLogout = () => {
    router.replace('/');
  };

  // Temporary message for screens that are not connected yet.
  const comingSoon = (screen: string) => {
    setMessage(`The ${screen} screen is not connected yet.`);
  };

  const appContent = (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={goHome}
            style={styles.headerBrand}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
          >
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
              accessibilityLabel="Search"
            >
              <Ionicons
                name="search-outline"
                size={21}
                color="#64748B"
              />
            </Pressable>

            <Pressable
              onPress={() => setMessage(`Signed in as ${name}`)}
              style={styles.smallAvatar}
              accessibilityRole="button"
              accessibilityLabel="Account information"
            >
              <Ionicons
                name="person"
                size={19}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>

        {/* PROFILE CONTENT */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {message !== '' && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                {message}
              </Text>

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

          {/* PROFILE CARD */}
          <View style={styles.profileCard}>
            <View style={styles.photoContainer}>
              <View style={styles.profilePhoto}>
                <Ionicons
                  name="person"
                  size={66}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <Text style={styles.name}>
              {name}
            </Text>

            <Text style={styles.role}>
              Daily Commuter
            </Text>

            <View style={styles.separator} />

            {/* EMAIL */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="at-outline"
                  size={20}
                  color="#3185F5"
                />
              </View>

              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                  EMAIL ADDRESS
                </Text>

                <Text style={styles.infoValue}>
                  {email}
                </Text>
              </View>
            </View>

            {/* MOBILE CONTACT */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color="#3185F5"
                />
              </View>

              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                  MOBILE CONTACT
                </Text>

                <Text style={styles.infoValue}>
                  {phone}
                </Text>
              </View>
            </View>

            {/* EDIT PROFILE */}
            <Pressable
              onPress={openEditProfile}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
            >
              <Ionicons
                name="create-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text style={styles.editButtonText}>
                EDIT PROFILE
              </Text>
            </Pressable>

            {/* LOG OUT */}
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Log out of TransitTrack"
            >
              <Ionicons
                name="log-out-outline"
                size={16}
                color="#B94141"
              />

              <Text style={styles.logoutButtonText}>
                LOG OUT OF TRANSITTRACK
              </Text>
            </Pressable>
          </View>

          {/* APP INFORMATION */}
          <View style={styles.appInfo}>
            <View style={styles.versionRow}>
              <MaterialCommunityIcons
                name="bus"
                size={14}
                color="#64748B"
              />

              <Text style={styles.versionText}>
                TransitTrack v2.4.1
              </Text>
            </View>

            <Text style={styles.footerText}>
              Engineered for punctual everyday travel
            </Text>
          </View>
        </ScrollView>

        {/* BOTTOM NAVIGATION */}
        <View style={styles.bottomNav}>
          <Pressable
            style={styles.navItem}
            onPress={goHome}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color="#8290A4"
            />

            <Text style={styles.navLabel}>
              Home
            </Text>
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

            <Text style={styles.navLabel}>
              Map
            </Text>
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

            <Text style={styles.navLabel}>
              Alerts
            </Text>
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

            <Text style={styles.navLabel}>
              Saved
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );

  // WEB PHONE MOCKUP
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

  /* WEB PHONE MOCKUP */
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
    backgroundColor: '#F5F8FC',
  },

  page: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    backgroundColor: '#F5F8FC',
    overflow: 'hidden',
  },

  /* HEADER */
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
    paddingVertical: 9,
    marginBottom: 10,
  },

  messageText: {
    flex: 1,
    color: '#334155',
    fontSize: 12,
  },

  /* PROFILE CARD */
  profileCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EDF4',
  },

  photoContainer: {
    alignItems: 'center',
    marginBottom: 9,
  },

  profilePhoto: {
    width: 82,
    height: 82,
    borderRadius: 9,
    backgroundColor: '#1D3553',
    borderWidth: 2,
    borderColor: '#E3EAF4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172033',
    textAlign: 'center',
  },

  role: {
    fontSize: 12,
    color: '#8492A6',
    textAlign: 'center',
    marginTop: 3,
  },

  separator: {
    height: 1,
    backgroundColor: '#EDF1F6',
    marginTop: 15,
    marginBottom: 12,
  },

  /* CONTACT INFORMATION */
  infoRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F6FF',
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginBottom: 8,
  },

  infoIcon: {
    width: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8794A7',
    letterSpacing: 0.5,
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },

  /* BUTTONS */
  editButton: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0758CE',
    borderRadius: 4,
    marginTop: 5,
    gap: 7,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  logoutButton: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBE0DE',
    borderRadius: 4,
    marginTop: 8,
    gap: 7,
  },

  logoutButtonText: {
    color: '#B94141',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  pressed: {
    opacity: 0.7,
  },

  /* FOOTER */
  appInfo: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },

  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  versionText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },

  footerText: {
    fontSize: 10,
    color: '#8492A6',
    textAlign: 'center',
    marginTop: 5,
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

  activeNavLabel: {
    color: '#0875E8',
    fontWeight: '700',
  },
});