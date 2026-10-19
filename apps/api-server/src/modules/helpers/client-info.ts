import { UAParser } from 'ua-parser-js';
import { isBot, isAICrawler, isAIAssistant } from 'ua-parser-js/bot-detection';
import geoip from 'geoip-lite';
import { ClientIntelligence } from '@kalya/types';

export type { ClientIntelligence };

/**
 * Fast, single-pass HTTP header reader supporting Fetch Headers and Node IncomingHttpHeaders.
 */
function getHeader(
  headers: Record<string, string | string[] | undefined> | Headers | null | undefined,
  name: string
): string | undefined {
  if (!headers) return undefined;
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name) || undefined;
  }
  const val = (headers as Record<string, string | string[] | undefined>)[name.toLowerCase()];
  return Array.isArray(val) ? val[0] : val;
}

/**
 * Extracts real-time client, hardware, bot/AI, and geolocation intelligence
 * using exclusively `ua-parser-js` and `geoip-lite`.
 *
 * @param userAgentString - Raw User-Agent string from request headers
 * @param ipAddressString - Client IP from Fastify (request.ip)
 * @param headers - Optional headers for Client Hints and reverse-proxy CDN lookups
 */
export function parseClientInfo(
  userAgentString?: string | null,
  ipAddressString?: string | null,
  headers?: Record<string, string | string[] | undefined> | Headers | null
): ClientIntelligence {
  const rawUa = userAgentString || '';

  // 1. Native UAParser Bot & AI Crawler Submodule
  const botDetected = isBot(rawUa);
  const aiCrawler = isAICrawler(rawUa);
  const aiAssistant = isAIAssistant(rawUa);

  // 2. Core UAParser.js v2 parsing
  const parser = new UAParser(rawUa);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();
  const cpu = parser.getCPU();
  const engine = parser.getEngine();

  // 3. Modern Client Hints (Chromium User-Agent Reduction support)
  const chPlatform = getHeader(headers, 'sec-ch-ua-platform')?.replace(/"/g, '');
  const chPlatformVer = getHeader(headers, 'sec-ch-ua-platform-version')?.replace(/"/g, '');
  const chModel = getHeader(headers, 'sec-ch-ua-model')?.replace(/"/g, '');
  const chMobile = getHeader(headers, 'sec-ch-ua-mobile');
  const chArch = getHeader(headers, 'sec-ch-ua-arch')?.replace(/"/g, '');
  const chBitness = getHeader(headers, 'sec-ch-ua-bitness')?.replace(/"/g, '');

  // 4. Resolve OS & Windows 11 (NT 10.0 + platform-version >= 13 = Windows 11)
  const osName = os.name || chPlatform || 'Unknown OS';
  let osVersion = os.version || '';
  if (osName === 'Windows' && chPlatformVer) {
    const majorVer = parseInt(chPlatformVer.split('.')[0] ?? '0', 10);
    if (majorVer >= 13) {
      osVersion = '11';
    }
  }
  const formattedOs = `${osName}${osVersion ? ` ${osVersion}` : ''}`;

  // 5. Device Form-Factor & Label Resolution
  let deviceType: string = device.type || (chMobile === '?1' ? 'mobile' : 'desktop');
  if (botDetected) {
    deviceType = 'bot';
  }

  const vendor = device.vendor ? `${device.vendor} ` : '';
  const model = chModel || device.model || '';
  const deviceLabel = model
    ? `${vendor}${model} (${formattedOs})`
    : `${formattedOs} (${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)})`;

  // 6. CPU Architecture
  const cpuArch = chArch ? `${chArch}${chBitness ? `-${chBitness}bit` : ''}` : cpu.architecture;

  // 7. Client IP Resolution & Bogon / Private Network Filter
  const rawIp =
    getHeader(headers, 'cf-connecting-ip') ||
    getHeader(headers, 'x-real-ip') ||
    getHeader(headers, 'x-forwarded-for')?.split(',')[0].trim() ||
    ipAddressString ||
    '';

  const cleanIp = rawIp.replace(/^::ffff:/, '').trim() || 'Unknown IP';

  const isPrivateNetwork =
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp === 'localhost' ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanIp) ||
    cleanIp.startsWith('fc00:') ||
    cleanIp.startsWith('fe80:');

  // 8. Real-Time Geolocation (Edge CDN first, in-memory geoip-lite fallback)
  let city = getHeader(headers, 'cf-ipcity') || getHeader(headers, 'x-vercel-ip-city');
  let region = getHeader(headers, 'cf-region') || getHeader(headers, 'x-vercel-ip-country-region');
  let country =
    getHeader(headers, 'cf-ipcountry') ||
    getHeader(headers, 'x-vercel-ip-country') ||
    getHeader(headers, 'cloudfront-viewer-country');
  let timezone = getHeader(headers, 'cf-timezone') || getHeader(headers, 'x-vercel-ip-timezone');
  let coordinates: [number, number] | undefined;

  const cfLat = getHeader(headers, 'cf-iplatitude') || getHeader(headers, 'x-vercel-ip-latitude');
  const cfLon = getHeader(headers, 'cf-iplongitude') || getHeader(headers, 'x-vercel-ip-longitude');
  if (cfLat && cfLon) {
    coordinates = [parseFloat(cfLat), parseFloat(cfLon)];
  }

  if (!city && !country && !isPrivateNetwork && cleanIp !== 'Unknown IP') {
    const geo = geoip.lookup(cleanIp);
    if (geo) {
      city = geo.city || undefined;
      region = geo.region || undefined;
      country = geo.country || undefined;
      timezone = geo.timezone || undefined;
      if (geo.ll && geo.ll.length === 2) {
        coordinates = [geo.ll[0], geo.ll[1]];
      }
    }
  }

  let location: string;
  if (isPrivateNetwork) {
    location = 'Localhost / Private Network';
  } else {
    const parts = [city, region, country].filter(Boolean);
    location = parts.length > 0 ? parts.join(', ') : 'India';
  }

  // 9. Preferred Language
  const acceptLang = getHeader(headers, 'accept-language');
  const preferredLanguage = acceptLang ? acceptLang.split(',')[0].trim() : undefined;

  return {
    browser: {
      name: browser.name || 'Web Browser',
      version: browser.version || '',
      major: browser.major || '',
      type: browser.type || 'browser',
    },
    os: {
      name: osName,
      version: osVersion,
    },
    device: {
      vendor: device.vendor,
      model: model || undefined,
      type: deviceType,
      label: deviceLabel,
    },
    cpu: {
      architecture: cpuArch,
    },
    engine: {
      name: engine.name || 'Unknown',
      version: engine.version || '',
    },
    bot: {
      isBot: botDetected,
      isAICrawler: aiCrawler,
      isAIAssistant: aiAssistant,
    },
    network: {
      ipAddress: cleanIp,
      isPrivateNetwork,
      preferredLanguage,
    },
    geo: {
      location,
      city,
      region,
      country,
      timezone,
      coordinates,
    },
  };
}
