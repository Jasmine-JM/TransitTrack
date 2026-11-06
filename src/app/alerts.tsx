
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image, Platform, Pressable, SafeAreaView, ScrollView,
    StyleSheet, Text, View,
} from 'react-native';

const alerts = [
  {
    type: 'DELAY',
    title: 'Slow traffic along Mangima Zigzag Road',
    location: 'Sayre Hwy (KM 18–22), Manolo Fortich',
    description: 'Heavy truck breakdown and minor fog causing slow vehicular crawl descending toward Alae. RTMI buses and PUJs rerouting lane queues.',
    detail: '14 km/h (Normal: 42 km/h)',
    color: '#EF4444',
    icon: 'warning-outline',
    time: 'Updated 8 mins ago',
  },
  {
    type: 'SERVICE ADDED',
    title: 'Extra PUJs dispatched from Manolo Fortich for rush hour',
    location: 'Manolo Fortich Public Market Terminal',
    description: '12 additional Modern PUJs and 4 UV Express units deployed to handle morning commuter surge bound for CDO Agora and Cogon.',
    detail: 'Reduced by ~18 mins',
    color: '#0875E8',
    icon: 'bus-outline',
    time: 'Updated 22 mins ago',
  },
  {
    type: 'MINOR RE-ROUTE',
    title: 'Roadworks near Puerto National Highway',
    location: 'Puerto Flyover Interchange & Sayre Junction',
    description: 'Drainage improvement works near Puerto market. CDO-bound modern jeepneys diverted via Coastal Road diversion bypass.',
    detail: '+1.8 km distance (+4 mins)',
    color: '#F59E0B',
    icon: 'git-branch-outline',
    time: 'Updated 45 mins ago',
  },
];

export default function AlertsScreen() {
  const [filter, setFilter] = useState('All Alerts');
  const [saved, setSaved] = useState<number[]>([]);

  const go = (path: string) => router.navigate(path as any);

  const reportIncident = () => go('/report-incident');

  const content = (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={styles.brandName}>TransitTrack</Text>
              <Text style={styles.blue}>Transit Alerts</Text>
            </View>
          </View>
          <Pressable style={styles.avatar} onPress={() => go('/profile')}>
            <Ionicons name="person" size={19} color="#FFF" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.summary}>
            <Text style={styles.live}>● LIVE DISPATCH STREAM</Text>
            <Text style={styles.title}>Alerts & Route Updates</Text>
            <Text style={styles.subtitle}>Live conditions along Sayre Highway & CDO Corridors</Text>
            <View style={styles.stats}>
              <View style={styles.stat}><Text style={styles.statNumber}>10m</Text><Text style={styles.subtitle}>Avg Delay</Text></View>
              <View style={styles.stat}><Text style={styles.statNumber}>+16</Text><Text style={styles.subtitle}>Extra PUJs</Text></View>
              <View style={styles.stat}><Text style={[styles.statNumber, { color: '#059669' }]}>94%</Text><Text style={styles.subtitle}>Transit Flow</Text></View>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            {['All Alerts', 'Delays', 'Advisories'].map((item) => (
              <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
                <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {alerts
            .filter((item) =>
              filter === 'All Alerts' ||
              (filter === 'Delays' && item.type === 'DELAY') ||
              (filter === 'Advisories' && item.type !== 'DELAY')
            )
            .map((item) => {
              const index = alerts.indexOf(item);
              return (
                <View key={item.title} style={[styles.alertCard, { borderLeftColor: item.color }]}>
                  <View style={styles.typeRow}>
                    <Ionicons name={item.icon as any} size={19} color={item.color} />
                    <Text style={[styles.type, { color: item.color }]}>{item.type}</Text>
                    <Pressable onPress={() => setSaved((old) => old.includes(index) ? old.filter(x => x !== index) : [...old, index])}>
                      <Ionicons name={saved.includes(index) ? 'bookmark' : 'bookmark-outline'} size={21} color="#8290A4" />
                    </Pressable>
                  </View>
                  <Text style={styles.alertTitle}>{item.title}</Text>
                  <Text style={styles.location}>⌖ {item.location}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Transit Update</Text>
                    <Text style={styles.detail}>{item.detail}</Text>
                  </View>
                  <View style={styles.footer}>
                    <Text style={styles.time}>{item.time}</Text>
                    <Pressable onPress={() => go('/map')}>
                      <Text style={styles.blue}>Map ›</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

          <View style={styles.reportCard}>
            <Ionicons name="warning-outline" size={25} color="#EF4444" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Spotted a delay or obstruction?</Text>
              <Text style={styles.subtitle}>Help other commuters stay on schedule.</Text>
            </View>
            <Pressable style={styles.reportButton} onPress={reportIncident}>
              <Ionicons name="warning-outline" size={18} color="#FFF" />
              <Text style={styles.reportText}>Report a Road Incident / Delay</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          {[
            ['Home', 'home-outline', '/home'],
            ['Map', 'map-outline', '/map'],
            ['Alerts', 'notifications', '/alerts'],
            ['Saved', 'bookmark-outline', '/saved'],
          ].map(([label, icon, path]) => (
            <Pressable key={label} style={styles.navItem} onPress={() => go(path)}>
              <Ionicons name={icon as any} size={22} color={label === 'Alerts' ? '#0875E8' : '#8290A4'} />
              <Text style={[styles.navText, label === 'Alerts' && styles.active]}>{label}</Text>
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
  blue: { color: '#0875E8', fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 20, backgroundColor: '#26364B', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 14, paddingBottom: 24 },
  summary: { backgroundColor: '#FFF', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#E2EAF4', marginBottom: 15 },
  live: { color: '#0875E8', fontSize: 10, fontWeight: '800', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#172033' },
  subtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 7, marginTop: 17 },
  stat: { flex: 1, alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12 },
  statNumber: { fontSize: 19, fontWeight: '800', color: '#172033' },
  filters: { flexGrow: 0, marginBottom: 14 },
  filter: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 22, borderWidth: 1, borderColor: '#CBD5E1', marginRight: 8, backgroundColor: '#FFF' },
  filterActive: { backgroundColor: '#0875E8', borderColor: '#0875E8' },
  filterText: { color: '#475569', fontSize: 12 },
  filterTextActive: { color: '#FFF', fontWeight: '700' },
  alertCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 13, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 4 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  type: { fontSize: 10, fontWeight: '800', flex: 1 },
  alertTitle: { color: '#172033', fontSize: 15, fontWeight: '800', lineHeight: 21 },
  location: { color: '#0875E8', fontSize: 11, marginTop: 6 },
  description: { color: '#475569', fontSize: 12, lineHeight: 19, marginTop: 10 },
  detailBox: { backgroundColor: '#F5F8FC', borderRadius: 10, padding: 11, marginTop: 13 },
  detailLabel: { fontSize: 10, color: '#64748B' },
  detail: { fontSize: 12, fontWeight: '700', color: '#172033', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 13 },
  time: { color: '#64748B', fontSize: 10 },
  reportCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 5 },
  reportButton: { width: '100%', backgroundColor: '#0875E8', padding: 13, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  reportText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  bottomNav: { height: 66, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E5EAF1', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navText: { color: '#8290A4', fontSize: 11 },
  active: { color: '#0875E8', fontWeight: '800' },
});
