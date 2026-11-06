import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
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

const issues = [
  { label: 'Heavy Traffic', icon: 'speedometer-outline' },
  { label: 'Accident', icon: 'car-sport-outline' },
  { label: 'Breakdown', icon: 'build-outline' },
  { label: 'Roadworks', icon: 'construct-outline' },
  { label: 'Weather / Flooding', icon: 'rainy-outline' },
];

const locations = [
  'Sayre Hwy - Mangima / Alae',
  'Camp Phillips Terminal',
  'Alae Junction',
  'Puerto Flyover / Sayre Junction',
  'Agora Terminal, CDO',
];

const delays = [
  { label: '+5-10 min', color: '#059669' },
  { label: '+15-30 min', color: '#0875E8' },
  { label: '+45+ min', color: '#EF4444' },
  { label: 'BLOCKED / STOPPED', color: '#EF4444' },
];

// Alert.alert does nothing on react-native-web, so fall back to window.alert there.
const showAlert = (title: string, message: string, onDone?: () => void) => {
  if (Platform.OS === 'web') {
    (globalThis as any).alert?.(`${title}\n\n${message}`);
    onDone?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onDone }]);
  }
};

export default function ReportIncidentScreen() {
  const [issue, setIssue] = useState('Heavy Traffic');
  const [location, setLocation] = useState(locations[0]);
  const [showLocations, setShowLocations] = useState(false);
  const [delay, setDelay] = useState('+15-30 min');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const go = (path: string) => router.navigate(path as any);

  const submitReport = () => {
    if (!issue) {
      setMessage('Please choose an issue type.');
      return;
    }

    Keyboard.dismiss();

    showAlert(
      'Report Submitted',
      'Thank you! Your report will help other commuters on this route.',
      () => router.navigate('/alerts' as any)
    );
  };

  const content = (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={styles.brandName}>TransitTrack</Text>
              <Text style={styles.blue}>Report Incident</Text>
            </View>
          </View>
          <Pressable style={styles.avatar} onPress={() => go('/profile')}>
            <Ionicons name="person" size={19} color="#FFF" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* INLINE MESSAGE */}
          {message !== '' && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
              <Pressable onPress={() => setMessage('')}>
                <Ionicons name="close" size={16} color="#334155" />
              </Pressable>
            </View>
          )}

          {/* TITLE CARD */}
          <View style={styles.summary}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.live}>● COMMUNITY REPORT</Text>
                <Text style={styles.title}>Report Incident & Delay</Text>
                <Text style={styles.subtitle}>Notify fellow Mindanao commuters on this route</Text>
              </View>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={22} color="#0875E8" />
              </View>
            </View>
          </View>

          {/* 1. ISSUE TYPE */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>1. Issue Type</Text>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredText}>Required</Text>
              </View>
            </View>
            <View style={styles.chipWrap}>
              {issues.map((item) => {
                const active = issue === item.label;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => {
                      setIssue(item.label);
                      setMessage('');
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Ionicons name={item.icon as any} size={16} color={active ? '#FFF' : '#475569'} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 2. LOCATION / ROUTE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Location / Route</Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => setShowLocations((open) => !open)}
            >
              <Ionicons name="location-outline" size={18} color="#0875E8" />
              <Text style={styles.dropdownText} numberOfLines={1}>{location}</Text>
              <Ionicons name={showLocations ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" />
            </Pressable>

            {showLocations && (
              <View style={styles.dropdownList}>
                {locations.map((item) => (
                  <Pressable
                    key={item}
                    style={[styles.dropdownItem, item === location && styles.dropdownItemActive]}
                    onPress={() => {
                      setLocation(item);
                      setShowLocations(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, item === location && styles.blue]}>{item}</Text>
                    {item === location && <Ionicons name="checkmark" size={16} color="#0875E8" />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* 3. ESTIMATED DELAY */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>3. Estimated Delay</Text>
              <Text style={styles.hint}>Tap to select</Text>
            </View>
            <View style={styles.chipWrap}>
              {delays.map((item) => {
                const active = delay === item.label;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => setDelay(item.label)}
                    style={[styles.delayChip, active && styles.chipActive]}
                  >
                    <Text style={[styles.delayText, { color: item.color }, active && styles.chipTextActive]}>
                      {item.label}
                    </Text>
                    <View style={[styles.delayDot, { backgroundColor: active ? '#FFF' : item.color }]} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 4. SHORT NOTE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>4. Short Note</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Optional: brief details or landmark..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
          </View>

          {/* SUBMIT */}
          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
            onPress={submitReport}
          >
            <Ionicons name="paper-plane" size={17} color="#FFF" />
            <Text style={styles.submitText}>Submit Report</Text>
          </Pressable>

          {/* CANCEL */}
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <View style={styles.dot} />
            <Text style={styles.subtitle}>CDO-Bukidnon Transit Center • 24/7 Operations</Text>
          </View>
        </ScrollView>

        {/* BOTTOM NAV */}
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

  messageBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: '#E8F2FF', borderWidth: 1, borderColor: '#C7DFFF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, marginBottom: 12 },
  messageText: { flex: 1, color: '#334155', fontSize: 12 },

  summary: { backgroundColor: '#FFF', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#E2EAF4', marginBottom: 13 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  live: { color: '#0875E8', fontSize: 10, fontWeight: '800', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '900', color: '#172033' },
  subtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
  iconBox: { width: 40, height: 40, backgroundColor: '#EAF3FF', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 13, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { color: '#172033', fontSize: 15, fontWeight: '800' },
  requiredBadge: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3 },
  requiredText: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  hint: { color: '#64748B', fontSize: 10 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexBasis: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 11, paddingVertical: 11 },
  chipActive: { backgroundColor: '#0875E8' },
  chipText: { color: '#475569', fontSize: 12, fontWeight: '700', flexShrink: 1 },
  chipTextActive: { color: '#FFF', fontWeight: '800' },

  dropdown: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#F5F8FC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 13 },
  dropdownText: { flex: 1, color: '#172033', fontSize: 12, fontWeight: '700' },
  dropdownList: { marginTop: 6, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  dropdownItemActive: { backgroundColor: '#F1F7FF' },
  dropdownItemText: { color: '#475569', fontSize: 12 },

  delayChip: { flexBasis: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 13 },
  delayText: { fontSize: 12, fontWeight: '800', flexShrink: 1 },
  delayDot: { width: 7, height: 7, borderRadius: 4 },

  noteInput: { marginTop: 12, minHeight: 90, backgroundColor: '#F5F8FC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 12, color: '#172033', outlineStyle: 'none' } as any,

  submitButton: { backgroundColor: '#0875E8', borderRadius: 25, padding: 14, marginTop: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', padding: 14, marginTop: 4 },
  cancelText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.7 },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 5, backgroundColor: '#0875E8' },

  bottomNav: { height: 66, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E5EAF1', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navText: { color: '#8290A4', fontSize: 11 },
  active: { color: '#0875E8', fontWeight: '800' },
});
