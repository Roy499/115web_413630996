// 點擊攝影作品的照片，跳出一個小窗放大檢視
// 用 HTML 內建的 <dialog>：按 Esc 會自動關閉，開著的時候後面的網頁不能點
// 小窗裡可以按左右箭頭（或鍵盤 ← →）切換上一張、下一張

function createLightbox() {
  const photos = Array.from(document.querySelectorAll(".photo-grid img"));
  if (photos.length === 0) return;

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="關閉">✕</button>
    <button class="lightbox-prev" type="button" aria-label="上一張">‹</button>
    <figure>
      <img alt="">
      <figcaption></figcaption>
    </figure>
    <button class="lightbox-next" type="button" aria-label="下一張">›</button>`;
  document.body.append(dialog);

  const big = dialog.querySelector("img");
  const caption = dialog.querySelector("figcaption");
  let current = 0;

  // 顯示第 index 張（超過頭尾就繞回另一端）
  function show(index) {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    big.src = photo.src;
    big.alt = photo.alt;
    caption.textContent = `${photo.alt}（${current + 1} / ${photos.length}）`;
  }

  photos.forEach((photo, i) => {
    // 讓照片可以用鍵盤 Tab 選到、按 Enter 打開
    photo.tabIndex = 0;
    photo.setAttribute("role", "button");
    photo.setAttribute("aria-label", `放大檢視：${photo.alt}`);

    photo.addEventListener("click", () => {
      show(i);
      dialog.showModal();
    });
    photo.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        photo.click();
      }
    });
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".lightbox-prev").addEventListener("click", () => show(current - 1));
  dialog.querySelector(".lightbox-next").addEventListener("click", () => show(current + 1));

  // 點照片以外的暗色背景也會關閉
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

document.addEventListener("DOMContentLoaded", createLightbox);
