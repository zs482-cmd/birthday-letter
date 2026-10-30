const envelopes = ["pink", "blue", "lilac", "sage", "cream", "mint"];
const letters = ["pink floral", "mint and lilac", "birthday cake", "pink bows", "rose border", "gold stars"];
const cards = ["birthday collage", "party cat", "disco birthday", "birthday girl"];
const cakes = ["pink cupcake", "blue ribbon cake", "lavender ribbon cake", "strawberry cake", "vintage mint cake"];
const backgrounds = ["blush floral", "mint floral", "blue floral", "ivory floral", "vintage lace", "brown rabbits", "blue roses", "pink lace"];
const chosen = { envelope: 1, background: 8, letter: 1, card: 1, cake: 3, candleLit: false, text: "", step: 1, age: "21", gifts: ["bow", "butterfly", "balloons-2"], crop: { format: "portrait", zoom: 1, panX: 0, panY: 0 } };
try {
  const saved = JSON.parse(localStorage.getItem("birthday-envelope-choice") || "{}");
  for (const [key, max] of [["envelope", 6], ["background", 8], ["letter", 6], ["card", 4], ["cake", 5]]) if (Number.isInteger(saved[key]) && saved[key] >= 1 && saved[key] <= max) chosen[key] = saved[key];
  if (Number.isInteger(saved.step) && saved.step >= 1 && saved.step <= 6) chosen.step = saved.step;
  if (typeof saved.text === "string") chosen.text = saved.text;
  if (typeof saved.age === "string" && /^\d{0,2}$/.test(saved.age)) chosen.age = saved.age;
  if (Array.isArray(saved.gifts)) chosen.gifts = saved.gifts.filter(x => typeof x === "string");
  chosen.candleLit = saved.candleLit === true;
  if (saved.crop && ["portrait", "landscape"].includes(saved.crop.format)) {
    chosen.crop = { format: saved.crop.format, zoom: Math.min(3, Math.max(1, Number(saved.crop.zoom) || 1)), panX: Math.min(1, Math.max(-1, Number(saved.crop.panX) || 0)), panY: Math.min(1, Math.max(-1, Number(saved.crop.panY) || 0)) };
  }
} catch {}
const page = document.getElementById("page"), mainEnvelope = document.getElementById("main-envelope"), mainLetter = document.getElementById("main-letter"), paperFrame = document.getElementById("paper-frame"), letterText = document.getElementById("letter-text"), backdrop = document.getElementById("backdrop");
const mainCard = document.getElementById("main-card"), cardFrame = document.getElementById("card-frame"), cardStack = document.getElementById("card-stack"), photoInput = document.getElementById("photo-input"), photoMat = document.getElementById("photo-mat"), uploadButton = document.getElementById("upload-button"), adjustButton = document.getElementById("adjust-button"), editor = document.getElementById("photo-editor"), cropPreview = document.getElementById("crop-preview"), zoomSlider = document.getElementById("zoom-slider");
const cakeFrame = document.getElementById("cake-frame"), mainCake = document.getElementById("main-cake"), placedCandle = document.getElementById("placed-candle"), flame = document.getElementById("flame"), cakeHint = document.getElementById("cake-hint");
function save() { localStorage.setItem("birthday-envelope-choice", JSON.stringify(chosen)); }
function render() {
  page.dataset.step = chosen.step;
  mainEnvelope.src = `assets/envelope-sample-${chosen.envelope}.webp`;
  mainEnvelope.alt = `Open ${envelopes[chosen.envelope - 1]} envelope`;
  mainLetter.src = `assets/letter-${chosen.letter}.webp`;
  mainLetter.alt = `${letters[chosen.letter - 1]} letter paper`;
  paperFrame.dataset.paper = chosen.letter;
  mainCard.src = `assets/card-${chosen.card}.webp`;
  mainCard.alt = `${cards[chosen.card - 1]} photo card`;
  cardFrame.dataset.card = chosen.card;
  mainCake.src = `assets/cake-${chosen.cake}.webp`;
  mainCake.alt = cakes[chosen.cake - 1];
  cakeFrame.dataset.cake = chosen.cake;
  placedCandle.hidden = !chosen.candleLit;
  cakeFrame.classList.toggle("is-lit", chosen.candleLit);
  document.getElementById("match-tool").setAttribute("aria-pressed", String(chosen.candleLit));
  backdrop.style.backgroundImage = `url('assets/background-${chosen.background}.webp')`;
  const step = chosen.step;
  document.getElementById("heading").innerHTML = [null, 'choose your <em>envelope!</em>', 'write your <em>letter.</em>', 'add your <em>photo.</em>', 'choose your <em>cake.</em>', 'choose little <em>gifts.</em>', 'for <em>you.</em>'][step];
  document.getElementById("primary-label").textContent = [null, "envelope", "letter paper", "photo card", "cake", "little gifts", ""][step];
  document.querySelector(".rail-primary").hidden = step === 6;
  document.getElementById("envelope-choices").hidden = step !== 1;
  document.getElementById("letter-choices").hidden = step !== 2;
  document.getElementById("card-choices").hidden = step !== 3;
  document.getElementById("cake-choices").hidden = step !== 4;
  document.getElementById("gift-choices").hidden = step !== 5;
  document.getElementById("age-rail").hidden = step !== 5;
  document.getElementById("background-rail").hidden = step >= 4;
  document.getElementById("cake-tools").hidden = step !== 4;
  mainEnvelope.hidden = step !== 1; paperFrame.hidden = step !== 2; cardStack.hidden = step !== 3; cakeFrame.hidden = step !== 4;
  document.getElementById("preview-grid").hidden = true;
  document.getElementById("gift-scene").hidden = step < 5;
  document.getElementById("gift-envelope").style.backgroundImage = `url(assets/envelope-sample-${chosen.envelope}.webp)`;
  document.querySelector(".gift-flap").style.backgroundImage = `url(assets/envelope-sample-${chosen.envelope}.webp)`;
  const tones = [null,["#f1cbd2","#d89eac"],["#d2eaf6","#9fc7df"],["#e6def4","#bcb1d9"],["#e5efd4","#bdcca0"],["#fbefcb","#dec897"],["#d8eddf","#a9cdb9"]];
  document.getElementById("gift-scene").style.setProperty("--envelope-tone", tones[chosen.envelope][0]);
  document.getElementById("gift-scene").style.setProperty("--envelope-shade", tones[chosen.envelope][1]);
  document.getElementById("gift-letter-img").src = mainLetter.src;
  document.querySelector(".gift-letter").dataset.paper = chosen.letter;
  document.getElementById("gift-letter-ink").textContent = chosen.text;
  document.getElementById("gift-card-img").src = document.getElementById("preview-photo").src || mainCard.src;
  document.getElementById("gift-cake-img").src = mainCake.src;
  document.querySelector(".gift-cake").dataset.cake = chosen.cake;
  document.getElementById("age-input").value = chosen.age;
  renderAge(); renderGiftDecorations();
  document.getElementById("next-button").hidden = step === 6;
  document.getElementById("replay-button").hidden = step !== 6;
  document.getElementById("back-button").hidden = step === 1;
  document.getElementById("step-count").innerHTML = `0${step} <i></i> 06`;
  document.getElementById("preview-envelope").src = mainEnvelope.src;
  document.getElementById("preview-letter").src = mainLetter.src;
  document.getElementById("preview-photo").src = mainCard.src;
  document.getElementById("preview-cake").src = mainCake.src;
  updatePreviewPhoto();
  if (step === 6) requestAnimationFrame(playReveal);
  for (const type of ["envelope", "letter", "card", "cake", "background"]) document.querySelectorAll(`[data-${type}]`).forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset[type]) === chosen[type])));
  requestAnimationFrame(renderCrop);
  save();
}
function addChoice(parent, type, number, label, image) {
  const button = document.createElement("button"); button.className = "choice"; button.type = "button"; button.dataset[type] = number; button.setAttribute("aria-label", label); button.title = label;
  const img = document.createElement("img"); img.src = image; img.alt = ""; img.loading = "lazy"; button.append(img);
  button.addEventListener("click", () => { chosen[type] = number; if (type === "cake") { chosen.candleLit = false; cakeHint.textContent = ""; } render(); }); parent.append(button);
}
envelopes.forEach((name, index) => addChoice(document.getElementById("envelope-choices"), "envelope", index + 1, `${name} envelope`, `assets/envelope-sample-${index + 1}.webp`));
letters.forEach((name, index) => addChoice(document.getElementById("letter-choices"), "letter", index + 1, `${name} letter paper`, `assets/letter-${index + 1}.webp`));
cards.forEach((name, index) => addChoice(document.getElementById("card-choices"), "card", index + 1, `${name} photo card`, `assets/card-${index + 1}.webp`));
cakes.forEach((name, index) => addChoice(document.getElementById("cake-choices"), "cake", index + 1, name, `assets/cake-${index + 1}.webp`));
backgrounds.forEach((name, index) => addChoice(document.getElementById("background-choices"), "background", index + 1, `${name} background`, `assets/background-${index + 1}.webp`));
letterText.value = chosen.text;
letterText.addEventListener("input", () => { chosen.text = letterText.value; document.getElementById("gift-letter-ink").textContent = chosen.text; save(); });
document.getElementById("next-button").addEventListener("click", () => { chosen.step = Math.min(6, chosen.step + 1); render(); });
document.getElementById("back-button").addEventListener("click", () => { chosen.step = Math.max(1, chosen.step - 1); render(); });
document.getElementById("match-tool").addEventListener("click", () => { chosen.candleLit = true; cakeHint.textContent = ""; render(); });
const previewDialog = document.getElementById("preview-dialog"), previewDetail = document.getElementById("preview-detail");
document.getElementById("preview-close").addEventListener("click", () => previewDialog.close());
document.querySelectorAll("[data-preview], [data-gift-preview]").forEach(button => button.addEventListener("click", () => {
  const type = button.dataset.preview || button.dataset.giftPreview;
  if (type === "cake") { openWishScene(); return; }
  previewDetail.replaceChildren();
  const image = document.createElement("img");
  image.src = type === "photo" ? document.getElementById("preview-photo").src : ({ envelope: mainEnvelope, letter: mainLetter, cake: mainCake })[type].src;
  image.alt = type;
  if (type === "letter") {
    const paper = document.createElement("div"); paper.className = "letter-preview"; paper.dataset.paper = chosen.letter;
    const ink = document.createElement("span"); ink.className = "gift-letter-ink"; ink.textContent = chosen.text;
    paper.append(image, ink); previewDetail.append(paper);
  } else previewDetail.append(image);
  previewDialog.showModal();
}));
const wishDialog = document.getElementById("wish-dialog"), wishRoom = document.getElementById("wish-room"), wishArt = document.getElementById("wish-art"), wishStatus = document.getElementById("wish-status"), wishLight = document.getElementById("wish-light"), wishMic = document.getElementById("wish-mic"), wishBlow = document.getElementById("wish-blow");
let wishStream, wishAudio, wishFrame;
function openWishScene() {
  stopWishMicrophone();
  wishRoom.classList.remove("is-lit", "is-blown"); wishArt.classList.remove("is-lit");
  wishArt.dataset.cake = chosen.cake;
  document.getElementById("wish-cake").src = mainCake.src;
  wishStatus.textContent = "Light the candle";
  wishLight.textContent = "✧ light the candle"; wishLight.hidden = false;
  wishMic.hidden = true; wishBlow.hidden = true;
  wishDialog.showModal();
}
function lightWishCandle() {
  wishRoom.classList.remove("is-blown"); wishRoom.classList.add("is-lit"); wishArt.classList.add("is-lit");
  wishStatus.textContent = "Make a wish, then blow";
  wishMic.textContent = "◌ blow into the microphone";
  wishLight.hidden = true; wishMic.hidden = false; wishBlow.hidden = false;
  startWishMicrophone();
}
function blowWishCandle() {
  if (!wishRoom.classList.contains("is-lit")) return;
  wishRoom.classList.remove("is-lit"); wishRoom.classList.add("is-blown"); wishArt.classList.remove("is-lit");
  wishStatus.textContent = "Your wish is on its way ✧";
  wishLight.textContent = "✧ light again"; wishLight.hidden = false; wishMic.hidden = true; wishBlow.hidden = true;
  stopWishMicrophone();
}
function stopWishMicrophone() {
  if (wishFrame) cancelAnimationFrame(wishFrame); wishFrame = 0;
  if (wishStream) wishStream.getTracks().forEach(track => track.stop()); wishStream = null;
  if (wishAudio) wishAudio.close().catch(() => {}); wishAudio = null;
}
document.getElementById("wish-close").addEventListener("click", () => wishDialog.close());
wishDialog.addEventListener("close", stopWishMicrophone);
wishLight.addEventListener("click", lightWishCandle);
wishBlow.addEventListener("click", blowWishCandle);
wishMic.addEventListener("click", startWishMicrophone);
async function startWishMicrophone() {
  if (wishStream) return;
  if (!navigator.mediaDevices?.getUserMedia) { wishStatus.textContent = "Use the touch button to blow out the candle"; return; }
  wishStatus.textContent = "Allow microphone, then blow towards it";
  try {
    wishStream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    if (!wishDialog.open || !wishRoom.classList.contains("is-lit")) { stopWishMicrophone(); return; }
    wishAudio = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = wishAudio.createAnalyser(); analyser.fftSize = 2048;
    wishAudio.createMediaStreamSource(wishStream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    let baseline = .008, blowScore = 0, lastTime = 0;
    wishMic.textContent = "◌ listening…";
    wishStatus.textContent = "Blow towards your microphone";
    function listen(time) {
      if (!wishStream || !wishDialog.open || !wishRoom.classList.contains("is-lit")) return;
      analyser.getFloatTimeDomainData(samples);
      let energy = 0; for (const sample of samples) energy += sample * sample;
      const level = Math.sqrt(energy / samples.length);
      const elapsed = Math.min(50, time - (lastTime || time)); lastTime = time;
      const threshold = Math.max(.018, baseline * 2.1);
      if (level > threshold) blowScore += elapsed * Math.min(2, level / threshold);
      else blowScore = Math.max(0, blowScore - elapsed * 1.2);
      if (blowScore > 130) { blowWishCandle(); return; }
      if (level < threshold) baseline = baseline * .995 + Math.min(level,.035) * .005;
      wishFrame = requestAnimationFrame(listen);
    }
    wishFrame = requestAnimationFrame(listen);
  } catch {
    stopWishMicrophone(); wishStatus.textContent = "Use the touch button to blow out the candle";
  }
}
async function updatePreviewPhoto() {
  const source = mainCard.src, image = new Image(); image.src = source;
  try { await image.decode(); } catch { return; }
  if (mainCard.src !== source) return;
  const canvas = document.createElement("canvas"), width = 420, height = Math.round(width * image.naturalHeight / image.naturalWidth);
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d"); ctx.drawImage(image, 0, 0, width, height);
  if (photoImage) {
    const photoWidth = width * (chosen.crop.format === "portrait" ? .64 : .78);
    const photoHeight = photoWidth * (chosen.crop.format === "portrait" ? 1.25 : .75);
    const centerY = height * ({1:.52,2:.50,3:.50,4:.48}[chosen.card]);
    ctx.save(); ctx.translate(width / 2, centerY); ctx.rotate(-2 * Math.PI / 180);
    ctx.beginPath(); ctx.rect(-photoWidth/2, -photoHeight/2, photoWidth, photoHeight); ctx.clip();
    const scale = Math.max(photoWidth/photoImage.naturalWidth, photoHeight/photoImage.naturalHeight) * chosen.crop.zoom;
    const drawnW = photoImage.naturalWidth * scale, drawnH = photoImage.naturalHeight * scale;
    ctx.drawImage(photoImage, -drawnW/2 + chosen.crop.panX*(drawnW-photoWidth)/2, -drawnH/2 + chosen.crop.panY*(drawnH-photoHeight)/2, drawnW, drawnH);
    ctx.restore();
  }
  document.getElementById("preview-photo").src = canvas.toDataURL("image/jpeg", .9);
  document.getElementById("gift-card-img").src = document.getElementById("preview-photo").src;
}
uploadButton.addEventListener("click", () => photoInput.click());
adjustButton.addEventListener("click", () => openEditor());
document.getElementById("editor-close").addEventListener("click", () => editor.close());
document.getElementById("editor-done").addEventListener("click", () => editor.close());
let photoUrl, photoImage;
function drawPhoto(canvas) {
  if (!photoImage || !canvas.clientWidth || !canvas.clientHeight) return;
  const width = canvas.clientWidth, height = canvas.clientHeight, ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d"); ctx.scale(ratio, ratio);
  const scale = Math.max(width / photoImage.naturalWidth, height / photoImage.naturalHeight) * chosen.crop.zoom;
  const drawnWidth = photoImage.naturalWidth * scale, drawnHeight = photoImage.naturalHeight * scale;
  const overflowX = (drawnWidth - width) / 2, overflowY = (drawnHeight - height) / 2;
  ctx.drawImage(photoImage, (width - drawnWidth) / 2 + chosen.crop.panX * overflowX, (height - drawnHeight) / 2 + chosen.crop.panY * overflowY, drawnWidth, drawnHeight);
}
function renderCrop() {
  photoMat.dataset.format = chosen.crop.format;
  cropPreview.dataset.format = chosen.crop.format;
  zoomSlider.value = chosen.crop.zoom;
  document.querySelectorAll("[data-format]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.format === chosen.crop.format)));
  requestAnimationFrame(() => { drawPhoto(document.getElementById("card-photo")); drawPhoto(document.getElementById("crop-canvas")); });
}
function openEditor() { renderCrop(); editor.showModal(); requestAnimationFrame(renderCrop); }
async function showPhoto(blob, edit = false) {
  const nextUrl = URL.createObjectURL(blob), image = new Image();
  image.src = nextUrl;
  try { await image.decode(); } catch { URL.revokeObjectURL(nextUrl); return false; }
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = nextUrl; photoImage = image;
  photoMat.hidden = false; adjustButton.hidden = false;
  uploadButton.querySelector("span").textContent = "change photo";
  if (edit) { chosen.crop = { format: image.naturalWidth > image.naturalHeight ? "landscape" : "portrait", zoom: 1, panX: 0, panY: 0 }; save(); }
  renderCrop();
  updatePreviewPhoto();
  if (edit) openEditor();
  return true;
}
function photoDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("birthday-card", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("photos");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
photoDb().then(db => {
  const request = db.transaction("photos", "readonly").objectStore("photos").get("current");
  request.onsuccess = () => { if (request.result) showPhoto(request.result); };
}).catch(() => {});
photoInput.addEventListener("change", async () => {
  const file = photoInput.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  if (!(await showPhoto(file, true))) return;
  try {
    const db = await photoDb();
    db.transaction("photos", "readwrite").objectStore("photos").put(file, "current");
  } catch {}
  photoInput.value = "";
});
document.querySelectorAll("[data-format]").forEach(button => button.addEventListener("click", () => {
  chosen.crop.format = button.dataset.format; chosen.crop.panX = 0; chosen.crop.panY = 0; renderCrop(); save();
}));
zoomSlider.addEventListener("input", () => { chosen.crop.zoom = Number(zoomSlider.value); renderCrop(); save(); });
let dragStart;
cropPreview.addEventListener("pointerdown", event => {
  if (!photoImage) return;
  dragStart = { x: event.clientX, y: event.clientY, panX: chosen.crop.panX, panY: chosen.crop.panY };
  cropPreview.setPointerCapture(event.pointerId);
});
cropPreview.addEventListener("pointermove", event => {
  if (!dragStart || !photoImage) return;
  const width = cropPreview.clientWidth, height = cropPreview.clientHeight;
  const scale = Math.max(width / photoImage.naturalWidth, height / photoImage.naturalHeight) * chosen.crop.zoom;
  const maxX = Math.max(0, (photoImage.naturalWidth * scale - width) / 2), maxY = Math.max(0, (photoImage.naturalHeight * scale - height) / 2);
  chosen.crop.panX = maxX ? Math.max(-1, Math.min(1, dragStart.panX + (event.clientX - dragStart.x) / maxX)) : 0;
  chosen.crop.panY = maxY ? Math.max(-1, Math.min(1, dragStart.panY + (event.clientY - dragStart.y) / maxY)) : 0;
  renderCrop(); save();
});
cropPreview.addEventListener("pointerup", () => { dragStart = null; });
cropPreview.addEventListener("pointercancel", () => { dragStart = null; });
new ResizeObserver(renderCrop).observe(photoMat);
new ResizeObserver(renderCrop).observe(cropPreview);
const stickerSpecs = [
  {id:"bow", label:"Pearl bow", sheet:0, box:[55,42,500,370]},
  {id:"butterfly", label:"Pink butterfly", sheet:0, box:[20,1280,410,1530]},
  {id:"camera", label:"Instant camera", sheet:0, box:[65,820,375,1175]},
  {id:"wings", label:"Angel wings", sheet:0, box:[390,1010,1040,1520]},
  {id:"cassette", label:"Pink cassette", sheet:0, box:[900,25,1310,340]},
  {id:"balloons-3", label:"Rose balloons", sheet:1, box:[0,805,730,1898]},
  {id:"balloons-4", label:"Silver balloons", sheet:1, box:[690,850,1407,1898]}
];
chosen.gifts = chosen.gifts.filter(id => stickerSpecs.some(sticker => sticker.id === id));
const stickerImages = new Map();
function renderAge() {
  const holder = document.getElementById("age-balloons"); holder.replaceChildren();
  for (const digit of (chosen.age || "21")) {
    const balloon = document.createElement("span"); balloon.className = "number-balloon"; balloon.textContent = digit; holder.append(balloon);
  }
}
document.getElementById("age-input").addEventListener("input", event => {
  chosen.age = event.target.value.replace(/\D/g, "").slice(0,2); event.target.value = chosen.age; renderAge(); save();
});
function renderGiftDecorations() {
  const holder = document.getElementById("gift-decorations"); holder.replaceChildren();
  for (const id of chosen.gifts) {
    const source = stickerImages.get(id); if (!source) continue;
    if (id === "wings") {
      for (const side of ["left", "right"]) {
        const wing = document.createElement("img"); wing.src = stickerImages.get(`wing-${side}`);
        wing.alt = `${side} angel wing`; wing.className = `scene-sticker sticker-wing-${side}`; holder.append(wing);
      }
      continue;
    }
    const img = document.createElement("img"); img.src = source; img.alt = stickerSpecs.find(x=>x.id===id)?.label || id;
    img.className = `scene-sticker sticker-${id}`; holder.append(img);
  }
  document.querySelectorAll("[data-sticker]").forEach(button => button.setAttribute("aria-pressed", String(chosen.gifts.includes(button.dataset.sticker))));
}
async function loadStickerSheet(src) {
  const img = new Image(); img.src = src; await img.decode(); return img;
}
function cutSticker(img, box) {
  const [x1,y1,x2,y2] = box, scale = Math.min(1, 340 / Math.max(x2-x1,y2-y1));
  const w = Math.round((x2-x1)*scale), h = Math.round((y2-y1)*scale);
  const canvas = document.createElement("canvas"); canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext("2d",{willReadFrequently:true}); ctx.drawImage(img,x1,y1,x2-x1,y2-y1,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h), a=data.data, seen=new Uint8Array(w*h), queue=new Int32Array(w*h); let head=0,tail=0;
  if (img.src.endsWith("balloon-cutouts.png")) {
    for (let pass=0;pass<8;pass++) {
      const old=new Uint8Array(w*h); for(let p=0;p<old.length;p++) old[p]=a[p*4+3];
      for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++) {
        const p=y*w+x,i=p*4;
        if(old[p]>0 && Math.min(a[i],a[i+1],a[i+2])>232 &&
          [p-1,p+1,p-w,p+w,p-w-1,p-w+1,p+w-1,p+w+1].some(q=>old[q]<32)) a[i+3]=0;
      }
    }
    ctx.putImageData(data,0,0); return canvas.toDataURL("image/png");
  }
  function white(p) { const i=p*4,r=a[i],g=a[i+1],b=a[i+2]; return Math.min(r,g,b)>224 && Math.max(r,g,b)-Math.min(r,g,b)<27; }
  function add(p) { if (!seen[p] && white(p)) { seen[p]=1; queue[tail++]=p; } }
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}
  for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}
  while(head<tail){const p=queue[head++],x=p%w,y=(p/w)|0;if(x) add(p-1);if(x<w-1)add(p+1);if(y)add(p-w);if(y<h-1)add(p+w)}
  for(let p=0;p<seen.length;p++) if(seen[p]) a[p*4+3]=0;
  ctx.putImageData(data,0,0); return canvas.toDataURL("image/png");
}
Promise.all([loadStickerSheet("assets/sticker-sheet.jpg"),loadStickerSheet("assets/balloon-cutouts.png")]).then(sheets=>{
  const rail=document.getElementById("gift-choices");
  stickerImages.set("wing-left",cutSticker(sheets[0],[390,1010,715,1520]));
  stickerImages.set("wing-right",cutSticker(sheets[0],[715,1010,1040,1520]));
  for(const spec of stickerSpecs){
    const src=cutSticker(sheets[spec.sheet],spec.box); stickerImages.set(spec.id,src);
    const button=document.createElement("button"); button.type="button"; button.className="choice sticker-choice"; button.dataset.sticker=spec.id; button.title=spec.label; button.setAttribute("aria-label",spec.label);
    const image=document.createElement("img"); image.src=src; image.alt=""; button.append(image);
    button.addEventListener("click",()=>{chosen.gifts=chosen.gifts.includes(spec.id)?chosen.gifts.filter(x=>x!==spec.id):[...chosen.gifts,spec.id]; renderGiftDecorations(); save();});
    rail.append(button);
  }
  renderGiftDecorations();
}).catch(error=>console.error("Could not load gift stickers",error));
function playReveal() {
  const scene=document.getElementById("gift-scene");
  scene.classList.remove("revealing"); void scene.offsetWidth; scene.classList.add("revealing");
}
document.getElementById("replay-button").addEventListener("click",playReveal);
render();
