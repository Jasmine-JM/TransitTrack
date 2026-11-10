import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
    Animated,
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

type Category =
  | 'TRIP UPDATE'
  | 'SCHEDULE REMINDER'
  | 'PASSENGER UPDATE'
  | 'SERVICE ADVISORY'
  | 'SYSTEM NOTIFICATION';

type StatusFilter = 'all' | 'unread' | 'read';
type CategoryFilter = 'ALL' | Category;

type Notice = {
  id: string;
  category: Category;
  urgent?: boolean;
  chip?: string;
  ago: string;
  title: string;
  body: string;
  time: string;
  timeIcon: string;
  actionLabel: string;
  actionIcon: string;
  route: string;
  read: boolean;
};

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
  red: '#DC2626',
};

// ==================================================
// CATEGORY STYLING
// ==================================================

const CATEGORY_META: Record<
  Category,
  {
    icon: any;
    color: string; // accent / badge background
    chipBg: string;
    chipText: string;
  }
> = {
  'TRIP UPDATE': {
    icon: 'access-point',
    color: COLORS.brandDark,
    chipBg: '#CCE5FF',
    chipText: '#001D31',
  },
  'SCHEDULE REMINDER': {
    icon: 'alarm',
    color: COLORS.red,
    chipBg: '#FFDAD6',
    chipText: '#93000A',
  },
  'PASSENGER UPDATE': {
    icon: 'account-group',
    color: COLORS.green,
    chipBg: '#D1FAE5',
    chipText: '#002114',
  },
  'SERVICE ADVISORY': {
    icon: 'traffic-cone',
    color: COLORS.amber,
    chipBg: '#FEF3C7',
    chipText: '#78350F',
  },
  'SYSTEM NOTIFICATION': {
    icon: 'cog-outline',
    color: COLORS.slate,
    chipBg: '#F1F5F9',
    chipText: '#334155',
  },
};

const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'TRIP UPDATE', label: 'Trip Updates' },
  { key: 'SCHEDULE REMINDER', label: 'Schedule Reminders' },
  { key: 'PASSENGER UPDATE', label: 'Passenger Surge' },
  { key: 'SERVICE ADVISORY', label: 'Advisories' },
  { key: 'SYSTEM NOTIFICATION', label: 'System' },
];

// ==================================================
// SEED DATA
// ==================================================

const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n1',
    category: 'TRIP UPDATE',
    chip: 'BUS 024',
    ago: '10m ago',
    title: 'Trip Libona ➔ Agora Terminal is On the Way',
    body:
      'Vehicle Bus 024 is actively broadcasting live GPS telemetry to commuters along Sayre Highway corridor.',
    time: '07:10 AM',
    timeIcon: 'time-outline',
    actionLabel: 'View Live Map',
    actionIcon: 'arrow-forward',
    route: '/driver-map',
    read: false,
  },
  {
    id: 'n2',
    category: 'SCHEDULE REMINDER',
    urgent: true,
    ago: '35m ago',
    title: 'Upcoming Departure Approaching',
    body:
      'Your scheduled run from Camp Phillips Terminal to Agora Terminal CDO is scheduled for 09:30 AM. Please ensure pre-trip inspection is completed.',
    time: '06:45 AM',
    timeIcon: 'alarm-outline',
    actionLabel: 'View Trip Details',
    actionIcon: 'arrow-forward',
    route: '/driver-trips',
    read: false,
  },
  {
    id: 'n3',
    category: 'PASSENGER UPDATE',
    chip: '+18 PAX WAITING',
    ago: '1h ago',
    title: 'High Passenger Demand at Alae Junction',
    body:
      'Commuter surge reported at Alae Junction Checkpoint heading towards CDO Agora. Estimated 18+ passengers waiting.',
    time: '06:20 AM',
    timeIcon: 'pin-outline',
    actionLabel: 'View Waypoint',
    actionIcon: 'navigate-outline',
    route: '/driver-map',
    read: false,
  },
];

// ==================================================
// MAIN SCREEN
// ==================================================

export default function DriverAlerts() {

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
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>('ALL');
  const [activeTab, setActiveTab] = useState<TabType>('Alerts');
  const [profileVisible, setProfileVisible] = useState(false);
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

  // DERIVED
  const unreadCount = notices.filter((n) => !n.read).length;
  const readCount = notices.length - unreadCount;
  const urgentCount = notices.filter((n) => n.urgent && !n.read).length;

  const visibleNotices = useMemo(
    () =>
      notices.filter((n) => {
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'unread' ? !n.read : n.read);

        const matchesCategory =
          categoryFilter === 'ALL' || n.category === categoryFilter;

        return matchesStatus && matchesCategory;
      }),
    [notices, statusFilter, categoryFilter]
  );

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
  const showToast = (message: string, icon = 'information-circle') => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast(message);
    setToastIcon(icon);

    toastTimer.current = setTimeout(() => {
      setToast('');
    }, 2400);
  };

  // ACTIONS
  const markRead = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    if (unreadCount === 0) {
      showToast('Everything is already read.', 'checkmark-done');
      return;
    }

    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.', 'checkmark-done');
  };

  const openAction = (notice: Notice) => {
    markRead(notice.id);
    router.push(notice.route as any);
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('ALL');
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
        // already on this screen
        break;
    }
  };

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: `All (${notices.length})` },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'read', label: `Read (${readCount})` },
  ];

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

        {/* TITLE */}
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeTitle}>
              Alerts
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Stay updated with your trips and regional operational
              dispatches.
            </Text>
          </View>

          <View
            style={[
              styles.newBadge,
              unreadCount === 0 && styles.newBadgeIdle,
            ]}
          >
            {unreadCount > 0 && <PulseDot color={COLORS.brandDark} />}

            <Text
              style={[
                styles.newBadgeText,
                unreadCount === 0 && { color: COLORS.slate },
              ]}
            >
              {unreadCount} New
            </Text>
          </View>
        </View>

        {/* METRICS */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLabel}>TOTAL</Text>

              <Ionicons
                name="file-tray-outline"
                size={14}
                color={COLORS.slateLight}
              />
            </View>

            <Text style={styles.summaryNumber}>
              {notices.length}
            </Text>

            <Text style={styles.summaryNote}>
              Inbox logs
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardHighlight]}>
            <View style={styles.summaryTop}>
              <Text style={[styles.summaryLabel, { color: COLORS.brand }]}>
                UNREAD
              </Text>

              {unreadCount > 0 && <PulseDot color={COLORS.brandDark} />}
            </View>

            <Text style={[styles.summaryNumber, { color: COLORS.brand }]}>
              {unreadCount}
            </Text>

            <Text style={[styles.summaryNote, { color: COLORS.brand }]}>
              Need review
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLabel}>URGENT</Text>

              <Ionicons
                name="alert-circle"
                size={14}
                color={COLORS.red}
              />
            </View>

            <Text style={[styles.summaryNumber, { color: COLORS.red }]}>
              {urgentCount}
            </Text>

            <Text style={styles.summaryNote}>
              Action req.
            </Text>
          </View>
        </View>

        {/* STATUS TABS + MARK READ */}
        <View style={styles.controlsRow}>
          <View style={styles.segment}>
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.key;

              return (
                <Pressable
                  key={tab.key}
                  style={[
                    styles.segmentButton,
                    active && styles.segmentButtonActive,
                  ]}
                  onPress={() => setStatusFilter(tab.key)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.markReadButton}
            onPress={markAllRead}
          >
            <Ionicons
              name="checkmark-done"
              size={16}
              color={COLORS.brand}
            />
          </Pressable>
        </View>

        {/* CATEGORY CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORY_FILTERS.map((item) => {
            const active = categoryFilter === item.key;

            return (
              <Pressable
                key={item.key}
                style={[
                  styles.filterPill,
                  active && styles.filterPillActive,
                ]}
                onPress={() => setCategoryFilter(item.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* NOTIFICATION FEED */}
        {visibleNotices.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-done-circle"
                size={32}
                color={COLORS.green}
              />
            </View>

            <Text style={styles.emptyTitle}>
              You're All Caught Up!
            </Text>

            <Text style={styles.emptyText}>
              You don't have any notifications here right now. Safe
              driving and enjoy your transit shift!
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={resetFilters}
            >
              <Text style={styles.emptyButtonText}>
                View All Notifications
              </Text>
            </Pressable>
          </View>
        ) : (
          visibleNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onPress={() => markRead(notice.id)}
              onAction={() => openAction(notice)}
            />
          ))
        )}

        {/* TIP BANNER */}
        <View style={styles.tipBanner}>
          <Ionicons
            name="information-circle"
            size={19}
            color={COLORS.brand}
          />

          <Text style={styles.tipText}>
            Real-time audio chime is enabled for urgent trip re-routing
            & dispatch reminders.
          </Text>
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
          hasNotification={unreadCount > 0}
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
// NOTICE CARD
// ==================================================

function NoticeCard({
  notice,
  onPress,
  onAction,
}: {
  notice: Notice;
  onPress: () => void;
  onAction: () => void;
}) {
  const meta = CATEGORY_META[notice.category];
  const unread = !notice.read;

  return (
    <Pressable
      style={[
        styles.noticeCard,
        unread && styles.noticeCardUnread,
      ]}
      onPress={onPress}
    >
      {unread && (
        <View
          style={[styles.noticeBar, { backgroundColor: meta.color }]}
        />
      )}

      {/* BADGES + TIME */}
      <View style={styles.noticeTopRow}>
        <View style={styles.badgeRow}>
          <View
            style={[styles.categoryBadge, { backgroundColor: meta.color }]}
          >
            <MaterialCommunityIcons
              name={meta.icon}
              size={11}
              color={COLORS.white}
            />

            <Text style={styles.categoryBadgeText}>
              {notice.category}
            </Text>
          </View>

          {notice.urgent && (
            <View style={styles.urgentBadge}>
              <Ionicons
                name="warning"
                size={10}
                color="#93000A"
              />

              <Text style={styles.urgentBadgeText}>
                URGENT
              </Text>
            </View>
          )}

          {notice.chip && (
            <View
              style={[styles.chipBadge, { backgroundColor: meta.chipBg }]}
            >
              <Text
                style={[styles.chipBadgeText, { color: meta.chipText }]}
              >
                {notice.chip}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.agoRow}>
          <Text style={styles.agoText}>
            {notice.ago}
          </Text>

          {unread && <View style={styles.unreadDot} />}
        </View>
      </View>

      {/* CONTENT */}
      <Text
        style={[
          styles.noticeTitle,
          !unread && { fontFamily: 'PlusJakartaSans_700Bold' },
        ]}
      >
        {notice.title}
      </Text>

      <Text style={styles.noticeDescription}>
        {notice.body}
      </Text>

      {/* FOOTER */}
      <View style={styles.noticeFooter}>
        <View style={styles.inlineRow}>
          <Ionicons
            name={notice.timeIcon as any}
            size={13}
            color={COLORS.slateLight}
          />

          <Text style={styles.noticeTime}>
            {notice.time}
          </Text>
        </View>

        <Pressable
          style={[
            styles.noticeAction,
            notice.category === 'TRIP UPDATE' && unread
              ? styles.noticeActionPrimary
              : styles.noticeActionSecondary,
          ]}
          onPress={onAction}
        >
          <Text
            style={[
              styles.noticeActionText,
              notice.category === 'TRIP UPDATE' && unread
                ? { color: COLORS.white }
                : { color: meta.color },
            ]}
          >
            {notice.actionLabel}
          </Text>

          <Ionicons
            name={notice.actionIcon as any}
            size={14}
            color={
              notice.category === 'TRIP UPDATE' && unread
                ? COLORS.white
                : meta.color
            }
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

// ==================================================
// PULSE DOT
// ==================================================

function PulseDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.pulseDot,
        { backgroundColor: color, opacity },
      ]}
    />
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

  // TITLE
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    gap: 10,
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

  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },

  newBadgeIdle: {
    backgroundColor: '#F1F5F9',
    borderColor: COLORS.border,
  },

  newBadgeText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: '#0052CC',
  },

  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },

  // SUMMARY
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    elevation: 1,
  },

  summaryCardHighlight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  summaryLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 9,
    color: COLORS.slate,
    letterSpacing: 0.8,
  },

  summaryNumber: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
    color: COLORS.navy,
    lineHeight: 25,
  },

  summaryNote: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: COLORS.slateLight,
    marginTop: 2,
  },

  // CONTROLS
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  segment: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EAEDFF',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },

  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 4,
  },

  segmentButtonActive: {
    backgroundColor: COLORS.brandDark,
  },

  segmentText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.slate,
  },

  segmentTextActive: {
    color: COLORS.white,
  },

  markReadButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CATEGORY CHIPS
  filterRow: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 8,
  },

  filterPill: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  filterPillActive: {
    backgroundColor: COLORS.brandDark,
    borderColor: COLORS.brandDark,
  },

  filterText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: COLORS.slate,
  },

  filterTextActive: {
    color: COLORS.white,
  },

  // NOTICE CARD
  noticeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    paddingLeft: 17,
    overflow: 'hidden',
    gap: 7,
    elevation: 1,
  },

  noticeCardUnread: {
    backgroundColor: '#EEF4FF',
    borderColor: '#DBEAFE',
  },

  noticeBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 5,
  },

  noticeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },

  badgeRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
  },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  categoryBadgeText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 8,
    letterSpacing: 0.6,
    color: COLORS.white,
  },

  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFDAD6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  urgentBadgeText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 8,
    color: '#93000A',
  },

  chipBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  chipBadgeText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 8,
  },

  agoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  agoText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    color: COLORS.slate,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brandDark,
  },

  noticeTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 13,
    color: COLORS.navy,
    lineHeight: 19,
  },

  noticeDescription: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    lineHeight: 16,
    color: '#475569',
  },

  noticeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },

  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  noticeTime: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    color: COLORS.slateLight,
  },

  noticeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 11,
  },

  noticeActionPrimary: {
    backgroundColor: COLORS.brandDark,
  },

  noticeActionSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  noticeActionText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 10,
  },

  // EMPTY STATE
  emptyState: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 26,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: COLORS.navy,
  },

  emptyText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.slate,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    maxWidth: 250,
  },

  emptyButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  emptyButtonText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
    color: COLORS.brand,
  },

  // TIP
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#EAEDFF',
    borderRadius: 12,
    padding: 12,
  },

  tipText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.slate,
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
