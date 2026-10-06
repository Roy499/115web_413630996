// 所有可以切換的主題（id 要和 style.css 裡的 data-theme 對應）
const themes = [
  { id: "dreamy", name: "夢幻" },
  { id: "ocean", name: "海洋" },
  { id: "fresh", name: "清新" },
];

// 讀取上次選的主題（存在瀏覽器的 localStorage，換頁也會保留）
let current = 0;
try {
  const saved = localStorage.getItem("theme");
  const index = themes.findIndex((t) => t.id === saved);
  if (index !== -1) current = index;
} catch (e) {}

// 把主題套用到 <html> 上
function applyTheme() {
  document.documentElement.dataset.theme = themes[current].id;

  const label = document.querySelector(".theme-name");
  if (label) label.textContent = themes[current].name;
}

applyTheme();

// 頁面載入完成後，替按鈕加上點擊事件
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  const button = document.querySelector(".theme-btn");
  if (!button) return;

  button.addEventListener("click", () => {
    // 換到下一個主題，到最後一個就回到第一個
    current = (current + 1) % themes.length;
    applyTheme();

    try {
      localStorage.setItem("theme", themes[current].id);
    } catch (e) {}
  });
});
