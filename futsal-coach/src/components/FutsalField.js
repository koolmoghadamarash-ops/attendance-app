import React from 'react';
import Svg, {
  Rect,
  Circle,
  Line,
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  G,
} from 'react-native-svg';

export default function FutsalField({ width: W, height: H }) {
  const pad = 8;
  const fw = W - pad * 2;
  const fh = H - pad * 2;
  const fx = pad;
  const fy = pad;

  // Scale: 40m x 20m
  const scaleX = fw / 40;
  const scaleY = fh / 20;
  const s = (m) => m * scaleX;
  const sv = (m) => m * scaleY;

  // Field elements (in meters, from top-left of play field)
  const cx = fx + fw / 2;
  const cy = fy + fh / 2;
  const circleR = s(3);

  // Penalty areas: 6m deep, 10m wide (centered on goal)
  const paDepth = s(6);
  const paHeight = sv(10);
  const paY = fy + (fh - paHeight) / 2;

  // Goal area: 3m deep, 6m wide
  const gaDepth = s(3);
  const gaHeight = sv(6);
  const gaY = fy + (fh - gaHeight) / 2;

  // Goal: 3m wide, on goal line
  const goalWidth = sv(3);
  const goalY = fy + (fh - goalWidth) / 2;
  const goalDepth = s(1.5);

  // Penalty marks at 6m
  const pmX = s(6);

  // Corner arcs radius 1m
  const cornerR = s(1);

  // Penalty arc radius 6m (only part outside penalty area)
  const penArcR = s(6);

  const lw = 1.5;
  const lineColor = 'rgba(255,255,255,0.85)';
  const fieldGreen1 = '#1e6b3c';
  const fieldGreen2 = '#186033';

  // Stripe pattern
  const stripeCount = 8;
  const stripeW = fw / stripeCount;

  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1a5c35" />
          <Stop offset="1" stopColor="#0f3d22" />
        </LinearGradient>
        <LinearGradient id="shadow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0.4" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </LinearGradient>
        <ClipPath id="fieldClip">
          <Rect x={fx} y={fy} width={fw} height={fh} rx={4} />
        </ClipPath>
      </Defs>

      {/* Outer shadow */}
      <Rect x={fx + 2} y={fy + 4} width={fw} height={fh} rx={4} fill="#000000" opacity={0.4} />

      {/* Field background */}
      <Rect x={fx} y={fy} width={fw} height={fh} fill="url(#grad1)" rx={4} />

      {/* Alternating stripes */}
      <G clipPath="url(#fieldClip)">
        {Array.from({ length: stripeCount }).map((_, i) =>
          i % 2 === 0 ? null : (
            <Rect
              key={i}
              x={fx + i * stripeW}
              y={fy}
              width={stripeW}
              height={fh}
              fill="#ffffff"
              opacity={0.03}
            />
          )
        )}
      </G>

      {/* Goals (behind goal lines) */}
      {/* Left goal */}
      <Rect
        x={fx - goalDepth}
        y={goalY}
        width={goalDepth}
        height={goalWidth}
        fill="#0a3a1c"
        stroke={lineColor}
        strokeWidth={lw}
      />
      {/* Right goal */}
      <Rect
        x={fx + fw}
        y={goalY}
        width={goalDepth}
        height={goalWidth}
        fill="#0a3a1c"
        stroke={lineColor}
        strokeWidth={lw}
      />

      {/* Field boundary */}
      <Rect
        x={fx}
        y={fy}
        width={fw}
        height={fh}
        stroke={lineColor}
        strokeWidth={lw}
        fill="none"
        rx={4}
      />

      {/* Penalty areas */}
      {/* Left penalty area */}
      <Rect
        x={fx}
        y={paY}
        width={paDepth}
        height={paHeight}
        stroke={lineColor}
        strokeWidth={lw}
        fill="rgba(255,255,255,0.03)"
      />
      {/* Right penalty area */}
      <Rect
        x={fx + fw - paDepth}
        y={paY}
        width={paDepth}
        height={paHeight}
        stroke={lineColor}
        strokeWidth={lw}
        fill="rgba(255,255,255,0.03)"
      />

      {/* Goal areas */}
      {/* Left */}
      <Rect
        x={fx}
        y={gaY}
        width={gaDepth}
        height={gaHeight}
        stroke={lineColor}
        strokeWidth={lw}
        fill="rgba(255,255,255,0.04)"
      />
      {/* Right */}
      <Rect
        x={fx + fw - gaDepth}
        y={gaY}
        width={gaDepth}
        height={gaHeight}
        stroke={lineColor}
        strokeWidth={lw}
        fill="rgba(255,255,255,0.04)"
      />

      {/* Corner arcs */}
      {/* Top-left */}
      <Path
        d={`M ${fx} ${fy + cornerR} A ${cornerR} ${cornerR} 0 0 1 ${fx + cornerR} ${fy}`}
        stroke={lineColor}
        strokeWidth={lw}
        fill="none"
      />
      {/* Top-right */}
      <Path
        d={`M ${fx + fw - cornerR} ${fy} A ${cornerR} ${cornerR} 0 0 1 ${fx + fw} ${fy + cornerR}`}
        stroke={lineColor}
        strokeWidth={lw}
        fill="none"
      />
      {/* Bottom-left */}
      <Path
        d={`M ${fx} ${fy + fh - cornerR} A ${cornerR} ${cornerR} 0 0 0 ${fx + cornerR} ${fy + fh}`}
        stroke={lineColor}
        strokeWidth={lw}
        fill="none"
      />
      {/* Bottom-right */}
      <Path
        d={`M ${fx + fw - cornerR} ${fy + fh} A ${cornerR} ${cornerR} 0 0 0 ${fx + fw} ${fy + fh - cornerR}`}
        stroke={lineColor}
        strokeWidth={lw}
        fill="none"
      />

      {/* Center line */}
      <Line x1={cx} y1={fy} x2={cx} y2={fy + fh} stroke={lineColor} strokeWidth={lw} />

      {/* Center circle */}
      <Circle cx={cx} cy={cy} r={circleR} stroke={lineColor} strokeWidth={lw} fill="rgba(255,255,255,0.03)" />

      {/* Center mark */}
      <Circle cx={cx} cy={cy} r={3} fill={lineColor} />

      {/* Penalty marks */}
      <Circle cx={fx + pmX} cy={cy} r={2.5} fill={lineColor} />
      <Circle cx={fx + fw - pmX} cy={cy} r={2.5} fill={lineColor} />

      {/* Penalty arcs (semicircle outside penalty area) */}
      {/* Left arc - only draw the arc that is OUTSIDE the penalty area */}
      <Path
        d={`M ${fx + paDepth} ${cy - Math.sqrt(penArcR * penArcR - paDepth * paDepth)} A ${penArcR} ${penArcR} 0 0 0 ${fx + paDepth} ${cy + Math.sqrt(penArcR * penArcR - paDepth * paDepth)}`}
        stroke={lineColor}
        strokeWidth={lw}
        fill="none"
        clipPath="url(#fieldClip)"
      />
      {/* Right arc */}
      <Path
        d={`M ${fx + fw - paDepth} ${cy - Math.sqrt(penArcR * penArcR - paDepth * paDepth)} A ${penArcR} ${penArcR} 0 0 1 ${fx + fw - paDepth} ${cy + Math.sqrt(penArcR * penArcR - paDepth * paDepth)}`}
        stroke={lineColor}
        strokeWidth={lw}
        fill="none"
        clipPath="url(#fieldClip)"
      />

      {/* Top shadow overlay */}
      <Rect x={fx} y={fy} width={fw} height={20} fill="url(#shadow)" rx={4} />
    </Svg>
  );
}
