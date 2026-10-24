
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myAthena", {
  enterFullscreen: () => ipcRenderer.invoke("window:fullscreen"),
  isFullscreen: () => ipcRenderer.invoke("window:is-fullscreen")
});
