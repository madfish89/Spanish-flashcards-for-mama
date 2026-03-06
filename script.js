let currentDoc = null;

const { jsPDF } = window.jspdf;

const defaultInput = `el deporte  sport
el baloncesto / el básquetbol  basketball
correr  to run
jugar al fútbol  I play soccer
`;

window.onload = () => {
  document.getElementById("input").value = defaultInput;
  renderPreview();
  setupSlider();
};

function setupSlider() {
  const slider = document.getElementById("cards-per-page");
  const valueDisplay = document.getElementById("cards-value");

  function updateValue() {
    valueDisplay.textContent = slider.value;
  }

  slider.addEventListener("input", updateValue);
  updateValue(); // initial
}

function parseInput() {
  const text = document.getElementById("input").value.trim();
  if (!text) return [];

  return text
    .split("\n")
    .map((line) => {
      const commaIndex = line.indexOf("  ");
      if (commaIndex === -1) return null;

      const front = line.substring(0, commaIndex).trim();
      const back = line.substring(commaIndex + 1).trim();
      if (!front || !back) return null;

      return { front, back };
    })
    .filter((pair) => pair !== null);
}

function renderPreview() {
  const pairs = parseInput();
  const grid = document.getElementById("preview-grid");
  grid.innerHTML = "";

  if (pairs.length === 0) {
    grid.innerHTML = `<p class="col-span-full text-center text-white/40 py-12">Type above to see live flip cards...</p>`;
    return;
  }

  pairs.forEach((pair) => {
    const cardHTML = `
            <div class="flip-card cursor-pointer" onclick="this.classList.toggle('flipped')">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="flex flex-col items-center justify-center h-full text-center">
                            <div class="text-blue-400 text-xs font-mono tracking-widest mb-4">FRONT</div>
                            <div class="text-3xl leading-tight font-semibold text-white">${pair.front}</div>
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div class="flex flex-col items-center justify-center h-full text-center">
                            <div class="text-emerald-400 text-xs font-mono tracking-widest mb-4">BACK</div>
                            <div class="text-3xl leading-tight font-semibold text-white">${pair.back}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    grid.innerHTML += cardHTML;
  });
}
document.getElementById("input").addEventListener("input", renderPreview);

function addFlashcardPage(doc, texts, cardsPerPage) {
  doc.addPage();

  const cols = 2;
  const rows = Math.ceil(cardsPerPage / cols);
  const marginX = 1;
  const marginY = 1;
  const spacingX = 1;
  const spacingY = 1;

  const cardW = (210 - 2 * marginX - (cols - 1) * spacingX) / cols;
  const cardH = (297 - 2 * marginY - (rows - 1) * spacingY) / rows;

  let fontSize = Math.max(16, Math.min(42, Math.floor(cardH * 0.62)));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);

  const positions = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      positions.push({
        x: marginX + j * (cardW + spacingX),
        y: marginY + i * (cardH + spacingY),
      });
    }
  }

  for (let i = 0; i < Math.min(texts.length, cardsPerPage); i++) {
    const text = texts[i] || "";
    const { x, y } = positions[i];

    // Thin cutting guide
    doc.setLineWidth(0.3);
    doc.rect(x, y, cardW, cardH);

    // Text (with wrapping)
    const maxWidth = cardW - 10;
    const splitText = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.38 + 1;
    const totalHeight = splitText.length * lineHeight;
    const startY = y + (cardH - totalHeight) / 2 + fontSize * 0.15;

    doc.text(splitText, x + cardW / 2, startY, { align: "center" });
  }
}

function createPDF() {
  const pairs = parseInput();
  if (pairs.length === 0) {
    alert("Please enter at least one flashcard pair!");
    return;
  }

  const cardsPerPage = parseInt(
    document.getElementById("cards-per-page").value,
  );

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  doc.deletePage(1);
  for (let i = 0; i < pairs.length; i += cardsPerPage) {
    const group = pairs.slice(i, i + cardsPerPage);
    const fronts = group.map((p) => p.front);
    const backs = group.map((p) => p.back);

    // English (front) page
    addFlashcardPage(doc, fronts, cardsPerPage);

    let swapped = [];
    const cols = 2;
    const maxRows = Math.ceil(cardsPerPage / cols);
    for (let r = 0; r < maxRows; r++) {
      const base = r * cols;
      if (base + 1 < backs.length) {
        swapped.push(backs[base + 1]);
        swapped.push(backs[base]);
      } else if (base < backs.length) {
        swapped.push(backs[base]);
      }
    }
    addFlashcardPage(doc, swapped, cardsPerPage);
  }

  currentDoc = doc;
  document.getElementById("status").innerHTML =
    `PDF ready! ${doc.getNumberOfPages()} pages • ${cardsPerPage} cards per page`;
  document.getElementById("download-btn").disabled = false;
  document.getElementById("download-btn").classList.remove("opacity-50");
}
function downloadPDF() {
  if (!currentDoc) return;
  let filename = document.getElementById("pdf-filename").value.trim();
  if (filename == "") {
    filename = "myflashcards";
  }
  filename = filename.replace(/[^a-z0-9-_ ]/gi, '_').trim();
  currentDoc.save(filename + '.pdf');
  const status = document.getElementById("status");
  status.innerHTML = `Downloaded! Print double-sided → Flip on long edge`;
  setTimeout(() => (status.innerHTML = ""), 7000);
}

function clearAll() {
  if (confirm("Clear everything and start fresh?")) {
    document.getElementById("input").value = "";
    currentDoc = null;
    document.getElementById("download-btn").disabled = true;
    document.getElementById("download-btn").classList.add("opacity-50");
    document.getElementById("status").innerHTML = "";
    renderPreview();
  }
}
