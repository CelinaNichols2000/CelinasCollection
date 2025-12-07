let images = [
  "https://i.ibb.co/cKngDwqM/victem4.png",
  "https://i.ibb.co/N6RmPTfJ/victem9.png",
  "https://i.ibb.co/zHZzb0nD/victem7.png",
  "https://i.ibb.co/C5fDqdDM/victem6.png",
  "https://i.ibb.co/tMtPN6Sy/victem10.png",
  "https://i.ibb.co/NwcZPz8/victem5.png",
  "https://i.ibb.co/7tp9nn3V/victem2-1.png",
  "https://i.ibb.co/mrs1nQJg/victem3.png",
  "https://i.ibb.co/LhJQyd0x/victem8-1.png",
  "https://i.ibb.co/1tw2DcLF/victem10.png",
  "https://i.ibb.co/Kpb5yrpM/victem11.png",
  "https://i.ibb.co/4g1KspRw/victem12.png",
  "https://i.ibb.co/LhqPnt6X/victem13.png",
  "https://i.ibb.co/7JkzZ8qv/victem14.png",
  "https://i.ibb.co/8D4Q0B7r/victem15.png",
  "https://i.ibb.co/dwGpcH5p/victem16.png",
  "https://i.ibb.co/Q3pDhJ7S/victem17.png"
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
  ch1.firstChild.style.backgroundImage = "url(https://i.ibb.co/svHrWrfv/celi1.png)";
  ch1.style.transform = "scale(0.9,0.9) translateY(-11%)";

  ACTIONBAR.TriggerMacro(texts[i]);
}
