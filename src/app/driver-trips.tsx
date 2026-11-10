import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
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

type TripStatus =
  | 'draft'
  | 'published'
  | 'on-the-way'
  | 'completed'
  | 'cancelled';

type FilterType = 'all' | TripStatus;

type Trip = {
  id: string;
  origin: string;
  destination: string;
  dateISO: string; // YYYY-MM-DD
  departMinutes: number; // minutes from midnight
  arriveMinutes: number | null;
  vehicle: string;
  seatsLeft: number;
  totalSeats: number;
  fare: string;
  status: TripStatus;
  startedAt?: number;
  statusNote?: string; // e.g. "Just now"
  actualArrival?: string;
  runtimeLabel?: string;
  paxDelivered?: number;
};

type FormState = {
  origin: string;
  destination: string;
  date: string;
  time: string;
  arrival: string;
  vehicle: string;
  seats: string;
  fare: string;
};

type ConfirmState = {
  type: 'start' | 'complete' | 'cancel';
  id: string;
} | null;

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
// DATE / TIME HELPERS
// ==================================================

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const pad = (n: number) => String(n).padStart(2, '0');

const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const shiftDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const TODAY = new Date();
const TODAY_ISO = toISO(TODAY);
const YESTERDAY_ISO = toISO(shiftDays(TODAY, -1));

const isValidISODate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
};

const formatDateLabel = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const base = `${MONTHS[m - 1]} ${d}, ${y}`;

  if (iso === TODAY_ISO) return `Today • ${base}`;
  if (iso === YESTERDAY_ISO) return `Yesterday • ${base}`;
  return base;
};

// Accepts "08:30", "8:30 AM", "08:30pm" -> minutes from midnight
const parseTime = (input: string): number | null => {
  const match = input.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    if (meridiem === 'PM' && hours !== 12) hours += 12;
  } else if (hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
};

const formatMinutes = (total: number) => {
  const normalized = ((total % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${pad(hours12)}:${pad(minutes)} ${meridiem}`;
};

const formatDuration = (from: number, to: number | null) => {
  if (to === null) return 'Scheduled';

  let diff = to - from;
  if (diff < 0) diff += 1440;

  const h = Math.floor(diff / 60);
  const m = diff % 60;

  if (h === 0) return `${m} mins est.`;
  if (m === 0) return `${h}h est.`;
  return `${h}h ${m}m est.`;
};

const formatRuntime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m runtime`;
  return `${h}h ${m}m runtime`;
};

const normalizeFare = (value: string) => {
  const digits = value.replace(/[^0-9.]/g, '');
  return digits ? `₱${digits}` : '';
};

const nowMinutes = () => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};

// ==================================================
// STATUS STYLING
// ==================================================

const STATUS_META: Record<
  TripStatus,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
    accent: string;
  }
> = {
  draft: {
    label: 'DRAFT • HIDDEN',
    bg: '#F1F5F9',
    border: COLORS.border,
    text: '#334155',
    accent: '#94A3B8',
  },
  published: {
    label: 'PUBLISHED • WAITING',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#0052CC',
    accent: COLORS.brand,
  },
  'on-the-way': {
    label: 'ON THE WAY',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#047857',
    accent: COLORS.green,
  },
  completed: {
    label: 'COMPLETED • ARRIVED',
    bg: '#F1F5F9',
    border: COLORS.border,
    text: '#334155',
    accent: '#CBD5E1',
  },
  cancelled: {
    label: 'CANCELLED',
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#B91C1C',
    accent: '#EF4444',
  },
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
  { key: 'on-the-way', label: 'On the Way' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// ==================================================
// SEED DATA
// ==================================================

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    origin: 'Libona Terminal',
    destination: 'Agora Terminal',
    dateISO: TODAY_ISO,
    departMinutes: 6 * 60 + 45,
    arriveMinutes: 7 * 60 + 35,
    vehicle: 'Bus 024 Mafortransco • KAZ-8821',
    seatsLeft: 18,
    totalSeats: 45,
    fare: '₱120',
    status: 'on-the-way',
  },
  {
    id: 'trip-2',
    origin: 'Camp Phillips Terminal',
    destination: 'Agora Terminal CDO',
    dateISO: TODAY_ISO,
    departMinutes: 9 * 60 + 30,
    arriveMinutes: 11 * 60,
    vehicle: 'Bus 024 Mafortransco • KAZ-8821',
    seatsLeft: 32,
    totalSeats: 45,
    fare: '₱150',
    status: 'published',
  },
  {
    id: 'trip-3',
    origin: 'Agora Terminal CDO',
    destination: 'Camp Phillips Terminal',
    dateISO: TODAY_ISO,
    departMinutes: 14 * 60,
    arriveMinutes: 15 * 60 + 35,
    vehicle: 'Bus 024 Mafortransco • KAZ-8821',
    seatsLeft: 45,
    totalSeats: 45,
    fare: '₱150',
    status: 'published',
  },
  {
    id: 'trip-5',
    origin: 'Camp Phillips Terminal',
    destination: 'Agora Terminal CDO',
    dateISO: YESTERDAY_ISO,
    departMinutes: 8 * 60 + 30,
    arriveMinutes: 10 * 60,
    vehicle: 'Bus 024 Mafortransco • KAZ-8821',
    seatsLeft: 3,
    totalSeats: 45,
    fare: '₱150',
    status: 'completed',
    actualArrival: '09:58 AM',
    runtimeLabel: '1h 28m runtime',
    paxDelivered: 42,
  },
];

const EMPTY_FORM: FormState = {
  origin: 'Camp Phillips Terminal',
  destination: 'Agora Terminal CDO',
  date: TODAY_ISO,
  time: '08:00 AM',
  arrival: '09:30 AM',
  vehicle: 'Bus 024 Mafortransco • KAZ-8821',
  seats: '45',
  fare: '₱150',
};

// ==================================================
// MAIN SCREEN
// ==================================================

export default function DriverTrips() {

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
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [filter, setFilter] = useState<FilterType>('all');
  const [profileVisible, setProfileVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Trips');

  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const [toast, setToast] = useState('');
  const [toastIcon, setToastIcon] = useState('checkmark-circle');
  const [toastColor, setToastColor] = useState('#34D399');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // DERIVED
  const counts = useMemo(() => {
    const result: Record<FilterType, number> = {
      all: trips.length,
      draft: 0,
      published: 0,
      'on-the-way': 0,
      completed: 0,
      cancelled: 0,
    };

    trips.forEach((t) => {
      result[t.status] += 1;
    });

    return result;
  }, [trips]);

  const visibleTrips = useMemo(
    () =>
      filter === 'all'
        ? trips
        : trips.filter((t) => t.status === filter),
    [trips, filter]
  );

  const editingTrip = editingId
    ? trips.find((t) => t.id === editingId) ?? null
    : null;

  const confirmTrip = confirm
    ? trips.find((t) => t.id === confirm.id) ?? null
    : null;

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
  const showToast = (
    message: string,
    icon = 'information-circle',
    color = '#34D399'
  ) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast(message);
    setToastIcon(icon);
    setToastColor(color);

    toastTimer.current = setTimeout(() => {
      setToast('');
    }, 2400);
  };

  // TRIP HELPERS
  const updateTrip = (id: string, patch: Partial<Trip>) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  // SCHEDULE FORM
  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openAddSchedule = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setScheduleVisible(true);
  };

  const openEditSchedule = (trip: Trip) => {
    setEditingId(trip.id);
    setForm({
      origin: trip.origin,
      destination: trip.destination,
      date: trip.dateISO,
      time: formatMinutes(trip.departMinutes),
      arrival:
        trip.arriveMinutes !== null
          ? formatMinutes(trip.arriveMinutes)
          : '',
      vehicle: trip.vehicle,
      seats: String(trip.totalSeats),
      fare: trip.fare,
    });
    setScheduleVisible(true);
  };

  const closeSchedule = () => {
    setScheduleVisible(false);
    setEditingId(null);
  };

  const submitSchedule = (mode: 'draft' | 'publish' | 'save') => {
    const origin = form.origin.trim();
    const destination = form.destination.trim();
    const vehicle = form.vehicle.trim();

    if (!origin || !destination || !vehicle) {
      showToast(
        'Fill in origin, destination, and vehicle.',
        'alert-circle',
        '#FBBF24'
      );
      return;
    }

    if (!isValidISODate(form.date.trim())) {
      showToast(
        'Date must look like 2026-11-15.',
        'alert-circle',
        '#FBBF24'
      );
      return;
    }

    const departMinutes = parseTime(form.time);
    if (departMinutes === null) {
      showToast(
        'Departure time must look like 08:00 AM.',
        'alert-circle',
        '#FBBF24'
      );
      return;
    }

    let arriveMinutes: number | null = null;
    if (form.arrival.trim()) {
      arriveMinutes = parseTime(form.arrival);
      if (arriveMinutes === null) {
        showToast(
          'Arrival time must look like 09:15 AM.',
          'alert-circle',
          '#FBBF24'
        );
        return;
      }
    }

    const totalSeats = parseInt(form.seats, 10);
    if (!Number.isFinite(totalSeats) || totalSeats < 1) {
      showToast(
        'Available seats must be at least 1.',
        'alert-circle',
        '#FBBF24'
      );
      return;
    }

    const fare = normalizeFare(form.fare);
    if (!fare) {
      showToast(
        'Enter a fare per passenger, e.g. ₱120.',
        'alert-circle',
        '#FBBF24'
      );
      return;
    }

    const fields = {
      origin,
      destination,
      dateISO: form.date.trim(),
      departMinutes,
      arriveMinutes,
      vehicle,
      totalSeats,
      fare,
    };

    if (editingTrip) {
      const nextStatus: TripStatus =
        mode === 'publish' ? 'published' : editingTrip.status;

      updateTrip(editingTrip.id, {
        ...fields,
        seatsLeft: Math.min(editingTrip.seatsLeft, totalSeats),
        status: nextStatus,
      });

      closeSchedule();

      if (mode === 'publish') {
        showToast(
          'Schedule published live to commuters!',
          'paper-plane'
        );
      } else {
        showToast('Trip changes saved.', 'checkmark-circle');
      }
      return;
    }

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      ...fields,
      seatsLeft: totalSeats,
      status: mode === 'draft' ? 'draft' : 'published',
    };

    setTrips((prev) => [newTrip, ...prev]);
    setFilter('all');
    closeSchedule();

    if (mode === 'draft') {
      showToast('Trip saved as Draft.', 'bookmark');
    } else {
      showToast(
        'Schedule published live to commuters!',
        'paper-plane'
      );
    }
  };

  // TRIP ACTIONS
  const publishDraft = (trip: Trip) => {
    updateTrip(trip.id, { status: 'published' });
    showToast('Draft is now Published & Waiting!', 'cloud-upload');
  };

  const confirmAction = () => {
    if (!confirm || !confirmTrip) {
      setConfirm(null);
      return;
    }

    if (confirm.type === 'start') {
      updateTrip(confirmTrip.id, {
        status: 'on-the-way',
        startedAt: Date.now(),
      });
      showToast(
        'Trip is now ON THE WAY! Commuters notified.',
        'radio'
      );
    }

    if (confirm.type === 'complete') {
      const elapsed = confirmTrip.startedAt
        ? Math.max(
            1,
            Math.round((Date.now() - confirmTrip.startedAt) / 60000)
          )
        : null;

      updateTrip(confirmTrip.id, {
        status: 'completed',
        statusNote: 'Just now',
        actualArrival: formatMinutes(nowMinutes()),
        paxDelivered: confirmTrip.totalSeats - confirmTrip.seatsLeft,
        runtimeLabel:
          elapsed !== null
            ? formatRuntime(elapsed)
            : formatDuration(
                confirmTrip.departMinutes,
                confirmTrip.arriveMinutes
              ).replace(' est.', ' runtime'),
      });
      showToast('Trip marked as Completed! Great job.', 'checkmark-done');
    }

    if (confirm.type === 'cancel') {
      updateTrip(confirmTrip.id, {
        status: 'cancelled',
        statusNote: 'Just now',
      });
      showToast(
        'Trip marked as Cancelled.',
        'close-circle',
        '#F87171'
      );
    }

    setConfirm(null);
  };

  // BOTTOM NAVIGATION
  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);

    switch (tab) {
      case 'Home':
        router.replace('/driver-home');
        break;

      case 'Trips':
        // already on this screen
        break;

      case 'Map':
        router.push('/driver-map');
        break;

      case 'Alerts':
        router.push('/driver-alerts');
        break;
    }
  };

  // CONFIRM DIALOG CONTENT
  const confirmConfig = {
    start: {
      icon: 'bus' as const,
      iconColor: COLORS.brand,
      iconBg: '#EFF6FF',
      title: 'Start This Trip?',
      message:
        'Are you ready to begin this trip? Once started, commuters will see that your vehicle is on the way.',
      cancelLabel: 'Not Yet',
      confirmLabel: 'Start Trip',
      confirmColor: COLORS.brandDark,
    },
    complete: {
      icon: 'checkmark-done-circle' as const,
      iconColor: COLORS.green,
      iconBg: '#ECFDF5',
      title: 'Complete This Trip?',
      message:
        'Have you reached your destination? Confirm to mark this trip as completed.',
      cancelLabel: 'Go Back',
      confirmLabel: 'Complete Trip',
      confirmColor: COLORS.green,
    },
    cancel: {
      icon: 'calendar-clear' as const,
      iconColor: COLORS.red,
      iconBg: '#FEF2F2',
      title: 'Cancel This Trip?',
      message:
        'Commuters will receive a live route update immediately. This cannot be undone.',
      cancelLabel: 'Keep Trip',
      confirmLabel: 'Cancel Trip',
      confirmColor: COLORS.red,
    },
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

        {/* TITLE */}
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeTitle}>
              My Trips
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Manage your schedules and monitor your trip status.
            </Text>
          </View>

          <View style={styles.titleIcon}>
            <MaterialCommunityIcons
              name="bus-clock"
              size={20}
              color={COLORS.brand}
            />
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryGrid}>
          <MetricCard
            label="Draft"
            value={counts.draft}
            color={COLORS.slateLight}
          />

          <MetricCard
            label="Published"
            value={counts.published}
            color={COLORS.brand}
          />

          <MetricCard
            label="On Way"
            value={counts['on-the-way']}
            color={COLORS.green}
          />

          <MetricCard
            label="Done"
            value={counts.completed}
            color={COLORS.navy}
          />
        </View>

        {/* ADD SCHEDULE */}
        <Pressable
          style={styles.tripButton}
          onPress={openAddSchedule}
        >
          <Ionicons
            name="add-circle"
            size={21}
            color={COLORS.white}
          />

          <Text style={styles.tripButtonText}>
            ADD NEW SCHEDULE
          </Text>
        </Pressable>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((item) => {
            const active = filter === item.key;

            return (
              <Pressable
                key={item.key}
                style={[
                  styles.filterPill,
                  active && styles.filterPillActive,
                ]}
                onPress={() => setFilter(item.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>

                <View
                  style={[
                    styles.filterBadge,
                    active && styles.filterBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      active && styles.filterBadgeTextActive,
                    ]}
                  >
                    {counts[item.key]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* TRIP LIST */}
        {visibleTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="bus-alert"
                size={30}
                color={COLORS.brand}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No trips found.
            </Text>

            <Text style={styles.emptyText}>
              Your trips will appear here once you create a schedule.
            </Text>

            <Pressable
              style={[styles.tripButton, styles.emptyButton]}
              onPress={openAddSchedule}
            >
              <Ionicons
                name="add"
                size={19}
                color={COLORS.white}
              />

              <Text style={styles.tripButtonText}>
                ADD SCHEDULE
              </Text>
            </Pressable>
          </View>
        ) : (
          visibleTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={() => openEditSchedule(trip)}
              onPublish={() => publishDraft(trip)}
              onStart={() =>
                setConfirm({ type: 'start', id: trip.id })
              }
              onComplete={() =>
                setConfirm({ type: 'complete', id: trip.id })
              }
              onCancel={() =>
                setConfirm({ type: 'cancel', id: trip.id })
              }
              onViewTrip={() => {
                showToast(
                  'Opening active trip navigation...',
                  'navigate'
                );
                router.push('/driver-map');
              }}
              onDetails={() =>
                showToast('Viewing trip details log', 'receipt')
              }
            />
          ))
        )}

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

      {/* ADD / EDIT SCHEDULE MODAL */}
      <Modal
        visible={scheduleVisible}
        transparent
        animationType="slide"
        onRequestClose={closeSchedule}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={closeSchedule}
          >
            <Pressable
              style={[styles.profileModal, styles.scheduleModal]}
              onPress={(event) => event.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalProfileInfo}>
                  <View style={styles.avatar}>
                    <MaterialCommunityIcons
                      name={editingTrip ? 'pencil' : 'map-marker-plus'}
                      size={20}
                      color={COLORS.brand}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalName}>
                      {editingTrip ? 'Edit Schedule' : 'Add Schedule'}
                    </Text>

                    <Text style={styles.modalSubtext}>
                      Publish trips directly for commuters. No admin
                      approval needed.
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={closeSchedule}
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color={COLORS.slate}
                  />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.formContent}
              >
                <Field
                  label="STARTING LOCATION"
                  icon="locate-outline"
                  iconColor={COLORS.brand}
                  value={form.origin}
                  placeholder="e.g. Camp Phillips Terminal"
                  onChangeText={(v) => setField('origin', v)}
                />

                <Field
                  label="DESTINATION"
                  icon="location-outline"
                  iconColor={COLORS.green}
                  value={form.destination}
                  placeholder="e.g. Agora Terminal CDO"
                  onChangeText={(v) => setField('destination', v)}
                />

                <View style={styles.fieldRow}>
                  <View style={{ flex: 1 }}>
                    <Field
                      label="DEPARTURE DATE"
                      icon="calendar-outline"
                      value={form.date}
                      placeholder="YYYY-MM-DD"
                      mono
                      onChangeText={(v) => setField('date', v)}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Field
                      label="DEPARTURE TIME"
                      icon="time-outline"
                      value={form.time}
                      placeholder="08:00 AM"
                      mono
                      autoCapitalize="characters"
                      onChangeText={(v) => setField('time', v)}
                    />
                  </View>
                </View>

                <Field
                  label="ESTIMATED ARRIVAL TIME"
                  icon="hourglass-outline"
                  value={form.arrival}
                  placeholder="e.g. 09:15 AM"
                  mono
                  autoCapitalize="characters"
                  onChangeText={(v) => setField('arrival', v)}
                />

                <Field
                  label="VEHICLE NAME / PLATE NUMBER"
                  icon="bus-outline"
                  value={form.vehicle}
                  placeholder="e.g. Bus 024 - KAZ-8821"
                  onChangeText={(v) => setField('vehicle', v)}
                />

                <View style={styles.fieldRow}>
                  <View style={{ flex: 1 }}>
                    <Field
                      label="AVAILABLE SEATS"
                      icon="people-outline"
                      value={form.seats}
                      placeholder="45"
                      keyboardType="number-pad"
                      onChangeText={(v) =>
                        setField('seats', v.replace(/[^0-9]/g, ''))
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Field
                      label="FARE PER PASSENGER"
                      icon="cash-outline"
                      value={form.fare}
                      placeholder="₱120"
                      onChangeText={(v) => setField('fare', v)}
                    />
                  </View>
                </View>

                <View style={styles.infoBanner}>
                  <Ionicons
                    name="flash"
                    size={16}
                    color={COLORS.brand}
                  />

                  <Text style={styles.infoBannerText}>
                    Direct publish: schedules go live to commuters
                    right away. No admin approval required.
                  </Text>
                </View>

                {/* FORM ACTIONS */}
                {editingTrip && editingTrip.status !== 'draft' ? (
                  <Pressable
                    style={styles.tripButton}
                    onPress={() => submitSchedule('save')}
                  >
                    <Ionicons
                      name="save-outline"
                      size={19}
                      color={COLORS.white}
                    />

                    <Text style={styles.tripButtonText}>
                      SAVE CHANGES
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.fieldRow}>
                    <Pressable
                      style={[styles.formButton, styles.formButtonSecondary]}
                      onPress={() =>
                        editingTrip
                          ? submitSchedule('save')
                          : submitSchedule('draft')
                      }
                    >
                      <Ionicons
                        name="bookmark-outline"
                        size={17}
                        color="#334155"
                      />

                      <Text style={styles.formButtonSecondaryText}>
                        {editingTrip ? 'SAVE DRAFT' : 'SAVE AS DRAFT'}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[styles.formButton, styles.formButtonPrimary]}
                      onPress={() => submitSchedule('publish')}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={17}
                        color={COLORS.white}
                      />

                      <Text style={styles.formButtonPrimaryText}>
                        PUBLISH
                      </Text>
                    </Pressable>
                  </View>
                )}

                <Pressable
                  style={styles.closeWindowButton}
                  onPress={closeSchedule}
                >
                  <Text style={styles.closeWindowText}>
                    Close / Cancel
                  </Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* CONFIRM DIALOG (START / COMPLETE / CANCEL) */}
      <Modal
        visible={confirm !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(null)}
      >
        {confirm && (
          <Pressable
            style={styles.dialogOverlay}
            onPress={() => setConfirm(null)}
          >
            <Pressable
              style={styles.dialogCard}
              onPress={(event) => event.stopPropagation()}
            >
              <View
                style={[
                  styles.dialogIcon,
                  { backgroundColor: confirmConfig[confirm.type].iconBg },
                ]}
              >
                <Ionicons
                  name={confirmConfig[confirm.type].icon}
                  size={26}
                  color={confirmConfig[confirm.type].iconColor}
                />
              </View>

              <Text style={styles.dialogTitle}>
                {confirmConfig[confirm.type].title}
              </Text>

              <Text style={styles.dialogMessage}>
                {confirmConfig[confirm.type].message}
              </Text>

              {confirmTrip && (
                <Text style={styles.dialogTrip} numberOfLines={2}>
                  {confirmTrip.origin} ➔ {confirmTrip.destination}
                </Text>
              )}

              <View style={styles.fieldRow}>
                <Pressable
                  style={[styles.formButton, styles.formButtonSecondary]}
                  onPress={() => setConfirm(null)}
                >
                  <Text style={styles.formButtonSecondaryText}>
                    {confirmConfig[confirm.type].cancelLabel.toUpperCase()}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.formButton,
                    {
                      backgroundColor:
                        confirmConfig[confirm.type].confirmColor,
                    },
                  ]}
                  onPress={confirmAction}
                >
                  <Text style={styles.formButtonPrimaryText}>
                    {confirmConfig[confirm.type].confirmLabel.toUpperCase()}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        )}
      </Modal>

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
            color={toastColor}
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
// TRIP CARD
// ==================================================

function TripCard({
  trip,
  onEdit,
  onPublish,
  onStart,
  onComplete,
  onCancel,
  onViewTrip,
  onDetails,
}: {
  trip: Trip;
  onEdit: () => void;
  onPublish: () => void;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onViewTrip: () => void;
  onDetails: () => void;
}) {
  const meta = STATUS_META[trip.status];
  const isDone =
    trip.status === 'completed' || trip.status === 'cancelled';

  const departLabel = `Departure: ${formatDateLabel(trip.dateISO)}`;

  const arrivalLabel =
    trip.status === 'completed' && trip.actualArrival
      ? 'Arrival Time'
      : 'Est. Arrival';

  const arrivalValue =
    trip.status === 'completed' && trip.actualArrival
      ? `${trip.actualArrival} actual`
      : trip.arriveMinutes !== null
        ? `~${formatMinutes(trip.arriveMinutes)}`
        : 'TBA';

  const rightNote =
    trip.statusNote ??
    (trip.status === 'on-the-way'
      ? 'LIVE'
      : trip.status === 'published'
        ? 'UPCOMING'
        : trip.status === 'draft'
          ? 'STAGED'
          : '');

  return (
    <View
      style={[
        styles.tripCard,
        trip.status === 'on-the-way' && styles.tripCardLive,
        isDone && { opacity: 0.92 },
      ]}
    >
      <View
        style={[styles.tripAccent, { backgroundColor: meta.accent }]}
      />

      {/* STATUS ROW */}
      <View style={styles.tripHeader}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: meta.bg,
              borderColor: meta.border,
            },
          ]}
        >
          {trip.status === 'on-the-way' ? (
            <PulseDot color={COLORS.green} />
          ) : trip.status === 'completed' ? (
            <Ionicons
              name="checkmark-circle"
              size={11}
              color={COLORS.green}
            />
          ) : trip.status === 'draft' ? (
            <Ionicons
              name="eye-off-outline"
              size={11}
              color={meta.text}
            />
          ) : trip.status === 'cancelled' ? (
            <Ionicons
              name="close-circle"
              size={11}
              color={meta.text}
            />
          ) : (
            <View
              style={[styles.smallDot, { backgroundColor: meta.accent }]}
            />
          )}

          <Text
            style={[styles.statusBadgeText, { color: meta.text }]}
            numberOfLines={1}
          >
            {meta.label}
          </Text>
        </View>

        {rightNote !== '' && (
          <View style={styles.rightNoteRow}>
            {trip.status === 'on-the-way' && (
              <MaterialCommunityIcons
                name="access-point"
                size={13}
                color={COLORS.green}
              />
            )}

            <Text
              style={[
                styles.rightNote,
                trip.status === 'on-the-way' && {
                  color: COLORS.green,
                },
                trip.status === 'cancelled' && {
                  color: COLORS.red,
                },
              ]}
            >
              {rightNote}
            </Text>
          </View>
        )}
      </View>

      {/* ROUTE */}
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicators}>
          <View
            style={[
              styles.originDot,
              isDone && styles.mutedDot,
            ]}
          />
          <View style={styles.routeLine} />
          <View
            style={[
              styles.destinationDot,
              isDone && styles.mutedDot,
            ]}
          />
        </View>

        <View style={styles.routeDetails}>
          <View style={styles.routeTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeCaption}>
                From (Origin)
              </Text>

              <Text
                style={[
                  styles.locationName,
                  isDone && { color: COLORS.slate },
                ]}
                numberOfLines={1}
              >
                {trip.origin}
              </Text>
            </View>

            <View style={styles.timeBadge}>
              <Ionicons
                name="time-outline"
                size={13}
                color={COLORS.brand}
              />

              <Text style={styles.timeText}>
                {formatMinutes(trip.departMinutes)}
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.routeCaption}>
              To (Destination)
            </Text>

            <Text
              style={[
                styles.locationName,
                isDone && { color: COLORS.slate },
              ]}
              numberOfLines={1}
            >
              {trip.destination}
            </Text>
          </View>
        </View>
      </View>

      {/* DEPARTURE / ARRIVAL */}
      <View style={styles.corridorBox}>
        <Text style={styles.corridorLabel}>
          {departLabel}
        </Text>

        <Text style={styles.corridorValue}>
          {arrivalLabel}: {arrivalValue}
        </Text>
      </View>

      {/* VEHICLE / SEATS / FARE */}
      <View style={styles.metaStrip}>
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <MaterialCommunityIcons
              name="bus"
              size={16}
              color={isDone ? COLORS.slateLight : COLORS.brand}
            />

            <Text style={styles.vehicleMeta} numberOfLines={1}>
              {trip.vehicle}
            </Text>
          </View>

          <Text style={styles.fareText}>
            {trip.fare} / pax
          </Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaRow}>
          {trip.status === 'completed' ? (
            <View style={styles.metaLeft}>
              <MaterialCommunityIcons
                name="check-all"
                size={14}
                color={COLORS.green}
              />

              <Text style={[styles.seatText, { color: COLORS.green }]}>
                {trip.paxDelivered ?? 0} pax delivered
              </Text>
            </View>
          ) : (
            <View style={styles.metaLeft}>
              <MaterialCommunityIcons
                name="seat-recline-normal"
                size={14}
                color={
                  trip.status === 'on-the-way'
                    ? COLORS.green
                    : COLORS.slate
                }
              />

              <Text
                style={[
                  styles.seatText,
                  trip.status === 'on-the-way' && {
                    color: COLORS.green,
                  },
                ]}
              >
                {trip.seatsLeft} / {trip.totalSeats} seats left
              </Text>
            </View>
          )}

          <View style={styles.metaLeft}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={14}
              color={COLORS.slateLight}
            />

            <Text style={styles.durationText}>
              {trip.status === 'completed'
                ? trip.runtimeLabel ?? '—'
                : trip.status === 'cancelled'
                  ? 'Cancelled'
                  : trip.status === 'draft'
                    ? 'Not published'
                    : formatDuration(
                        trip.departMinutes,
                        trip.arriveMinutes
                      )}
            </Text>
          </View>
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.actionRow}>
        {trip.status === 'draft' && (
          <>
            <ActionButton
              icon="create-outline"
              label="Edit"
              variant="neutral"
              onPress={onEdit}
            />

            <ActionButton
              icon="cloud-upload-outline"
              label="Publish"
              variant="primary"
              onPress={onPublish}
            />
          </>
        )}

        {trip.status === 'published' && (
          <>
            <ActionButton
              icon="create-outline"
              label="Edit"
              variant="neutral"
              onPress={onEdit}
            />

            <ActionButton
              icon="play"
              label="Start Trip"
              variant="primary"
              onPress={onStart}
            />

            <ActionButton
              icon="close-circle-outline"
              label="Cancel"
              variant="danger"
              onPress={onCancel}
            />
          </>
        )}

        {trip.status === 'on-the-way' && (
          <>
            <ActionButton
              icon="navigate-outline"
              label="View Trip"
              variant="neutral"
              onPress={onViewTrip}
            />

            <ActionButton
              icon="checkmark-circle-outline"
              label="Complete Trip"
              variant="success"
              onPress={onComplete}
            />
          </>
        )}

        {isDone && (
          <ActionButton
            icon="receipt-outline"
            label="View Details"
            variant="neutral"
            onPress={onDetails}
          />
        )}
      </View>
    </View>
  );
}

// ==================================================
// ACTION BUTTON
// ==================================================

function ActionButton({
  icon,
  label,
  variant,
  onPress,
}: {
  icon: any;
  label: string;
  variant: 'neutral' | 'primary' | 'success' | 'danger';
  onPress: () => void;
}) {
  const palette = {
    neutral: { bg: '#F1F5F9', fg: '#334155' },
    primary: { bg: COLORS.brandDark, fg: COLORS.white },
    success: { bg: COLORS.green, fg: COLORS.white },
    danger: { bg: '#FEE2E2', fg: '#B91C1C' },
  }[variant];

  return (
    <Pressable
      style={[styles.actionButton, { backgroundColor: palette.bg }]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={16}
        color={palette.fg}
      />

      <Text
        style={[styles.actionButtonText, { color: palette.fg }]}
        numberOfLines={1}
      >
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

// ==================================================
// PULSE DOT (LIVE INDICATOR)
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
        styles.smallDot,
        { backgroundColor: color, opacity },
      ]}
    />
  );
}

// ==================================================
// METRIC CARD
// ==================================================

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryNumber}>
        <Text style={{ color }}>{value}</Text>
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

// ==================================================
// FORM FIELD
// ==================================================

function Field({
  label,
  icon,
  iconColor,
  value,
  placeholder,
  onChangeText,
  mono,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  icon: any;
  iconColor?: string;
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  mono?: boolean;
  keyboardType?: 'default' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Ionicons
          name={icon}
          size={13}
          color={iconColor ?? COLORS.slate}
        />

        <Text style={styles.fieldLabel}>
          {label}
        </Text>
      </View>

      <TextInput
        style={[styles.input, mono && styles.inputMono]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.slateLight}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoCorrect={false}
      />
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

  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SUMMARY
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  summaryCard: {
    flex: 1,
    minHeight: 64,
    backgroundColor: COLORS.white,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
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
    marginTop: 2,
  },

  // PRIMARY BUTTON
  tripButton: {
    minHeight: 46,
    backgroundColor: COLORS.brandDark,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  tripButtonText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 12,
    color: COLORS.white,
    letterSpacing: 0.6,
  },

  // FILTERS
  filterRow: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 8,
  },

  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
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

  filterBadge: {
    minWidth: 18,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  filterBadgeText: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 9,
    color: COLORS.slate,
  },

  filterBadgeTextActive: {
    color: COLORS.white,
  },

  // TRIP CARD
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    paddingTop: 17,
    overflow: 'hidden',
    elevation: 2,
  },

  tripCardLive: {
    borderWidth: 2,
    borderColor: 'rgba(5,150,105,0.25)',
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
    gap: 8,
  },

  statusBadge: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  statusBadgeText: {
    flexShrink: 1,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 9,
    letterSpacing: 0.5,
  },

  smallDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },

  rightNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  rightNote: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 9,
    color: COLORS.slateLight,
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
    alignSelf: 'flex-start',
  },

  timeText: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    color: '#334155',
  },

  routeContainer: {
    flexDirection: 'row',
    gap: 11,
    marginBottom: 13,
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

  mutedDot: {
    backgroundColor: '#CBD5E1',
    borderColor: '#F1F5F9',
  },

  routeDetails: {
    flex: 1,
    gap: 12,
  },

  routeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
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
    marginBottom: 9,
    gap: 5,
  },

  corridorLabel: {
    flexShrink: 1,
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

  metaStrip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 9,
    gap: 6,
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  metaLeft: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  metaDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  vehicleMeta: {
    flexShrink: 1,
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.navy,
  },

  fareText: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 10,
    color: COLORS.brand,
  },

  seatText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: COLORS.slate,
  },

  durationText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    color: COLORS.slateLight,
  },

  // ACTIONS
  actionRow: {
    flexDirection: 'row',
    gap: 7,
  },

  actionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },

  actionButtonText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 10,
    letterSpacing: 0.4,
    flexShrink: 1,
  },

  // EMPTY STATE
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 14,
    color: COLORS.navy,
  },

  emptyText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.slate,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    maxWidth: 240,
  },

  emptyButton: {
    paddingHorizontal: 22,
    alignSelf: 'center',
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

  // MODALS (SHARED)
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

  scheduleModal: {
    maxHeight: '92%',
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

  // FORM
  formContent: {
    paddingTop: 14,
    gap: 12,
  },

  field: {
    gap: 5,
  },

  fieldRow: {
    flexDirection: 'row',
    gap: 8,
  },

  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  fieldLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 9,
    color: COLORS.slate,
    letterSpacing: 0.8,
  },

  input: {
    minHeight: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: COLORS.navy,
  },

  inputMono: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 11,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    padding: 10,
  },

  infoBannerText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.navyLight,
  },

  formButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },

  formButtonSecondary: {
    backgroundColor: '#F1F5F9',
  },

  formButtonPrimary: {
    backgroundColor: COLORS.brandDark,
  },

  formButtonSecondaryText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
    color: '#334155',
    letterSpacing: 0.4,
  },

  formButtonPrimaryText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
    color: COLORS.white,
    letterSpacing: 0.4,
  },

  // CONFIRM DIALOG
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23,32,51,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },

  dialogIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  dialogTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: COLORS.navy,
    textAlign: 'center',
  },

  dialogMessage: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.slate,
    textAlign: 'center',
  },

  dialogTrip: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: COLORS.navyLight,
    textAlign: 'center',
    marginBottom: 8,
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
