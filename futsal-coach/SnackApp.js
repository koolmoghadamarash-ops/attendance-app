// ═══════════════════════════════════════════════════
//  FUTSAL COACH PRO - بدون نیاز به پکیج اضافه
//  فقط این فایل را در App.js اسنک پیست کن
// ═══════════════════════════════════════════════════
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, PanResponder, SafeAreaView,
  Alert, ScrollView, Modal, TextInput,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ابعاد زمین
const FW = SW;
const FH = Math.round(SW * 0.52);
const PAD = 10;
const FX = PAD, FY = PAD;
const IW = FW - PAD * 2; // عرض داخلی
const IH = FH - PAD * 2; // ارتفاع داخلی

const C = {
  bg: '#0a0a1a',
  card: '#0f172a',
  border: '#1e293b',
  fieldDark: '#155d2e',
  fieldLight: '#1a7a3a',
  A: '#ef4444',
  B: '#3b82f6',
  ball: '#fbbf24',
  white: '#ffffff',
  text: '#e2e8f0',
  sub: '#64748b',
  green: '#4ade80',
};

// ─── زمین فوتسال با View ────────────────────────────
function FutsalField() {
  const cx = IW / 2;
  const cy = IH / 2;

  // اندازه‌ها بر اساس استاندارد فوتسال (40x20 متر)
  const penDepth = IW * 0.15;   // عمق محدوده دروازه‌بان
  const penHeight = IH * 0.5;   // ارتفاع محدوده دروازه‌بان
  const goalH = IH * 0.22;      // دهانه دروازه
  const circR = IW * 0.08;      // شعاع دایره مرکزی
  const dotR = 3;

  return (
    <View style={[styles.field, { width: FW, height: FH }]}>
      {/* نوارهای رنگی افقی */}
      {[0,1,2,3,4,5].map(i => (
        <View key={i} style={{
          position: 'absolute',
          left: PAD + i * (IW/6),
          top: PAD, width: IW/6, height: IH,
          backgroundColor: i%2===0 ? C.fieldDark : C.fieldLight,
        }}/>
      ))}

      {/* کادر بیرونی زمین */}
      <View style={{
        position: 'absolute', left: PAD, top: PAD,
        width: IW, height: IH,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)',
        borderRadius: 4,
      }}/>

      {/* خط مرکزی */}
      <View style={{
        position: 'absolute',
        left: PAD + IW/2 - 1, top: PAD,
        width: 2, height: IH,
        backgroundColor: 'rgba(255,255,255,0.85)',
      }}/>

      {/* دایره مرکزی */}
      <View style={{
        position: 'absolute',
        left: PAD + cx - circR, top: PAD + cy - circR,
        width: circR*2, height: circR*2,
        borderRadius: circR,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
        backgroundColor: 'rgba(255,255,255,0.04)',
      }}/>

      {/* نقطه مرکزی */}
      <View style={{
        position: 'absolute',
        left: PAD + cx - dotR, top: PAD + cy - dotR,
        width: dotR*2, height: dotR*2,
        borderRadius: dotR,
        backgroundColor: 'rgba(255,255,255,0.9)',
      }}/>

      {/* محدوده دروازه‌بان چپ */}
      <View style={{
        position: 'absolute',
        left: PAD, top: PAD + (IH - penHeight)/2,
        width: penDepth, height: penHeight,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
        backgroundColor: 'rgba(255,255,255,0.04)',
      }}/>

      {/* محدوده دروازه‌بان راست */}
      <View style={{
        position: 'absolute',
        left: PAD + IW - penDepth, top: PAD + (IH - penHeight)/2,
        width: penDepth, height: penHeight,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
        backgroundColor: 'rgba(255,255,255,0.04)',
      }}/>

      {/* دروازه چپ */}
      <View style={{
        position: 'absolute',
        left: PAD - 8, top: PAD + (IH - goalH)/2,
        width: 8, height: goalH,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
        backgroundColor: '#0a3a1c',
      }}/>

      {/* دروازه راست */}
      <View style={{
        position: 'absolute',
        left: PAD + IW, top: PAD + (IH - goalH)/2,
        width: 8, height: goalH,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
        backgroundColor: '#0a3a1c',
      }}/>

      {/* نقطه پنالتی چپ */}
      <View style={{
        position: 'absolute',
        left: PAD + IW*0.15 - dotR, top: PAD + cy - dotR,
        width: dotR*2, height: dotR*2, borderRadius: dotR,
        backgroundColor: 'rgba(255,255,255,0.85)',
      }}/>

      {/* نقطه پنالتی راست */}
      <View style={{
        position: 'absolute',
        left: PAD + IW*0.85 - dotR, top: PAD + cy - dotR,
        width: dotR*2, height: dotR*2, borderRadius: dotR,
        backgroundColor: 'rgba(255,255,255,0.85)',
      }}/>
    </View>
  );
}

// ─── خط کشی با View ────────────────────────────────
function DrawLine({ x1, y1, x2, y2, color, lw }) {
  const dx = x2 - x1, dy = y2 - y1;
  const length = Math.sqrt(dx*dx + dy*dy);
  if (length < 3) return null;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const cx2 = (x1+x2)/2, cy2 = (y1+y2)/2;
  return (
    <View style={{
      position: 'absolute',
      left: cx2 - length/2, top: cy2 - (lw||2)/2,
      width: length, height: lw||2,
      backgroundColor: color,
      transform: [{ rotate: `${angle}deg` }],
    }}/>
  );
}

// ─── فلش ───────────────────────────────────────────
function DrawArrow({ x1, y1, x2, y2, color, lw }) {
  const dx = x2-x1, dy = y2-y1;
  const length = Math.sqrt(dx*dx + dy*dy);
  if (length < 8) return null;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const cx2 = (x1+x2)/2, cy2 = (y1+y2)/2;
  const headSize = 12;
  return (
    <>
      {/* خط */}
      <View style={{
        position: 'absolute',
        left: cx2 - length/2, top: cy2 - (lw||2)/2,
        width: length - headSize*0.4, height: lw||2,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
      }}/>
      {/* نوک فلش */}
      <View style={{
        position: 'absolute',
        left: x2 - headSize/2, top: y2 - headSize/2,
        width: headSize, height: headSize,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{ rotate: `${angle + 45}deg` }],
        opacity: 0.9,
      }}/>
    </>
  );
}

// ─── رندر نقاشی ────────────────────────────────────
function DrawLayer({ paths, activePath }) {
  const renderPath = (p, key) => {
    if (!p || !p.points || p.points.length < 2) return null;
    const s = p.points[0];
    const e = p.points[p.points.length - 1];

    if (p.type === 'arrow') return (
      <DrawArrow key={key} x1={s.x} y1={s.y} x2={e.x} y2={e.y} color={p.color} lw={p.lw}/>
    );

    if (p.type === 'line') return (
      <DrawLine key={key} x1={s.x} y1={s.y} x2={e.x} y2={e.y} color={p.color} lw={p.lw}/>
    );

    if (p.type === 'zone') {
      const xs = p.points.map(pt=>pt.x), ys = p.points.map(pt=>pt.y);
      const minX=Math.min(...xs), maxX=Math.max(...xs);
      const minY=Math.min(...ys), maxY=Math.max(...ys);
      const r = Math.max((maxX-minX)/2, (maxY-minY)/2, 10);
      const cx3=(minX+maxX)/2, cy3=(minY+maxY)/2;
      return (
        <View key={key} style={{
          position: 'absolute',
          left: cx3 - r, top: cy3 - r,
          width: r*2, height: r*2, borderRadius: r,
          borderWidth: 2, borderColor: p.color,
          borderStyle: 'dashed',
          backgroundColor: p.color + '22',
        }}/>
      );
    }

    // قلم آزاد - نقاط کوچک
    return (
      <View key={key}>
        {p.points.filter((_,i)=>i%3===0).map((pt, i) => (
          <View key={i} style={{
            position: 'absolute',
            left: pt.x - (p.lw||2)/2, top: pt.y - (p.lw||2)/2,
            width: p.lw||2, height: p.lw||2,
            borderRadius: p.lw||2,
            backgroundColor: p.color,
          }}/>
        ))}
        <DrawLine x1={s.x} y1={s.y} x2={e.x} y2={e.y} color={p.color} lw={p.lw}/>
      </View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {paths.map((p,i)=>renderPath(p,`p${i}`))}
      {activePath && renderPath(activePath,'a')}
    </View>
  );
}

// ─── بازیکن ────────────────────────────────────────
function Marker({ p, sel, isBall }) {
  const color = isBall ? C.ball : p.team==='A' ? C.A : C.B;
  const size = isBall ? 20 : 28;
  const r = size/2;
  return (
    <View pointerEvents="none" style={[styles.marker, {
      width: size, height: size, borderRadius: r,
      backgroundColor: color,
      left: p.x - r, top: p.y - r,
      borderWidth: sel ? 3 : 1.5,
      borderColor: sel ? '#fff' : 'rgba(0,0,0,0.4)',
      shadowColor: color, shadowOpacity: 0.9,
      shadowRadius: sel ? 14 : 5,
      elevation: sel ? 14 : 5,
      zIndex: sel ? 30 : 10,
    }]}>
      {isBall
        ? <Text style={{fontSize:12}}>⚽</Text>
        : <Text style={[styles.num,{fontSize:p.number>=10?8:12}]}>{p.number}</Text>
      }
    </View>
  );
}

// ─── داده اولیه بازیکنان ───────────────────────────
function initPlayers() {
  const cy = FY + IH/2;
  return [
    {id:'A1',team:'A',number:1,x:FX+IW*0.07,y:cy},
    {id:'A2',team:'A',number:2,x:FX+IW*0.22,y:FY+IH*0.22},
    {id:'A3',team:'A',number:3,x:FX+IW*0.22,y:FY+IH*0.78},
    {id:'A4',team:'A',number:4,x:FX+IW*0.35,y:FY+IH*0.35},
    {id:'A5',team:'A',number:5,x:FX+IW*0.42,y:cy},
    {id:'B1',team:'B',number:1,x:FX+IW*0.93,y:cy},
    {id:'B2',team:'B',number:2,x:FX+IW*0.78,y:FY+IH*0.22},
    {id:'B3',team:'B',number:3,x:FX+IW*0.78,y:FY+IH*0.78},
    {id:'B4',team:'B',number:4,x:FX+IW*0.65,y:FY+IH*0.65},
    {id:'B5',team:'B',number:5,x:FX+IW*0.58,y:cy},
  ];
}

function initBall() {
  return { x: FX + IW/2, y: FY + IH/2 };
}

function clamp(x, y) {
  return {
    x: Math.max(FX+14, Math.min(FX+IW-14, x)),
    y: Math.max(FY+14, Math.min(FY+IH-14, y)),
  };
}

function nearest(x, y, players, thr=30) {
  return players.reduce((best, p) => {
    const d = Math.sqrt((p.x-x)**2+(p.y-y)**2);
    return d<thr && d<(best?.d??thr) ? {...p,d} : best;
  }, null);
}

const TOOLS = [
  {id:'select',icon:'☝️',label:'جابجایی'},
  {id:'arrow', icon:'➡️',label:'فلش'},
  {id:'line',  icon:'📏',label:'خط'},
  {id:'pen',   icon:'✏️',label:'قلم'},
  {id:'zone',  icon:'⭕',label:'منطقه'},
];

const COLORS = ['#fff','#fbbf24','#ef4444','#3b82f6','#4ade80','#f97316','#a78bfa'];
const WIDTHS  = [2, 4, 7];

// ─── اپ اصلی ───────────────────────────────────────
export default function App() {
  const [screen,    setScreen]    = useState('home');
  const [players,   setPlayers]   = useState(initPlayers);
  const [ball,      setBall]      = useState(initBall);
  const [paths,     setPaths]     = useState([]);
  const [active,    setActive]    = useState(null);
  const [tool,      setTool]      = useState('select');
  const [color,     setColor]     = useState('#ffffff');
  const [lw,        setLw]        = useState(3);
  const [selId,     setSelId]     = useState(null);
  const [keyframes, setKeyframes] = useState([]);
  const [curFrame,  setCurFrame]  = useState(0);
  const [playing,   setPlaying]   = useState(false);
  const [speed,     setSpeed]     = useState(800);
  const [saved,     setSaved]     = useState([]);
  const [saveModal, setSaveModal] = useState(false);
  const [name,      setName]      = useState('تاکتیک جدید');

  const dragRef    = useRef({type:null});
  const drawRef    = useRef([]);
  const timerRef   = useRef(null);

  // ref های به‌روز برای PanResponder
  const toolR    = useRef(tool);    useEffect(()=>{toolR.current=tool},[tool]);
  const colorR   = useRef(color);   useEffect(()=>{colorR.current=color},[color]);
  const lwR      = useRef(lw);      useEffect(()=>{lwR.current=lw},[lw]);
  const playersR = useRef(players); useEffect(()=>{playersR.current=players},[players]);
  const ballR    = useRef(ball);    useEffect(()=>{ballR.current=ball},[ball]);
  const pathsR   = useRef(paths);   useEffect(()=>{pathsR.current=paths},[paths]);
  const kfR      = useRef(keyframes);useEffect(()=>{kfR.current=keyframes},[keyframes]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── انیمیشن ─────────────────────────────────────
  const addFrame = () => {
    setKeyframes(prev => [...prev, {
      players: playersR.current.map(p=>({...p})),
      ball: {...ballR.current},
    }]);
    Alert.alert('✅','فریم اضافه شد');
  };

  const playAnim = () => {
    if (kfR.current.length < 2) { Alert.alert('⚠️','حداقل ۲ فریم نیاز است'); return; }
    clearInterval(timerRef.current);
    let i = 0;
    setPlaying(true); setCurFrame(0);
    timerRef.current = setInterval(() => {
      i++;
      if (i >= kfR.current.length) { clearInterval(timerRef.current); setPlaying(false); return; }
      setCurFrame(i);
      setPlayers(kfR.current[i].players.map(p=>({...p})));
      setBall({...kfR.current[i].ball});
    }, speed);
  };

  const stopAnim = () => { clearInterval(timerRef.current); setPlaying(false); };

  const reset = () => Alert.alert('ریست','همه چیز پاک شود؟',[
    {text:'خیر',style:'cancel'},
    {text:'بله',style:'destructive',onPress:()=>{
      setPlayers(initPlayers()); setBall(initBall());
      setPaths([]); setKeyframes([]); setCurFrame(0); stopAnim();
    }},
  ]);

  const doSave = () => {
    setSaved(prev => [{
      id: Date.now(), name, date: new Date().toLocaleDateString('fa-IR'),
      players: playersR.current.map(p=>({...p})),
      ball: {...ballR.current},
      paths: [...pathsR.current],
      keyframes: [...kfR.current],
    }, ...prev]);
    setSaveModal(false);
    Alert.alert('✅','ذخیره شد');
  };

  // ── PanResponder ─────────────────────────────────
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,

    onPanResponderGrant: (e) => {
      const {locationX:x, locationY:y} = e.nativeEvent;

      if (toolR.current === 'select') {
        const bd = Math.sqrt((ballR.current.x-x)**2+(ballR.current.y-y)**2);
        if (bd < 26) {
          dragRef.current = {type:'ball', initX:ballR.current.x, initY:ballR.current.y};
          setSelId('ball'); return;
        }
        const pl = nearest(x, y, playersR.current);
        if (pl) {
          dragRef.current = {type:'player', id:pl.id, initX:pl.x, initY:pl.y};
          setSelId(pl.id); return;
        }
        setSelId(null); return;
      }

      drawRef.current = [{x,y}];
      setActive({type:toolR.current, points:[{x,y}], color:colorR.current, lw:lwR.current});
    },

    onPanResponderMove: (e, gs) => {
      if (toolR.current === 'select') {
        const d = dragRef.current; if (!d.type) return;
        const c = clamp(d.initX+gs.dx, d.initY+gs.dy);
        if (d.type === 'ball') setBall(c);
        else setPlayers(prev => prev.map(p => p.id===d.id ? {...p,...c} : p));
        return;
      }
      const {locationX:x, locationY:y} = e.nativeEvent;
      const t = toolR.current;
      if (t==='arrow'||t==='line') {
        drawRef.current = [drawRef.current[0], {x,y}];
      } else {
        drawRef.current = [...drawRef.current, {x,y}];
      }
      setActive(prev => prev ? {...prev, points:[...drawRef.current]} : null);
    },

    onPanResponderRelease: () => {
      dragRef.current = {type:null};
      if (toolR.current!=='select' && drawRef.current.length >= 2) {
        const t = toolR.current;
        const pts = (t==='arrow'||t==='line')
          ? [drawRef.current[0], drawRef.current[drawRef.current.length-1]]
          : [...drawRef.current];
        setPaths(prev => [...prev, {id:Date.now(), type:t, points:pts, color:colorR.current, lw:lwR.current}]);
      }
      drawRef.current = []; setActive(null);
    },
  }), []);

  // ── صفحه اصلی ────────────────────────────────────
  if (screen === 'home') return (
    <SafeAreaView style={[styles.root,{justifyContent:'center',alignItems:'center',gap:24}]}>
      <Text style={{fontSize:52}}>⚽</Text>
      <Text style={{color:'#fff',fontSize:22,fontWeight:'900',letterSpacing:2}}>FUTSAL COACH PRO</Text>
      <Text style={{color:C.green,fontSize:13,letterSpacing:5}}>تاکتیک • انیمیشن • تحلیل</Text>

      <TouchableOpacity style={styles.bigBtn} onPress={()=>setScreen('board')}>
        <Text style={styles.bigBtnT}>▶  شروع طراحی</Text>
      </TouchableOpacity>

      {saved.length > 0 && (
        <TouchableOpacity style={[styles.bigBtn,{backgroundColor:'#1e1b4b',borderColor:'#818cf8'}]} onPress={()=>setScreen('saved')}>
          <Text style={[styles.bigBtnT,{color:'#818cf8'}]}>📂  بازی‌های ذخیره ({saved.length})</Text>
        </TouchableOpacity>
      )}

      <View style={{flexDirection:'row',gap:28,marginTop:8}}>
        {[['🎨','نقاشی'],['🎬','انیمیشن'],['💾','ذخیره']].map(([ic,lb],i)=>(
          <View key={i} style={{alignItems:'center',gap:4}}>
            <Text style={{fontSize:28}}>{ic}</Text>
            <Text style={{color:C.sub,fontSize:11}}>{lb}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );

  // ── صفحه بازی‌های ذخیره ──────────────────────────
  if (screen === 'saved') return (
    <SafeAreaView style={styles.root}>
      <View style={styles.hdr}>
        <TouchableOpacity onPress={()=>setScreen('home')}><Text style={styles.back}>← برگشت</Text></TouchableOpacity>
        <Text style={styles.hdrT}>بازی‌های ذخیره شده</Text>
        <View style={{width:60}}/>
      </View>
      <ScrollView contentContainerStyle={{padding:14,gap:10}}>
        {saved.map(pl=>(
          <TouchableOpacity key={pl.id} style={styles.playCard}
            onPress={()=>{
              setPlayers(pl.players.map(p=>({...p})));
              setBall({...pl.ball});
              setPaths([...pl.paths]);
              setKeyframes([...pl.keyframes]);
              setScreen('board');
            }}>
            <Text style={{fontSize:30}}>📋</Text>
            <View style={{flex:1}}>
              <Text style={{color:C.text,fontSize:15,fontWeight:'700',textAlign:'right'}}>{pl.name}</Text>
              <Text style={{color:C.sub,fontSize:11,textAlign:'right'}}>{pl.date} • {pl.keyframes?.length||0} فریم</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  // ── تاکتیک بورد ─────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>

      {/* هدر */}
      <View style={styles.hdr}>
        <TouchableOpacity onPress={()=>setScreen('home')}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.hdrT}>تاکتیک بورد</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={()=>setSaveModal(true)}>
          <Text style={{fontSize:22}}>💾</Text>
        </TouchableOpacity>
      </View>

      {/* زمین */}
      <View style={{width:FW, height:FH, overflow:'hidden'}} {...pan.panHandlers}>
        <FutsalField/>
        <DrawLayer paths={paths} activePath={active}/>
        <Marker p={ball} sel={selId==='ball'} isBall/>
        {players.map(p=><Marker key={p.id} p={p} sel={selId===p.id}/>)}
      </View>

      {/* کنترل‌ها */}
      <View style={styles.ctrl}>

        {/* ابزارها */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:8}}>
          {TOOLS.map(t=>(
            <TouchableOpacity key={t.id}
              style={[styles.toolBtn, tool===t.id && styles.toolOn]}
              onPress={()=>setTool(t.id)}>
              <Text style={{fontSize:20}}>{t.icon}</Text>
              <Text style={[styles.toolLbl, tool===t.id&&{color:C.green}]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.toolBtn} onPress={()=>setPaths(p=>p.slice(0,-1))}>
            <Text style={{fontSize:20}}>↩️</Text><Text style={styles.toolLbl}>بازگشت</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={reset}>
            <Text style={{fontSize:20}}>🔄</Text><Text style={styles.toolLbl}>ریست</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* رنگ‌ها و ضخامت */}
        <View style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:10,marginBottom:10,flexWrap:'wrap'}}>
          {COLORS.map(c=>(
            <TouchableOpacity key={c} onPress={()=>setColor(c)}
              style={[styles.dot,{backgroundColor:c}, color===c&&{borderColor:'#fff',borderWidth:3}]}/>
          ))}
          <View style={{width:1,height:22,backgroundColor:C.border,marginHorizontal:2}}/>
          {WIDTHS.map(w=>(
            <TouchableOpacity key={w} onPress={()=>setLw(w)}
              style={[styles.wBtn, lw===w&&{backgroundColor:'#1d4ed8'}]}>
              <View style={{width:18,height:w,backgroundColor:'#fff',borderRadius:1}}/>
            </TouchableOpacity>
          ))}
        </View>

        {/* انیمیشن */}
        <View style={{paddingHorizontal:10}}>
          <Text style={{color:C.sub,fontSize:11,textAlign:'right',marginBottom:6}}>
            انیمیشن  •  {keyframes.length} فریم
          </Text>
          <View style={{flexDirection:'row',gap:7,flexWrap:'wrap'}}>
            <TouchableOpacity style={styles.aBtn} onPress={addFrame}>
              <Text style={styles.aBtnT}>+ فریم</Text>
            </TouchableOpacity>
            {keyframes.length>0 && (
              <TouchableOpacity style={styles.aBtn} onPress={()=>setKeyframes(p=>p.slice(0,-1))}>
                <Text style={styles.aBtnT}>- فریم</Text>
              </TouchableOpacity>
            )}
            {playing ? (
              <TouchableOpacity style={[styles.aBtn,{backgroundColor:'#7f1d1d',borderColor:'#ef4444'}]} onPress={stopAnim}>
                <Text style={styles.aBtnT}>⏹ توقف</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.aBtn,{backgroundColor:'#14532d',borderColor:C.green},keyframes.length<2&&{opacity:0.4}]}
                onPress={playAnim}>
                <Text style={styles.aBtnT}>▶ پخش</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.aBtn} onPress={()=>setSpeed(s=>s===800?500:s===500?280:800)}>
              <Text style={styles.aBtnT}>{speed===800?'1x':speed===500?'1.5x':'2x'}</Text>
            </TouchableOpacity>
          </View>

          {/* نقاط فریم */}
          {keyframes.length>0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:8}}>
              {keyframes.map((_,i)=>(
                <TouchableOpacity key={i}
                  onPress={()=>{
                    setCurFrame(i);
                    setPlayers(keyframes[i].players.map(p=>({...p})));
                    setBall({...keyframes[i].ball});
                  }}
                  style={[styles.fDot, i===curFrame&&{backgroundColor:C.green,borderColor:C.green}]}>
                  <Text style={{color:'#fff',fontSize:9}}>{i+1}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* مودال ذخیره */}
      <Modal visible={saveModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.mCard}>
            <Text style={styles.mTitle}>💾  ذخیره تاکتیک</Text>
            <TextInput
              style={styles.mInput} value={name} onChangeText={setName}
              placeholder="نام تاکتیک" placeholderTextColor="#475569" textAlign="right"/>
            <View style={{flexDirection:'row',gap:10}}>
              <TouchableOpacity style={[styles.mBtn,{backgroundColor:'#334155'}]} onPress={()=>setSaveModal(false)}>
                <Text style={{color:C.sub,fontWeight:'600'}}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mBtn,{backgroundColor:'#166534'}]} onPress={doSave}>
                <Text style={{color:'#fff',fontWeight:'700'}}>ذخیره ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── استایل‌ها ──────────────────────────────────────
const styles = StyleSheet.create({
  root:    {flex:1,backgroundColor:C.bg},
  field:   {backgroundColor:C.fieldDark,overflow:'hidden'},
  marker:  {position:'absolute',alignItems:'center',justifyContent:'center'},
  num:     {color:'#fff',fontWeight:'900'},
  hdr:     {flexDirection:'row',alignItems:'center',justifyContent:'space-between',
             paddingHorizontal:12,paddingVertical:9,borderBottomWidth:1,borderBottomColor:C.border},
  back:    {color:C.green,fontSize:16,fontWeight:'700'},
  hdrT:    {color:C.text,fontSize:15,fontWeight:'700',letterSpacing:1},
  iconBtn: {padding:4},
  ctrl:    {flex:1,backgroundColor:'#0f172a',paddingTop:10,borderTopWidth:1,borderTopColor:C.border},
  toolBtn: {alignItems:'center',justifyContent:'center',marginHorizontal:5,
            paddingVertical:6,paddingHorizontal:8,borderRadius:10,
            backgroundColor:'#1e293b',minWidth:58,gap:2},
  toolOn:  {backgroundColor:'#14532d',borderWidth:1,borderColor:C.green},
  toolLbl: {fontSize:9,color:C.sub,textAlign:'center'},
  dot:     {width:24,height:24,borderRadius:12,borderWidth:1.5,borderColor:'#334155'},
  wBtn:    {width:32,height:24,alignItems:'center',justifyContent:'center',
            borderRadius:6,backgroundColor:'#1e293b'},
  aBtn:    {paddingVertical:8,paddingHorizontal:14,backgroundColor:'#1e293b',
            borderRadius:8,borderWidth:1,borderColor:'#334155'},
  aBtnT:   {color:C.text,fontSize:13,fontWeight:'600'},
  fDot:    {width:24,height:24,borderRadius:12,backgroundColor:'#334155',
            borderWidth:1,borderColor:'#475569',alignItems:'center',
            justifyContent:'center',marginRight:6},
  bigBtn:  {backgroundColor:'#166534',borderRadius:14,paddingVertical:15,
            paddingHorizontal:40,borderWidth:1,borderColor:C.green},
  bigBtnT: {color:'#fff',fontSize:17,fontWeight:'800'},
  playCard:{backgroundColor:C.card,borderRadius:12,padding:14,flexDirection:'row',
            alignItems:'center',gap:12,borderWidth:1,borderColor:C.border,marginBottom:10},
  overlay: {flex:1,backgroundColor:'rgba(0,0,0,0.75)',justifyContent:'center',alignItems:'center'},
  mCard:   {backgroundColor:'#1e293b',borderRadius:18,padding:22,width:'82%',
            gap:14,borderWidth:1,borderColor:'#334155'},
  mTitle:  {color:C.text,fontSize:17,fontWeight:'700',textAlign:'center'},
  mInput:  {backgroundColor:C.bg,borderRadius:10,padding:12,color:C.text,
            fontSize:15,borderWidth:1,borderColor:'#334155'},
  mBtn:    {flex:1,padding:12,borderRadius:10,alignItems:'center'},
});
