import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Svg, {
  Rect,
  Circle,
  Line,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

function MiniField({ size = 120 }) {
  const w = size;
  const h = size * 0.5;
  const lw = 1.5;

  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="fieldGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1a5c35" />
          <Stop offset="1" stopColor="#145229" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={w} height={h} fill="url(#fieldGrad)" rx={6} />
      <Rect x={2} y={2} width={w - 4} height={h - 4} stroke="#ffffff40" strokeWidth={lw} fill="none" rx={4} />
      <Line x1={w / 2} y1={2} x2={w / 2} y2={h - 2} stroke="#ffffff40" strokeWidth={lw} />
      <Circle cx={w / 2} cy={h / 2} r={h * 0.18} stroke="#ffffff40" strokeWidth={lw} fill="none" />
      <Circle cx={w / 2} cy={h / 2} r={2} fill="#ffffff60" />
      <Rect x={2} y={h * 0.2} width={w * 0.15} height={h * 0.6} stroke="#ffffff40" strokeWidth={lw} fill="none" />
      <Rect x={w - w * 0.15 - 2} y={h * 0.2} width={w * 0.15} height={h * 0.6} stroke="#ffffff40" strokeWidth={lw} fill="none" />
      <Circle cx={w * 0.12} cy={h / 2} r={2} fill="#ffffff60" />
      <Circle cx={w * 0.88} cy={h / 2} r={2} fill="#ffffff60" />
    </Svg>
  );
}

export default function HomeScreen({ navigation }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <MiniField size={width * 0.55} />
          </Animated.View>
          <Text style={styles.appTitle}>FUTSAL COACH PRO</Text>
          <Text style={styles.appSubtitle}>تاکتیک • انیمیشن • تحلیل</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => navigation.navigate('TacticBoard', { playId: null })}
            activeOpacity={0.85}
          >
            <Text style={styles.btnIcon}>⚽</Text>
            <View>
              <Text style={styles.btnTitle}>بازی جدید</Text>
              <Text style={styles.btnSub}>طراحی تاکتیک و انیمیشن</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => navigation.navigate('SavedPlays')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnIcon}>📂</Text>
            <View>
              <Text style={styles.btnTitle}>بازی‌های ذخیره شده</Text>
              <Text style={styles.btnSub}>مشاهده و ویرایش</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: '🎨', text: 'ابزار نقاشی حرفه‌ای' },
            { icon: '🎬', text: 'انیمیشن فریم به فریم' },
            { icon: '💾', text: 'ذخیره و اشتراک‌گذاری' },
          ].map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.version}>نسخه ۱.۰</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    gap: 14,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#4ade80',
    letterSpacing: 6,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 14,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: '#166534',
    borderColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnSecondary: {
    backgroundColor: '#1e1b4b',
    borderColor: '#818cf8',
  },
  btnIcon: {
    fontSize: 32,
  },
  btnTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'right',
  },
  btnSub: {
    fontSize: 12,
    color: '#a3e635',
    marginTop: 2,
    textAlign: 'right',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  version: {
    color: '#1e293b',
    fontSize: 12,
  },
});
