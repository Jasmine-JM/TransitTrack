import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
import { LineChart } from 'react-native-chart-kit';

// Alert.alert does nothing on react-native-web, so fall back to window.alert there.
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    (globalThis as any).alert?.(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Transit');

  const trackVehicle = (vehicle: string) => {
    showAlert('Track Vehicle', `${vehicle} is being tracked.`);
  };

  const appContent = (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.headerLeft,
              pressed && styles.trackPressed,
            ]}
            onPress={() =>
              showAlert(
                'TransitTrack',
                'Home dashboard.'
              )
            }
          >
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.homeLogo}
              resizeMode="contain"
            />

            <View style={styles.brandTextContainer}>
              <Text style={styles.brandName}>
                TransitTrack
              </Text>

              <Text style={styles.homeLabel}>
                Home
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.profileCircle,
              pressed && styles.trackPressed,
            ]}
            onPress={() => router.push('/profile')}
          >
            <Ionicons
              name="person"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >

          {/* TELEMETRY */}
          <Pressable
            style={({ pressed }) => [
              styles.telemetryRow,
              pressed && styles.trackPressed,
            ]}
            onPress={() =>
              showAlert(
                'Live Telemetry',
                'Live telemetry is currently active.'
              )
            }
          >
            <View style={styles.telemetryLeft}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                LIVE TELEMETRY ACTIVE
              </Text>
            </View>

            {/* 4G HIGH SYNC */}
            <View style={styles.connectionBox}>
              <Ionicons
                name="radio-outline"
                size={16}
                color="#5D91E8"
              />

              <View style={styles.connectionTextContainer}>
                <Text style={styles.connectionText}>
                  4G High
                </Text>

                <Text style={styles.syncText}>
                  Sync
                </Text>
              </View>
            </View>
          </Pressable>

          {/* GREETING */}
          <Text style={styles.greeting}>
            Good morning, Jasmine
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.locationRow,
              pressed && styles.trackPressed,
            ]}
            onPress={() =>
              showAlert(
                'Current Location',
                'Near Camp Phillips Terminal, Manolo Fortich'
              )
            }
          >
            <Ionicons
              name="location-outline"
              size={19}
              color="#3578D4"
            />

            <Text style={styles.locationText}>
              Near Camp Phillips Terminal, Manolo Fortich
            </Text>
          </Pressable>

          {/* SEARCH */}
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={23}
              color="#758092"
            />

            <TextInput
              style={styles.searchText}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Where in CDO? (Agora / Limketkai)"
              placeholderTextColor="#758092"
              numberOfLines={1}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={({ pressed }) => [
                pressed && styles.trackPressed,
              ]}
              onPress={() =>
                showAlert(
                  'Search Options',
                  'Search filters coming soon.'
                )
              }
            >
              <Ionicons
                name="options-outline"
                size={21}
                color="#758092"
              />
            </Pressable>
          </View>

          {/* ROUTE CARD */}
          <Pressable
            style={({ pressed }) => [
              styles.routeCard,
              pressed && styles.trackPressed,
            ]}
            onPress={() =>
              showAlert(
                'Route',
                'Camp Phillips to CDO Corridor'
              )
            }
          >
            <View style={styles.routeTop}>

              <View style={styles.routeIconBox}>
                <MaterialCommunityIcons
                  name="transit-connection-variant"
                  size={23}
                  color="#1675E8"
                />
              </View>

              <View style={styles.routeDescription}>
                <Text style={styles.routeTitle}>
                  Camp Phillips to CDO
                </Text>

                <Text style={styles.routeTitle}>
                  Corridor
                </Text>

                <Text style={styles.routeSubtitle}>
                  Via Alae Junction & Sayre Hwy
                </Text>

                <Text style={styles.routeSubtitle}>
                  descent
                </Text>
              </View>

              <View style={styles.speedBadge}>
                <Text style={styles.speedText}>
                  42 km/h
                </Text>

                <Text style={styles.speedText}>
                  avg
                </Text>
              </View>
            </View>

            {/* SMOOTH ROUTE GRAPH */}
            <View style={styles.graphArea}>
              <LineChart
                data={{
                  labels: ['', '', '', '', '', '', ''],
                  datasets: [
                    {
                      data: [
                        42,
                        50,
                        72,
                        54,
                        68,
                        47,
                        30,
                      ],
                    },
                  ],
                }}
                width={326}
                height={100}
                withDots={false}
                withShadow={false}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={false}
                withVerticalLabels={false}
                withHorizontalLabels={false}
                fromZero={false}
                bezier
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: () => '#126FE4',
                  labelColor: () => 'transparent',
                  propsForBackgroundLines: {
                    strokeWidth: 0,
                  },
                  propsForDots: {
                    r: '0',
                    strokeWidth: '0',
                  },
                }}
                style={styles.routeChart}
              />

              <View style={styles.bluePoint} />

              <View style={styles.redPoint} />

              <View style={styles.endPoint} />
            </View>

            {/* ROUTE LABELS */}
            <View style={styles.routeLabels}>

              <View style={styles.routeLabelBlock}>
                <Text
                  style={styles.routePlace}
                  numberOfLines={1}
                >
                  Camp Phillips
                </Text>

                <Text style={styles.routeDistance}>
                  620m ASL
                </Text>
              </View>

              <View
                style={[
                  styles.routeLabelBlock,
                  styles.routeMiddle,
                ]}
              >
                <Text
                  style={styles.routePlace}
                  numberOfLines={1}
                >
                  Alae Junction
                </Text>

                <Text
                  style={styles.routeSmall}
                  numberOfLines={1}
                >
                  Descent Waypoint
                </Text>
              </View>

              <View
                style={[
                  styles.routeLabelBlock,
                  styles.routeEnd,
                ]}
              >
                <Text
                  style={styles.routePlace}
                  numberOfLines={1}
                >
                  Agora / Limketkai
                </Text>

                <Text style={styles.routeDistance}>
                  10m ASL
                </Text>
              </View>

            </View>
          </Pressable>

          {/* TRANSIT FILTERS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >

            {/* ALL TRANSIT */}
            <Pressable
              style={({ pressed }) => [
                activeFilter === 'All Transit'
                  ? styles.activeFilter
                  : styles.filterButton,
                pressed && styles.trackPressed,
              ]}
              onPress={() =>
                setActiveFilter('All Transit')
              }
            >
              <Ionicons
                name="grid"
                size={16}
                color={
                  activeFilter === 'All Transit'
                    ? '#FFFFFF'
                    : '#2371D8'
                }
              />

              <Text
                style={
                  activeFilter === 'All Transit'
                    ? styles.activeFilterText
                    : styles.filterText
                }
              >
                All Transit
              </Text>
            </Pressable>

            {/* LIBTRANSCO */}
            <Pressable
              style={({ pressed }) => [
                activeFilter === 'Libtransco'
                  ? styles.activeFilter
                  : styles.filterButton,
                pressed && styles.trackPressed,
              ]}
              onPress={() =>
                setActiveFilter('Libtransco')
              }
            >
              <MaterialCommunityIcons
                name="bus"
                size={17}
                color={
                  activeFilter === 'Libtransco'
                    ? '#FFFFFF'
                    : '#2371D8'
                }
              />

              <Text
                style={
                  activeFilter === 'Libtransco'
                    ? styles.activeFilterText
                    : styles.filterText
                }
              >
                Libtransco
              </Text>
            </Pressable>

            {/* MACATRANSCO */}
            <Pressable
              style={({ pressed }) => [
                activeFilter === 'Macatransco'
                  ? styles.activeFilter
                  : styles.filterButton,
                pressed && styles.trackPressed,
              ]}
              onPress={() =>
                setActiveFilter('Macatransco')
              }
            >
              <MaterialCommunityIcons
                name="bus"
                size={17}
                color={
                  activeFilter === 'Macatransco'
                    ? '#FFFFFF'
                    : '#2371D8'
                }
              />

              <Text
                style={
                  activeFilter === 'Macatransco'
                    ? styles.activeFilterText
                    : styles.filterText
                }
              >
                Macatransco
              </Text>
            </Pressable>

            {/* MAFORTRANSCO */}
            <Pressable
              style={({ pressed }) => [
                activeFilter === 'Mafortransco'
                  ? styles.activeFilter
                  : styles.filterButton,
                pressed && styles.trackPressed,
              ]}
              onPress={() =>
                setActiveFilter('Mafortransco')
              }
            >
              <MaterialCommunityIcons
                name="bus"
                size={17}
                color={
                  activeFilter === 'Mafortransco'
                    ? '#FFFFFF'
                    : '#2371D8'
                }
              />

              <Text
                style={
                  activeFilter === 'Mafortransco'
                    ? styles.activeFilterText
                    : styles.filterText
                }
              >
                Mafortransco
              </Text>
            </Pressable>

            {/* SUV */}
            <Pressable
              style={({ pressed }) => [
                activeFilter === 'SUV'
                  ? styles.activeFilter
                  : styles.filterButton,
                pressed && styles.trackPressed,
              ]}
              onPress={() =>
                setActiveFilter('SUV')
              }
            >
              <MaterialCommunityIcons
                name="van-passenger"
                size={17}
                color={
                  activeFilter === 'SUV'
                    ? '#FFFFFF'
                    : '#2371D8'
                }
              />

              <Text
                style={
                  activeFilter === 'SUV'
                    ? styles.activeFilterText
                    : styles.filterText
                }
              >
                SUV
              </Text>
            </Pressable>

          </ScrollView>

          {/* ARRIVING VEHICLES */}
          <View style={styles.sectionHeader}>

            <View style={styles.arrivingTitleRow}>
              <Text style={styles.sectionTitle}>
                Arriving Vehicles
              </Text>

              <View style={styles.liveBadge}>
                <View style={styles.smallLiveDot} />

                <Text style={styles.liveBadgeText}>
                  Live
                </Text>
              </View>
            </View>

            <Text style={styles.highwayText}>
              SAYRE HWY
            </Text>

          </View>

          {/* BUS 1 */}
          {(activeFilter === 'All Transit' || activeFilter === 'Libtransco') && (
          <VehicleCard
            icon="bus"
            title="Libtransco Bus #104"
            subtitle="Drop-off: Agora Terminal"
            time="4"
            status="On Time"
            route="Via Gusa Coastal Road"
            live
            onTrack={() =>
              trackVehicle('Libtransco Bus #104')
            }
          />
          )}

          {/* BUS 2 */}
          {(activeFilter === 'All Transit' || activeFilter === 'Macatransco') && (
          <VehicleCard
            icon="bus"
            title="Macatransco Bus #22"
            subtitle="Drop-off: Agora Terminal"
            time="9"
            status="On Time"
            route="Via Sayre Hwy & Puerto National Hwy"
            live
            onTrack={() =>
              trackVehicle('Macatransco Bus #22')
            }
          />
          )}

          {/* BUS 3 */}
          {(activeFilter === 'All Transit' || activeFilter === 'Mafortransco') && (
          <VehicleCard
            icon="bus"
            title="Mafortransco Bus #58"
            subtitle="Drop-off: Agora Terminal"
            time="15"
            status="Approaching"
            route="Via Sayre Hwy & National Highway"
            live
            onTrack={() =>
              trackVehicle('Mafortransco Bus #58')
            }
          />
          )}

          {/* SUV */}
          {(activeFilter === 'All Transit' || activeFilter === 'SUV') && (
          <VehicleCard
            icon="van"
            title="Camp Phillips SUV Express"
            subtitle="Direct Shuttle • Agora or Limketkai Center"
            time="18"
            status="On Time"
            route="Via Gusa Coastal Road & National Hwy"
            live
            onTrack={() =>
              trackVehicle('Camp Phillips SUV Express')
            }
          />
          )}

          <View style={styles.bottomSpace} />

        </ScrollView>

        {/* BOTTOM NAVIGATION */}
<View style={styles.bottomNav}>

  {/* HOME */}
  <Pressable
    style={({ pressed }) => [
      styles.navItem,
      pressed && styles.trackPressed,
    ]}
    onPress={() => router.navigate('/home')}
  >
    <Ionicons
      name="home"
      size={23}
      color="#1475E8"
    />

    <Text style={styles.activeNavText}>
      Home
    </Text>
  </Pressable>

  {/* MAP */}
  <Pressable
    style={({ pressed }) => [
      styles.navItem,
      pressed && styles.trackPressed,
    ]}
    onPress={() => router.navigate('/map')}
  >
    <Ionicons
      name="map-outline"
      size={23}
      color="#9AA5B5"
    />

    <Text style={styles.navText}>
      Map
    </Text>
  </Pressable>

  {/* ALERTS */}
  <Pressable
    style={({ pressed }) => [
      styles.navItem,
      pressed && styles.trackPressed,
    ]}
    onPress={() => router.navigate('/alerts')}
  >
    <View>
      <Ionicons
        name="notifications-outline"
        size={24}
        color="#9AA5B5"
      />

      <View style={styles.notificationDot} />
    </View>

    <Text style={styles.navText}>
      Alerts
    </Text>
  </Pressable>

  {/* SAVED */}
  <Pressable
    style={({ pressed }) => [
      styles.navItem,
      pressed && styles.trackPressed,
    ]}
    onPress={() => router.navigate('/saved')}
  >
    <Ionicons
      name="bookmark-outline"
      size={23}
      color="#9AA5B5"
    />

    <Text style={styles.navText}>
      Saved
    </Text>
  </Pressable>

</View>
      </View>
    </SafeAreaView>
  );

  /*
   * WEB
   *
   * Desktop shows the application inside
   * a realistic phone-sized frame.
   *
   * Native/mobile renders normally.
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

/* ==================================================
   VEHICLE CARD
   ================================================== */

type VehicleCardProps = {
  icon: 'bus' | 'van';
  title: string;
  subtitle: string;
  time: string;
  status: string;
  route: string;
  live?: boolean;
  onTrack: () => void;
};

function VehicleCard({
  icon,
  title,
  subtitle,
  time,
  status,
  route,
  live,
  onTrack,
}: VehicleCardProps) {
  return (
    <View style={styles.vehicleCard}>

      <View style={styles.vehicleTop}>

        <View style={styles.vehicleIconBox}>
          <MaterialCommunityIcons
            name={
              icon === 'bus'
                ? 'bus'
                : 'van-passenger'
            }
            size={27}
            color="#1475E8"
          />
        </View>

        <View style={styles.vehicleInfo}>
          <Text
            style={styles.vehicleTitle}
            numberOfLines={2}
          >
            {title}
          </Text>

          <Text
            style={styles.vehicleSubtitle}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            status === 'Approaching' &&
              styles.approachingBadge,
          ]}
        >
          {(live || status === 'Approaching') && (
            <View
              style={[
                styles.statusDot,
                status === 'Approaching' &&
                  styles.approachingDot,
              ]}
            />
          )}

          <Text
            style={[
              styles.statusText,
              status === 'Approaching' &&
                styles.approachingText,
            ]}
          >
            {status}
          </Text>
        </View>

      </View>

      <View style={styles.vehicleBottom}>

        <View style={styles.vehicleBottomLeft}>

          <View style={styles.timeRow}>
            <Text style={styles.timeNumber}>
              {time}
            </Text>

            <Text style={styles.timeText}>
              min away
            </Text>
          </View>

          <View style={styles.routeBadge}>
            <Ionicons
              name="shuffle-outline"
              size={14}
              color="#2478D9"
            />

            <Text
              style={styles.routeBadgeText}
              numberOfLines={2}
            >
              {route}
            </Text>
          </View>

        </View>

        <Pressable
          style={({ pressed }) => [
            styles.trackButton,
            live && styles.liveTrackButton,
            pressed && styles.trackPressed,
          ]}
          onPress={onTrack}
        >
          <Text
            style={[
              styles.trackText,
              live && styles.liveTrackText,
            ]}
          >
            {live ? 'Track Live' : 'Track'}
          </Text>

          <Ionicons
            name="navigate-circle-outline"
            size={17}
            color={
              live
                ? '#FFFFFF'
                : '#1475E8'
            }
          />
        </Pressable>

      </View>
    </View>
  );
}

/* ==================================================
   STYLES
   ================================================== */

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
    backgroundColor: '#F7F9FC',
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
    backgroundColor: '#F7F9FC',
  },

  screen: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  /* ==================================================
     HEADER
     ================================================== */

  header: {
    minHeight: 70,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E8EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  homeLogo: {
    width: 44,
    height: 44,
    marginRight: 9,
  },

  brandTextContainer: {
    flexShrink: 1,
  },

  brandName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  homeLabel: {
    fontSize: 13,
    color: '#176FE5',
    marginTop: 1,
  },

  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#273548',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDE3EA',
  },

  /* ==================================================
     SCROLL
     ================================================== */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  /* ==================================================
     TELEMETRY
     ================================================== */

  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  telemetryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  liveDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2778E8',
    marginRight: 7,
    borderWidth: 2,
    borderColor: '#A9D1FF',
  },

  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2876D7',
    letterSpacing: 0.25,
    flexShrink: 1,
  },

  connectionBox: {
    width: 82,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE2EA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  connectionTextContainer: {
    marginLeft: 6,
    justifyContent: 'center',
  },

  connectionText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    color: '#4F5967',
  },

  syncText: {
    fontSize: 9,
    lineHeight: 11,
    color: '#7A8492',
    marginTop: 1,
  },

  /* ==================================================
     GREETING
     ================================================== */

  greeting: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '700',
    color: '#111827',
    marginTop: 14,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 18,
  },

  locationText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#596474',
    marginLeft: 6,
    flex: 1,
  },

  /* ==================================================
     SEARCH
     ================================================== */

  searchBox: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE3EA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  searchText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: '#303743',
    marginHorizontal: 10,
    paddingVertical: 0,
  },

  /* ==================================================
     ROUTE CARD
     ================================================== */

  routeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE3EA',
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
  },

  routeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  routeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EDF6FF',
    borderWidth: 1,
    borderColor: '#C7E1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  routeDescription: {
    flex: 1,
    minWidth: 0,
  },

  routeTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: '#1B2432',
  },

  routeSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: '#727C8B',
    marginTop: 1,
  },

  speedBadge: {
    minWidth: 58,
    backgroundColor: '#EFF7FF',
    borderWidth: 1,
    borderColor: '#D3E6FC',
    borderRadius: 18,
    paddingHorizontal: 7,
    paddingVertical: 6,
    alignItems: 'center',
    marginLeft: 5,
  },

  speedText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#2474D5',
    fontWeight: '700',
  },

  /* ==================================================
     SMOOTH ROUTE GRAPH
     ================================================== */

  graphArea: {
    height: 100,
    marginTop: 10,
    position: 'relative',
    overflow: 'hidden',
  },

  routeChart: {
    marginLeft: -4,
    paddingRight: 0,
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },

  bluePoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#126FE4',
    top: 51,
    left: 4,
    zIndex: 3,
  },

  redPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E85C5C',
    top: 29,
    left: '50%',
    zIndex: 3,
  },

  endPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#126FE4',
    top: 31,
    right: 4,
    zIndex: 3,
  },

  /* ==================================================
     ROUTE LABELS
     ================================================== */

  routeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
    paddingTop: 8,
  },

  routeLabelBlock: {
    flex: 1,
    minWidth: 0,
  },

  routePlace: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: '#303743',
  },

  routeDistance: {
    fontSize: 10,
    color: '#2474D5',
    fontWeight: '700',
    marginTop: 1,
  },

  routeMiddle: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  routeSmall: {
    fontSize: 9,
    color: '#727C8B',
    marginTop: 1,
  },

  routeEnd: {
    alignItems: 'flex-end',
    paddingLeft: 4,
  },

  /* ==================================================
     FILTERS
     ================================================== */

  filterScroll: {
    marginBottom: 19,
  },

  filterContent: {
    gap: 7,
    paddingRight: 4,
  },

  activeFilter: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1475E8',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },

  filterButton: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8DEE7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterText: {
    color: '#596474',
    fontSize: 12,
    marginLeft: 6,
  },

  /* ==================================================
     ARRIVING
     ================================================== */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  arrivingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF7FF',
    borderWidth: 1,
    borderColor: '#C7E1FF',
    borderRadius: 13,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 6,
  },

  smallLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4D9AFF',
    marginRight: 4,
  },

  liveBadgeText: {
    color: '#3E83DB',
    fontSize: 10,
  },

  highwayText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#737D8C',
    marginLeft: 5,
  },

  /* ==================================================
     VEHICLE CARD
     ================================================== */

  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE3EA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  vehicleTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  vehicleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF7FF',
    borderWidth: 1,
    borderColor: '#C9E2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  vehicleInfo: {
    flex: 1,
    minWidth: 0,
  },

  vehicleTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: '#172030',
  },

  vehicleSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#7A8492',
    marginTop: 2,
  },

  statusBadge: {
    minWidth: 69,
    borderRadius: 14,
    backgroundColor: '#ECFBF5',
    borderWidth: 1,
    borderColor: '#B8EED8',
    paddingHorizontal: 6,
    paddingVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 5,
  },

  approachingBadge: {
    backgroundColor: '#EFF7FF',
    borderColor: '#C6E0FF',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4EAA83',
    marginRight: 4,
  },

  approachingDot: {
    backgroundColor: '#2876D7',
  },

  statusText: {
    fontSize: 10,
    color: '#3D9B76',
    fontWeight: '600',
  },

  approachingText: {
    color: '#2876D7',
  },

  vehicleBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  vehicleBottomLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  timeNumber: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '700',
    color: '#111827',
  },

  timeText: {
    fontSize: 12,
    color: '#6E7785',
    marginLeft: 5,
  },

  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E0E5EB',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginTop: 4,
    maxWidth: '100%',
  },

  routeBadgeText: {
    flexShrink: 1,
    fontSize: 9,
    lineHeight: 13,
    color: '#687486',
    marginLeft: 4,
  },

  trackButton: {
    minWidth: 94,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F4F8',
    borderWidth: 1,
    borderColor: '#E1E5EA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  liveTrackButton: {
    backgroundColor: '#0875E8',
    borderColor: '#0875E8',
  },

  trackPressed: {
    opacity: 0.7,
  },

  trackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#172030',
    marginRight: 4,
  },

  liveTrackText: {
    color: '#FFFFFF',
  },

  /* ==================================================
     BOTTOM NAVIGATION
     ================================================== */

  bottomNav: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E5EA',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeNavText: {
    fontSize: 10,
    color: '#1475E8',
    fontWeight: '700',
    marginTop: 2,
  },

  navText: {
    fontSize: 10,
    color: '#9AA5B5',
    marginTop: 2,
  },

  notificationDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#1475E8',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  bottomSpace: {
    height: 10,
  },
});