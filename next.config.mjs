const host = (() => { try { return new URL(process.env.APP_URL ?? '').host; } catch { return null; } })();

/** @type {import('next').NextConfig} */
export default {
  serverExternalPackages: ['sharp'],
  experimental: {
    // Mehrere Dateien je bis 5 MB pro Anfrage; die Einzelprüfung erfolgt serverseitig im Code.
    serverActions: { bodySizeLimit: '60mb', ...(host ? { allowedOrigins: [host] } : {}) },
  },
  poweredByHeader: false,
};
