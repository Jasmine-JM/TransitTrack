
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    useFonts as useJakartaFonts,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
    useFonts as useMonoFonts,
} from '@expo-google-fonts/jetbrains-mono';

type TabType = 'Home' | 'Trips' | 'Map' | 'Alerts';

const COLORS = {
  brand: '#0875E8',
  brandDark: '#0066FF',
  navy: '#172033',
  navyLight: '#1D3553',
  canvas: '#F5F8FC',
  white: '#FFFFFF',
  slate: '#64748B',
  slateLight: '#94A3B8',
  border: '#E2E8F0',
  green: '#059669',
  amber: '#D97706',
};

export default function DriverHome() {

  // RESPONSIVE SCREEN DIMENSIONS
  const { width: screenWidth, height: screenHeight } =
    useWindowDimensions();

  const frameWidth = Math.min(
    390,
    Math.max(280, screenWidth - 40)
  );

  const frameHeight = Math.min(
    844,
    Math.max(400, screenHeight - 40)
  );

  // GOOGLE FONTS
  const [jakartaLoaded] = useJakartaFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [monoLoaded] = useMonoFonts({
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  // STATES
  const [isTripActive, setIsTripActive] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [toast, setToast] = useState('');
  const [toastIcon, setToastIcon] = useState('checkmark-circle');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // LOADING SCREEN
  if (!jakartaLoaded || !monoLoaded) {

    const loadingContent = (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>
          Loading TransitTrack...
        </Text>
      </SafeAreaView>
    );

    if (Platform.OS === 'web') {
      return (
        <View style={styles.webBackground}>
          <View
            style={[
              styles.phoneFrame,
              {
                width: frameWidth,
                height: frameHeight,
              },
            ]}
          >
            {loadingContent}
          </View>
        </View>
      );
    }

    return loadingContent;
  }

  // TOAST
  const showToast = (message: string, icon = 'information') => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast(message);
    setToastIcon(icon);

    toastTimer.current = setTimeout(() => {
      setToast('');
    }, 2400);
  };

  // TRIP ACTION
  const handleTripAction = () => {
    if (!isTripActive) {
      setIsTripActive(true);

      showToast(
        'Trip started! Route tracking active.',
        'checkmark-circle'
      );
    } else {
      showToast(
        'Opening active trip navigation...',
        'navigate'
      );

      router.push('/driver-map');
    }
  };

  // BOTTOM NAVIGATION
  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);

    switch (tab) {
      case 'Home':
        router.replace('/driver-home');
        break;

      case 'Trips':
        router.push('/driver-trips');
        break;

      case 'Map':
        router.push('/driver-map');
        break;

      case 'Alerts':
        router.push('/driver-alerts');
        break;
    }
  };

  // MAIN APP CONTENT
  const appContent = (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBox}>
            <Ionicons
              name="bus"
              size={23}
              color={COLORS.brand}
            />
          </View>

          <View>
            <Text style={styles.brandTitle}>
              TransitTrack
            </Text>

            <Text style={styles.brandSubtitle}>
              DRIVER DASHBOARD
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() => setProfileVisible(true)}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={COLORS.navyLight}
          />
        </Pressable>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* WELCOME */}
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeTitle}>
              Good afternoon, Kuya Junrey!
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Here's your driving overview today.
            </Text>
          </View>

          <View style={styles.todayBadge}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={COLORS.brand}
            />

            <Text style={styles.todayText}>
              Today
            </Text>
          </View>
        </View>

        {/* DRIVER STATUS */}
        <View style={styles.statusCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeading}>
              <MaterialCommunityIcons
                name="badge-account-outline"
                size={18}
                color={COLORS.navyLight}
              />

              <Text style={styles.sectionLabel}>
                DRIVER STATUS
              </Text>
            </View>

            <View style={styles.availableBadge}>
              <View style={styles.greenDot} />

              <Text style={styles.availableText}>
                Available
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="bus"
              size={17}
              color={COLORS.slateLight}
            />

            <Text style={styles.infoLabel}>
              Vehicle:
            </Text>

            <Text style={styles.vehicleText}>
              Bus 024{' '}
              <Text style={styles.operatorText}>
                (Mafortransco)
              </Text>
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker-path"
              size={17}
              color={COLORS.slateLight}
            />

            <Text style={styles.infoLabel}>
              Route:
            </Text>

            <Text style={styles.routeText}>
              Camp Phillips – Cagayan de Oro
            </Text>
          </View>
        </View>

        {/* UPCOMING TRIP */}
        <View style={styles.tripCard}>
          <View style={styles.tripAccent} />

          <View style={styles.tripHeader}>
            <View style={styles.upcomingBadge}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={COLORS.brand}
              />

              <Text style={styles.upcomingText}>
                UPCOMING TRIP
              </Text>
            </View>

            <View style={styles.timeBadge}>
              <Ionicons
                name="time-outline"
                size={14}
                color={COLORS.brand}
              />

              <Text style={styles.timeText}>
                08:30 AM
              </Text>
            </View>
          </View>

          {/* ROUTE */}
          <View style={styles.routeContainer}>
            <View style={styles.routeIndicators}>
              <View style={styles.originDot} />
              <View style={styles.routeLine} />
              <View style={styles.destinationDot} />
            </View>

            <View style={styles.routeDetails}>
              <View>
                <Text style={styles.routeCaption}>
                  From (Origin)
                </Text>

                <Text style={styles.locationName}>
                  Camp Phillips Terminal
                </Text>
              </View>

              <View>
                <Text style={styles.routeCaption}>
                  To (Destination)
                </Text>

                <Text style={styles.locationName}>
                  Cagayan de Oro (Agora Terminal)
                </Text>
              </View>
            </View>
          </View>

          {/* CORRIDOR */}
          <View style={styles.corridorBox}>
            <Text style={styles.corridorLabel}>
              Corridor Route:
            </Text>

            <Text style={styles.corridorValue}>
              Via Sayre Highway Express
            </Text>
          </View>

          {/* TRIP ACTION */}
          <Pressable
            style={[
              styles.tripButton,
              isTripActive && styles.tripButtonActive,
            ]}
            onPress={handleTripAction}
          >
            <Ionicons
              name={isTripActive ? 'navigate' : 'play-circle'}
              size={21}
              color={COLORS.white}
            />

            <Text style={styles.tripButtonText}>
              {isTripActive
                ? 'VIEW ACTIVE TRIP'
                : 'START TRIP'}
            </Text>
          </Pressable>

          {isTripActive && (
            <View style={styles.activeRibbon}>
              <View style={styles.activeDot} />

              <Text style={styles.activeRibbonText}>
                TRIP IN PROGRESS • VIEW ACTIVE NAVIGATION
              </Text>
            </View>
          )}
        </View>

        {/* TODAY'S SUMMARY */}
        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>
              TODAY'S SUMMARY
            </Text>

            <Text style={styles.shiftText}>
              Shift: 06:00 - 18:00
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCard
              icon="calendar-month-outline"
              iconColor={COLORS.brand}
              iconBackground="#EFF6FF"
              number="4"
              label="Assigned"
            />

            <SummaryCard
              icon="check-circle-outline"
              iconColor={COLORS.green}
              iconBackground="#ECFDF5"
              number="1"
              label="Completed"
            />

            <SummaryCard
              icon="clock-outline"
              iconColor={COLORS.amber}
              iconBackground="#FFFBEB"
              number="3"
              label="Upcoming"
            />
          </View>
        </View>

        {/* IMPORTANT UPDATES */}
        <View style={styles.updatesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>
              IMPORTANT UPDATES
            </Text>

            <Pressable
              onPress={() =>
                showToast('Loading full bulletin board...')
              }
            >
              <Text style={styles.viewAllText}>
                View All Updates
              </Text>
            </Pressable>
          </View>

          {/* NOTICE 1 */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeIconAmber}>
              <MaterialCommunityIcons
                name="traffic-light"
                size={19}
                color={COLORS.amber}
              />
            </View>

            <View style={styles.noticeContent}>
              <View style={styles.noticeTitleRow}>
                <Text style={styles.noticeTitle}>
                  Sayre Highway Roadworks
                </Text>

                <Text style={styles.noticeTime}>
                  15m ago
                </Text>
              </View>

              <Text style={styles.noticeDescription}>
                Lane advisory near Alae Junction — slow down to
                30 km/h due to reblocking.
              </Text>
            </View>
          </View>

          {/* NOTICE 2 */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeIconBlue}>
              <MaterialCommunityIcons
                name="directions-fork"
                size={19}
                color={COLORS.brand}
              />
            </View>

            <View style={styles.noticeContent}>
              <View style={styles.noticeTitleRow}>
                <Text style={styles.noticeTitle}>
                  Terminal Bay Update
                </Text>

                <Text style={styles.noticeTime}>
                  1h ago
                </Text>
              </View>

              <Text style={styles.noticeDescription}>
                Agora Terminal Platform 3 assigned for all
                arriving Bukidnon express units.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 15 }} />

      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNavigation}>
        <BottomTab
          icon="home-outline"
          label="Home"
          active={activeTab === 'Home'}
          onPress={() => handleTabPress('Home')}
        />

        <BottomTab
          icon="git-branch-outline"
          label="Trips"
          active={activeTab === 'Trips'}
          onPress={() => handleTabPress('Trips')}
        />

        <BottomTab
          icon="map-outline"
          label="Map"
          active={activeTab === 'Map'}
          onPress={() => handleTabPress('Map')}
        />

        <BottomTab
          icon="notifications-outline"
          label="Alerts"
          active={activeTab === 'Alerts'}
          onPress={() => handleTabPress('Alerts')}
          hasNotification
        />
      </View>

      {/* DRIVER PROFILE MODAL */}
      <Modal
        visible={profileVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProfileVisible(false)}
        >
          <Pressable
            style={styles.profileModal}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalProfileInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    KJ
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalName}>
                    Kuya Junrey Dela Cruz
                  </Text>

                  <Text style={styles.modalSubtext}>
                    ID: DRV-88214 • Mafortransco
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setProfileVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={19}
                  color={COLORS.slate}
                />
              </Pressable>
            </View>

            <View style={styles.profileDetails}>
              <ProfileRow
                label="Driver License:"
                value="PRO-N02-09-91823"
                mono
              />

              <ProfileRow
                label="Shift Status:"
                value="Active Duty"
                valueColor={COLORS.green}
              />

              <ProfileRow
                label="Operator Hotline:"
                value="(088) 856-4221"
                valueColor={COLORS.brand}
              />
            </View>

            <Pressable
              style={styles.closeWindowButton}
              onPress={() => setProfileVisible(false)}
            >
              <Text style={styles.closeWindowText}>
                Close Window
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* TOAST */}
      {toast !== '' && (
        <View style={styles.toast}>
          <Ionicons
            name={toastIcon as any}
            size={17}
            color="#34D399"
          />

          <Text style={styles.toastText}>
            {toast}
          </Text>
        </View>
      )}

    </SafeAreaView>
  );

  // WEB PHONE FRAME
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webBackground}>
        <View
          style={[
            styles.phoneFrame,
            {
              width: frameWidth,
              height: frameHeight,
            },
          ]}
        >
          {appContent}
        </View>
      </View>
    );
  }

  // REAL MOBILE DEVICE
  return appContent;
}

// ==================================================
// SUMMARY CARD
// ==================================================

function SummaryCard({
  icon,
  iconColor,
  iconBackground,
  number,
  label,
}: {
  icon: any;
  iconColor: string;
  iconBackground: string;
  number: string;
  label: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={iconColor}
        />
      </View>

      <Text style={styles.summaryNumber}>
        {number}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

// ==================================================
// BOTTOM TAB
// ==================================================

function BottomTab({
  icon,
  label,
  active,
  onPress,
  hasNotification,
}: {
  icon: any;
  label: string;
  active: boolean;
  onPress: () => void;
  hasNotification?: boolean;
}) {
  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
    >
      <View>
        <Ionicons
          name={icon}
          size={24}
          color={active ? COLORS.brandDark : '#94A3B8'}
        />

        {hasNotification && (
          <View style={styles.notificationDot} />
        )}
      </View>

      <Text
        style={[
          styles.tabLabel,
          active && styles.activeTabLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ==================================================
// PROFILE ROW
// ==================================================

function ProfileRow({
  label,
  value,
  mono,
  valueColor,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.profileValue,
          mono && styles.monoText,
          valueColor ? { color: valueColor } : {},
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  // WEB PHONE FRAME
  webBackground: {
    flex: 1,
    minHeight: '100vh' as any,
    width: '100%',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  phoneFrame: {
    overflow: 'hidden',
    borderRadius: 42,
    borderWidth: 8,
    borderColor: '#111827',
    backgroundColor: COLORS.canvas,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
    flexShrink: 1,
  },

  // MAIN APP
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas,
    minHeight: 0,
  },

  loading: {
    flex: 1,
    backgroundColor: COLORS.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: COLORS.navy,
  },

  // HEADER
  header: {
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2,
    zIndex: 10,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  brandTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 16,
    color: COLORS.navy,
    letterSpacing: -0.4,
  },

  brandSubtitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 9,
    color: COLORS.brand,
    letterSpacing: 1,
    marginTop: 1,
  },

  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SCROLL
  scrollView: {
    flex: 1,
    minHeight: 0,
  },

  scrollContent: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 15,
    gap: 14,
  },

  // WELCOME
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },

  welcomeTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 17,
    color: COLORS.navy,
    lineHeight: 25,
  },

  welcomeSubtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.slate,
    marginTop: 1,
  },

  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  todayText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.slate,
  },

  // DRIVER STATUS
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    elevation: 1,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  sectionLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 10,
    color: COLORS.slate,
    letterSpacing: 1,
  },

  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },

  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },

  availableText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: '#047857',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },

  infoLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.slate,
  },

  vehicleText: {
    flexShrink: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 13,
    color: COLORS.navy,
  },

  operatorText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 10,
    color: COLORS.slate,
  },

  routeText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: COLORS.navy,
  },

  // UPCOMING TRIP
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(8,117,232,0.18)',
    padding: 15,
    overflow: 'hidden',
    elevation: 3,
  },

  tripAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.brand,
  },

  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 2,
  },

  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  upcomingText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 9,
    color: '#0052CC',
    letterSpacing: 0.5,
  },

  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  timeText: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    color: '#334155',
  },

  routeContainer: {
    flexDirection: 'row',
    gap: 11,
    marginBottom: 15,
  },

  routeIndicators: {
    alignItems: 'center',
    paddingTop: 3,
  },

  originDot: {
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: COLORS.brand,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },

  routeLine: {
    width: 2,
    height: 27,
    backgroundColor: COLORS.border,
    marginVertical: 3,
  },

  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: COLORS.navyLight,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },

  routeDetails: {
    flex: 1,
    gap: 12,
  },

  routeCaption: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: COLORS.slate,
    marginBottom: 2,
  },

  locationName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 13,
    color: COLORS.navy,
    lineHeight: 19,
  },

  corridorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
    gap: 5,
  },

  corridorLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: COLORS.slate,
  },

  corridorValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.navyLight,
    flexShrink: 1,
    textAlign: 'right',
  },

  tripButton: {
    minHeight: 46,
    backgroundColor: COLORS.brandDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  tripButtonActive: {
    backgroundColor: '#059669',
  },

  tripButtonText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 0.6,
  },

  activeRibbon: {
    marginTop: 9,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },

  activeRibbonText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 9,
    color: '#047857',
    textAlign: 'center',
  },

  // TODAY'S SUMMARY
  summarySection: {
    gap: 9,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },

  shiftText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: COLORS.slateLight,
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  summaryCard: {
    flex: 1,
    minHeight: 110,
    backgroundColor: COLORS.white,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 11,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },

  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  summaryNumber: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: COLORS.navy,
    lineHeight: 25,
  },

  summaryLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 3,
  },

  // IMPORTANT UPDATES
  updatesSection: {
    gap: 9,
  },

  viewAllText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: COLORS.brand,
  },

  noticeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 11,
    flexDirection: 'row',
    gap: 10,
    elevation: 1,
  },

  noticeIconAmber: {
    width: 29,
    height: 29,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  noticeIconBlue: {
    width: 29,
    height: 29,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  noticeContent: {
    flex: 1,
    minWidth: 0,
  },

  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
    marginBottom: 3,
  },

  noticeTitle: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
    color: COLORS.navy,
  },

  noticeTime: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 9,
    color: COLORS.slateLight,
  },

  noticeDescription: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    lineHeight: 16,
    color: '#475569',
  },

  // BOTTOM NAVIGATION
  bottomNavigation: {
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 3 : 0,
    elevation: 8,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: 1,
  },

  tabLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },

  activeTabLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: COLORS.brandDark,
  },

  notificationDot: {
    position: 'absolute',
    top: 0,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#F43F5E',
    borderWidth: 1,
    borderColor: COLORS.white,
  },

  // PROFILE MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23,32,51,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  profileModal: {
    width: '100%',
    maxWidth: 448,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  modalProfileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: COLORS.brand,
  },

  modalName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 12,
    color: COLORS.navy,
  },

  modalSubtext: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: COLORS.slate,
    marginTop: 3,
  },

  closeButton: {
    width: 31,
    height: 31,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileDetails: {
    paddingVertical: 12,
    gap: 11,
  },

  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },

  profileLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: COLORS.slate,
  },

  profileValue: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.navy,
    textAlign: 'right',
    flexShrink: 1,
  },

  monoText: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 9,
  },

  closeWindowButton: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },

  closeWindowText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
    color: '#334155',
  },

  // TOAST
  toast: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 70 : 65,
    alignSelf: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 8,
    zIndex: 100,
    maxWidth: '90%',
  },

  toastText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.white,
    flexShrink: 1,
  },

});
