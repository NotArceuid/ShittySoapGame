import { init, register } from "svelte-i18n";

export function RegisterLocales() {
  register("en", () => import("./en.json"));
}
