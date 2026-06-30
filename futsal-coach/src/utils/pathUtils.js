export function pointsToSmoothPath(points) {
  if (!points || points.length < 2) return '';
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mx = ((points[i].x + points[i + 1].x) / 2).toFixed(1);
    const my = ((points[i].y + points[i + 1].y) / 2).toFixed(1);
    d += ` Q${points[i].x.toFixed(1)},${points[i].y.toFixed(1)} ${mx},${my}`;
  }
  const last = points[points.length - 1];
  d += ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  return d;
}

export function pointsToLinePath(points) {
  if (!points || points.length < 2) return '';
  const s = points[0];
  const e = points[points.length - 1];
  return `M${s.x.toFixed(1)},${s.y.toFixed(1)} L${e.x.toFixed(1)},${e.y.toFixed(1)}`;
}

export function getArrowPoints(points) {
  if (!points || points.length < 2) return null;
  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) return null;
  const ux = dx / len;
  const uy = dy / len;
  const aw = 8;
  const al = 14;
  const tipX = end.x;
  const tipY = end.y;
  const lx = end.x - al * ux + aw * uy;
  const ly = end.y - al * uy - aw * ux;
  const rx = end.x - al * ux - aw * uy;
  const ry = end.y - al * uy + aw * ux;
  const lineEndX = end.x - al * 0.6 * ux;
  const lineEndY = end.y - al * 0.6 * uy;
  return { tipX, tipY, lx, ly, rx, ry, lineEndX, lineEndY, start };
}

export function findNearestPlayer(x, y, players, threshold = 28) {
  let nearest = null;
  let minDist = threshold;
  for (const p of players) {
    const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = p;
    }
  }
  return nearest;
}

export function clampToField(x, y, fieldX, fieldY, fieldW, fieldH, margin = 16) {
  return {
    x: Math.max(fieldX + margin, Math.min(fieldX + fieldW - margin, x)),
    y: Math.max(fieldY + margin, Math.min(fieldY + fieldH - margin, y)),
  };
}

export function interpolatePlayers(frameA, frameB, t) {
  const ratio = Math.max(0, Math.min(1, t));
  return frameA.map((pA) => {
    const pB = frameB.find((p) => p.id === pA.id);
    if (!pB) return pA;
    return {
      ...pA,
      x: pA.x + (pB.x - pA.x) * ratio,
      y: pA.y + (pB.y - pA.y) * ratio,
    };
  });
}
