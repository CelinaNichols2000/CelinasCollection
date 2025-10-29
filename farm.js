const qs  = (s, r=document) => r.querySelector(s);

// Beispiel-Daten
const farmData = {
  entry: {
    name: "Farm Gate",
    image: "https://i.ibb.co/N6x330cW/farm-entrance.jpg",
    description: "A weathered iron gate marks the edge of the farm, its hinges groaning low at night, and sometimes you can glimpse pale shapes moving beyond the posts.",
    encounters: [
      {
        stages: [
          {
            title: "Entrance to the Farm",
            image: "https://i.ibb.co/N6x330cW/farm-entrance.jpg",
            text: "A weathered iron gate stands before you, its hinges creaking softly in the night. Pale shapes flicker in the shadows beyond. Do you dare to enter the farm through this gate?",
            choices: [
              { text: "Enter the farm", next: "/farm/farmGate.html" },
              { text: "Step back", next: "end" }
            ]
          },
        ]
      }
    ]
  },
  stable: {
    name: "Stables",
    image: "https://i.ibb.co/h18gRSsg/Stable.jpg",
    description: "An ancient timber stable leans against the hill, its doors creaking softly in the wind, and sometimes you can hear the whisper of hooves in the shadows.",
    encounters: [
      {
        stages: [
          {
            title: "Entrance to the Stables",
            image: "https://i.ibb.co/h18gRSsg/Stable.jpg",
            text: "An ancient timber stable leans against the hill. The scent of hay and the faint sound of hooves drift through the air. Will you step inside and see what awaits?",
            choices: [
              { text: "Enter the stables", next: "/farm/stables.html" },
              { text: "Step back", next: "end" }
            ]
          }
        ]
      }
    ]
  },
  farmhouse: {
    name: "Farmhouse",
    image: "https://i.ibb.co/5XhNVcnJ/farmhouse.webp",
    description: "A huge old farmhouse stands by the roadside, its windows glowing faintly in the dusk, and sometimes you can catch a shadow slipping behind the curtains.",
    encounters: [
      {
        stages: [
          {
            title: "Entrance to the Farmhouse",
            image: "https://i.ibb.co/5XhNVcnJ/farmhouse.webp",
            text: "The farmhouse glows warmly in the fading light, and shadows flicker behind its windows. A sense of comfort mixed with mystery draws you near. Do you enter the house?",
            choices: [
              { text: "Enter the farmhouse", next: "/farm/farmhouse.html" },
              { text: "Keep walking", next: "end" }
            ]
          }
        ]
      }
    ]
  },
  barn: {
    name: "Barn",
    image: "https://i.ibb.co/W42HhDXK/barn.jpg",
    description: "A rickety old barn leans precariously on the hillside, its doors creaking in the wind, and sometimes you can hear the rustle of hay and the soft lowing of unseen animals.",
    encounters: [
      {
        stages: [
          {
            title: "Entrance to the Barn",
            image: "https://i.ibb.co/W42HhDXK/barn.jpg",
            text: "A rickety old barn creaks on the hillside. The rustle of hay and soft lowing of unseen animals echo faintly. Do you venture inside to explore?",
            choices: [
              { text: "Enter the barn", next: "/farm/barn.html" },
              { text: "Step back", next: "end" }
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
        }
        else if (choice.next.endsWith(".html")) {
          window.location.href = choice.next; 
        }
        else {
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