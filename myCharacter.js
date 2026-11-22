let images = [
  "https://images.celinascollection.com/victems/victem4.png",
  "https://images.celinascollection.com/victems/victem9.png",
  "https://images.celinascollection.com/victems/victem7.png",
  "https://images.celinascollection.com/victems/victem6.png",
  "https://images.celinascollection.com/victems/victem10.png",
  "https://images.celinascollection.com/victems/victem5.png",
  "https://images.celinascollection.com/victems/victem2-1.png",
  "https://images.celinascollection.com/victems/victem3.png",
  "https://images.celinascollection.com/victems/victem8-1.png",
  "https://images.celinascollection.com/victems/victem10-2.png",
  "https://images.celinascollection.com/victems/victem11.png",
  "https://images.celinascollection.com/victems/victem12.png",
  "https://images.celinascollection.com/victems/victem13.png",
  "https://images.celinascollection.com/victems/victem14.png",
  "https://images.celinascollection.com/victems/victem15.png",
  "https://images.celinascollection.com/victems/victem16.png",
  "https://images.celinascollection.com/victems/victem17.png"
];

let texts = [
  "*The catsuit wiggles helpless around~*",
  "*SQUEAAAK*",
  "*wiggles gently on the leash, collar tightly wrapped around your neck*",
  "BOK-BOK-BRAAAWK!",
  "HEE-HAW-HEE-HAW!",
  "*SQUEAAAK*",
  "*wiggles gently on the leash, collar tightly wrapped around your neck*",
  "*The dress shifts eagerly, needy for some lovely owner to cover up*",
  "BWAK! BA-KAWK!",
  "MOOOOO-OOOO-OOOO~",
  "*forced to wiggle deep inside some strangers anus*",
  "SQUEAAAK~",
  "Ohhh god... stuff me full... this is all Im good for anymore... just a silicone fucktoy begging to be used over and over...",
  "Hahhh... my hole is so empty... I cant even think straight until Im being used like the mindless toy I am...",
  "Nghhhh! I was so stupid to think I deserved to be more than just a living fleshlight... now I know my true purpose is serving cocks...",
  "Uhhnnn...each squish and squelch of my rubber pussy reminds me Im just a plastic cock milker now..",
  "Stretch me over your cock... Im just a thin pathetic condom, waiting to be filled with hot cum..."
];

function loadMyCharacters() {
  let i = Math.floor(Math.random() * images.length);

  let ch0 = document.getElementById("characters").children[0];
  ch0.firstChild.style.backgroundImage = "url(" + images[i] + ")";
  ch0.style.transform = "scale(-0.9,0.9)";

  let ch1 = document.getElementById("characters").children[1];
  ch1.firstChild.style.backgroundImage = "url(https://images.celinascollection.com/victems/34406ed8-905b-4b7e-89c4-0e112f58242d.png)";
  ch1.style.transform = "scale(0.9,0.9) translateY(-11%)";

  GAME_MANAGER.instance.Send("LocalChat", {channel: 0, message: texts[i]});
}
