// 在網頁上方深色的部分撒上隨機大小的星星，越往下越少
// 每次重新整理頁面，星星的位置都會重新隨機產生

function random(min, max) {
  return min + Math.random() * (max - min);
}

function createStars() {
  const old = document.querySelector(".stars");
  if (old) old.remove();

  const layer = document.createElement("div");
  layer.className = "stars";
  layer.setAttribute("aria-hidden", "true");

  const width = document.documentElement.clientWidth;
  // 只放在網頁上方約 75% 的範圍（底色比較深的地方）
  const height = document.body.offsetHeight * 0.75;
  layer.style.height = height + "px";

  // 星星數量依照面積決定
  const count = Math.round((width * height) / 900);

  for (let i = 0; i < count; i++) {
    // 用平方讓星星集中在上方，越往下越稀疏
    const y = Math.pow(Math.random(), 2) * height;
    const x = Math.random() * width;

    // 大部分很小、少數中等、極少數很大
    const r = Math.random();
    let size;
    if (r < 0.75) size = random(1, 1.6);
    else if (r < 0.95) size = random(1.8, 2.5);
    else size = random(3, 4);

    const star = document.createElement("span");
    star.className = size >= 3 ? "star big" : "star";
    star.style.left = x + "px";
    star.style.top = y + "px";
    star.style.width = size + "px";
    star.style.height = size + "px";
    // 越往下越淡
    star.style.opacity = random(0.5, 1) * (1 - y / height);
    layer.appendChild(star);
  }

  // 加上幾顆流星，數量依照寬度決定
  const meteorCount = Math.max(8, Math.round(width / 120));
  for (let i = 0; i < meteorCount; i++) {
    const meteor = document.createElement("span");
    meteor.className = "meteor";
    placeMeteor(meteor, width, height);
    // 第一次出現的時間錯開，才不會一起劃過
    meteor.style.animationDelay = random(0, 8) + "s";
    // 每顆流星的速度不同（數字越大，等待下一次出現的時間越久）
    meteor.style.animationDuration = random(6, 12) + "s";
    // 每劃過一次，就換到新的隨機位置
    meteor.addEventListener("animationiteration", () => {
      placeMeteor(meteor, width, height);
    });
    layer.appendChild(meteor);
  }

  document.body.prepend(layer);
}

// 替流星決定隨機的起點和長度
function placeMeteor(meteor, width, height) {
  meteor.style.left = random(-0.1, 0.8) * width + "px";
  meteor.style.top = random(0, 0.45) * height + "px";
  meteor.style.width = random(80, 160) + "px";
}

document.addEventListener("DOMContentLoaded", () => {
  createStars();

  // 圖片載入後頁面可能變高，重新產生一次
  window.addEventListener("load", createStars);

  // 視窗寬度改變時重新產生
  let timer;
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(createStars, 300);
  });
});
