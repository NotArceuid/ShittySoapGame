import { DevHacks } from "../../Game/Game.svelte";
export const ColorTheme = $state({
  ResourcePanelBg: { r: 0, g: 0, b: 0, a: 0 },
  MainBg: { r: 0, g: 0, b: 0, a: 0 },
  NavigationBg: { r: 0, g: 0, b: 0, a: 0 },
  OverlayBg: { r: 0, g: 0, b: 0, a: 0 },
  TooltipBg: { r: 255, g: 255, b: 255, a: 1 },
  ActiveBorderColor: { r: 0, g: 0, b: 0, a: 0 },
  HoverActiveColor: { r: 0, g: 0, b: 0, a: 0 },
  ActionBg: { r: 0, g: 0, b: 0, a: 0 },
  BorderColor: { r: 0, g: 0, b: 0, a: 0 },
});

export function ColorThemeStyle() {
  return colorThemeStyle;
}

const colorThemeStyle = $derived({
  ResourcePanelBg: `background: rgba(${ColorTheme.ResourcePanelBg.r}, ${ColorTheme.ResourcePanelBg.g}, ${ColorTheme.ResourcePanelBg.b}, ${ColorTheme.ResourcePanelBg.a});`,
  MainBg: `background: rgba(${ColorTheme.MainBg.r}, ${ColorTheme.MainBg.g}, ${ColorTheme.MainBg.b}, ${ColorTheme.MainBg.a});`,
  NavigationBg: `background: rgba(${ColorTheme.NavigationBg.r}, ${ColorTheme.NavigationBg.g}, ${ColorTheme.NavigationBg.b}, ${ColorTheme.NavigationBg.a});`,
  OverlayBg: `background: rgba(${ColorTheme.OverlayBg.r}, ${ColorTheme.OverlayBg.g}, ${ColorTheme.OverlayBg.b}, ${ColorTheme.OverlayBg.a});`,
  TooltipBg: `background: rgba(${ColorTheme.TooltipBg.r}, ${ColorTheme.TooltipBg.g}, ${ColorTheme.TooltipBg.b}, ${ColorTheme.TooltipBg.a});`,
  ActiveBorderColor: `border-color: rgba(${ColorTheme.ActiveBorderColor.r}, ${ColorTheme.ActiveBorderColor.g}, ${ColorTheme.ActiveBorderColor.b}, ${ColorTheme.ActiveBorderColor.a});`,
  HoverActiveColor: `background: rgba(${ColorTheme.HoverActiveColor.r}, ${ColorTheme.HoverActiveColor.g}, ${ColorTheme.HoverActiveColor.b}, ${ColorTheme.HoverActiveColor.a});`,
  ActionBg: `background: rgba(${ColorTheme.ActionBg.r}, ${ColorTheme.ActionBg.g}, ${ColorTheme.ActionBg.b}, ${ColorTheme.ActionBg.a});`,
  BorderColor: `border-color: rgba(${ColorTheme.BorderColor.r}, ${ColorTheme.BorderColor.g}, ${ColorTheme.BorderColor.b}, ${ColorTheme.BorderColor.a});`,
});

export const Settings = $state({
  ShowMaxxedUpgrades: false,
});

export const InvertedTextColor = $state({ val: true });
export function RandomiseColors(): void {
  (Object.keys(ColorTheme) as Array<keyof typeof ColorTheme>).forEach((key) => {
    ColorTheme[key] = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
      a: parseFloat(Math.random().toFixed(2)),
    };
  });

  ColorTheme["TooltipBg"].a = 1.0;
}

export function SaveColors(): void {
  localStorage.setItem("colorTheme", JSON.stringify(ColorTheme));
}

export function LoadColors(): void {
  const saved = localStorage.getItem("colorTheme");
  if (saved) {
    try {
      const colorData = JSON.parse(saved);
      Object.assign(ColorTheme, colorData);
    } catch (error) {
      console.error("Error loading saved colors:", error);
    }
  }
}
