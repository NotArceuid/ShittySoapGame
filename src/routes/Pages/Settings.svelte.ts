import { SaveSystem } from "../../Game/Saves.ts";
import { Notation } from "../../Game/Shared/BreakInfinity/Formatter.svelte.ts";

export enum ColorTheme {
  Light, Dark
}

interface SettingsType {
  Theme: ColorTheme;
  Format: Notation;
  Sounds: boolean;
}

export const Settings: SettingsType = $state({
  Theme: ColorTheme.Light,
  Format: Notation.Standard,
  Sounds: false,
})

const classList: Record<ColorTheme, string> = {
  [ColorTheme.Light]: "light",
  [ColorTheme.Dark]: "dark",
};

export function SetTheme(oldTheme: ColorTheme) {
  document.documentElement.classList.remove(classList[oldTheme]);
  switch (Settings.Theme) {
    case ColorTheme.Dark:
      document.documentElement.classList.toggle(classList[ColorTheme.Dark]);
      break;
    case ColorTheme.Light:
      document.documentElement.classList.toggle(classList[ColorTheme.Light]);
  }
}

let saveKey = "settings"
SaveSystem.SaveCallback<SettingsType>(saveKey, () => {
  return Settings;
})

SaveSystem.LoadCallback<SettingsType>(saveKey, (data) => {
  let oldTheme = Settings.Theme;
  Settings.Theme = data.Theme;
  SetTheme(oldTheme);
  Settings.Format = data.Format;
  Settings.Sounds = data.Sounds;
})
