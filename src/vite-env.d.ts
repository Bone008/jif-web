/// <reference types="vite/client" />

declare module "*.scad?raw" {
  const src: string;
  export default src;
}
