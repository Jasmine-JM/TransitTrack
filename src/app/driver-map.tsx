import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
    Animated,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Svg, {
    Circle,
    Defs,
    G,
    LinearGradient,
    Path,
    Pattern,
    Rect,
    Stop,
    Text as SvgText,
} from 'react-native-svg';

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

type TripState =
  | 'active'
  | 'upcoming'
  | 'empty'
  | 'completed'
  | 'cancelled';

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
// MAP STATE CONFIG
// ==================================================

const BUS_ACTIVE = { x: 185, y: 162 };
const BUS_START = { x: 330, y: 290 };
const BUS_END = { x: 75, y: 102 };

const STATE_TABS: {
  key: TripState;
  label: string;
  dot: string;
}[] = [
  { key: 'active', label: 'On the Way', dot: '#34D399' },
  { key: 'upcoming', label: 'Upcoming Trip', dot: '#0EA5E9' },
  { key: 'empty', label: 'No Active Trip', dot: '#94A3B8' },
  { key: 'completed', label: 'Completed', dot: COLORS.green },
  { key: 'cancelled', label: 'Cancelled', dot: COLORS.red },
];

const MAP_STATES: Record<
  TripState,
  {
    bus: { x: number; y: number } | null;
    stroke: string;
    width: number;
    speed: string;
    showEta: boolean;
  }
> = {
  active: {
    bus: BUS_ACTIVE,
    stroke: 'url(#routeGradient)',
    width: 5,
    speed: 'Live GPS: 42 km/h',
    showEta: true,
  },
  upcoming: {
    bus: BUS_START,
    stroke: '#0066FF',
    width: 3,
    speed: 'Parked: 0 km/h',
    showEta: false,
  },
  empty: {
    bus: null,
    stroke: '#DAE2FD',
    width: 4,
    speed: 'GPS Standby',
    showEta: false,
  },
  completed: {
    bus: BUS_END,
    stroke: '#00825A',
    width: 5,
    speed: 'Trip Finished',
    showEta: false,
  },
  cancelled: {
    bus: BUS_START,
    stroke: '#BA1A1A',
    width: 3,
    speed: 'Route Blocked',
    showEta: false,
  },
};

const ROUTE_PATH =
  'M 330,290 C 290,260 270,225 220,190 C 180,160 170,135 130,120 C 105,110 90,105 75,102';

const MILESTONES = [
  {
    id: 'm1',
    title: 'Libona Terminal Depot',
    sub: 'Departed 06:45 AM • Gate 2',
    dist: '0.0 km',
    status: 'done' as const,
    subColor: COLORS.green,
  },
  {
    id: 'm2',
    title: 'Damilag Crossing',
    sub: 'Cleared 07:08 AM • Normal Flow',
    dist: '+12 km',
    status: 'done' as const,
    subColor: COLORS.slate,
  },
  {
    id: 'm3',
    title: 'Alae Junction Checkpoint',
    sub: 'Approaching now • ~2 mins remaining',
    dist: '+24 km',
    status: 'current' as const,
    subColor: COLORS.brand,
  },
  {
    id: 'm4',
    title: 'Agora Integrated Terminal (CDO)',
    sub: 'Destination Bay 04 • ETA ~07:35 AM',
    dist: '38.2 km',
    status: 'next' as const,
    subColor: COLORS.slate,
  },
];

// ==================================================
// MAIN SCREEN
// ==================================================

export default function DriverMap() {

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
  const [tripState, setTripStateRaw] = useState<TripState>('active');
  const [activeTab, setActiveTab] = useState<TabType>('Map');
  const [profileVisible, setProfileVisible] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [trafficVisible, setTrafficVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState('');
  const [toastIcon, setToastIcon] = useState('checkmark-circle');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    Animated.spring(mapScale, {
      toValue: zoom,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [zoom, mapScale]);

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

  // TRIP STATE
  const setTripState = (state: TripState) => {
    setTripStateRaw(state);
  };

  const startTrip = () => {
    setTripState('active');
    showToast('Trip started! Route tracking active.', 'checkmark-circle');
  };

  const confirmCompletion = () => {
    setCompleteVisible(false);
    setTripState('completed');
    showToast('Trip logged as Completed! Well done.', 'checkmark-done');
  };

  // MAP CONTROLS
  const zoomMap = (delta: number) => {
    const next = Math.max(
      0.85,
      Math.min(1.45, Number((zoom + delta * 0.15).toFixed(2)))
    );
    setZoom(next);
    showToast(`Zoom: ${Math.round(next * 100)}%`, 'search');
  };

  const recenterMap = () => {
    setZoom(1);
    showToast('Map recentered on Bus 024', 'locate');
  };

  const toggleTraffic = () => {
    const next = !trafficVisible;
    setTrafficVisible(next);
    showToast(
      next ? 'Traffic overlay enabled' : 'Traffic overlay hidden',
      'car'
    );
  };

  const shareLocation = async () => {
    try {
      await Share.share({
        message:
          'Bus 024 (Mafortransco) is on the way: Libona ➔ Agora Terminal CDO. ETA ~07:35 AM. Tracked live on TransitTrack.',
      });
    } catch {
      showToast('Live telemetry link copied to clipboard', 'link');
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
        // already on this screen
        break;

      case 'Alerts':
        router.push('/driver-alerts');
        break;
    }
  };

  const mapState = MAP_STATES[tripState];

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
              Current Trip Map
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Monitor your route real-time telemetry and dispatch
              milestones.
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <PulseDot color={COLORS.green} />

            <Text style={styles.liveText}>
              Fleet Live
            </Text>
          </View>
        </View>

        {/* STATE TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATE_TABS.map((tab) => {
            const active = tripState === tab.key;

            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.filterPill,
                  active && styles.filterPillActive,
                ]}
                onPress={() => setTripState(tab.key)}
              >
                <View
                  style={[
                    styles.smallDot,
                    { backgroundColor: tab.dot },
                  ]}
                />

                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* MAP */}
        <View style={styles.mapViewport}>

          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { transform: [{ scale: mapScale }] },
            ]}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 420 340"
              preserveAspectRatio="xMidYMid slice"
            >
              <Defs>
                <LinearGradient
                  id="routeGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor="#00825a" />
                  <Stop offset="60%" stopColor="#0066ff" />
                  <Stop offset="100%" stopColor="#0050cb" />
                </LinearGradient>

                <Pattern
                  id="gridPattern"
                  width="30"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <Path
                    d="M 30 0 L 0 0 0 30"
                    fill="none"
                    stroke="#eaedff"
                    strokeWidth="0.8"
                  />
                </Pattern>
              </Defs>

              {/* BASE */}
              <Rect width="420" height="340" fill="#f4f6fd" />
              <Rect
                width="420"
                height="340"
                fill="url(#gridPattern)"
              />

              {/* MACAJALAR BAY */}
              <Path
                d="M-10,-10 L190,-10 C175,45 155,75 120,95 C85,115 50,110 -10,130 Z"
                fill="#daeaff"
                opacity={0.85}
              />
              <SvgText
                x="35"
                y="45"
                fill="#006398"
                fontFamily="JetBrainsMono_600SemiBold"
                fontSize="9"
                letterSpacing="1.5"
                opacity={0.6}
              >
                MACAJALAR BAY
              </SvgText>

              {/* TERRAIN */}
              <Path
                d="M 280,20 Q 340,60 380,140 Q 320,180 270,120 Z"
                fill="#e2f5ec"
                opacity={0.6}
              />
              <SvgText
                x="300"
                y="85"
                fill="#006646"
                fontFamily="JetBrainsMono_500Medium"
                fontSize="8"
                opacity={0.5}
              >
                MT. KITANGLAD RANGE
              </SvgText>

              {/* MINOR ROADS */}
              <Path
                d="M 40,240 Q 110,210 160,230 T 260,250"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <Path
                d="M 120,80 Q 150,130 140,190"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <Path
                d="M 230,160 Q 300,180 370,160"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <Path
                d="M 70,110 L 150,115 L 210,140"
                fill="none"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* SECONDARY HIGHWAY */}
              <Path
                d="M 85,110 Q 155,100 215,140"
                fill="none"
                stroke="#d5def9"
                strokeLinecap="round"
                strokeWidth="4"
              />

              {/* ROUTE */}
              <Path
                d={ROUTE_PATH}
                fill="none"
                stroke="#dae2fd"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="8"
              />
              <Path
                d={ROUTE_PATH}
                fill="none"
                stroke={mapState.stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={mapState.width}
              />

              {/* TRAFFIC */}
              {trafficVisible && (
                <Path
                  d="M 245,210 C 230,198 215,185 200,172"
                  fill="none"
                  stroke="#ea580c"
                  strokeDasharray="4,2"
                  strokeWidth="3.5"
                  opacity={0.9}
                />
              )}

              {/* LIBONA */}
              <G transform={`translate(${BUS_START.x} ${BUS_START.y})`}>
                <Circle fill="#00825a" fillOpacity={0.18} r="14" />
                <Circle fill="#00825a" r="7" />
                <Circle fill="#ffffff" r="3" />
                <Rect
                  x="12"
                  y="-12"
                  width="98"
                  height="20"
                  rx="4"
                  fill="#ffffff"
                  fillOpacity={0.95}
                />
                <SvgText
                  x="17"
                  y="1"
                  fill="#002114"
                  fontFamily="JetBrainsMono_700Bold"
                  fontSize="8.5"
                >
                  LIBONA TERMINAL
                </SvgText>
              </G>

              {/* DAMILAG */}
              <G transform="translate(262 230)">
                <Circle fill="#0050cb" r="4" />
                <Circle fill="#ffffff" r="2" />
                <SvgText
                  x="10"
                  y="4"
                  fill="#424656"
                  fontFamily="PlusJakartaSans_600SemiBold"
                  fontSize="8.5"
                >
                  Damilag Crossing
                </SvgText>
              </G>

              {/* ALAE */}
              <G transform="translate(195 170)">
                <Circle fill="#0050cb" r="5" />
                <Circle fill="#ffffff" r="2.5" />
                <Rect
                  x="-70"
                  y="-18"
                  width="65"
                  height="15"
                  rx="3"
                  fill="#0050cb"
                />
                <SvgText
                  x="-37"
                  y="-7.5"
                  fill="#ffffff"
                  fontFamily="JetBrainsMono_600SemiBold"
                  fontSize="7.5"
                  textAnchor="middle"
                >
                  Alae Jct
                </SvgText>
              </G>

              {/* PUERTO */}
              <G transform="translate(130 120)">
                <Circle fill="#0050cb" r="4" />
                <Circle fill="#ffffff" r="2" />
                <SvgText
                  x="-48"
                  y="14"
                  fill="#424656"
                  fontFamily="PlusJakartaSans_600SemiBold"
                  fontSize="8.5"
                >
                  Puerto Flyover
                </SvgText>
              </G>

              {/* AGORA */}
              <G transform={`translate(${BUS_END.x} ${BUS_END.y})`}>
                <Circle fill="#ba1a1a" fillOpacity={0.16} r="16" />
                <Circle fill="#ba1a1a" r="7.5" />
                <Circle fill="#ffffff" r="3" />
                <Rect
                  x="-85"
                  y="-24"
                  width="80"
                  height="20"
                  rx="4"
                  fill="#131b2e"
                />
                <SvgText
                  x="-45"
                  y="-10.5"
                  fill="#ffffff"
                  fontFamily="PlusJakartaSans_800ExtraBold"
                  fontSize="9"
                  letterSpacing="0.5"
                  textAnchor="middle"
                >
                  AGORA TERMINAL
                </SvgText>
              </G>

              {/* LIVE BUS */}
              {mapState.bus && (
                <G
                  transform={`translate(${mapState.bus.x} ${mapState.bus.y})`}
                >
                  <Circle
                    fill="#0066ff"
                    fillOpacity={0.22}
                    r="20"
                  />
                  <Circle fill="#0066ff" r="12" />
                  <Path
                    d="M 0,-7 L 5,6 L 0,3 L -5,6 Z"
                    fill="#ffffff"
                    transform="rotate(-48)"
                  />
                  <G transform="translate(12 -18)">
                    <Rect
                      width="68"
                      height="18"
                      rx="4"
                      fill="#001849"
                      fillOpacity={0.95}
                    />
                    <SvgText
                      x="34"
                      y="12"
                      fill="#b3c5ff"
                      fontFamily="JetBrainsMono_600SemiBold"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      BUS 024
                    </SvgText>
                  </G>
                </G>
              )}
            </Svg>
          </Animated.View>

          {/* TOP HUD */}
          <View style={styles.hudTop} pointerEvents="box-none">
            <View style={styles.hudChip}>
              <PulseDot color={COLORS.green} />

              <Text style={styles.hudText}>
                {mapState.speed}
              </Text>

              <View style={styles.hudDivider} />

              <MaterialCommunityIcons
                name="signal-cellular-3"
                size={13}
                color={COLORS.green}
              />

              <Text style={styles.hudSubText}>
                98%
              </Text>
            </View>

            <View style={styles.hudChip}>
              <Text style={[styles.hudText, { color: COLORS.brand }]}>
                Sayre Hwy 10
              </Text>

              <MaterialCommunityIcons
                name="call-split"
                size={14}
                color={COLORS.slate}
              />
            </View>
          </View>

          {/* RIGHT CONTROLS */}
          <View style={styles.mapControls}>
            <Pressable
              style={styles.roundControl}
              onPress={recenterMap}
            >
              <Ionicons
                name="navigate"
                size={18}
                color={COLORS.brand}
              />
            </Pressable>

            <View style={styles.zoomGroup}>
              <Pressable
                style={styles.zoomButton}
                onPress={() => zoomMap(1)}
              >
                <Ionicons
                  name="add"
                  size={19}
                  color={COLORS.navy}
                />
              </Pressable>

              <View style={styles.zoomSeparator} />

              <Pressable
                style={styles.zoomButton}
                onPress={() => zoomMap(-1)}
              >
                <Ionicons
                  name="remove"
                  size={19}
                  color={COLORS.navy}
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.roundControl}
              onPress={toggleTraffic}
            >
              <MaterialCommunityIcons
                name="traffic-light"
                size={19}
                color={trafficVisible ? COLORS.amber : COLORS.slateLight}
              />
            </Pressable>
          </View>

          {/* PACE */}
          <View style={styles.paceChip}>
            <View>
              <Text style={styles.paceLabel}>
                CORRIDOR PACE
              </Text>

              <Text style={styles.paceValue}>
                {tripState === 'active' ? '42' : '0'}{' '}
                <Text style={styles.paceUnit}>km/h</Text>
              </Text>
            </View>

            <View style={styles.paceBarTrack}>
              <View
                style={[
                  styles.paceBarFill,
                  { height: tripState === 'active' ? '60%' : '8%' },
                ]}
              />
            </View>
          </View>

          {/* ETA */}
          {mapState.showEta && (
            <View style={styles.etaChip}>
              <Ionicons
                name="time-outline"
                size={17}
                color="#CCE5FF"
              />

              <View>
                <Text style={styles.etaLabel}>
                  ETA CDO
                </Text>

                <Text style={styles.etaValue}>
                  ~07:35 AM
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* STATE PANELS */}
        {tripState === 'active' && (
          <>
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
                  ]}
                >
                  <PulseDot color={COLORS.green} />

                  <Text
                    style={[styles.statusBadgeText, { color: '#047857' }]}
                  >
                    ON THE WAY • IN PROGRESS
                  </Text>
                </View>

                <Text style={styles.vehicleChip}>
                  Bus 024
                </Text>
              </View>

              <Text style={styles.cardTitle}>
                Libona ➔ Agora Terminal (CDO)
              </Text>

              <View style={styles.inlineRow}>
                <MaterialCommunityIcons
                  name="call-split"
                  size={14}
                  color={COLORS.green}
                />

                <Text style={styles.cardSub}>
                  Via Sayre Highway Express • Plate KAZ-8821
                </Text>
              </View>

              <View style={styles.statGrid}>
                <StatTile
                  label="DEPARTURE"
                  value="06:45 AM"
                  note="On-time"
                  noteColor={COLORS.green}
                />

                <StatTile
                  label="EST. ARRIVAL"
                  value="07:35 AM"
                  valueColor={COLORS.brand}
                  note="~18m est"
                />

                <StatTile
                  label="REMAINING DIST"
                  value="14.2 km"
                  note="of 38 km"
                />

                <StatTile
                  label="ONBOARD MANIFEST"
                  value="39 / 45"
                  note="86% Cap"
                  noteColor="#0284C7"
                />
              </View>
            </View>

            {/* MILESTONES */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  ROUTE MILESTONES
                </Text>

                <Text style={styles.progressText}>
                  65% Completed
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>

              <View style={styles.milestoneList}>
                {MILESTONES.map((m) => (
                  <View
                    key={m.id}
                    style={[
                      styles.milestoneRow,
                      m.status === 'current' && styles.milestoneCurrent,
                      m.status === 'next' && { opacity: 0.6 },
                    ]}
                  >
                    <View
                      style={[
                        styles.milestoneIcon,
                        m.status === 'done' && {
                          backgroundColor: '#D1FAE5',
                        },
                        m.status === 'current' && {
                          backgroundColor: COLORS.brandDark,
                        },
                        m.status === 'next' && {
                          backgroundColor: '#F1F5F9',
                        },
                      ]}
                    >
                      {m.status === 'done' && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color="#047857"
                        />
                      )}

                      {m.status === 'current' && (
                        <PulseDot color={COLORS.white} />
                      )}

                      {m.status === 'next' && (
                        <View style={styles.hollowDot} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.milestoneTitle,
                          m.status === 'current' && {
                            color: COLORS.brand,
                          },
                        ]}
                      >
                        {m.title}
                      </Text>

                      <Text
                        style={[
                          styles.milestoneSub,
                          { color: m.subColor },
                        ]}
                      >
                        {m.sub}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.milestoneDist,
                        m.status === 'current' && {
                          color: COLORS.brand,
                        },
                      ]}
                    >
                      {m.dist}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ACTIONS */}
            <Pressable
              style={styles.tripButton}
              onPress={() => setCompleteVisible(true)}
            >
              <Ionicons
                name="checkmark-circle"
                size={21}
                color={COLORS.white}
              />

              <Text style={styles.tripButtonText}>
                COMPLETE TRIP
              </Text>
            </Pressable>

            <View style={styles.linkRow}>
              <Pressable
                style={styles.linkButton}
                onPress={() =>
                  showToast(
                    'Incident report ticket generated (#INC-842)',
                    'alert-circle'
                  )
                }
              >
                <Ionicons
                  name="warning-outline"
                  size={15}
                  color={COLORS.red}
                />

                <Text style={styles.linkTextMuted}>
                  Report Incident / Delay
                </Text>
              </Pressable>

              <Pressable
                style={styles.linkButton}
                onPress={shareLocation}
              >
                <Ionicons
                  name="share-social-outline"
                  size={15}
                  color={COLORS.brand}
                />

                <Text style={styles.linkTextBrand}>
                  Share Location
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {tripState === 'upcoming' && (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
                ]}
              >
                <View
                  style={[
                    styles.smallDot,
                    { backgroundColor: COLORS.brand },
                  ]}
                />

                <Text
                  style={[styles.statusBadgeText, { color: '#0052CC' }]}
                  numberOfLines={1}
                >
                  UPCOMING • WAITING
                </Text>
              </View>

              <Text style={styles.cardMeta}>
                #TR-4091
              </Text>
            </View>

            <Text style={styles.cardTitle}>
              Libona Terminal ➔ Agora CDO
            </Text>

            <Text style={styles.cardSub}>
              Assigned Vehicle: Bus 024 • Standby Platform 02
            </Text>

            <View style={styles.countdownBox}>
              <View style={styles.countdownIcon}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#0284C7"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.countdownTitle}>
                  09:30 AM DEPARTURE
                </Text>

                <Text style={styles.cardSub}>
                  Estimated departure countdown: 1h 45m
                </Text>
              </View>
            </View>

            <Text style={styles.bodyText}>
              Your trip schedule is published to passengers. The vehicle
              is registered as parked at Libona dispatch depot. Complete
              pre-departure inspection before boarding.
            </Text>

            <Pressable style={styles.tripButton} onPress={startTrip}>
              <Ionicons
                name="play-circle"
                size={21}
                color={COLORS.white}
              />

              <Text style={styles.tripButtonText}>
                START TRIP NOW
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() =>
                showToast(
                  'Opening Passenger Manifest for Bus 024...',
                  'receipt'
                )
              }
            >
              <Ionicons
                name="receipt-outline"
                size={17}
                color="#334155"
              />

              <Text style={styles.secondaryButtonText}>
                View Passenger Manifest (34 Reserved)
              </Text>
            </Pressable>
          </View>
        )}

        {tripState === 'empty' && (
          <View style={[styles.card, { alignItems: 'center' }]}>
            <View style={styles.emptyIconWrap}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="bus"
                  size={36}
                  color={COLORS.brand}
                />
              </View>

              <View style={styles.zzzBadge}>
                <Text style={styles.zzzText}>Zzz</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>
              No Active Trip
            </Text>

            <Text style={[styles.bodyText, { textAlign: 'center' }]}>
              You don't have an active trip assigned or running right
              now. You are marked as Available on the dispatch grid.
            </Text>

            <View style={styles.statGrid}>
              <StatTile
                label="TODAY'S COMPLETED"
                value="2 Trips"
              />

              <StatTile
                label="TOTAL DUTY TIME"
                value="4h 15m"
                valueColor={COLORS.brand}
              />
            </View>

            <Pressable
              style={[styles.tripButton, { width: '100%' }]}
              onPress={() => router.push('/driver-trips')}
            >
              <Ionicons
                name="calendar"
                size={19}
                color={COLORS.white}
              />

              <Text style={styles.tripButtonText}>
                VIEW MY TRIPS SCHEDULE
              </Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { width: '100%' }]}
              onPress={() => {
                setTripState('active');
                showToast('Active dispatch simulated.', 'refresh');
              }}
            >
              <Ionicons
                name="refresh"
                size={17}
                color="#334155"
              />

              <Text style={styles.secondaryButtonText}>
                Simulate Active Dispatch
              </Text>
            </Pressable>
          </View>
        )}

        {tripState === 'completed' && (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={COLORS.green}
                />

                <Text
                  style={[styles.statusBadgeText, { color: '#047857' }]}
                >
                  TRIP COMPLETED
                </Text>
              </View>

              <Text style={[styles.cardMeta, { color: COLORS.green }]}>
                Logs Synchronized
              </Text>
            </View>

            <Text style={styles.cardTitle}>
              Libona ➔ Agora Terminal (CDO)
            </Text>

            <Text style={styles.cardSub}>
              Arrived safely at Agora Bay 04 • 07:34 AM
            </Text>

            <View style={styles.statGrid}>
              <StatTile label="RUNTIME" value="49 min" center third />

              <StatTile label="DISTANCE" value="38.4 km" center third />

              <StatTile
                label="PAX SERVED"
                value="42 pax"
                valueColor={COLORS.green}
                center
                third
              />
            </View>

            <View style={styles.noticeBox}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={19}
                color={COLORS.green}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>
                  Excellent On-Time Performance
                </Text>

                <Text style={styles.noticeText}>
                  Dispatch metrics logged to Central Office. Your break
                  timer starts now (35 mins allotted).
                </Text>
              </View>
            </View>

            <Pressable style={styles.tripButton} onPress={startTrip}>
              <Ionicons
                name="refresh"
                size={19}
                color={COLORS.white}
              />

              <Text style={styles.tripButtonText}>
                START NEXT TRIP
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => setTripState('empty')}
            >
              <Ionicons
                name="list"
                size={17}
                color="#334155"
              />

              <Text style={styles.secondaryButtonText}>
                Return to Dashboard
              </Text>
            </Pressable>
          </View>
        )}

        {tripState === 'cancelled' && (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
                ]}
              >
                <Ionicons
                  name="warning"
                  size={12}
                  color="#B91C1C"
                />

                <Text
                  style={[styles.statusBadgeText, { color: '#B91C1C' }]}
                >
                  TRIP CANCELLED
                </Text>
              </View>

              <Text style={[styles.cardMeta, { color: COLORS.red }]}>
                Notice #CAN-902
              </Text>
            </View>

            <Text style={styles.cardTitle}>
              Libona ➔ Agora Terminal
            </Text>

            <Text style={styles.cardSub}>
              Scheduled 06:45 AM • Unit: Bus 024
            </Text>

            <View style={[styles.noticeBox, styles.noticeBoxDanger]}>
              <MaterialCommunityIcons
                name="alert-octagon"
                size={21}
                color={COLORS.red}
              />

              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeTitle, { color: '#93000A' }]}>
                  Cancelled due to severe weather advisory
                </Text>

                <Text style={styles.noticeText}>
                  Heavy landslide hazard near Mangima canyon pass.
                  Provincial Highway Patrol has temporarily closed
                  northbound Sayre passage. All passengers have received
                  automatic SMS rerouting notices.
                </Text>
              </View>
            </View>

            <View style={styles.protocolBox}>
              <Text style={styles.statLabel}>
                DISPATCHER PROTOCOL
              </Text>

              <Text style={styles.protocolText}>
                Keep bus securely parked at Libona Station staging bay
                until Highway clearance.
              </Text>
            </View>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                setTripState('active');
                showToast('Test trip resumed.', 'arrow-undo');
              }}
            >
              <Ionicons
                name="arrow-undo"
                size={17}
                color="#334155"
              />

              <Text style={styles.secondaryButtonText}>
                Resume Test Trip
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.replace('/driver-home')}
            >
              <Ionicons
                name="home-outline"
                size={17}
                color="#334155"
              />

              <Text style={styles.secondaryButtonText}>
                Back to Driver Hub
              </Text>
            </Pressable>
          </View>
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

      {/* COMPLETE TRIP MODAL */}
      <Modal
        visible={completeVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCompleteVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCompleteVisible(false)}
        >
          <Pressable
            style={styles.profileModal}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalProfileInfo}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons
                    name="flag-checkered"
                    size={20}
                    color={COLORS.brand}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalName}>
                    Complete This Trip?
                  </Text>

                  <Text style={styles.modalSubtext}>
                    Route: Libona Terminal ➔ Agora Terminal CDO
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setCompleteVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={19}
                  color={COLORS.slate}
                />
              </Pressable>
            </View>

            <View style={{ paddingVertical: 14, gap: 10 }}>
              <Text style={styles.bodyText}>
                Have you safely docked at destination Agora Integrated
                Terminal and cleared all passengers from Bus 024?
              </Text>

              <View style={styles.infoBanner}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={COLORS.green}
                />

                <Text style={styles.infoBannerText}>
                  This action logs your runtime (49m) and triggers trip
                  settlement.
                </Text>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Pressable
                style={[styles.formButton, styles.formButtonSecondary]}
                onPress={() => setCompleteVisible(false)}
              >
                <Text style={styles.formButtonSecondaryText}>
                  GO BACK
                </Text>
              </Pressable>

              <Pressable
                style={[styles.formButton, styles.formButtonPrimary]}
                onPress={confirmCompletion}
              >
                <Ionicons
                  name="checkmark"
                  size={17}
                  color={COLORS.white}
                />

                <Text style={styles.formButtonPrimaryText}>
                  COMPLETE TRIP
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
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
        styles.smallDot,
        { backgroundColor: color, opacity },
      ]}
    />
  );
}

// ==================================================
// STAT TILE
// ==================================================

function StatTile({
  label,
  value,
  note,
  valueColor,
  noteColor,
  center,
  third,
}: {
  label: string;
  value: string;
  note?: string;
  valueColor?: string;
  noteColor?: string;
  center?: boolean;
  third?: boolean;
}) {
  return (
    <View
      style={[
        styles.statTile,
        third && styles.statTileThird,
        center && { alignItems: 'center' },
      ]}
    >
      <Text style={styles.statLabel}>
        {label}
      </Text>

      <View style={styles.statValueRow}>
        <Text
          style={[
            styles.statValue,
            valueColor ? { color: valueColor } : {},
          ]}
        >
          {value}
        </Text>

        {note ? (
          <Text
            style={[
              styles.statNote,
              noteColor ? { color: noteColor } : {},
            ]}
          >
            {note}
          </Text>
        ) : null}
      </View>
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

  liveBadge: {
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

  liveText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: '#047857',
  },

  smallDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },

  // STATE TABS
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

  // MAP
  mapViewport: {
    height: 340,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F4F6FD',
    overflow: 'hidden',
    elevation: 2,
  },

  hudTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },

  hudChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 2,
  },

  hudText: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 9,
    color: COLORS.navy,
  },

  hudSubText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    color: COLORS.slate,
  },

  hudDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#C2C6D8',
  },

  mapControls: {
    position: 'absolute',
    right: 10,
    top: 56,
    gap: 8,
  },

  roundControl: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  zoomGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },

  zoomButton: {
    width: 38,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  zoomSeparator: {
    height: 1,
    backgroundColor: '#EAEDFF',
  },

  paceChip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 2,
  },

  paceLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 8,
    color: COLORS.slate,
  },

  paceValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 15,
    color: COLORS.brandDark,
    marginTop: 1,
  },

  paceUnit: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    color: COLORS.slate,
  },

  paceBarTrack: {
    width: 6,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#D1FAE5',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  paceBarFill: {
    width: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },

  etaChip: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(19,27,46,0.92)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 3,
  },

  etaLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 8,
    color: '#DAE2FD',
  },

  etaValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 11,
    color: '#FAF8FF',
  },

  // CARDS
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
    elevation: 1,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  vehicleChip: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.brand,
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    overflow: 'hidden',
  },

  cardMeta: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.slate,
  },

  cardTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 15,
    color: COLORS.navy,
    lineHeight: 21,
  },

  cardSub: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.slate,
    flexShrink: 1,
  },

  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  bodyText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    lineHeight: 17,
    color: '#475569',
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },

  statTile: {
    width: '48.5%',
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 9,
  },

  statTileThird: {
    width: '31%',
  },

  statLabel: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 9,
    color: COLORS.slate,
    letterSpacing: 0.5,
  },

  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 3,
  },

  statValue: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 12,
    color: COLORS.navy,
  },

  statNote: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 9,
    color: COLORS.slate,
  },

  // SECTION / MILESTONES
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionLabel: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 10,
    color: COLORS.slate,
    letterSpacing: 1,
  },

  progressText: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 10,
    color: COLORS.brand,
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAEDFF',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.brandDark,
  },

  milestoneList: {
    gap: 8,
    paddingTop: 2,
  },

  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 6,
    borderRadius: 8,
  },

  milestoneCurrent: {
    backgroundColor: 'rgba(8,117,232,0.08)',
  },

  milestoneIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hollowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.slateLight,
  },

  milestoneTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: COLORS.navy,
  },

  milestoneSub: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    marginTop: 2,
  },

  milestoneDist: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 9,
    color: COLORS.slate,
  },

  // BUTTONS
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

  secondaryButton: {
    minHeight: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
  },

  secondaryButtonText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 11,
    color: '#334155',
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },

  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },

  linkTextMuted: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: COLORS.slate,
  },

  linkTextBrand: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 10,
    color: COLORS.brand,
  },

  // UPCOMING
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
  },

  countdownIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countdownTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 12,
    color: COLORS.navy,
    marginBottom: 2,
  },

  // EMPTY
  emptyIconWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  zzzBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  zzzText: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 10,
    color: '#047857',
  },

  // NOTICE BOXES
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
  },

  noticeBoxDanger: {
    backgroundColor: '#FEF2F2',
  },

  noticeTitle: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 11,
    color: '#002114',
    lineHeight: 16,
  },

  noticeText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    lineHeight: 16,
    color: '#475569',
    marginTop: 3,
  },

  protocolBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },

  protocolText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.navy,
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

  // MODALS
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

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
  },

  infoBannerText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 10,
    lineHeight: 15,
    color: '#047857',
  },

  fieldRow: {
    flexDirection: 'row',
    gap: 8,
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
