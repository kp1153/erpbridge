const { spawn } = require("child_process");
const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");

let mainWindow;
let nextProcess;

function waitForNext(url, retries, callback) {
  http.get(url, (res) => {
    if (res.statusCode === 200) {
      callback();
    } else {
      retry();
    }
  }).on("error", () => {
    retry();
  });

  function retry() {
    if (retries <= 0) {
      console.error("Next.js did not start in time");
      app.quit();
      return;
    }
    setTimeout(() => waitForNext(url, retries - 1, callback), 1000);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, "public", "icon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.on("ready", () => {
  nextProcess = spawn("node", ["node_modules/.bin/next", "start"], {
    cwd: __dirname,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, PORT: "3000" },
  });

  waitForNext("http://localhost:3000", 30, () => {
    createWindow();
  });
});

app.on("window-all-closed", () => {
  if (nextProcess) nextProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});