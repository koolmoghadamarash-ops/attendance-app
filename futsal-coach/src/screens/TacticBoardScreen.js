import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Line,
  Polygon,
  Circle,
  G,
} from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import FutsalField from '../components/FutsalField';
import {
  pointsToSmoothPath,
  pointsToLinePath,
  getArrowPoints,
  findNearestPlayer,
  clampToField,
  interpolatePlayers,
} from '../utils/pathUtils';
import { savePlay, generateId } from '../utils/storage';

const { width: SW, height: SH } = Dimensions.get('window');

const FIELD_W = SW;
const FIELD_H = Math.round(SW * 0.54);
const FIELD_PAD = 8;
const PLAY_FIELD_X = FIELD_PAD;
const PLAY_FIELD_Y = FIELD_PAD;
const PLAY_FIELD_W = FIELD_W - FIELD_PAD * 2;
const PLAY_FIELD_H = FIELD_H - FIELD_PAD * 2;

const TEAM_A_COLOR = '#ef4444';
const TEAM_B_COLOR = '#3b82f6';
const BALL_COLOR = '#fbbf24';

const TOOLS = [
  { id: 'select', icon: '☝️', label: 'انتخاب' },
  { id: 'pen', icon: '✏️', label: 'قلم' },
  { id: 'arrow', icon: '➡️', label: 'فلش' },
  { id: 'line', icon: '📏', label: 'خط' },
  { id: 'zone', icon: '⭕', label: 'منطقه' },
  { id: 'erase', icon: '🗑️', label: 'پاک' },
];

const COLORS = [
  '#ffffff', '#fbbf24', '#ef4444', '#3b82f6', '#4ade80', '#f97316', '#a78bfa', '#000000',
];

const LINE_WIDTHS = [2, 4, 6];

function buildInitialPlayers(fw, fh, fx, fy) {
  const cx = fx + fw / 2;
  const cy = fy + fh / 2;
  const w = fw;
  const h = fh;
  return [
    // Team A
    { id: 'A1', team: 'A', number: 1, role: 'GK', x: fx + w * 0.07, y: cy },
    { id: 'A2', team: 'A', number: 2, role: 'LD', x: fx + w * 0.22, y: fy + h * 0.22 },
    { id: 'A3', team: 'A', number: 3, role: 'RD', x: fx + w * 0.22, y: fy + h * 0.78 },
    { id: 'A4', team: 'A', number: 4, role: 'LA', x: fx + w * 0.35, y: fy + h * 0.35 },
    { id: 'A5', team: 'A', number: 5, role: 'RA', x: fx + w * 0.35, y: fy + h * 0.65 },
    // Team B
    { id: 'B1', team: 'B', number: 1, role: 'GK', x: fx + w * 0.93, y: cy },
    { id: 'B2', team: 'B', number: 2, role: 'LD', x: fx + w * 0.78, y: fy + h * 0.22 },
    { id: 'B3', team: 'B', number: 3, role: 'RD', x: fx + w * 0.78, y: fy + h * 0.78 },
    { id: 'B4', team: 'B', number: 4, role: 'LA', x: fx + w * 0.65, y: fy + h * 0.35 },
    { id: 'B5', team: 'B', number: 5, role: 'RA', x: fx + w * 0.65, y: fy + h * 0.65 },
  ];
}

function buildInitialBall(fx, fy, fw, fh) {
  return { x: fx + fw / 2, y: fy + fh / 2 };
}

function PlayerMarker({ player, isSelected, isBall }) {
  const color = isBall
    ? BALL_COLOR
    : player.team === 'A'
    ? TEAM_A_COLOR
    : TEAM_B_COLOR;
  const size = isBall ? 18 : 26;
  const r = size / 2;

  return (
    <View
      style={[
        styles.marker,
        {
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: color,
          left: (isBall ? player.x : player.x) - r,
          top: (isBall ? player.y : player.y) - r,
          borderWidth: isSelected ? 2.5 : 1.5,
          borderColor: isSelected ? '#ffffff' : 'rgba(0,0,0,0.5)',
          shadowColor: color,
          shadowOpacity: 0.7,
          shadowRadius: isSelected ? 10 : 4,
          shadowOffset: { width: 0, height: 0 },
          elevation: isSelected ? 10 : 4,
          zIndex: isSelected ? 20 : 10,
        },
      ]}
      pointerEvents="none"
    >
      {!isBall && (
        <Text style={[styles.markerNum, { fontSize: player.number >= 10 ? 9 : 11 }]}>
          {player.number}
        </Text>
      )}
      {isBall && <Text style={styles.ballEmoji}>⚽</Text>}
    </View>
  );
}

function DrawingLayer({ paths, activePath, activeTool, activeColor, lineWidth }) {
  const renderPath = (p, key) => {
    if (!p.points || p.points.length < 2) return null;

    if (p.type === 'arrow') {
      const ap = getArrowPoints(p.points);
      if (!ap) return null;
      return (
        <G key={key}>
          <Line
            x1={ap.start.x}
            y1={ap.start.y}
            x2={ap.lineEndX}
            y2={ap.lineEndY}
            stroke={p.color}
            strokeWidth={p.lineWidth}
            strokeLinecap="round"
            opacity={p.opacity || 1}
          />
          <Polygon
            points={`${ap.tipX},${ap.tipY} ${ap.lx},${ap.ly} ${ap.rx},${ap.ry}`}
            fill={p.color}
            opacity={p.opacity || 1}
          />
        </G>
      );
    }

    if (p.type === 'line') {
      return (
        <Path
          key={key}
          d={pointsToLinePath(p.points)}
          stroke={p.color}
          strokeWidth={p.lineWidth}
          strokeLinecap="round"
          fill="none"
          opacity={p.opacity || 1}
        />
      );
    }

    if (p.type === 'zone') {
      const xs = p.points.map((pt) => pt.x);
      const ys = p.points.map((pt) => pt.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const rw = maxX - minX;
      const rh = maxY - minY;
      const rx2 = (minX + maxX) / 2;
      const ry2 = (minY + maxY) / 2;
      return (
        <React.Fragment key={key}>
          <Circle
            cx={rx2}
            cy={ry2}
            r={Math.max(rw, rh) / 2}
            stroke={p.color}
            strokeWidth={p.lineWidth}
            strokeDasharray="6 4"
            fill={p.color}
            fillOpacity={0.12}
            opacity={p.opacity || 1}
          />
        </React.Fragment>
      );
    }

    // pen (smooth)
    return (
      <Path
        key={key}
        d={pointsToSmoothPath(p.points)}
        stroke={p.color}
        strokeWidth={p.lineWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={p.opacity || 1}
      />
    );
  };

  return (
    <Svg
      width={FIELD_W}
      height={FIELD_H}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {paths.map((p, i) => renderPath(p, `path-${i}`))}
      {activePath && renderPath(activePath, 'active')}
    </Svg>
  );
}

export default function TacticBoardScreen({ navigation, route }) {
  const [players, setPlayers] = useState(() =>
    buildInitialPlayers(PLAY_FIELD_W, PLAY_FIELD_H, PLAY_FIELD_X, PLAY_FIELD_Y)
  );
  const [ball, setBall] = useState(() =>
    buildInitialBall(PLAY_FIELD_X, PLAY_FIELD_Y, PLAY_FIELD_W, PLAY_FIELD_H)
  );
  const [paths, setPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(2);
  const [selectedId, setSelectedId] = useState(null);

  // Animation
  const [keyframes, setKeyframes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animSpeed, setAnimSpeed] = useState(1000);
  const animTimer = useRef(null);

  // Save modal
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [playTitle, setPlayTitle] = useState('تاکتیک جدید');

  // Export
  const boardRef = useRef(null);
  const [showTools, setShowTools] = useState(true);

  // Drag refs
  const dragRef = useRef({ type: null, id: null, startX: 0, startY: 0, initX: 0, initY: 0 });
  const drawRef = useRef([]);
  const pathsRef = useRef(paths);
  useEffect(() => { pathsRef.current = paths; }, [paths]);

  const playersRef = useRef(players);
  useEffect(() => { playersRef.current = players; }, [players]);

  const ballRef = useRef(ball);
  useEffect(() => { ballRef.current = ball; }, [ball]);

  const activeToolRef = useRef(activeTool);
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

  const activeColorRef = useRef(activeColor);
  useEffect(() => { activeColorRef.current = activeColor; }, [activeColor]);

  const lineWidthRef = useRef(lineWidth);
  useEffect(() => { lineWidthRef.current = lineWidth; }, [lineWidth]);

  // Stop animation on unmount
  useEffect(() => () => clearInterval(animTimer.current), []);

  const stopAnimation = useCallback(() => {
    clearInterval(animTimer.current);
    setIsPlaying(false);
  }, []);

  const playAnimation = useCallback(() => {
    if (keyframes.length < 2) {
      Alert.alert('انیمیشن', 'حداقل ۲ فریم نیاز است. با دکمه + فریم اضافه کنید.');
      return;
    }
    stopAnimation();
    setCurrentFrame(0);
    let frame = 0;
    animTimer.current = setInterval(() => {
      frame++;
      if (frame >= keyframes.length) {
        clearInterval(animTimer.current);
        setIsPlaying(false);
        setCurrentFrame(0);
        setPlayers(keyframes[0].players);
        setBall(keyframes[0].ball);
        return;
      }
      setCurrentFrame(frame);
      if (frame < keyframes.length - 1) {
        // Show interpolated positions - set target
      }
      setPlayers(keyframes[frame].players.map((p) => ({ ...p })));
      setBall({ ...keyframes[frame].ball });
    }, animSpeed);
    setIsPlaying(true);
  }, [keyframes, animSpeed, stopAnimation]);

  const addKeyframe = useCallback(() => {
    const frame = {
      id: Date.now(),
      players: playersRef.current.map((p) => ({ ...p })),
      ball: { ...ballRef.current },
      paths: pathsRef.current.map((p) => ({ ...p })),
    };
    setKeyframes((prev) => {
      const next = [...prev, frame];
      return next;
    });
    Alert.alert('', `فریم ${keyframes.length + 1} ذخیره شد ✓`);
  }, [keyframes.length]);

  const removeLastKeyframe = useCallback(() => {
    setKeyframes((prev) => prev.slice(0, -1));
  }, []);

  const resetAll = useCallback(() => {
    Alert.alert('پاک کردن', 'همه چیز پاک شود؟', [
      { text: 'خیر', style: 'cancel' },
      {
        text: 'بله',
        style: 'destructive',
        onPress: () => {
          setPlayers(buildInitialPlayers(PLAY_FIELD_W, PLAY_FIELD_H, PLAY_FIELD_X, PLAY_FIELD_Y));
          setBall(buildInitialBall(PLAY_FIELD_X, PLAY_FIELD_Y, PLAY_FIELD_W, PLAY_FIELD_H));
          setPaths([]);
          setKeyframes([]);
          setCurrentFrame(0);
          stopAnimation();
        },
      },
    ]);
  }, [stopAnimation]);

  const undoLastPath = useCallback(() => {
    setPaths((prev) => prev.slice(0, -1));
  }, []);

  const handleSave = useCallback(async () => {
    const play = {
      id: generateId(),
      title: playTitle,
      createdAt: Date.now(),
      players: playersRef.current,
      ball: ballRef.current,
      paths: pathsRef.current,
      keyframes,
    };
    await savePlay(play);
    setSaveModalVisible(false);
    Alert.alert('', '✅ ذخیره شد');
  }, [playTitle, keyframes]);

  const handleExport = useCallback(async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setShowTools(false);
      await new Promise((r) => setTimeout(r, 100));
      const uri = await captureRef(boardRef, { format: 'png', quality: 1 });
      setShowTools(true);
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('', '✅ در گالری ذخیره شد');
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) await Sharing.shareAsync(uri);
      }
    } catch (e) {
      setShowTools(true);
      Alert.alert('خطا', 'خروجی ناموفق: ' + e.message);
    }
  }, []);

  // ─── PanResponder ───────────────────────────────────────────────────
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,

        onPanResponderGrant: (e) => {
          const { locationX: x, locationY: y } = e.nativeEvent;
          const tool = activeToolRef.current;

          if (tool === 'erase') {
            // Find closest path and remove
            return;
          }

          if (tool === 'select') {
            // Check ball
            const ballDist = Math.sqrt(
              (ballRef.current.x - x) ** 2 + (ballRef.current.y - y) ** 2
            );
            if (ballDist < 22) {
              dragRef.current = {
                type: 'ball',
                id: 'ball',
                startX: x,
                startY: y,
                initX: ballRef.current.x,
                initY: ballRef.current.y,
              };
              setSelectedId('ball');
              return;
            }

            // Check players
            const player = findNearestPlayer(x, y, playersRef.current);
            if (player) {
              dragRef.current = {
                type: 'player',
                id: player.id,
                startX: x,
                startY: y,
                initX: player.x,
                initY: player.y,
              };
              setSelectedId(player.id);
              return;
            }
            setSelectedId(null);
            return;
          }

          // Drawing tool
          drawRef.current = [{ x, y }];
          setActivePath({
            type: tool,
            points: [{ x, y }],
            color: activeColorRef.current,
            lineWidth: lineWidthRef.current,
          });
        },

        onPanResponderMove: (e, gs) => {
          const tool = activeToolRef.current;

          if (tool === 'select') {
            const { dx, dy } = gs;
            const d = dragRef.current;
            if (!d.type) return;

            const nx = d.initX + dx;
            const ny = d.initY + dy;
            const clamped = clampToField(nx, ny, PLAY_FIELD_X, PLAY_FIELD_Y, PLAY_FIELD_W, PLAY_FIELD_H);

            if (d.type === 'ball') {
              setBall({ x: clamped.x, y: clamped.y });
            } else if (d.type === 'player') {
              setPlayers((prev) =>
                prev.map((p) =>
                  p.id === d.id ? { ...p, x: clamped.x, y: clamped.y } : p
                )
              );
            }
            return;
          }

          // Drawing
          const { locationX: x, locationY: y } = e.nativeEvent;
          drawRef.current = [...drawRef.current, { x, y }];

          if (tool === 'arrow' || tool === 'line') {
            setActivePath((prev) =>
              prev
                ? { ...prev, points: [drawRef.current[0], { x, y }] }
                : null
            );
          } else {
            setActivePath((prev) =>
              prev ? { ...prev, points: [...drawRef.current] } : null
            );
          }
        },

        onPanResponderRelease: () => {
          const tool = activeToolRef.current;
          dragRef.current = { type: null, id: null };

          if (tool !== 'select' && drawRef.current.length >= 2) {
            const finalPath = {
              id: Date.now(),
              type: tool,
              points:
                tool === 'arrow' || tool === 'line'
                  ? [drawRef.current[0], drawRef.current[drawRef.current.length - 1]]
                  : [...drawRef.current],
              color: activeColorRef.current,
              lineWidth: lineWidthRef.current,
            };
            setPaths((prev) => [...prev, finalPath]);
          }
          drawRef.current = [];
          setActivePath(null);
        },
      }),
    []
  );

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تاکتیک بورد</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setSaveModalVisible(true)} style={styles.headerBtn}>
            <Text style={styles.headerBtnTxt}>💾</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport} style={styles.headerBtn}>
            <Text style={styles.headerBtnTxt}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Field + Drawing area */}
      <View ref={boardRef} style={styles.fieldContainer} {...panResponder.panHandlers}>
        <FutsalField width={FIELD_W} height={FIELD_H} />
        <DrawingLayer
          paths={paths}
          activePath={activePath}
          activeTool={activeTool}
          activeColor={activeColor}
          lineWidth={lineWidth}
        />

        {/* Ball */}
        <PlayerMarker player={ball} isSelected={selectedId === 'ball'} isBall />

        {/* Players */}
        {players.map((p) => (
          <PlayerMarker key={p.id} player={p} isSelected={selectedId === p.id} />
        ))}
      </View>

      {/* Tool Bar */}
      {showTools && (
        <View style={styles.toolArea}>
          {/* Tools */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolsRow}>
            {TOOLS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.toolBtn, activeTool === t.id && styles.toolBtnActive]}
                onPress={() => setActiveTool(t.id)}
              >
                <Text style={styles.toolIcon}>{t.icon}</Text>
                <Text style={[styles.toolLabel, activeTool === t.id && { color: '#4ade80' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.toolBtn} onPress={undoLastPath}>
              <Text style={styles.toolIcon}>↩️</Text>
              <Text style={styles.toolLabel}>بازگشت</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={resetAll}>
              <Text style={styles.toolIcon}>🔄</Text>
              <Text style={styles.toolLabel}>ریست</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Colors */}
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  activeColor === c && styles.colorDotActive,
                  c === '#000000' && { borderColor: '#444' },
                ]}
                onPress={() => setActiveColor(c)}
              />
            ))}
            <View style={styles.separator} />
            {LINE_WIDTHS.map((w) => (
              <TouchableOpacity
                key={w}
                style={[styles.widthBtn, lineWidth === w && styles.widthBtnActive]}
                onPress={() => setLineWidth(w)}
              >
                <View style={[styles.widthLine, { height: w + 1 }]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Animation Controls */}
          <View style={styles.animRow}>
            <Text style={styles.animLabel}>انیمیشن • {keyframes.length} فریم</Text>
            <View style={styles.animBtns}>
              <TouchableOpacity style={styles.animBtn} onPress={addKeyframe}>
                <Text style={styles.animBtnTxt}>+ فریم</Text>
              </TouchableOpacity>
              {keyframes.length > 0 && (
                <TouchableOpacity style={styles.animBtn} onPress={removeLastKeyframe}>
                  <Text style={styles.animBtnTxt}>- فریم</Text>
                </TouchableOpacity>
              )}
              {isPlaying ? (
                <TouchableOpacity style={[styles.animBtn, styles.animBtnPlay]} onPress={stopAnimation}>
                  <Text style={styles.animBtnTxt}>⏹ توقف</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.animBtn, styles.animBtnPlay, keyframes.length < 2 && styles.animBtnDisabled]}
                  onPress={playAnimation}
                >
                  <Text style={styles.animBtnTxt}>▶ پخش</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.animBtn}
                onPress={() => setAnimSpeed((s) => (s === 1000 ? 600 : s === 600 ? 300 : 1000))}
              >
                <Text style={styles.animBtnTxt}>
                  {animSpeed === 1000 ? '1x' : animSpeed === 600 ? '1.5x' : '2x'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Frame indicator */}
          {keyframes.length > 0 && (
            <View style={styles.framesRow}>
              {keyframes.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.frameDot, i === currentFrame && styles.frameDotActive]}
                  onPress={() => {
                    setCurrentFrame(i);
                    setPlayers(keyframes[i].players.map((p) => ({ ...p })));
                    setBall({ ...keyframes[i].ball });
                  }}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Save Modal */}
      <Modal visible={saveModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>ذخیره تاکتیک</Text>
            <TextInput
              style={styles.modalInput}
              value={playTitle}
              onChangeText={setPlayTitle}
              placeholder="نام تاکتیک"
              placeholderTextColor="#475569"
              textAlign="right"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSaveModalVisible(false)}>
                <Text style={styles.modalCancelTxt}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
                <Text style={styles.modalSaveTxt}>ذخیره</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerBtnTxt: {
    fontSize: 22,
    color: '#94a3b8',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  fieldContainer: {
    width: FIELD_W,
    height: FIELD_H,
    backgroundColor: '#0f1a12',
    position: 'relative',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerNum: {
    color: '#ffffff',
    fontWeight: '900',
  },
  ballEmoji: {
    fontSize: 12,
  },
  toolArea: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  toolsRow: {
    flexGrow: 0,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    minWidth: 56,
    gap: 2,
  },
  toolBtnActive: {
    backgroundColor: '#14532d',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  toolIcon: {
    fontSize: 20,
  },
  toolLabel: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  colorDotActive: {
    borderColor: '#ffffff',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  separator: {
    width: 1,
    height: 22,
    backgroundColor: '#334155',
    marginHorizontal: 4,
  },
  widthBtn: {
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#1e293b',
  },
  widthBtnActive: {
    backgroundColor: '#1d4ed8',
  },
  widthLine: {
    width: 20,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  animRow: {
    paddingHorizontal: 12,
    paddingBottom: 6,
    gap: 6,
  },
  animLabel: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'right',
  },
  animBtns: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  animBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  animBtnPlay: {
    backgroundColor: '#14532d',
    borderColor: '#4ade80',
  },
  animBtnDisabled: {
    opacity: 0.4,
  },
  animBtnTxt: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  framesRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
    flexWrap: 'wrap',
  },
  frameDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  frameDotActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    gap: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    color: '#f1f5f9',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  modalCancelTxt: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#166534',
    alignItems: 'center',
  },
  modalSaveTxt: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
