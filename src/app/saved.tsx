
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image, Platform, Pressable, SafeAreaView, ScrollView,
    StyleSheet, Text, View,
} from 'react-native';

// Alert.alert does nothing on react-native-web, so fall back to window.alert there.
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    (globalThis as any).alert?.(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

export default function SavedScreen() {
  const [savedStops, setSavedStops] = useState([
    'Alae Junction Stop (Home)',
    'RTMI Bus #218 (Express)',
    'Agora Terminal (Work)',
  ]);

  const go = (path: string) => router.navigate(path as any);

  const removeStop = (stop: string) => {
    setSavedStops((current) => current.filter((item) => item !== stop));
  };

  const content = (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={styles.brandName}>TransitTrack</Text>
              <Text style={styles.blue}>Saved</Text>
            </View>
          </View>
          <Pressable style={styles.avatar} onPress={() => go('/profile')}>
            <Ionicons name="person" size={19} color="#FFF" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <Text style={styles.sectionLabel}>SAVED DESTINATIONS</Text>
              <Ionicons name="bookmark" size={22} color="#0875E8" />
            </View>
            <Text style={styles.heroTitle}>Your Stops & Favorite Routes</Text>
            <Text style={styles.subtitle}>Quick access to your daily commute and saved destinations.</Text>
            <View style={styles.stats}>
              <View style={styles.stat}><Text style={styles.statNumber}>{savedStops.length}</Text><Text style={styles.subtitle}>Saved Stops</Text></View>
              <View style={styles.stat}><Text style={styles.statNumber}>42 km</Text><Text style={styles.subtitle}>Corridor</Text></View>
              <View style={styles.stat}><Text style={styles.statNumber}>38 min</Text><Text style={styles.subtitle}>Avg Commute</Text></View>
            </View>
          </View>

          <View style={styles.liveRow}>
            <View style={styles.dot} />
            <Text style={styles.blue}>Live Mindanao GPS Sync Active</Text>
            <Text style={styles.subtitle}>Auto-refreshed</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HOME STOP</Text>
            <Text style={styles.sectionLabel}>Live Board</Text>
          </View>

          {savedStops.filter(x => x.includes('Home') || x.includes('Express')).map((stop) => (
            <View style={styles.stopCard} key={stop}>
              <View style={styles.iconBox}><Ionicons name="bus-outline" size={23} color="#0875E8" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{stop}</Text>
                <Text style={styles.subtitle}>Sayre Hwy, Manolo Fortich • CDO Boundary</Text>
                <Text style={styles.blue}>Arriving soon • View live arrivals</Text>
              </View>
              <Pressable onPress={() => removeStop(stop)}>
                <Ionicons name="bookmark" size={20} color="#0875E8" />
              </Pressable>
            </View>
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>WORK</Text>
            <Text style={styles.sectionLabel}>Frequent: Mon–Fri</Text>
          </View>

          {savedStops.filter(x => x.includes('Work')).map((stop) => (
            <View style={styles.stopCard} key={stop}>
              <View style={styles.iconBox}><Ionicons name="briefcase-outline" size={23} color="#0875E8" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{stop}</Text>
                <Text style={styles.subtitle}>Gusa, Cagayan de Oro</Text>
                <Text style={styles.blue}>3 min away</Text>
              </View>
              <Pressable onPress={() => removeStop(stop)}>
                <Ionicons name="bookmark" size={20} color="#0875E8" />
              </Pressable>
            </View>
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FAVORITE</Text>
            <Text style={styles.sectionLabel}>Weekend Hub</Text>
          </View>

          <View style={styles.stopCard}>
            <View style={styles.iconBox}><Ionicons name="storefront-outline" size={23} color="#F59E0B" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>SM CDO Downtown (Shop)</Text>
              <Text style={styles.subtitle}>Claro M. Recto Avenue</Text>
              <Text style={styles.blue}>7 min away</Text>
            </View>
            <Ionicons name="bookmark" size={20} color="#0875E8" />
          </View>

          <View style={styles.routeCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PINNED TRANSIT LINES</Text>
              <Text style={styles.blue}>Active Corridor</Text>
            </View>
            <View style={styles.routeRow}>
              <Text style={styles.routeNumber}>90</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Route 90: Manolo Fortich ↔ CDO</Text>
                <Text style={styles.subtitle}>Every 8 minutes</Text>
              </View>
              <Ionicons name="star" color="#0875E8" size={20} />
            </View>
            <View style={styles.mapPreview}>
              <Ionicons name="map-outline" size={45} color="#0875E8" />
              <Text style={styles.blue}>Sayre Highway Northern Corridor</Text>
              <Text style={styles.subtitle}>Map preview</Text>
            </View>
            <Pressable style={styles.mapButton} onPress={() => go('/map')}>
              <Ionicons name="map-outline" color="#FFF" size={17} />
              <Text style={styles.buttonText}>View Live Map</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => showAlert('Add Destination', 'Destination search will be connected next.')}
          >
            <Ionicons name="add-circle-outline" size={19} color="#FFF" />
            <Text style={styles.buttonText}>Add New Destination or Stop</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomNav}>
          {[
            ['Home', 'home-outline', '/home'],
            ['Map', 'map-outline', '/map'],
            ['Alerts', 'notifications-outline', '/alerts'],
            ['Saved', 'bookmark', '/saved'],
          ].map(([label, icon, path]) => (
            <Pressable key={label} style={styles.navItem} onPress={() => go(path)}>
              <Ionicons name={icon as any} size={22} color={label === 'Saved' ? '#0875E8' : '#8290A4'} />
              <Text style={[styles.navText, label === 'Saved' && styles.active]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );

  if (Platform.OS === 'web') {
    return <View style={styles.web}><View style={styles.phone}>{content}</View></View>;
  }
  return content;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F8FC' },
  page: { flex: 1, backgroundColor: '#F5F8FC' },
  web: { flex: 1, minHeight: '100%', backgroundColor: '#E7EBF0', alignItems: 'center', justifyContent: 'center', padding: 12 },
  phone: { width: 390, height: 844, maxWidth: '100%', maxHeight: '100%', overflow: 'hidden', borderRadius: 30 },
  header: { height: 65, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#E5EAF1' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 36, height: 36 },
  brandName: { fontSize: 16, fontWeight: '800', color: '#182437' },
  blue: { color: '#0875E8', fontWeight: '700', fontSize: 11 },
  avatar: { width: 36, height: 36, borderRadius: 20, backgroundColor: '#26364B', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 14, paddingBottom: 25 },
  hero: { backgroundColor: '#FFF', borderRadius: 17, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionLabel: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  heroTitle: { fontSize: 19, fontWeight: '900', color: '#172033', marginTop: 9 },
  subtitle: { color: '#64748B', fontSize: 11, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 7, marginTop: 16 },
  stat: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 9 },
  statNumber: { fontSize: 15, fontWeight: '800', color: '#172033' },
  liveRow: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 5, backgroundColor: '#0875E8' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 9 },
  sectionTitle: { color: '#0875E8', fontSize: 11, fontWeight: '900' },
  stopCard: { backgroundColor: '#FFF', borderRadius: 13, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconBox: { width: 40, height: 40, backgroundColor: '#EAF3FF', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: '#172033', fontWeight: '800', fontSize: 12 },
  routeCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 18 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeNumber: { backgroundColor: '#EAF3FF', color: '#0875E8', fontWeight: '900', padding: 10, borderRadius: 8 },
  mapPreview: { height: 115, backgroundColor: '#E6F0E9', borderRadius: 10, marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  mapButton: { backgroundColor: '#0875E8', borderRadius: 9, padding: 12, marginTop: 10, flexDirection: 'row', justifyContent: 'center', gap: 7 },
  buttonText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  addButton: { backgroundColor: '#0875E8', borderRadius: 10, padding: 14, marginTop: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  bottomNav: { height: 66, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E5EAF1', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navText: { color: '#8290A4', fontSize: 11 },
  active: { color: '#0875E8', fontWeight: '800' },
});
