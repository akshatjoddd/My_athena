const { app, BrowserWindow, ipcMain, session, systemPreferences } = require("electron");
const path = require("node:path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    title: "myAthena Test",
    backgroundColor: "#ffffff",
    fullscreenable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(permission === "media" || permission === "fullscreen");
  });

  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return permission === "media" || permission === "fullscreen";
  });

  if (!app.isPackaged) {
    mainWindow.loadURL("http://127.0.0.1:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "Escape" && mainWindow?.isFullScreen()) {
      event.preventDefault();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (
    process.platform === "darwin" &&
    systemPreferences.getMediaAccessStatus("camera") === "not-determined"
  ) {
    systemPreferences.askForMediaAccess("camera").catch(() => {});
  }

  ipcMain.handle("window:fullscreen", async () => {
    const win = mainWindow;

    if (!win || win.isDestroyed()) return false;
    if (win.isFullScreen()) return true;

    const entered = new Promise(resolve => {
      let settled = false;

      const finish = value => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        win.removeListener("enter-full-screen", onEnter);
        win.removeListener("closed", onClosed);
        resolve(value);
      };

      const onEnter = () => finish(true);
      const onClosed = () => finish(false);
      const timeout = setTimeout(() => finish(win.isFullScreen()), 3000);

      win.once("enter-full-screen", onEnter);
      win.once("closed", onClosed);

      win.show();
      win.focus();
      win.setFullScreenable(true);
      win.setFullScreen(true);
    });

    const eventResult = await entered;

    return !win.isDestroyed() && (eventResult || win.isFullScreen());
  });

  ipcMain.handle("window:is-fullscreen", () => {
    return Boolean(mainWindow && mainWindow.isFullScreen());
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
