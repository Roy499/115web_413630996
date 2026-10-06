// 作品集的照片相框：在卡片的白底（.box-bg）上，把每個 .photo-frame 的位置挖空
// 挖空的地方會露出後面的網頁背景（漸層和星星），看起來就像照片的相框
// 做法：畫一張 SVG 當遮罩（mask）——有顏色的地方顯示、透明的地方挖掉

// 圓角長方形的 SVG 路徑
function roundedRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  return `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} ` +
    `V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} ` +
    `H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} ` +
    `V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
}

function punchPhotoHoles(card) {
  const bg = card.querySelector(".box-bg");
  if (!bg) return;

  const box = bg.getBoundingClientRect();
  const width = box.width;
  const height = box.height;
  const cardRadius = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;

  // 先畫整張卡片的外框，再把每個相框的位置加進同一個路徑
  // fill-rule="evenodd"：外框裡面又被框起來的地方不填色，就變成洞
  let d = roundedRect(0, 0, width, height, cardRadius);
  card.querySelectorAll(".photo-frame").forEach((frame) => {
    const r = frame.getBoundingClientRect();
    const radius = parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0;
    d += " " + roundedRect(r.left - box.left, r.top - box.top, r.width, r.height, radius);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<path d="${d}" fill="black" fill-rule="evenodd" /></svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  bg.style.webkitMaskImage = url;
  bg.style.maskImage = url;
  bg.style.webkitMaskSize = "100% 100%";
  bg.style.maskSize = "100% 100%";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".box.has-holes").forEach((card) => {
    punchPhotoHoles(card);
    // 視窗大小改變、照片載入完成時，相框的位置會變，要重新挖洞
    new ResizeObserver(() => punchPhotoHoles(card)).observe(card);
    card.querySelectorAll("img").forEach((img) => {
      img.addEventListener("load", () => punchPhotoHoles(card));
    });
  });
});
