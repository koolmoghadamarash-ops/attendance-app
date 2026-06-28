// ═══════════════════════════════════════════════════
//  FUTSAL COACH PRO - Single File for Expo Snack
//  snack.expo.dev  →  paste this as App.js
// ═══════════════════════════════════════════════════
import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, PanResponder, SafeAreaView,
  Alert, ScrollView, Modal, TextInput,
} from 'react-native';
import Svg, { Rect, Circle, Line, Path, Polygon, G, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');
const FIELD_W = SW;
const FIELD_H = Math.round(SW * 0.54);
const PAD = 8;
const FX = PAD, FY = PAD;
const FW = FIELD_W - PAD * 2, FH = FIELD_H - PAD * 2;

const COL = {
  bg: '#0a0a1a', card: '#0f172a', border: '#1e293b',
  green1: '#1a5c35', green2: '#0f3d22',
  A: '#ef4444', B: '#3b82f6', ball: '#fbbf24',
  text: '#e2e8f0', sub: '#64748b', accent: '#4ade80',
};

// ── Field SVG ──────────────────────────────────────
function FutsalField() {
  const cx = FX + FW / 2, cy = FY + FH / 2;
  const scX = FW / 40, scY = FH / 20;
  const s = m => m * scX, sv = m => m * scY;
  const lc = 'rgba(255,255,255,0.85)', lw = 1.5;
  const circR = s(3);
  const paH = sv(10), paD = s(6), paY = FY + (FH - paH) / 2;
  const gaH = sv(6), gaD = s(3), gaY = FY + (FH - gaH) / 2;
  const goalW = sv(3), goalY = FY + (FH - goalW) / 2, goalD = s(1.5);
  const penR = s(6), penD = s(6), cr = s(1);
  const paOff = Math.sqrt(penR * penR - penD * penD);

  return (
    <Svg width={FIELD_W} height={FIELD_H}>
      <Defs>
        <LinearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={COL.green1} />
          <Stop offset="1" stopColor={COL.green2} />
        </LinearGradient>
        <ClipPath id="fc"><Rect x={FX} y={FY} width={FW} height={FH} rx={4} /></ClipPath>
      </Defs>
      <Rect x={FX+2} y={FY+4} width={FW} height={FH} rx={4} fill="#000" opacity={0.35} />
      <Rect x={FX} y={FY} width={FW} height={FH} fill="url(#fg)" rx={4} />
      {[1,3,5,7].map(i=>(
        <Rect key={i} x={FX+i*(FW/8)} y={FY} width={FW/8} height={FH} fill="#fff" opacity={0.025} clipPath="url(#fc)" />
      ))}
      {/* Goals */}
      <Rect x={FX-goalD} y={goalY} width={goalD} height={goalW} fill="#0a3a1c" stroke={lc} strokeWidth={lw} />
      <Rect x={FX+FW} y={goalY} width={goalD} height={goalW} fill="#0a3a1c" stroke={lc} strokeWidth={lw} />
      {/* Boundary */}
      <Rect x={FX} y={FY} width={FW} height={FH} stroke={lc} strokeWidth={lw} fill="none" rx={4} />
      {/* Penalty areas */}
      <Rect x={FX} y={paY} width={paD} height={paH} stroke={lc} strokeWidth={lw} fill="rgba(255,255,255,0.03)" />
      <Rect x={FX+FW-paD} y={paY} width={paD} height={paH} stroke={lc} strokeWidth={lw} fill="rgba(255,255,255,0.03)" />
      {/* Goal areas */}
      <Rect x={FX} y={gaY} width={gaD} height={gaH} stroke={lc} strokeWidth={lw} fill="rgba(255,255,255,0.04)" />
      <Rect x={FX+FW-gaD} y={gaY} width={gaD} height={gaH} stroke={lc} strokeWidth={lw} fill="rgba(255,255,255,0.04)" />
      {/* Corner arcs */}
      <Path d={`M${FX} ${FY+cr} A${cr} ${cr} 0 0 1 ${FX+cr} ${FY}`} stroke={lc} strokeWidth={lw} fill="none" />
      <Path d={`M${FX+FW-cr} ${FY} A${cr} ${cr} 0 0 1 ${FX+FW} ${FY+cr}`} stroke={lc} strokeWidth={lw} fill="none" />
      <Path d={`M${FX} ${FY+FH-cr} A${cr} ${cr} 0 0 0 ${FX+cr} ${FY+FH}`} stroke={lc} strokeWidth={lw} fill="none" />
      <Path d={`M${FX+FW-cr} ${FY+FH} A${cr} ${cr} 0 0 0 ${FX+FW} ${FY+FH-cr}`} stroke={lc} strokeWidth={lw} fill="none" />
      {/* Center */}
      <Line x1={cx} y1={FY} x2={cx} y2={FY+FH} stroke={lc} strokeWidth={lw} />
      <Circle cx={cx} cy={cy} r={circR} stroke={lc} strokeWidth={lw} fill="rgba(255,255,255,0.03)" />
      <Circle cx={cx} cy={cy} r={3} fill={lc} />
      {/* Penalty marks */}
      <Circle cx={FX+penD} cy={cy} r={2.5} fill={lc} />
      <Circle cx={FX+FW-penD} cy={cy} r={2.5} fill={lc} />
      {/* Penalty arcs */}
      <Path d={`M${FX+paD} ${cy-paOff} A${penR} ${penR} 0 0 0 ${FX+paD} ${cy+paOff}`} stroke={lc} strokeWidth={lw} fill="none" clipPath="url(#fc)" />
      <Path d={`M${FX+FW-paD} ${cy-paOff} A${penR} ${penR} 0 0 1 ${FX+FW-paD} ${cy+paOff}`} stroke={lc} strokeWidth={lw} fill="none" clipPath="url(#fc)" />
    </Svg>
  );
}

// ── Utilities ──────────────────────────────────────
function toSmoothPath(pts) {
  if (!pts || pts.length < 2) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i+1].x) / 2, my = (pts[i].y + pts[i+1].y) / 2;
    d += ` Q${pts[i].x},${pts[i].y} ${mx},${my}`;
  }
  d += ` L${pts[pts.length-1].x},${pts[pts.length-1].y}`;
  return d;
}

function toLinePath(pts) {
  if (!pts || pts.length < 2) return '';
  return `M${pts[0].x},${pts[0].y} L${pts[pts.length-1].x},${pts[pts.length-1].y}`;
}

function arrowInfo(pts) {
  if (!pts || pts.length < 2) return null;
  const s = pts[0], e = pts[pts.length-1];
  const dx = e.x-s.x, dy = e.y-s.y, len = Math.sqrt(dx*dx+dy*dy);
  if (len < 5) return null;
  const ux = dx/len, uy = dy/len, aw = 9, al = 14;
  return {
    sx: s.x, sy: s.y,
    lx: e.x-al*ux+aw*uy, ly: e.y-al*uy-aw*ux,
    rx: e.x-al*ux-aw*uy, ry: e.y-al*uy+aw*ux,
    ex: e.x, ey: e.y,
    lineEnd: { x: e.x-al*0.6*ux, y: e.y-al*0.6*uy },
  };
}

function nearestPlayer(x, y, players, thr = 28) {
  return players.reduce((best, p) => {
    const d = Math.sqrt((p.x-x)**2 + (p.y-y)**2);
    return d < thr && d < (best?.d ?? thr) ? { ...p, d } : best;
  }, null);
}

function clamp(x, y) {
  return {
    x: Math.max(FX+14, Math.min(FX+FW-14, x)),
    y: Math.max(FY+14, Math.min(FY+FH-14, y)),
  };
}

// ── Initial data ───────────────────────────────────
function initPlayers() {
  const cx = FX+FW/2, cy = FY+FH/2;
  return [
    { id:'A1', team:'A', number:1, x:FX+FW*0.07, y:cy },
    { id:'A2', team:'A', number:2, x:FX+FW*0.22, y:FY+FH*0.22 },
    { id:'A3', team:'A', number:3, x:FX+FW*0.22, y:FY+FH*0.78 },
    { id:'A4', team:'A', number:4, x:FX+FW*0.35, y:FY+FH*0.38 },
    { id:'A5', team:'A', number:5, x:FX+FW*0.42, y:cy },
    { id:'B1', team:'B', number:1, x:FX+FW*0.93, y:cy },
    { id:'B2', team:'B', number:2, x:FX+FW*0.78, y:FY+FH*0.22 },
    { id:'B3', team:'B', number:3, x:FX+FW*0.78, y:FY+FH*0.78 },
    { id:'B4', team:'B', number:4, x:FX+FW*0.65, y:FY+FH*0.38 },
    { id:'B5', team:'B', number:5, x:FX+FW*0.58, y:cy },
  ];
}

const TOOLS = [
  { id:'select', icon:'☝️', label:'انتخاب' },
  { id:'pen',    icon:'✏️', label:'قلم' },
  { id:'arrow',  icon:'➡️', label:'فلش' },
  { id:'line',   icon:'📏', label:'خط' },
  { id:'zone',   icon:'⭕', label:'منطقه' },
];
const COLORS = ['#ffffff','#fbbf24','#ef4444','#3b82f6','#4ade80','#f97316','#a78bfa','#000000'];
const WIDTHS = [2, 4, 7];

// ── Drawing Layer ──────────────────────────────────
function DrawLayer({ paths, active }) {
  const render = (p, k) => {
    if (!p?.points || p.points.length < 2) return null;
    if (p.type === 'arrow') {
      const a = arrowInfo(p.points);
      if (!a) return null;
      return (
        <G key={k}>
          <Line x1={a.sx} y1={a.sy} x2={a.lineEnd.x} y2={a.lineEnd.y}
            stroke={p.color} strokeWidth={p.lw} strokeLinecap="round" />
          <Polygon points={`${a.ex},${a.ey} ${a.lx},${a.ly} ${a.rx},${a.ry}`} fill={p.color} />
        </G>
      );
    }
    if (p.type === 'line') return (
      <Path key={k} d={toLinePath(p.points)} stroke={p.color}
        strokeWidth={p.lw} strokeLinecap="round" fill="none" />
    );
    if (p.type === 'zone') {
      const xs = p.points.map(pt=>pt.x), ys = p.points.map(pt=>pt.y);
      const cx2 = (Math.min(...xs)+Math.max(...xs))/2;
      const cy2 = (Math.min(...ys)+Math.max(...ys))/2;
      const r = Math.max(Math.max(...xs)-Math.min(...xs), Math.max(...ys)-Math.min(...ys))/2;
      return (
        <Circle key={k} cx={cx2} cy={cy2} r={Math.max(r,6)}
          stroke={p.color} strokeWidth={p.lw} strokeDasharray="6 4"
          fill={p.color} fillOpacity={0.12} />
      );
    }
    return (
      <Path key={k} d={toSmoothPath(p.points)} stroke={p.color}
        strokeWidth={p.lw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    );
  };
  return (
    <Svg width={FIELD_W} height={FIELD_H} style={StyleSheet.absoluteFill} pointerEvents="none">
      {paths.map((p,i) => render(p, `p${i}`))}
      {active && render(active, 'a')}
    </Svg>
  );
}

// ── Player Marker ──────────────────────────────────
function Marker({ p, sel, isBall }) {
  const color = isBall ? COL.ball : p.team==='A' ? COL.A : COL.B;
  const size = isBall ? 18 : 26, r = size/2;
  return (
    <View pointerEvents="none" style={[styles.marker, {
      width: size, height: size, borderRadius: r,
      backgroundColor: color,
      left: p.x - r, top: p.y - r,
      borderWidth: sel ? 3 : 1.5,
      borderColor: sel ? '#fff' : 'rgba(0,0,0,0.5)',
      shadowColor: color, shadowOpacity: 0.8,
      shadowRadius: sel ? 12 : 4,
      elevation: sel ? 12 : 4,
      zIndex: sel ? 30 : 10,
    }]}>
      {isBall
        ? <Text style={{fontSize:11}}>⚽</Text>
        : <Text style={[styles.num, {fontSize: p.number>=10?8:11}]}>{p.number}</Text>
      }
    </View>
  );
}

// ── Main App ───────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('home'); // home | board | saved
  const [players, setPlayers] = useState(initPlayers);
  const [ball, setBall] = useState({ x: FX+FW/2, y: FY+FH/2 });
  const [paths, setPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('#ffffff');
  const [lw, setLw] = useState(2);
  const [selId, setSelId] = useState(null);
  const [keyframes, setKeyframes] = useState([]);
  const [curFrame, setCurFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [savedPlays, setSavedPlays] = useState([]);
  const [saveModal, setSaveModal] = useState(false);
  const [playName, setPlayName] = useState('تاکتیک جدید');

  const dragRef = useRef({ type:null, id:null, initX:0, initY:0 });
  const drawPts = useRef([]);
  const timerRef = useRef(null);
  const toolRef = useRef(tool);   const colorRef = useRef(color);
  const lwRef = useRef(lw);       const playersRef = useRef(players);
  const ballRef = useRef(ball);   const pathsRef = useRef(paths);
  React.useEffect(()=>{ toolRef.current=tool; },[tool]);
  React.useEffect(()=>{ colorRef.current=color; },[color]);
  React.useEffect(()=>{ lwRef.current=lw; },[lw]);
  React.useEffect(()=>{ playersRef.current=players; },[players]);
  React.useEffect(()=>{ ballRef.current=ball; },[ball]);
  React.useEffect(()=>{ pathsRef.current=paths; },[paths]);
  React.useEffect(()=>()=>clearInterval(timerRef.current),[]);

  const addFrame = useCallback(()=>{
    setKeyframes(prev=>[...prev,{
      players: playersRef.current.map(p=>({...p})),
      ball: {...ballRef.current},
    }]);
    Alert.alert('','فریم اضافه شد ✓');
  },[]);

  const playAnim = useCallback(()=>{
    if(keyframes.length<2){ Alert.alert('','حداقل ۲ فریم نیاز است'); return; }
    clearInterval(timerRef.current);
    let i=0;
    setPlaying(true); setCurFrame(0);
    timerRef.current = setInterval(()=>{
      i++;
      if(i>=keyframes.length){ clearInterval(timerRef.current); setPlaying(false); i=0; }
      setCurFrame(i%keyframes.length);
      setPlayers(keyframes[i%keyframes.length].players.map(p=>({...p})));
      setBall({...keyframes[i%keyframes.length].ball});
    }, speed);
  },[keyframes, speed]);

  const stopAnim = useCallback(()=>{ clearInterval(timerRef.current); setPlaying(false); },[]);

  const undo = useCallback(()=>setPaths(p=>p.slice(0,-1)),[]);

  const reset = useCallback(()=>{
    Alert.alert('ریست','همه چیز پاک شود؟',[
      {text:'خیر',style:'cancel'},
      {text:'بله',style:'destructive',onPress:()=>{
        setPlayers(initPlayers()); setBall({x:FX+FW/2,y:FY+FH/2});
        setPaths([]); setKeyframes([]); setCurFrame(0); stopAnim();
      }},
    ]);
  },[stopAnim]);

  const doSave = useCallback(()=>{
    setSavedPlays(prev=>[{
      id:Date.now(), name:playName, date:new Date().toLocaleDateString('fa-IR'),
      frameCount:keyframes.length, pathCount:paths.length,
      players: playersRef.current.map(p=>({...p})),
      ball:{...ballRef.current}, paths:[...pathsRef.current], keyframes:[...keyframes],
    },...prev]);
    setSaveModal(false);
    Alert.alert('','✅ ذخیره شد');
  },[playName, keyframes, paths]);

  // ── PanResponder ─────────────────────────────────
  const pan = useMemo(()=>PanResponder.create({
    onStartShouldSetPanResponder:()=>true,
    onMoveShouldSetPanResponder:()=>true,
    onPanResponderGrant:(e)=>{
      const {locationX:x, locationY:y} = e.nativeEvent;
      if(toolRef.current==='select'){
        const bd = Math.sqrt((ballRef.current.x-x)**2+(ballRef.current.y-y)**2);
        if(bd<24){ dragRef.current={type:'ball',initX:ballRef.current.x,initY:ballRef.current.y}; setSelId('ball'); return; }
        const pl = nearestPlayer(x,y,playersRef.current);
        if(pl){ dragRef.current={type:'player',id:pl.id,initX:pl.x,initY:pl.y}; setSelId(pl.id); return; }
        setSelId(null); return;
      }
      drawPts.current=[{x,y}];
      setActivePath({type:toolRef.current,points:[{x,y}],color:colorRef.current,lw:lwRef.current});
    },
    onPanResponderMove:(e,gs)=>{
      if(toolRef.current==='select'){
        const d=dragRef.current; if(!d.type) return;
        const c=clamp(d.initX+gs.dx, d.initY+gs.dy);
        if(d.type==='ball'){ setBall(c); }
        else { setPlayers(prev=>prev.map(p=>p.id===d.id?{...p,...c}:p)); }
        return;
      }
      const {locationX:x,locationY:y}=e.nativeEvent;
      const t=toolRef.current;
      if(t==='arrow'||t==='line'){
        drawPts.current=[drawPts.current[0],{x,y}];
      } else {
        drawPts.current=[...drawPts.current,{x,y}];
      }
      setActivePath(prev=>prev?{...prev,points:[...drawPts.current]}:null);
    },
    onPanResponderRelease:()=>{
      dragRef.current={type:null};
      if(toolRef.current!=='select' && drawPts.current.length>=2){
        const t=toolRef.current;
        setPaths(prev=>[...prev,{
          id:Date.now(), type:t,
          points: (t==='arrow'||t==='line')
            ? [drawPts.current[0], drawPts.current[drawPts.current.length-1]]
            : [...drawPts.current],
          color:colorRef.current, lw:lwRef.current,
        }]);
      }
      drawPts.current=[]; setActivePath(null);
    },
  }),[]);

  // ── Home Screen ───────────────────────────────────
  if(screen==='home') return (
    <SafeAreaView style={[styles.root,{alignItems:'center',justifyContent:'center',gap:28}]}>
      <Text style={{fontSize:40}}>⚽</Text>
      <Text style={[styles.big,{fontSize:22,letterSpacing:2}]}>FUTSAL COACH PRO</Text>
      <Text style={{color:COL.accent,fontSize:13,letterSpacing:5}}>تاکتیک • انیمیشن • تحلیل</Text>
      <TouchableOpacity style={styles.bigBtn} onPress={()=>setScreen('board')}>
        <Text style={styles.bigBtnTxt}>▶  شروع طراحی</Text>
      </TouchableOpacity>
      {savedPlays.length>0 && (
        <TouchableOpacity style={[styles.bigBtn,{backgroundColor:'#1e1b4b',borderColor:'#818cf8'}]} onPress={()=>setScreen('saved')}>
          <Text style={[styles.bigBtnTxt,{color:'#818cf8'}]}>📂  بازی‌های ذخیره ({savedPlays.length})</Text>
        </TouchableOpacity>
      )}
      <View style={{flexDirection:'row',gap:20,marginTop:8}}>
        {[['🎨','نقاشی'],['🎬','انیمیشن'],['💾','ذخیره']].map(([ic,lb],i)=>(
          <View key={i} style={{alignItems:'center',gap:4}}>
            <Text style={{fontSize:26}}>{ic}</Text>
            <Text style={{color:COL.sub,fontSize:11}}>{lb}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );

  // ── Saved Plays ────────────────────────────────────
  if(screen==='saved') return (
    <SafeAreaView style={styles.root}>
      <View style={styles.hdr}>
        <TouchableOpacity onPress={()=>setScreen('home')}><Text style={styles.back}>← برگشت</Text></TouchableOpacity>
        <Text style={styles.hdrTxt}>بازی‌های ذخیره شده</Text>
        <View style={{width:60}}/>
      </View>
      {savedPlays.length===0
        ? <View style={{flex:1,alignItems:'center',justifyContent:'center',gap:12}}>
            <Text style={{fontSize:48}}>📋</Text>
            <Text style={{color:COL.sub,fontSize:16}}>هنوز بازی‌ای ذخیره نشده</Text>
          </View>
        : <ScrollView contentContainerStyle={{padding:14,gap:10}}>
            {savedPlays.map(pl=>(
              <TouchableOpacity key={pl.id} style={styles.playCard}
                onPress={()=>{ setPlayers(pl.players.map(p=>({...p}))); setBall({...pl.ball}); setPaths([...pl.paths]); setKeyframes([...pl.keyframes]); setScreen('board'); }}>
                <Text style={{fontSize:32}}>📋</Text>
                <View style={{flex:1}}>
                  <Text style={{color:COL.text,fontSize:15,fontWeight:'700',textAlign:'right'}}>{pl.name}</Text>
                  <Text style={{color:COL.sub,fontSize:11,textAlign:'right'}}>{pl.date} • {pl.frameCount} فریم</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
      }
    </SafeAreaView>
  );

  // ── Board Screen ───────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.hdr}>
        <TouchableOpacity onPress={()=>setScreen('home')}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.hdrTxt}>تاکتیک بورد</Text>
        <View style={{flexDirection:'row',gap:4}}>
          <TouchableOpacity style={styles.iconBtn} onPress={()=>setSaveModal(true)}><Text>💾</Text></TouchableOpacity>
        </View>
      </View>

      {/* Field */}
      <View style={{width:FIELD_W,height:FIELD_H}} {...pan.panHandlers}>
        <FutsalField/>
        <DrawLayer paths={paths} active={activePath}/>
        <Marker p={ball} sel={selId==='ball'} isBall/>
        {players.map(p=><Marker key={p.id} p={p} sel={selId===p.id}/>)}
      </View>

      {/* Controls */}
      <View style={styles.ctrl}>
        {/* Tools */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:8}}>
          {TOOLS.map(t=>(
            <TouchableOpacity key={t.id} style={[styles.toolBtn, tool===t.id&&styles.toolActive]} onPress={()=>setTool(t.id)}>
              <Text style={{fontSize:18}}>{t.icon}</Text>
              <Text style={[styles.toolLbl, tool===t.id&&{color:COL.accent}]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.toolBtn} onPress={undo}><Text style={{fontSize:18}}>↩️</Text><Text style={styles.toolLbl}>بازگشت</Text></TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={reset}><Text style={{fontSize:18}}>🔄</Text><Text style={styles.toolLbl}>ریست</Text></TouchableOpacity>
        </ScrollView>

        {/* Colors + widths */}
        <View style={{flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:10,marginBottom:8,flexWrap:'wrap'}}>
          {COLORS.map(c=>(
            <TouchableOpacity key={c} onPress={()=>setColor(c)}
              style={[styles.dot,{backgroundColor:c}, color===c&&{borderColor:'#fff',borderWidth:3,transform:[{scale:1.2}]}]}/>
          ))}
          <View style={{width:1,height:20,backgroundColor:COL.border,marginHorizontal:2}}/>
          {WIDTHS.map(w=>(
            <TouchableOpacity key={w} onPress={()=>setLw(w)} style={[styles.wBtn, lw===w&&{backgroundColor:'#1d4ed8'}]}>
              <View style={{width:18,height:w+1,backgroundColor:'#fff',borderRadius:1}}/>
            </TouchableOpacity>
          ))}
        </View>

        {/* Animation */}
        <View style={{paddingHorizontal:10}}>
          <Text style={{color:COL.sub,fontSize:11,textAlign:'right',marginBottom:5}}>
            انیمیشن • {keyframes.length} فریم
          </Text>
          <View style={{flexDirection:'row',gap:7,flexWrap:'wrap'}}>
            <TouchableOpacity style={styles.aBtn} onPress={addFrame}><Text style={styles.aBtnTxt}>+ فریم</Text></TouchableOpacity>
            {keyframes.length>0&&<TouchableOpacity style={styles.aBtn} onPress={()=>setKeyframes(p=>p.slice(0,-1))}><Text style={styles.aBtnTxt}>- فریم</Text></TouchableOpacity>}
            {playing
              ? <TouchableOpacity style={[styles.aBtn,{backgroundColor:'#7f1d1d',borderColor:'#ef4444'}]} onPress={stopAnim}><Text style={styles.aBtnTxt}>⏹ توقف</Text></TouchableOpacity>
              : <TouchableOpacity style={[styles.aBtn,{backgroundColor:'#14532d',borderColor:COL.accent}, keyframes.length<2&&{opacity:0.4}]} onPress={playAnim}><Text style={styles.aBtnTxt}>▶ پخش</Text></TouchableOpacity>
            }
            <TouchableOpacity style={styles.aBtn} onPress={()=>setSpeed(s=>s===900?550:s===550?280:900)}>
              <Text style={styles.aBtnTxt}>{speed===900?'1x':speed===550?'1.5x':'2x'}</Text>
            </TouchableOpacity>
          </View>
          {keyframes.length>0&&(
            <View style={{flexDirection:'row',gap:5,marginTop:7,flexWrap:'wrap'}}>
              {keyframes.map((_,i)=>(
                <TouchableOpacity key={i} onPress={()=>{setCurFrame(i);setPlayers(keyframes[i].players.map(p=>({...p})));setBall({...keyframes[i].ball});}}
                  style={[styles.fDot, i===curFrame&&{backgroundColor:COL.accent}]}/>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Save Modal */}
      <Modal visible={saveModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.mCard}>
            <Text style={styles.mTitle}>ذخیره تاکتیک</Text>
            <TextInput style={styles.mInput} value={playName} onChangeText={setPlayName}
              placeholder="نام تاکتیک" placeholderTextColor="#475569" textAlign="right"/>
            <View style={{flexDirection:'row',gap:10}}>
              <TouchableOpacity style={[styles.mBtn,{backgroundColor:'#334155'}]} onPress={()=>setSaveModal(false)}>
                <Text style={{color:COL.sub,fontWeight:'600'}}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mBtn,{backgroundColor:'#166534'}]} onPress={doSave}>
                <Text style={{color:'#fff',fontWeight:'700'}}>ذخیره</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex:1, backgroundColor:COL.bg },
  hdr:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, paddingVertical:9, borderBottomWidth:1, borderBottomColor:COL.border },
  back:   { color:COL.accent, fontSize:16, fontWeight:'600' },
  hdrTxt: { color:COL.text, fontSize:15, fontWeight:'700', letterSpacing:1 },
  iconBtn:{ padding:6 },
  big:    { color:'#fff', fontWeight:'900', textAlign:'center' },
  bigBtn: { backgroundColor:'#166534', borderRadius:14, paddingVertical:14, paddingHorizontal:36, borderWidth:1, borderColor:COL.accent },
  bigBtnTxt:{ color:'#fff', fontSize:16, fontWeight:'700' },
  marker: { position:'absolute', alignItems:'center', justifyContent:'center' },
  num:    { color:'#fff', fontWeight:'900' },
  ctrl:   { flex:1, backgroundColor:'#0f172a', paddingTop:10, borderTopWidth:1, borderTopColor:COL.border },
  toolBtn:{ alignItems:'center', justifyContent:'center', marginHorizontal:5, paddingVertical:6, paddingHorizontal:8, borderRadius:10, backgroundColor:'#1e293b', minWidth:54, gap:2 },
  toolActive:{ backgroundColor:'#14532d', borderWidth:1, borderColor:COL.accent },
  toolLbl:{ fontSize:9, color:COL.sub, textAlign:'center' },
  dot:    { width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:'#334155' },
  wBtn:   { width:30, height:22, alignItems:'center', justifyContent:'center', borderRadius:6, backgroundColor:'#1e293b' },
  aBtn:   { paddingVertical:7, paddingHorizontal:13, backgroundColor:'#1e293b', borderRadius:8, borderWidth:1, borderColor:'#334155' },
  aBtnTxt:{ color:COL.text, fontSize:13, fontWeight:'600' },
  fDot:   { width:13, height:13, borderRadius:7, backgroundColor:'#334155', borderWidth:1, borderColor:'#475569' },
  playCard:{ backgroundColor:COL.card, borderRadius:12, padding:14, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1, borderColor:COL.border },
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.75)', justifyContent:'center', alignItems:'center' },
  mCard:  { backgroundColor:'#1e293b', borderRadius:18, padding:22, width:'80%', gap:14, borderWidth:1, borderColor:'#334155' },
  mTitle: { color:COL.text, fontSize:17, fontWeight:'700', textAlign:'center' },
  mInput: { backgroundColor:COL.bg, borderRadius:10, padding:12, color:COL.text, fontSize:15, borderWidth:1, borderColor:'#334155' },
  mBtn:   { flex:1, padding:12, borderRadius:10, alignItems:'center' },
});
