"use client";

import { useState, useEffect } from "react";
import { t, Lang } from "@/lib/i18n";
import { mockServers, getRecommended, Server } from "@/lib/servers";

type Screen = "splash" | "onboarding" | "home" | "servers" | "settings" | "language" | "profile";

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [connected, setConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server>(getRecommended());
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);
  const [timer, setTimer] = useState(0);
  const [search, setSearch] = useState("");

  // Apply theme
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // Apply RTL
  useEffect(() => {
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Connection timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connected) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [connected]);

  // Splash auto advance
  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => setScreen("onboarding"), 1800);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const filteredServers = mockServers.filter(
    (s) =>
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.countryFa.includes(search) ||
      s.cityFa.includes(search)
  );

  // ========== SPLASH ==========
  if (screen === "splash") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D1B36] text-white">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-primary" />
        </div>
        <h1 className="text-3xl font-bold">SecureLink</h1>
        <p className="text-blue-200 mt-2">VPN</p>
      </div>
    );
  }

  // ========== ONBOARDING ==========
  if (screen === "onboarding") {
    const steps = [
      { title: t(lang, "stayPrivate"), desc: t(lang, "stayPrivateDesc") },
      { title: t(lang, "oneTap"), desc: t(lang, "oneTapDesc") },
      { title: t(lang, "freeWithAds"), desc: t(lang, "freeWithAdsDesc") },
    ];
    const step = steps[onboardingStep];

    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] px-8 pt-20 pb-10">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">{step.title}</h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{step.desc}</p>
        </div>
        <div className="flex gap-2 justify-center mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === onboardingStep ? "w-8 bg-primary" : "w-2 bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => {
            if (onboardingStep < 2) setOnboardingStep((s) => s + 1);
            else setScreen("home");
          }}
          className="w-full py-4 rounded-2xl bg-primary text-white font-semibold text-lg"
        >
          {onboardingStep < 2 ? t(lang, "next") : t(lang, "getStarted")}
        </button>
      </div>
    );
  }

  // ========== HOME ==========
  if (screen === "home") {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)]">
        {/* Header */}
        <div className="px-6 pt-12 pb-4">
          <h1 className="text-xl font-semibold text-[var(--text)]">{t(lang, "appName")}</h1>
          <p className={`text-sm font-medium mt-1 ${connected ? "text-success" : "text-red-500"}`}>
            {connected ? t(lang, "protected") : t(lang, "notProtected")}
          </p>
        </div>

        {/* Connect Button */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={() => setConnected(!connected)}
            className={`w-40 h-40 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg transition-transform active:scale-95 ${
              connected ? "bg-success" : "bg-primary"
            }`}
          >
            {connected ? t(lang, "disconnect") : t(lang, "connect")}
          </button>

          <div className="mt-10 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              {connected ? t(lang, "connectedTo") : t(lang, "bestLocation")}
            </p>
            <p className="text-lg font-semibold text-[var(--text)] mt-1">
              {lang === "fa"
                ? `${selectedServer.flag} ${selectedServer.countryFa} • ${selectedServer.cityFa}`
                : `${selectedServer.flag} ${selectedServer.country} • ${selectedServer.city}`}
            </p>
            {connected && (
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                IP: 185.xxx.xxx.xx  •  {formatTime(timer)}
              </p>
            )}
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mx-6 mb-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)]">{t(lang, "sponsored")}</p>
          <p className="text-sm font-semibold text-[var(--text)] mt-1">{t(lang, "removeAds")}</p>
        </div>

        {/* Bottom Nav */}
        <nav className="flex justify-around items-center h-16 border-t border-[var(--border)] bg-[var(--surface)]">
          <button onClick={() => setScreen("home")} className="text-primary font-medium text-sm">{t(lang, "home")}</button>
          <button onClick={() => setScreen("servers")} className="text-[var(--text-secondary)] text-sm">{t(lang, "servers")}</button>
          <button onClick={() => setScreen("settings")} className="text-[var(--text-secondary)] text-sm">{t(lang, "settings")}</button>
        </nav>
      </div>
    );
  }

  // ========== SERVERS ==========
  if (screen === "servers") {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)]">
        <div className="px-6 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-[var(--text)]">{t(lang, "servers")}</h1>
          <input
            type="text"
            placeholder={t(lang, "searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4 w-full px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-20">
          <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">{t(lang, "recommended")}</p>
          {mockServers
            .filter((s) => s.recommended)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedServer(s);
                  setConnected(true);
                  setScreen("home");
                }}
                className="w-full mb-3 p-4 rounded-xl bg-[var(--surface)] border-2 border-primary text-left"
              >
                <div className="font-semibold text-[var(--text)]">
                  {s.flag} {lang === "fa" ? s.countryFa : s.country}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {lang === "fa" ? s.cityFa : s.city} • {s.ping} ms
                </div>
              </button>
            ))}

          <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3 mt-6">{t(lang, "allLocations")}</p>
          {filteredServers.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedServer(s);
                setConnected(true);
                setScreen("home");
              }}
              className="w-full mb-2 p-4 rounded-xl bg-[var(--surface)] text-left"
            >
              <div className="font-medium text-[var(--text)]">
                {s.flag} {lang === "fa" ? s.countryFa : s.country}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {lang === "fa" ? s.cityFa : s.city} • {s.ping} ms
              </div>
            </button>
          ))}
        </div>

        <nav className="flex justify-around items-center h-16 border-t border-[var(--border)] bg-[var(--surface)] fixed bottom-0 left-0 right-0">
          <button onClick={() => setScreen("home")} className="text-[var(--text-secondary)] text-sm">{t(lang, "home")}</button>
          <button onClick={() => setScreen("servers")} className="text-primary font-medium text-sm">{t(lang, "servers")}</button>
          <button onClick={() => setScreen("settings")} className="text-[var(--text-secondary)] text-sm">{t(lang, "settings")}</button>
        </nav>
      </div>
    );
  }

  // ========== SETTINGS ==========
  if (screen === "settings") {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)]">
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-[var(--text)]">{t(lang, "settings")}</h1>
        </div>

        <div className="px-6 space-y-3 flex-1">
          <button
            onClick={() => setScreen("language")}
            className="w-full p-4 rounded-xl bg-[var(--surface)] flex justify-between items-center"
          >
            <span className="font-medium text-[var(--text)]">{t(lang, "language")}</span>
            <span className="text-[var(--text-secondary)]">{lang === "en" ? "English" : "فارسی"}</span>
          </button>

          <div className="w-full p-4 rounded-xl bg-[var(--surface)] flex justify-between items-center">
            <span className="font-medium text-[var(--text)]">{t(lang, "theme")}</span>
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium"
            >
              {dark ? "Dark" : "Light"}
            </button>
          </div>

          <div className="w-full p-4 rounded-xl bg-[var(--surface)] flex justify-between items-center">
            <span className="font-medium text-[var(--text)]">{t(lang, "protocol")}</span>
            <span className="text-[var(--text-secondary)]">Automatic</span>
          </div>

          <div className="w-full p-4 rounded-xl bg-[var(--surface)] flex justify-between items-center">
            <span className="font-medium text-[var(--text)]">{t(lang, "killSwitch")}</span>
            <span className="text-success font-medium">On</span>
          </div>

          <div className="w-full p-4 rounded-xl bg-[var(--surface)] flex justify-between items-center">
            <span className="font-medium text-[var(--text)]">{t(lang, "autoConnect")}</span>
            <span className="text-[var(--text-secondary)]">Wi-Fi only</span>
          </div>

          <button
            onClick={() => setScreen("profile")}
            className="w-full p-4 rounded-xl bg-[var(--surface)] text-left font-medium text-[var(--text)]"
          >
            {t(lang, "account")}
          </button>
        </div>

        <div className="mx-6 my-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text)]">{t(lang, "removeAds")}</p>
        </div>

        <nav className="flex justify-around items-center h-16 border-t border-[var(--border)] bg-[var(--surface)]">
          <button onClick={() => setScreen("home")} className="text-[var(--text-secondary)] text-sm">{t(lang, "home")}</button>
          <button onClick={() => setScreen("servers")} className="text-[var(--text-secondary)] text-sm">{t(lang, "servers")}</button>
          <button onClick={() => setScreen("settings")} className="text-primary font-medium text-sm">{t(lang, "settings")}</button>
        </nav>
      </div>
    );
  }

  // ========== LANGUAGE ==========
  if (screen === "language") {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-6 pt-12">
        <button onClick={() => setScreen("settings")} className="text-primary mb-6">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{t(lang, "language")}</h1>
        <p className="text-[var(--text-secondary)] mb-8">Choose your preferred language</p>

        <button
          onClick={() => {
            setLang("en");
            setScreen("settings");
          }}
          className={`w-full p-4 rounded-xl mb-3 text-left font-semibold ${
            lang === "en" ? "bg-[var(--surface)] border-2 border-primary" : "bg-[var(--surface)]"
          }`}
        >
          English
        </button>
        <button
          onClick={() => {
            setLang("fa");
            setScreen("settings");
          }}
          className={`w-full p-4 rounded-xl text-left font-semibold ${
            lang === "fa" ? "bg-[var(--surface)] border-2 border-primary" : "bg-[var(--surface)]"
          }`}
        >
          فارسی
        </button>
      </div>
    );
  }

  // ========== PROFILE ==========
  if (screen === "profile") {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-6 pt-12">
        <button onClick={() => setScreen("settings")} className="text-primary mb-6">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-8">{t(lang, "account")}</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary mb-4" />
          <p className="text-lg font-semibold text-[var(--text)]">{t(lang, "freeUser")}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t(lang, "adSupported")}</p>
        </div>

        <button className="w-full py-4 rounded-2xl bg-primary text-white font-semibold mb-6">
          {t(lang, "upgrade")}
        </button>

        <div className="space-y-2">
          {["Help & Support", "Privacy Policy", "Terms of Service", "Rate the App"].map((item) => (
            <div key={item} className="p-4 rounded-xl bg-[var(--surface)] text-[var(--text)]">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}