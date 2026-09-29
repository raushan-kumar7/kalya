export interface ClientIntelligence {
  /** Browser details from UAParser.js */
  browser: {
    name: string;
    version: string;
    major: string;
    type: string; // 'browser' | 'inapp' | 'email' | etc.
  };
  /** Operating system (accurately resolves Windows 11 from Client Hints) */
  os: {
    name: string;
    version: string;
  };
  /** Hardware device profile and form-factor */
  device: {
    vendor?: string;
    model?: string;
    type: string; // 'desktop' | 'mobile' | 'tablet' | 'smarttv' | 'bot' | etc.
    label: string; // e.g. "Apple iPhone 15 Pro (iOS 18.2)" or "Windows 11 (Desktop)"
  };
  /** CPU Hardware architecture (arm64, amd64, etc.) */
  cpu: {
    architecture?: string;
  };
  /** Rendering engine (Blink, WebKit, Gecko, etc.) */
  engine: {
    name: string;
    version: string;
  };
  /** Bot & AI intelligence powered by ua-parser-js/bot-detection */
  bot: {
    isBot: boolean;
    isAICrawler: boolean;
    isAIAssistant: boolean;
  };
  /** Network & IP details */
  network: {
    ipAddress: string;
    isPrivateNetwork: boolean;
    preferredLanguage?: string;
  };
  /** Real-time Geolocation context */
  geo: {
    location: string;
    city?: string;
    region?: string;
    country?: string;
    timezone?: string;
    coordinates?: [number, number]; // [latitude, longitude]
  };
}
