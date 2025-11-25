const wifi = require("node-wifi");
const { exec } = require("child_process");

// ---- Init Wi-Fi module ----
wifi.init({ iface: null }); // auto detect Wi-Fi interface

// Helper: run shell command (Windows netsh)
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { encoding: "utf8" }, (error, stdout) => {
      if (error) return reject(error);
      resolve(stdout);
    });
  });
}

// Rate security based on auth type (Open / WEP / WPA / WPA2 / WPA3)
function rateSecurityByAuth(auth) {
  if (!auth) return { level: "Unknown", message: "Cannot detect authentication type." };

  const a = auth.toLowerCase();

  if (a.includes("open") || a.includes("none")) {
    return { level: "Very Weak", message: "Open network (no password). Anyone can connect." };
  }
  if (a.includes("wep")) {
    return { level: "Very Weak", message: "WEP is outdated and easily hackable. Use WPA2 or WPA3." };
  }
  if (a.includes("wpa3")) {
    return { level: "Strong", message: "WPA3 is very secure." };
  }
  if (a.includes("wpa2")) {
    return { level: "Good", message: "WPA2 is secure for most home networks. WPA3 is even better." };
  }
  if (a.includes("wpa")) {
    return { level: "Medium", message: "Old WPA. Prefer WPA2 or WPA3." };
  }

  return { level: "Unknown", message: "Unrecognized authentication type." };
}

// Rate password strength from length
function ratePasswordByLength(len) {
  if (typeof len !== "number" || Number.isNaN(len)) {
    return { level: "Unknown", message: "Password length not available." };
  }

  if (len < 8) {
    return { level: "Very Weak", message: `Only ${len} characters. Use at least 12+.` };
  }
  if (len < 12) {
    return { level: "Weak", message: `${len} characters. Better to use 12+.` };
  }
  if (len < 16) {
    return { level: "Medium", message: `${len} characters. Decent, but can be stronger.` };
  }
  if (len < 20) {
    return { level: "Strong", message: `${len} characters. Good length.` };
  }
  return { level: "Very Strong", message: `${len} characters. Excellent length.` };
}

// Get current Wi-Fi connection
function getCurrentWifi() {
  return new Promise((resolve, reject) => {
    wifi.getCurrentConnections((error, connections) => {
      if (error) return reject(error);
      resolve(connections?.[0] || null);
    });
  });
}

// Scan all visible networks
function scanNetworks() {
  return new Promise((resolve, reject) => {
    wifi.scan((error, networks) => {
      if (error) return reject(error);
      resolve(networks || []);
    });
  });
}

// Get saved Wi-Fi password lengths (Windows only)
// Returns: { [ssid]: { auth, cipher, passwordLength } }
async function getSavedWifiPasswordLengths() {
  const result = {};

  if (process.platform !== "win32") {
    return result; // On non-Windows, we can't read saved passwords
  }

  try {
    const profilesOutput = await runCommand("netsh wlan show profiles");
    const profileNames = [
      ...profilesOutput.matchAll(/All User Profile\s*:\s*(.+)\r?/g),
    ].map((m) => m[1].trim());

    for (const name of profileNames) {
      try {
        const detail = await runCommand(
          `netsh wlan show profile name="${name}" key=clear`
        );

        const authMatch = detail.match(/Authentication\s*:\s*(.+)\r?/);
        const cipherMatch = detail.match(/Cipher\s*:\s*(.+)\r?/);
        const keyMatch = detail.match(/Key Content\s*:\s*(.+)\r?/);

        const auth = authMatch ? authMatch[1].trim() : "Unknown";
        const cipher = cipherMatch ? cipherMatch[1].trim() : "Unknown";
        const password = keyMatch ? keyMatch[1].trim() : null;
        const passwordLength = password ? password.length : null;

        result[name] = {
          auth,
          cipher,
          passwordLength,
        };
      } catch {
        // Ignore individual profile errors
      }
    }
  } catch {
    // Ignore global failure
  }

  return result;
}

// MAIN
(async () => {
  console.log("\n=== Wi-Fi Security Report ===\n");

  // 1) Current Wi-Fi
  console.log("📌 Current Wi-Fi Connection:");
  try {
    const wifiInfo = await getCurrentWifi();
    if (!wifiInfo) {
      console.log("Not connected to any Wi-Fi.");
    } else {
      console.log("SSID           :", wifiInfo.ssid);
      console.log("BSSID          :", wifiInfo.bssid);
      console.log("Signal Quality :", wifiInfo.quality + "%");
      console.log("Frequency      :", wifiInfo.frequency + " MHz");
      console.log("Security       :", wifiInfo.security || "Unknown");
    }
  } catch (err) {
    console.error("Error reading current Wi-Fi:", err.message);
  }

  // 2) Get saved password lengths (for length-based analysis)
  const savedProfiles = await getSavedWifiPasswordLengths();

  // 3) Scan and show all networks
  console.log("\n📡 Scanning nearby Wi-Fi networks...\n");

  try {
    const networks = await scanNetworks();

    if (!networks.length) {
      console.log("No Wi-Fi networks found. Is Wi-Fi turned on?");
      return;
    }

    networks.forEach((net, index) => {
      const ssid = net.ssid || "(Hidden SSID)";
      const bssid = net.bssid || net.mac || "Unknown";
      const channel = net.channel ?? "Unknown";
      const freq = net.frequency ? `${net.frequency} MHz` : "Unknown";
      const quality =
        typeof net.quality !== "undefined"
          ? `${net.quality}%`
          : net.signal_level || "Unknown";

      const secText = Array.isArray(net.security)
        ? net.security.join(", ")
        : net.security || "Unknown";

      const secRating = rateSecurityByAuth(secText);

      const saved = savedProfiles[ssid];
      const passwordLength = saved?.passwordLength ?? null;
      const passRating = ratePasswordByLength(passwordLength);

      console.log("--------------------------------------------------");
      console.log(`#${index + 1}`);
      console.log("SSID            :", ssid);
      console.log("BSSID/MAC       :", bssid);
      console.log("Channel         :", channel);
      console.log("Frequency       :", freq);
      console.log("Signal          :", quality);
      console.log("Security (auth) :", secText);
      console.log(`▶ Security Rate : ${secRating.level} – ${secRating.message}`);

      if (passwordLength !== null) {
        console.log(`Password length : ${passwordLength} characters`);
        console.log(
          `▶ Password Rate : ${passRating.level} – ${passRating.message}`
        );
      } else {
        console.log(
          "Password length : Unknown (network not saved on this device or no password stored)."
        );
      }
    });

    console.log("\nTotal networks found:", networks.length);
    console.log("\n=== Report Finished ===\n");
  } catch (err) {
    console.error("Error scanning networks:", err.message);
  }
})();
