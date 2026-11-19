/** @type {import('next').NextConfig} */
export default {
  serverExternalPackages: ['sharp'],
  // Mehrere Dateien je bis 5 MB pro Anfrage; die Prüfung der Einzelgröße erfolgt serverseitig im Code.
  experimental: { serverActions: { bodySizeLimit: '60mb' } },
};
