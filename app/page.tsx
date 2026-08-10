"use client";

import { useState, useEffect, useRef } from "react";
import { t, Lang } from "@/lib/i18n";
import { mockServers, getRecommended, Server } from "@/lib/servers";

type Screen =
  | "splash"
  | "onboarding"
  | "auth"
  | "home"
  | "servers"
  | "settings"
  | "language"
  | "profile";

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [selectedServer, setSelectedServer] = useState<Server>(getRecommended());
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);
  const [timer, setTimer] = useState(0);
  const [search, setSearch] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Theme
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // RTL
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

  // Splash
  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => setScreen("onboarding"), 1600);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // Interstitial countdown (Google Play style: max 15s, we use 5s then skip appears)
  useEffect(() => {
    if (!showInterstitial) return;
    setCountdown(5);
    setCanSkip(false);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showInterstitial]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const startConnect = () => {
    if (connected) {
      // Disconnect instantly
      setConnected(false);
      setProgress(0);
      return;
    }

    // Start connecting animation
    setConnecting(true);
    setProgress(0);
    setStatusText(lang === "fa" ? "در حال اتصال..." : "Connecting...");

    const steps = [
      { p: 25, text: lang === "fa" ? "یافتن بهترین سرور..." : "Finding best server..." },
      { p: 55, text: lang === "fa" ? "ایجاد تونل امن..." : "Creating secure tunnel..." },
      { p: 80, text: lang === "fa" ? "رمزنگاری اتصال..." : "Encrypting connection..." },
      { p: 100, text: lang === "fa" ? "تقریباً تمام شد..." : "Almost there..." },
    ];

    let stepIndex = 0;
    progressInterval.current = setInterval(() => {
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex].p);
        setStatusText(steps[stepIndex].text);
        stepIndex++;
      } else {
        if (progressInterval.current) clearInterval(progressInterval.current);

        // For free users → show interstitial before finishing connect
        if (!isPremium) {
          setShowInterstitial(true);
        } else {
          finishConnect();
        }
      }
    }, 700);
  };

  const finishConnect = () => {
    setConnecting(false);
    setConnected(true);
    setProgress(100);
    setShowInterstitial(false);
  };

  const handleSkipAd = () => {
    finishConnect();
  };

  const handleAdClick = () => {
    // Simulate going to Google Play (in real app use real store link)
    window.open("https://play.google.com/store/apps", "_blank");
  };

  const filteredServers = mockServers.filter(
    (s) =>
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.countryFa.includes(search) ||
      s.cityFa.includes(search)
  );

  // ========== INTERSTITIAL AD (Google Play compliant style) ==========
  const InterstitialModal = () => {
    if (!showInterstitial || isPremium) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
        {/* Thin yellow progress bar at top */}
        <div className="h-1 w-full bg-gray-800">
          <div
            className="h-full bg-yellow-400 transition-all duration-1000"
            style={{ width: `${((5 - countdown) / 5) * 100}%` }}
          />
        </div>

        {/* Countdown top-left */}
        <div className="absolute top-4 left-4 z-10">
          {!canSkip ? (
            <div className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white font-bold text-sm border border-white/20">
              {countdown}
            </div>
          ) : (
            <button
              onClick={handleSkipAd}
              className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white text-lg border border-white/30"
            >
              ×
            </button>
          )}
        </div>

        {/* Ad content - clicking goes to Play Store */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 cursor-pointer"
          onClick={handleAdClick}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 mb-6 flex items-center justify-center text-3xl">
            🎮
          </div>
          <h2 className="text-white text-2xl font-bold text-center mb-2">
            Discover Amazing Apps
          </h2>
          <p className="text-white/70 text-center mb-8 max-w-xs">
            Check out the latest games and apps on Google Play
          </p>
          <div className="bg-white text-black px-8 py-3 rounded-full font-semibold">
            Install Now
          </div>
          <p className="text-white/40 text-xs mt-8">Ad • Google Play</p>
        </div>

        {/* Skip button after countdown */}
        {canSkip && (
          <div className="p-4 flex justify-center">
            <button
              onClick={handleSkipAd}
              className="text-white/80 text-sm underline"
            >
              Skip Ad
            </button>
          </div>
        )}
      </div>
    );
  };

  // ========== SPLASH ==========
  if (screen === "splash") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] to-[#0d1b36] text-white">
        <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur flex items-center justify-center mb-6 border border-white/20">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">SecureLink</h1>
        <p className="text-blue-300/80 mt-2 text-sm">VPN</p>
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
      <div className="min-h-screen flex flex-col bg-[var(--bg)] px-8 pt-16 pb-10">
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">{step.title}</h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{step.desc}</p>
        </div>
        <div className="flex gap-2 justify-center mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === onboardingStep ? "w-8 bg-primary" : "w-2 bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => {
            if (onboardingStep < 2) setOnboardingStep((s) => s + 1);
            else setScreen("auth");
          }}
          className="w-full py-4 rounded-2xl bg-primary text-white font-semibold text-lg active:scale-[0.98] transition"
        >
          {onboardingStep < 2 ? t(lang, "next") : t(lang, "getStarted")}
        </button>
      </div>
    );
  }

  // ========== AUTH / LOGIN ==========
  if (screen === "auth") {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] px-6 pt-14 pb-10">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
          {lang === "fa" ? "ورود یا ثبت‌نام" : "Sign in or Sign up"}
        </h1>
        <p className="text-[var(--text-secondary)] mb-10">
          {lang === "fa"
            ? "برای همگام‌سازی تنظیمات و دسترسی به ویژگی‌های بیشتر"
            : "Sync settings and unlock more features"}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setScreen("home")}
            className="w-full py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center gap-3 font-medium text-[var(--text)]"
          >
            <span className="text-xl">📧</span> Continue with Email
          </button>
          <button
            onClick={() => setScreen("home")}
            className="w-full py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center gap-3 font-medium text-[var(--text)]"
          >
            <span className="text-xl">G</span> Continue with Google
          </button>
          <button
            onClick={() => setScreen("home")}
            className="w-full py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center gap-3 font-medium text-[var(--text)]"
          >
            <span className="text-xl"> </span> Continue with Apple
          </button>
          <button
            onClick={() => setScreen("home")}
            className="w-full py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center gap-3 font-medium text-[var(--text)]"
          >
            <span className="text-xl">𝕏</span> Continue with X
          </button>
        </div>

        <button
          onClick={() => setScreen("home")}
          className="mt-8 text-center text-[var(--text-secondary)] text-sm"
        >
          {lang === "fa" ? "فعلاً رد شو" : "Skip for now"}
        </button>
      </div>
    );
  }

  // ========== HOME ==========
  if (screen === "home") {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] relative">
        <InterstitialModal />

        {/* Header */}
        <div className="px-6 pt-12 pb-2 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text)]">{t(lang, "appName")}</h1>
            <p
              className={`text-sm font-medium mt-1 ${
                connecting
                  ? "text-yellow-500"
                  : connected
                  ? "text-success"
                  : "text-red-500"
              }`}
            >
              {connecting
                ? statusText
                : connected
                ? t(lang, "protected")
                : t(lang, "notProtected")}
            </p>
          </div>
          {isPremium && (
            <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium">
              Premium
            </span>
          )}
        </div>

        {/* Connect Button Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative">
            {/* Pulse rings when connecting */}
            {connecting && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="absolute -inset-4 rounded-full border-2 border-primary/30 animate-pulse" />
              </>
            )}

            <button
              onClick={startConnect}
              disabled={connecting}
              className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center text-white font-semibold shadow-xl transition-all active:scale-95 disabled:opacity-90 ${
                connected
                  ? "bg-success"
                  : connecting
                  ? "bg-primary"
                  : "bg-primary"
              }`}
            >
              {connecting ? (
                <>
                  <span className="text-3xl font-bold">{progress}%</span>
                  <span className="text-xs mt-1 opacity-80">
                    {lang === "fa" ? "در حال اتصال" : "Connecting"}
                  </span>
                </>
              ) : connected ? (
                <span className="text-lg">{t(lang, "disconnect")}</span>
              ) : (
                <span className="text-lg">{t(lang, "connect")}</span>
              )}
            </button>
          </div>

          {/* Progress bar under button while connecting */}
          {connecting && (
            <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Location info - clickable */}
          <button
            onClick={() => !connecting && setScreen("servers")}
            className="mt-10 text-center active:opacity-70"
            disabled={connecting}
          >
            <p className="text-sm text-[var(--text-secondary)]">
              {connected ? t(lang, "connectedTo") : t(lang, "bestLocation")}
            </p>
            <p className="text-lg font-semibold text-[var(--text)] mt-1.5 flex items-center justify-center gap-2">
              <span className="text-2xl">{selectedServer.flag}</span>
              {lang === "fa"
                ? `${selectedServer.countryFa} • ${selectedServer.cityFa}`
                : `${selectedServer.country} • ${selectedServer.city}`}
            </p>
            {connected && (
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                IP: 185.xxx.xxx.xx  •  {formatTime(timer)}
              </p>
            )}
            {!connected && !connecting && (
              <p className="text-xs text-primary mt-2">
                {lang === "fa" ? "برای تغییر ضربه بزنید" : "Tap to change"}
              </p>
            )}
          </button>
        </div>

        {/* Ad Banner - only for free users, better placement */}
        {!isPremium && (
          <div className="mx-5 mb-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                  {t(lang, "sponsored")}
                </p>
                <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                  {t(lang, "removeAds")}
                </p>
              </div>
              <button
                onClick={() => setIsPremium(true)}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded-full font-medium"
              >
                {lang === "fa" ? "ارتقا" : "Upgrade"}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <nav className="flex justify-around items-center h-[68px] border-t border-[var(--border)] bg-[var(--surface)] safe-bottom">
          <button onClick={() => setScreen("home")} className="flex flex-col items-center gap-0.5 text-primary">
            <span className="text-lg">⌂</span>
            <span className="text-[11px] font-medium">{t(lang, "home")}</span>
          </button>
          <button onClick={() => setScreen("servers")} className="flex flex-col items-center gap-0.5 text-[var(--text-secondary)]">
            <span className="text-lg">◎</span>
            <span className="text-[11px]">{t(lang, "servers")}</span>
          </button>
          <button onClick={() => setScreen("settings")} className="flex flex-col items-center gap-0.5 text-[var(--text-secondary)]">
            <span className="text-lg">⚙</span>
            <span className="text-[11px]">{t(lang, "settings")}</span>
          </button>
        </nav>
      </div>
    );
  }

  // ========== SERVERS ==========
  if (screen === "servers") {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)]">
        <div className="px-5 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-[var(--text)]">{t(lang, "servers")}</h1>
          <input
            type="text"
            placeholder={t(lang, "searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4 w-full px-4 py-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-24">
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            {t(lang, "recommended")}
          </p>
          {mockServers
            .filter((s) => s.recommended)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedServer(s);
                  setScreen("home");
                  // Auto start connect after selecting
                  setTimeout(() => startConnect(), 100);
                }}
                className="w-full mb-3 p-4 rounded-2xl bg-[var(--surface)] border-2 border-primary flex items-center gap-4 text-left"
              >
                <span className="text-3xl">{s.flag}</span>
                <div className="flex-1">
                  <div className="font-semibold text-[var(--text)]">
                    {lang === "fa" ? s.countryFa : s.country}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {lang === "fa" ? s.cityFa : s.city} • {s.ping} ms
                  </div>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Fast
                </span>
              </button>
            ))}

          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 mt-6">
            {t(lang, "allLocations")}
          </p>
          {filteredServers.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedServer(s);
                setScreen("home");
              }}
              className="w-full mb-2 p-4 rounded-2xl bg-[var(--surface)] flex items-center gap-4 text-left active:scale-[0.99] transition"
            >
              <span className="text-3xl">{s.flag}</span>
              <div className="flex-1">
                <div className="font-medium text-[var(--text)]">
                  {lang === "fa" ? s.countryFa : s.country}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {lang === "fa" ? s.cityFa : s.city} • {s.ping} ms
                </div>
              </div>
            </button>
          ))}
        </div>

        <nav className="flex justify-around items-center h-[68px] border-t border-[var(--border)] bg-[var(--surface)] fixed bottom-0 left-0 right-0">
          <button onClick={() => setScreen("home")} className="flex flex-col items-center gap-0.5 text-[var(--text-secondary)]">
            <span className="text-lg">⌂</span>
            <span className="text-[11px]">{t(lang, "home")}</span>
          </button>
          <button onClick={() => setScreen("servers")} className="flex flex-col items-center gap-0.5 text-primary">
            <span className="text-lg">◎</span>
            <span className="text-[11px] font-medium">{t(lang, "servers")}</span>
          </button>
          <button onClick={() => setScreen("settings")} className="flex flex-col items-center gap-0.5 text-[var(--text-secondary)]">
            <span className="text-lg">⚙</span>
            <span className="text-[11px]">{t(lang, "settings")}</span>
          </button>
        </nav>
      </div>
    );
  }

  // ========== SETTINGS ==========
  if (screen === "settings") {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)]">
        <div className="px-5 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-[var(--text)]">{t(lang, "settings")}</h1>
        </div>

        <div className="px-5 space-y-2.5 flex-1">
          <button
            onClick={() => setScreen("language")}
            className="w-full p-4 rounded-2xl bg-[var(--surface)] flex justify-between items-center"
          >
            <span className="font-medium text-[var(--text)]">{t(lang, "language")}</span>
            <span className="text-[var(--text-secondary)] text-sm">{lang === "en" ? "English" : "فارسی"}</span>
          </button>

          <div className="w-full p-4 rounded-2xl bg-[var(--surface)] flex justify-between items-center">
            <span className="font-medium text-[var(--text)]">{t(lang, "theme")}</span>
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
            >
              {dark ? "Dark" : "Light"}
            </button>
          </div>

          <div className="w-full p-4 rounded-2xl bg-[var(--surface)] flex justify-between items-center">
            <span className="font-medium text-[var(--text)]">{t(lang, "protocol")}</span>
            <span className="text-[var(--text-secondary)] text-sm">Automatic</span>
          </div>

          <div className="w-full p-4 rounded-2xl bg-[var(--surface)] flex justify-between items-center">
            <span className="font-medium text-[var(--text)]">{t(lang, "killSwitch")}</span>
            <span className="text-success font-medium text-sm">On</span>
          </div>

          <button
            onClick={() => setScreen("profile")}
            className="w-full p-4 rounded-2xl bg-[var(--surface)] text-left font-medium text-[var(--text)]"
          >
            {t(lang, "account")}
          </button>

          {/* Demo: toggle premium */}
          <button
            onClick={() => setIsPremium(!isPremium)}
            className="w-full p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-left font-medium text-sm"
          >
            {isPremium ? "✓ Premium active (tap to disable)" : "Demo: Activate Premium (no ads)"}
          </button>
        </div>

        {!isPremium && (
          <div className="mx-5 my-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--text)]">{t(lang, "removeAds")}</p>
          </div>
        )}

        <nav className="flex justify-around items-center h-[68px] border-t border-[var(--border)] bg-[var(--surface)]">
          <button onClick={() => setScreen("home")} className="flex flex-col items-center gap-0.5 text-[var(--text-secondary)]">
            <span className="text-lg">⌂</span>
            <span className="text-[11px]">{t(lang, "home")}</span>
          </button>
          <button onClick={() => setScreen("servers")} className="flex flex-col items-center gap-0.5 text-[var(--text-secondary)]">
            <span className="text-lg">◎</span>
            <span className="text-[11px]">{t(lang, "servers")}</span>
          </button>
          <button onClick={() => setScreen("settings")} className="flex flex-col items-center gap-0.5 text-primary">
            <span className="text-lg">⚙</span>
            <span className="text-[11px] font-medium">{t(lang, "settings")}</span>
          </button>
        </nav>
      </div>
    );
  }

  // ========== LANGUAGE ==========
  if (screen === "language") {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-5 pt-12">
        <button onClick={() => setScreen("settings")} className="text-primary mb-6 text-sm">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{t(lang, "language")}</h1>
        <p className="text-[var(--text-secondary)] mb-8 text-sm">Choose your preferred language</p>

        <button
          onClick={() => {
            setLang("en");
            setScreen("settings");
          }}
          className={`w-full p-4 rounded-2xl mb-3 text-left font-semibold ${
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
          className={`w-full p-4 rounded-2xl text-left font-semibold ${
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
      <div className="min-h-screen bg-[var(--bg)] px-5 pt-12">
        <button onClick={() => setScreen("settings")} className="text-primary mb-6 text-sm">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-8">{t(lang, "account")}</h1>

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary mb-4 flex items-center justify-center text-white text-2xl font-bold">
            U
          </div>
          <p className="text-lg font-semibold text-[var(--text)]">
            {isPremium ? "Premium User" : t(lang, "freeUser")}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {isPremium ? "No ads • Unlimited" : t(lang, "adSupported")}
          </p>
        </div>

        {!isPremium && (
          <button
            onClick={() => setIsPremium(true)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-semibold mb-6"
          >
            {t(lang, "upgrade")}
          </button>
        )}

        <div className="space-y-2">
          {["Help & Support", "Privacy Policy", "Terms of Service", "Rate the App"].map((item) => (
            <div key={item} className="p-4 rounded-2xl bg-[var(--surface)] text-[var(--text)] text-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
