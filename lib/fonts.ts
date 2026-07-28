import {
  Anton,
  Bebas_Neue,
  Bungee,
  Permanent_Marker,
  Playfair_Display,
  Special_Elite,
  Caveat,
  Fredoka,
  Righteous,
  Space_Grotesk,
  Rubik_Mono_One,
  Libre_Baskerville,
  Oswald,
  Archivo_Black,
  Staatliches,
  VT323,
  IBM_Plex_Mono,
  Crimson_Text,
  JetBrains_Mono,
  Audiowide,
  Luckiest_Guy,
  Alfa_Slab_One,
  Gochi_Hand,
  Cormorant_Garamond,
  Nosifer,
  Stardos_Stencil,
} from "next/font/google";

// The site's own wordmark / headers — one consistent heavy condensed face,
// same idea as "CINEMA" always being set in the same typeface on the
// reference site regardless of which movie card you're looking at.
export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

// One distinct display face per tool card, so every card has its own
// typographic personality — mirrors the reference archive where every
// movie title is set in a different font.
export const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});
export const bungee = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bungee",
});
export const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
});
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "700",
  style: ["italic"],
  variable: "--font-playfair",
});
export const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-typewriter",
});
export const caveat = Caveat({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-caveat",
});
export const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-fredoka",
});
export const righteous = Righteous({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-righteous",
});
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-space",
});
export const rubikMono = Rubik_Mono_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-rubikmono",
});
export const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-baskerville",
});
export const oswald = Oswald({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-oswald",
});
export const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
});
export const staatliches = Staatliches({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-staatliches",
});
export const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
});
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-plexmono",
});
export const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: "700",
  style: ["italic"],
  variable: "--font-crimson",
});
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-jetbrains",
});
export const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-audiowide",
});
export const luckiestGuy = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-luckiest",
});
export const alfaSlabOne = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alfaslab",
});
export const gochiHand = Gochi_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gochi",
});
export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "700",
  style: ["italic"],
  variable: "--font-cormorant",
});
export const nosifer = Nosifer({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-nosifer",
});
export const stardosStencil = Stardos_Stencil({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-stardos",
});

// One class list to slap on <body> so every --font-* variable is available
// everywhere in the CSS.
export const fontVariables = [
  anton.variable,
  bebasNeue.variable,
  bungee.variable,
  permanentMarker.variable,
  playfair.variable,
  specialElite.variable,
  caveat.variable,
  fredoka.variable,
  righteous.variable,
  spaceGrotesk.variable,
  rubikMono.variable,
  libreBaskerville.variable,
  oswald.variable,
  archivoBlack.variable,
  staatliches.variable,
  vt323.variable,
  ibmPlexMono.variable,
  crimsonText.variable,
  jetbrainsMono.variable,
  audiowide.variable,
  luckiestGuy.variable,
  alfaSlabOne.variable,
  gochiHand.variable,
  cormorantGaramond.variable,
  nosifer.variable,
  stardosStencil.variable,
].join(" ");
