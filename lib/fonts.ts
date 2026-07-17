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
].join(" ");
