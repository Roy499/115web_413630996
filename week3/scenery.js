// 在頁尾上方插入一片水彩風格的風景：藍天、白雲、遠方的高山、往右上升的草坡、泥土小路、小花叢
// 顏色寫在 style.css 的 .scenery 裡

// 產生 min ~ max 之間的隨機數字
function random(min, max) {
  return min + Math.random() * (max - min);
}

// 草坡表面的高度：x 從 0 到 1200，左邊低、右邊高
function slopeY(x) {
  return 250 - 165 * Math.pow(Math.min(Math.max(x, 0), 1200) / 1200, 1.5);
}

// 用 slopeY 算出草坡的形狀（左右和下方多畫一點，水彩的抖動邊緣才不會露出空隙）
function slopePath() {
  let d = "M-40 " + slopeY(0);
  for (let x = 0; x <= 1240; x += 20) {
    d += " L" + x + " " + slopeY(x).toFixed(1);
  }
  return d + " V340 H-40 Z";
}

// 小路的中心線：t = 0 在遠處（右上方坡上），t = 1 在近處（畫面最下面）
// 越遠的地方 y 變化越小，彎道看起來會被壓扁，比較有遠近感
function trailPoint(t) {
  const startY = slopeY(1000) + 6;
  const x = 1000 - 560 * t + (20 + 90 * t) * Math.sin(t * Math.PI * 2.4 + 0.3);
  const y = startY + (335 - startY) * Math.pow(t, 1.6);
  return { x, y };
}

// 小路的寬度：遠處很細、近處比較寬
function trailWidth(t) {
  return 4 + 95 * t * t;
}

// 地面是斜著看的，所以上下方向要壓扁（FLAT），小路才會像平躺在草地上
const FLAT = 0.4;

// 算出小路在 t 這個位置的「橫向」方向（已經壓扁成畫面上的比例）
function trailSide(t) {
  const q = trailPoint(Math.min(t + 0.01, 1));
  const r = trailPoint(Math.max(t - 0.01, 0));
  const dx = q.x - r.x;
  const dy = (q.y - r.y) / FLAT;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: (dx / len) * FLAT };
}

// 小路的外形：scale 是寬度倍率，wobble 是邊緣不規則的程度
// 兩側邊緣各自用不同的波動，看起來像自然被踩出來的路，而不是整齊的帶子
function trailShape(scale, wobble) {
  const left = [];
  const right = [];
  const phaseL = random(0, 10);
  const phaseR = random(0, 10);
  for (let i = 0; i <= 90; i++) {
    const t = i / 90;
    const p = trailPoint(t);
    const n = trailSide(t);
    const w = trailWidth(t) * scale / 2;
    const wl = w * (1 + wobble * Math.sin(t * 37 + phaseL) * Math.sin(t * 11 + phaseL));
    const wr = w * (1 + wobble * Math.sin(t * 31 + phaseR) * Math.sin(t * 13 + phaseR));
    left.push(`${(p.x + n.x * wl).toFixed(1)} ${(p.y + n.y * wl).toFixed(1)}`);
    right.push(`${(p.x - n.x * wr).toFixed(1)} ${(p.y - n.y * wr).toFixed(1)}`);
  }
  return "M" + left.join(" L") + " L" + right.reverse().join(" L") + " Z";
}

// 路邊被踩到稀疏的草：從路的邊緣往路面上長
function trailEdgeGrass() {
  let blades = "";
  for (let i = 0; i < 70; i++) {
    const t = Math.pow(Math.random(), 0.7) * 0.95 + 0.05;
    const p = trailPoint(t);
    const n = trailSide(t);
    const side = Math.random() < 0.5 ? 1 : -1;
    const w = trailWidth(t) / 2 * random(0.75, 1.05);
    const x = p.x + side * n.x * w;
    const y = p.y + side * n.y * w;
    const h = 3 + 9 * t;
    const lean = random(-1, 1) * h * 0.4;
    blades += `<path class="edge-blade" d="M${x.toFixed(1)} ${y.toFixed(1)} q${(lean / 2).toFixed(1)} ${(-h / 2).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)}" />`;
  }
  return blades;
}

// 一叢小花：底下幾片葉子，上面一團小圓點花朵
function flowerBush(x, y, size) {
  let dots = "";
  const colors = ["f1", "f2", "f3", "f4"];
  for (let i = 0; i < 9; i++) {
    const dx = random(-1, 1) * size;
    const dy = -random(0.3, 1.1) * size;
    const r = size * random(0.18, 0.28);
    const c = colors[Math.floor(Math.random() * colors.length)];
    dots += `<circle class="${c}" cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" r="${r.toFixed(1)}" />`;
  }
  return `
    <g class="flower-bush">
      <ellipse class="leaves" cx="${x}" cy="${y - size * 0.25}" rx="${size * 1.25}" ry="${size * 0.55}" />
      ${dots}
    </g>`;
}

// 在草坡上放幾叢小花，避開小路
function flowerBushes() {
  let result = "";
  let placed = 0;
  let tries = 0;
  while (placed < 9 && tries < 200) {
    tries++;
    const x = random(40, 1160);
    const y = random(slopeY(x) + 20, 290);
    // 找小路在這個高度附近的位置，太近就跳過
    let tooClose = false;
    for (let t = 0; t <= 1; t += 0.02) {
      const p = trailPoint(t);
      if (Math.abs(p.y - y) < 14 && Math.abs(p.x - x) < trailWidth(t) / 2 + 30) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;
    // 越下面（越近）的花叢越大
    const size = 8 + 12 * ((y - 100) / 200);
    result += flowerBush(x, y, size);
    placed++;
  }
  return result;
}

// 一側山坡：從山頂 peak 往下走到山谷 valley，中間產生幾個點
// 真的山是「上面陡、下面緩」，所以高度用曲線 1 - (1 - f)^steep 來算
// 每個點再加一點起伏（像山肩），但一定保持往下，積雪和陰影才找得到山谷
function mountainFlank(peak, valley, steep) {
  const points = [];
  const count = 7;
  const height = valley.y - peak.y;
  let lastY = peak.y;
  for (let k = 1; k < count; k++) {
    const f = k / count;
    const x = peak.x + (valley.x - peak.x) * (f + random(-0.03, 0.03));
    let y = peak.y + height * (1 - Math.pow(1 - f, steep)) + random(-0.06, 0.06) * height;
    y = Math.max(y, lastY + 1);
    y = Math.min(y, valley.y - 1);
    points.push({ x, y });
    lastY = y;
  }
  return points;
}

// 一排山的稜線：在 0～1200 之間隨機放幾座山峰，山峰之間是山谷
// baseY 是山腳的高度，top 和 bottom 是山峰高度的範圍
// 每座山左右兩側的陡度不一樣，山才不會像對稱的三角形
function mountainRidge(baseY, top, bottom, peaks) {
  const step = 1200 / peaks;
  const peakList = [];
  for (let i = 0; i < peaks; i++) {
    peakList.push({ x: step * i + random(0.3, 0.7) * step, y: random(top, bottom), peak: true });
  }

  // 山谷：比兩邊的山峰都低；畫面兩端也各放一個，稜線才會延伸出畫面
  const valleys = [];
  valleys.push({ x: -40, y: Math.min(peakList[0].y + random(50, 80), baseY - 10) });
  for (let i = 0; i < peaks - 1; i++) {
    const a = peakList[i];
    const b = peakList[i + 1];
    valleys.push({
      x: a.x + (b.x - a.x) * random(0.4, 0.6),
      y: Math.min(Math.max(a.y, b.y) + random(35, 70), baseY - 10),
    });
  }
  valleys.push({ x: 1240, y: Math.min(peakList[peaks - 1].y + random(50, 80), baseY - 10) });

  const points = [valleys[0]];
  for (let i = 0; i < peaks; i++) {
    const p = peakList[i];
    // 左側山坡：從山頂往左下產生，再反過來接在山谷後面
    points.push(...mountainFlank(p, valleys[i], random(1.4, 2.2)).reverse());
    points.push(p);
    points.push(...mountainFlank(p, valleys[i + 1], random(1.4, 2.2)));
    points.push(valleys[i + 1]);
  }
  return points;
}

// 把稜線的點連成一座山的形狀
function mountainPath(points, baseY) {
  let d = `M${points[0].x} ${baseY}`;
  points.forEach((p) => {
    d += ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  });
  return d + ` L1240 ${baseY} Z`;
}

// 從山頂沿著稜線往某一邊（dir = 1 往右、-1 往左）走，一直走到高度 targetY 為止
// 如果還沒到 targetY 就遇到山谷（開始往上爬），就停在山谷
function walkRidge(points, i, dir, targetY) {
  const result = [];
  let j = i;
  while (j + dir >= 0 && j + dir < points.length) {
    const cur = points[j];
    const next = points[j + dir];
    if (next.y >= targetY) {
      const f = (targetY - cur.y) / (next.y - cur.y);
      result.push({ x: cur.x + (next.x - cur.x) * f, y: targetY });
      return result;
    }
    if (next.y < cur.y) {
      return result;
    }
    result.push(next);
    j += dir;
  }
  return result;
}

// 在比較高的山峰頂端畫積雪：從山頂沿兩側稜線往下蓋 drop 這麼多
// 雪線用平滑的弧線做出幾道往下垂的圓弧（像雪沿著山溝往下延伸），不用尖尖的鋸齒
function snowCaps(points, limit, drop) {
  let caps = "";
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    if (!p.peak || p.y > limit) continue;
    const right = walkRidge(points, i, 1, p.y + drop);
    const left = walkRidge(points, i, -1, p.y + drop);
    if (right.length === 0 || left.length === 0) continue;

    // 沿著右邊稜線往下
    let d = `M${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    right.forEach((q) => {
      d += ` L${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    });

    // 雪線：從右下走回左下，每一段用一個往下垂的弧線連起來
    const rx = right[right.length - 1].x;
    const ry = right[right.length - 1].y;
    const lx = left[left.length - 1].x;
    const ly = left[left.length - 1].y;
    const count = 5;
    for (let k = 1; k <= count; k++) {
      const f = k / count;
      const x = rx + (lx - rx) * f;
      const y = ry + (ly - ry) * f + (k < count ? random(-3, 3) : 0);
      const fm = (k - 0.5) / count;
      const cx = rx + (lx - rx) * fm;
      const cy = ry + (ly - ry) * fm + random(5, 11);
      d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }

    // 沿著左邊稜線回到山頂
    for (let k = left.length - 2; k >= 0; k--) {
      d += ` L${left[k].x.toFixed(1)} ${left[k].y.toFixed(1)}`;
    }
    caps += `<path class="snow" d="${d} Z" />`;
  }
  return caps;
}

// 山的陰影面：光從左上方照過來，所以每座山峰「右邊」那一面比較暗
// 陰影從山頂沿右側稜線到山谷，再沿一條微彎的線回到山頂（這條線就是山的稜脊）
function mountainShades(points, baseY, shadeClass) {
  let shades = "";
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    if (!p.peak) continue;
    // 沿著右側山坡一直往下走，走到開始往上爬的地方就是山谷
    let j = i + 1;
    while (j + 1 < points.length && points[j + 1].y >= points[j].y) j++;
    const flank = points.slice(i + 1, j);
    const valley = points[j];
    // 陰影的下緣：在山谷下方、山的中間偏右的位置收起來（不直接切到山腳，才不會出現垂直的直線）
    const bottomX = p.x + (valley.x - p.x) * random(0.45, 0.6);
    const bottomY = valley.y + (baseY - valley.y) * random(0.5, 0.7);
    // 從山谷往左下彎過去
    const valleyCurveX = valley.x - (valley.x - bottomX) * 0.2;
    const valleyCurveY = bottomY;
    // 稜脊從山頂往下，稍微往右偏、彎彎的
    const midX = p.x + (valley.x - p.x) * random(0.1, 0.25);
    const midY = p.y + (bottomY - p.y) * 0.5;
    const flankPath = flank.map((q) => ` L${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join("");
    shades += `<path class="${shadeClass}" d="M${p.x.toFixed(1)} ${p.y.toFixed(1)}${flankPath} L${valley.x.toFixed(1)} ${valley.y.toFixed(1)} Q${valleyCurveX.toFixed(1)} ${valleyCurveY.toFixed(1)} ${bottomX.toFixed(1)} ${bottomY.toFixed(1)} Q${midX.toFixed(1)} ${midY.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)} Z" />`;
  }
  return shades;
}

// 山壁上的細節：從山頂往下幾道淡淡的山溝線條
function mountainCreases(points, baseY, creaseClass) {
  let lines = "";
  for (let i = 1; i < points.length - 2; i++) {
    const p = points[i];
    if (!p.peak) continue;
    const height = baseY - p.y;
    for (let k = 0; k < 3; k++) {
      // 線條從山頂附近開始，往左下（亮面）或右下（暗面）延伸
      const side = k === 0 ? 1 : -1;
      const startX = p.x + side * random(2, 10);
      const startY = p.y + random(6, 16);
      const len = height * random(0.3, 0.55);
      const endX = startX + side * len * random(0.35, 0.6);
      const endY = startY + len;
      const bend = side * random(4, 10);
      lines += `<path class="${creaseClass}" d="M${startX.toFixed(1)} ${startY.toFixed(1)} Q${((startX + endX) / 2 + bend).toFixed(1)} ${((startY + endY) / 2).toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}" />`;
    }
  }
  return lines;
}

// 遠方的高山：最遠的一排比較淡、比較高，前面一排比較深、比較矮
// 每一排的順序：山的底色 → 積雪 → 陰影面（會讓雪的背光面變成淡藍灰）→ 山溝細節
function mountains() {
  const far = mountainRidge(250, 60, 115, 5);
  const near = mountainRidge(250, 115, 160, 7);
  return `
    <path class="mountain-far" d="${mountainPath(far, 250)}" fill="url(#mountain-far-gradient)" />
    ${snowCaps(far, 125, 45)}
    ${mountainShades(far, 250, "shade-far")}
    ${mountainCreases(far, 250, "crease-far")}

    <path class="mountain-near" d="${mountainPath(near, 250)}" fill="url(#mountain-near-gradient)" />
    ${snowCaps(near, 150, 30)}
    ${mountainShades(near, 250, "shade-near")}
    ${mountainCreases(near, 250, "crease-near")}`;
}

// 一朵卡通雲：底部平平的，上面是幾個圓疊起來
function cloud(x, y, scale) {
  return `
    <g class="cloud" transform="translate(${x} ${y}) scale(${scale})">
      <circle cx="-32" cy="-6" r="16" />
      <circle cx="-8" cy="-18" r="24" />
      <circle cx="20" cy="-12" r="19" />
      <circle cx="42" cy="-4" r="13" />
      <rect x="-48" y="-6" width="104" height="14" rx="7" />
    </g>`;
}

// 隨機產生草坡上的草葉筆觸
function grassBlades() {
  let blades = "";
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 1200;
    const top = slopeY(x);
    // 越靠近草坡表面的草越多
    const y = top + 6 + Math.pow(Math.random(), 1.8) * (300 - top);
    const h = 6 + Math.random() * 10;
    const lean = 2 + Math.random() * 5;
    const tone = Math.random() < 0.5 ? "light" : "dark";
    blades += `<path class="blade ${tone}" d="M${x.toFixed(1)} ${y.toFixed(1)} q${lean.toFixed(1)} ${(-h / 2).toFixed(1)} ${(lean * 1.6).toFixed(1)} ${(-h).toFixed(1)}" />`;
  }
  return blades;
}

function createScenery() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const scenery = document.createElement("div");
  scenery.className = "scenery";
  scenery.setAttribute("aria-hidden", "true");
  scenery.innerHTML = `
    <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
      <defs>
        <!-- 天空：上面透明（接網頁底色），往下慢慢透出淡藍色，到地平線附近最亮 -->
        <!-- 分好幾段慢慢變，山峰後面才不會出現一條明顯的藍色色塊 -->
        <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="sky-stop-0" />
          <stop offset="0.2" class="sky-stop-0" />
          <stop offset="0.45" class="sky-stop-1" />
          <stop offset="0.7" class="sky-stop-2" />
          <stop offset="1" class="sky-stop-3" />
        </linearGradient>

        <!-- 草坡：表面亮黃綠，往下越來越深 -->
        <linearGradient id="grass-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="85" x2="0" y2="300">
          <stop offset="0" class="grass-stop-0" />
          <stop offset="0.45" class="grass-stop-1" />
          <stop offset="1" class="grass-stop-2" />
        </linearGradient>

        <!-- 畫面最下面一條：從透明漸漸變成頁尾的綠色，讓風景和頁尾接起來 -->
        <!-- 遠山：山頂顏色比較清楚，往山腳慢慢被霧氣淡化 -->
        <linearGradient id="mountain-far-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="250">
          <stop offset="0" class="mountain-far-stop-0" />
          <stop offset="1" class="mountain-far-stop-1" />
        </linearGradient>

        <linearGradient id="mountain-near-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="115" x2="0" y2="250">
          <stop offset="0" class="mountain-near-stop-0" />
          <stop offset="1" class="mountain-near-stop-1" />
        </linearGradient>

        <!-- 山的陰影：山頂附近最明顯，往山腳慢慢淡掉 -->
        <linearGradient id="shade-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="250">
          <stop offset="0" class="shade-stop-0" />
          <stop offset="0.7" class="shade-stop-1" />
          <stop offset="1" class="shade-stop-2" />
        </linearGradient>

        <!-- 白雲：上面亮白，雲底帶一點主題色，和白色的積雪分得出來 -->
        <!-- 用雲自己的座標（-42 是雲頂、8 是雲底），每朵雲不管大小都一樣 -->
        <linearGradient id="cloud-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="-42" x2="0" y2="8">
          <stop offset="0" class="cloud-stop-0" />
          <stop offset="0.45" class="cloud-stop-1" />
          <stop offset="1" class="cloud-stop-2" />
        </linearGradient>

        <linearGradient id="bottom-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="fade-stop-0" />
          <stop offset="1" class="fade-stop-1" />
        </linearGradient>

        <!-- 水彩效果：用雜訊讓邊緣微微抖動、暈開 -->
        <filter id="watercolor" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" result="wobble" />
          <feGaussianBlur in="wobble" stdDeviation="0.7" />
        </filter>

        <!-- 水彩紙的顆粒感：疊一層很淡的雜訊 -->
        <filter id="paper" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="grain" />
          <feColorMatrix in="grain" type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.12 0" result="whiteGrain" />
          <feComposite in="whiteGrain" in2="SourceGraphic" operator="in" result="grainOnShape" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grainOnShape" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="300" fill="url(#sky-gradient)" />

      <!-- 遠方的高山 -->
      <g filter="url(#watercolor)">
        ${mountains()}
      </g>

      <g filter="url(#watercolor)">
        ${cloud(170, 120, 1)}
        ${cloud(430, 70, 0.7)}
        ${cloud(640, 135, 0.85)}
        ${cloud(960, 55, 0.6)}
      </g>

      <!-- 草坡 -->
      <g filter="url(#paper)">
        <path class="slope" d="${slopePath()}" fill="url(#grass-gradient)" filter="url(#watercolor)" />
      </g>
      ${grassBlades()}

      <!-- 泥土小路：踩實的泥土，整條同一個顏色 -->
      <g filter="url(#watercolor)">
        <path class="trail-dirt" d="${trailShape(1, 0.12)}" />
        ${trailEdgeGrass()}
      </g>

      <!-- 小花叢 -->
      <g filter="url(#watercolor)">
        ${flowerBushes()}
      </g>

      <rect y="272" width="1200" height="28" fill="url(#bottom-fade)" />
    </svg>`;

  footer.before(scenery);
}

document.addEventListener("DOMContentLoaded", createScenery);
