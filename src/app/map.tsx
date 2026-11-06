
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

export default function MapScreen() {
  const [arrivalChime, setArrivalChime] = useState(true);
  const [selectedBus, setSelectedBus] = useState('Libtransco #104');

  const go = (path: string) => router.navigate(path as any);

  const nav = [
    { label: 'Home', icon: 'home-outline', path: '/home' },
    { label: 'Map', icon: 'map', path: '/map' },
    { label: 'Alerts', icon: 'notifications-outline', path: '/alerts' },
    { label: 'Saved', icon: 'bookmark-outline', path: '/saved' },
  ];

  const content = (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.brandName}>TransitTrack</Text>
              <Text style={styles.blue}>Live Map</Text>
            </View>
          </View>
          <Pressable style={styles.avatar} onPress={() => go('/profile')}>
            <Ionicons name="person" size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.mapArea}>
          <View style={styles.roadOne} />
          <View style={styles.roadTwo} />
          <View style={styles.mainRoute} />

          <View style={styles.speedBadge}>
            <View style={styles.dot} />
            <Text style={styles.bold}>48 km/h</Text>
            <Text style={styles.muted}>•</Text>
            <Text style={styles.blue}>GPS Accurate</Text>
          </View>

          <View style={styles.busMarker}>
            <Ionicons name="bus" size={25} color="#0875E8" />
          </View>

          <View style={styles.busLabel}>
            <Text style={styles.bold}>Libtransco #104</Text>
          </View>

          <View style={styles.otherMarker}>
            <Ionicons name="bus" size={22} color="#475569" />
          </View>

          <View style={styles.otherLabel}>
            <Text style={styles.bold}>UV #088 • 40 km/h</Text>
          </View>

          <View style={styles.routeLabel}>
            <Text style={styles.blue}>ROUTE</Text>
            <Text style={styles.muted}>Camp Phillips — CDO Corridor</Text>
          </View>
        </View>

        <ScrollView
          style={styles.details}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.busChoices}>
            {['Libtransco #104', 'Macatransco #22'].map((bus) => (
              <Pressable
                key={bus}
                onPress={() => setSelectedBus(bus)}
                style={[
                  styles.choice,
                  selectedBus === bus && styles.choiceActive,
                ]}
              >
                <Text style={styles.bold}>{bus}</Text>
                <Text style={styles.small}>3m</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.blue}>DIRECT BUS</Text>
            <Text style={styles.green}>● On Track</Text>
          </View>

          <Text style={styles.title}>{selectedBus}</Text>
          <Text style={styles.muted}>Camp Phillips → CDO Agora Terminal</Text>

          <View style={styles.arrivalCard}>
            <Text style={styles.cardLabel}>ESTIMATED ARRIVAL</Text>
            <Text style={styles.arrival}>
              3 <Text style={styles.arrivalSmall}>min away</Text>
            </Text>
            <Text style={styles.bold}>⌖ Next: Camp Phillips Exit / Alae Junction</Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.cardLabel}>ROUTE PROGRESS</Text>
            {[
              ['✓', 'Camp Phillips Main Terminal', '07:15 AM', 'Departed on schedule'],
              ['●', 'Alae Junction', '07:28 AM', 'Arriving in ~3 minutes'],
              ['○', 'Puerto Flyover / Sayre Hwy Exit', '07:42 AM', 'Via National Hwy'],
              ['⚑', 'Agora Terminal, CDO', '08:05 AM', 'Final Destination'],
            ].map((item, index) => (
              <View style={styles.stop} key={item[1]}>
                <Text style={[styles.stopIcon, index < 2 && styles.blue]}>
                  {item[0]}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bold}>{item[1]}</Text>
                  <Text style={styles.muted}>{item[3]}</Text>
                </View>
                <Text style={styles.muted}>{item[2]}</Text>
              </View>
            ))}
          </View>

          <View style={styles.chimeCard}>
            <Ionicons name="notifications-outline" size={25} color="#0875E8" />
            <View style={{ flex: 1 }}>
              <Text style={styles.bold}>Arrival chime</Text>
              <Text style={styles.muted}>Vibrate 500m before Alae</Text>
            </View>
            <Switch value={arrivalChime} onValueChange={setArrivalChime} />
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          {nav.map((item) => (
            <Pressable
              key={item.label}
              style={styles.navItem}
              onPress={() => go(item.path)}
            >
              <Ionicons
                name={item.icon as any}
                size={22}
                color={item.label === 'Map' ? '#0875E8' : '#8290A4'}
              />
              <Text style={[
                styles.navText,
                item.label === 'Map' && styles.activeText,
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.web}>
        <View style={styles.phone}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F8FC' },
  page: { flex: 1, backgroundColor: '#F5F8FC' },
  web: { flex: 1, minHeight: '100%', backgroundColor: '#E7EBF0', alignItems: 'center', justifyContent: 'center', padding: 12 },
  phone: { width: 390, height: 844, maxWidth: '100%', maxHeight: '100%', overflow: 'hidden', borderRadius: 30, backgroundColor: '#F5F8FC' },
  header: { height: 65, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#E5EAF1' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 36, height: 36 },
  brandName: { fontSize: 16, fontWeight: '800', color: '#182437' },
  blue: { color: '#0875E8', fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 20, backgroundColor: '#26364B', alignItems: 'center', justifyContent: 'center' },
  mapArea: { height: 290, backgroundColor: '#E7EDF5', overflow: 'hidden' },
  roadOne: { position: 'absolute', width: 500, height: 2, backgroundColor: '#FFF', top: 75, left: -30, transform: [{ rotate: '-8deg' }] },
  roadTwo: { position: 'absolute', width: 500, height: 2, backgroundColor: '#FFF', top: 190, left: -30, transform: [{ rotate: '5deg' }] },
  mainRoute: { position: 'absolute', width: 390, height: 7, backgroundColor: '#1689E9', top: 145, left: 40, transform: [{ rotate: '-48deg' }], borderRadius: 8 },
  speedBadge: { position: 'absolute', top: 14, left: 14, backgroundColor: '#FFF', padding: 10, borderRadius: 22, flexDirection: 'row', gap: 8, alignItems: 'center', elevation: 3 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#3185F5' },
  bold: { fontWeight: '700', color: '#1D293D', fontSize: 13 },
  muted: { color: '#718096', fontSize: 12 },
  busMarker: { position: 'absolute', top: 125, left: '43%', width: 52, height: 52, borderRadius: 28, backgroundColor: '#FFF', borderWidth: 3, borderColor: '#3185F5', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  busLabel: { position: 'absolute', top: 182, left: '34%', backgroundColor: '#FFF', padding: 7, borderRadius: 15, elevation: 3 },
  otherMarker: { position: 'absolute', top: 62, right: 85, width: 42, height: 42, borderRadius: 24, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  otherLabel: { position: 'absolute', top: 108, right: 22, backgroundColor: '#FFF', padding: 9, borderRadius: 18, elevation: 3 },
  routeLabel: { position: 'absolute', bottom: 10, left: 15, right: 15, backgroundColor: '#FFF', padding: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between' },
  details: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  busChoices: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  choice: { flex: 1, padding: 10, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center' },
  choiceActive: { backgroundColor: '#E5F0FF', borderWidth: 1, borderColor: '#A8CEFF' },
  small: { color: '#0875E8', fontSize: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  green: { color: '#059669', fontWeight: '700', fontSize: 12 },
  title: { fontSize: 21, fontWeight: '800', color: '#172033', marginBottom: 4 },
  arrivalCard: { marginTop: 18, padding: 18, borderRadius: 16, backgroundColor: '#F1F7FF', borderWidth: 1, borderColor: '#D4E5FF', gap: 10 },
  cardLabel: { color: '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
  arrival: { fontSize: 42, color: '#0875E8', fontWeight: '900' },
  arrivalSmall: { fontSize: 18 },
  progressCard: { marginTop: 18, padding: 16, borderRadius: 16, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', gap: 18 },
  stop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  stopIcon: { fontSize: 22, color: '#94A3B8', width: 25 },
  chimeCard: { marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 12 },
  bottomNav: { height: 66, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E5EAF1', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center', gap: 3, flex: 1 },
  navText: { color: '#8290A4', fontSize: 11 },
  activeText: { color: '#0875E8', fontWeight: '800' },
});
