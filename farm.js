const qs  = (s, r=document) => r.querySelector(s);

// Beispiel-Daten
const farmData = {
  entry: {
    name: "Farmtor",
    image: "https://i.ibb.co/N6x330cW/farm-entrance.jpg",
    description: "Ein mystisches Tor, das den Eingang markiert.",
    encounters: [
      {
        stages: [
          {
            title: "Unheimliches Flüstern",
            image: "https://i.ibb.co/N6x330cW/farm-entrance.jpg",
            text: "Ein Flüstern erfüllt die Luft. Willst du weitergehen?",
            choices: [
              { text: "Mutig weiter", next: 1 },
              { text: "Umkehren", next: "end" }
            ]
          },
          {
            title: "Das Tor öffnet sich",
            image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
            text: "Das Tor knarrt auf und enthüllt den Hof.",
            choices: [
              { text: "Eintreten", next: "end" }
            ]
          }
        ]
      }
    ]
  },
  stable: {
    name: "Ställe",
    image: "https://i.ibb.co/h18gRSsg/Stable.jpg",
    description: "Pferde schnauben, Heu liegt in der Luft.",
    encounters: [
      {
        stages: [
          {
            title: "Neugieriges Pferd",
            image: "https://i.ibb.co/h18gRSsg/Stable.jpg",
            text: "Ein Pferd stupst dich neugierig an.",
            choices: [
              { text: "Hand ausstrecken", next: "end" },
              { text: "Zurücktreten", next: "end" }
            ]
          }
        ]
      }
    ]
  }
};

let currentLocation = "entry";

// Render Locations
function renderLocations() {
  const grid = qs("#locationsGrid");
  grid.innerHTML = "";
  Object.keys(farmData).forEach(loc => {
    const data = farmData[loc];
    const card = document.createElement("div");
    card.innerHTML = `
    <div class="farm-location-link">
      <div class="farm-location-card">
        <div class="farm-locations-image">
          <img src="${data.image}" alt="${data.name}">
        </div>
        <div class="farm-location-info">
          <h3>${data.name}</h3>
          <p>${data.description}</p>
        </div>
      </div>
    </div> 
    `;
    card.addEventListener("click", () => {
      currentLocation = loc;
      openEncounter(data.encounters[0]);
    });
    grid.appendChild(card);
  });
}

// Modal
function openEncounter(enc) {
  const modal = qs("#farmModal");
  const container = qs("#modalStageContainer");
  let index = 0;

  function renderStage(i) {
    container.innerHTML = "";
    const stage = enc.stages[i];
    if (!stage) return;

    const el = document.createElement("div");
    el.className = "stage";
    el.innerHTML = `
      <h3>${stage.title}</h3>
      <img src="${stage.image}" alt="">
      <p>${stage.text}</p>
      <div class="choice-buttons">
        ${stage.choices.map(c => `<button>${c.text}</button>`).join("")}
      </div>
    `;
    container.appendChild(el);

    el.querySelectorAll("button").forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        const choice = stage.choices[idx];
        if (choice.next === "end") {
          closeModal();
        } else {
          renderStage(choice.next);
        }
      });
    });
  }

  renderStage(index);
  modal.classList.add("active");
}
function closeModal() {
  qs("#farmModal").classList.remove("active");
}

// Events
document.addEventListener("DOMContentLoaded", () => {
  renderLocations();
  qs(".farm-close").addEventListener("click", closeModal);
  qs("#startFarm").addEventListener("click", () => renderLocations());
  qs("#randomEncounter").addEventListener("click", () => {
    const keys = Object.keys(farmData);
    const loc = keys[Math.floor(Math.random()*keys.length)];
    openEncounter(farmData[loc].encounters[0]);
  });
  qs("#resetFarm").addEventListener("click", () => renderLocations());
});