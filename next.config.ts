import type { NextConfig } from "next";

/**
 * The CSP is set per-request in middleware.ts because it carries a nonce.
 * These are the headers that are the same for every response.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  /**
   * Reading an env-configured directory is dynamic filesystem access, so the
   * build tracer gives up and traces the whole project for these two routes.
   * Left alone that would sweep the uploads directory itself into the build
   * output — the exact coupling the volume exists to break.
   *
   * Only affects `output: 'standalone'`; `next start` from a checkout ignores
   * the trace entirely.
   */
  outputFileTracingExcludes: {
    "/api/upload": ["var/**", "_research/**", "scripts/**", "prisma/**"],
    "/uploads/[[]...file[]]": ["var/**", "_research/**", "scripts/**", "prisma/**"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "x-content-type-options", value: "nosniff" },
          { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
          { key: "x-frame-options", value: "DENY" },
          { key: "permissions-policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
