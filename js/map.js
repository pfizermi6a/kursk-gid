// js/map.jsdwadwadaw

const dataFiles = [
  "../assets/attractions.json",
  "../assets/parks.json",
  "../assets/hotels.json",
  "../assets/cafes.json",
];

const categories = {
  attraction: "islands#redIcon",
  park: "islands#greenIcon",
  hotel: "islands#blueIcon",
  cafe: "islands#violetIcon",
};

let allPlaces = { type: "FeatureCollection", features: [] };
let map, objectManager;

// Загружаем все файлы
Promise.all(dataFiles.map((url) => fetch(url).then((r) => r.json())))
  .then((datasets) => {
    datasets.forEach((data) => allPlaces.features.push(...data.features));
    ymaps.ready(initMap);
  })
  .catch((err) => console.error("Ошибка загрузки данных:", err));

function initMap() {
  map = new ymaps.Map("map", {
    center: [51.7277, 36.19],
    zoom: 12,
    controls: ["zoomControl", "fullscreenControl"],
  });

  objectManager = new ymaps.ObjectManager({
    clusterize: true,
    gridSize: 32,
  });

  // Добавляем стиль и содержимое балуна
  allPlaces.features.forEach((f) => {
    const cat = f.properties.category;
    f.options = { preset: categories[cat] || "islands#grayIcon" };
    f.properties.balloonContent = `
      <strong>${f.properties.name}</strong><br/>
      ${f.properties.description || ""}
    `;
  });

  objectManager.add(allPlaces);
  map.geoObjects.add(objectManager);

  // Фильтры
  const checkboxes = document.querySelectorAll(
    "#mapControls input[type=checkbox]"
  );
  const resetBtn = document.getElementById("resetFilters");

  function applyFilter() {
    const active = Array.from(checkboxes)
      .filter((c) => c.checked)
      .map((c) => c.value);

    objectManager.setFilter((obj) => active.includes(obj.properties.category));

    const bounds = objectManager.getBounds();
    if (bounds) map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 30 });
  }

  // Исправленный сброс фильтров
  resetBtn.addEventListener("click", () => {
    checkboxes.forEach((c) => (c.checked = false));
    applyFilter();
  });

  checkboxes.forEach((c) => c.addEventListener("change", applyFilter));

  applyFilter();

  // --- Легенда ---
  const legend = document.createElement("div");
  legend.className = "map-legend";
  legend.innerHTML = `
    <strong>Легенда</strong>
    <ul>
      <li><span class="dot red"></span> Достопримечательности</li>
      <li><span class="dot green"></span> Парки</li>
      <li><span class="dot blue"></span> Отели</li>
      <li><span class="dot violet"></span> Кафе и рестораны</li>
    </ul>
  `;
  document.getElementById("mapSection").appendChild(legend);
}
