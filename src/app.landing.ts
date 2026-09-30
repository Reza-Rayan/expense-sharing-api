interface LandingInfo {
  name: string;
  description: string;
  environment: string;
  uptimeSeconds: number;
}

export function renderLanding(info: LandingInfo): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${info.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body {
      min-height: 100vh; display: grid; place-items: center; padding: 24px;
      background: #0b1020; color: #e6e9f2;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    }
    .card {
      width: 100%; max-width: 480px; padding: 32px; border-radius: 16px;
      background: #141a30; border: 1px solid #262e4d;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 8px; font-size: 13px;
      padding: 4px 12px; border-radius: 999px; background: #10301f; color: #4ade80;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
    h1 { margin: 16px 0 8px; font-size: 24px; }
    p { color: #9aa3c0; line-height: 1.6; }
    .meta { margin: 20px 0; font-size: 13px; color: #9aa3c0; display: flex; gap: 16px; }
    .links { display: grid; gap: 10px; }
    a {
      display: block; padding: 12px 16px; border-radius: 10px; text-decoration: none;
      color: #e6e9f2; background: #1c2440; border: 1px solid #262e4d;
    }
    a:hover { border-color: #6366f1; }
    a small { display: block; margin-top: 2px; color: #9aa3c0; }
  </style>
</head>
<body>
  <main class="card">
    <span class="badge"><span class="dot"></span>Running</span>
    <h1>${info.name}</h1>
    <p>${info.description}</p>
    <div class="meta">
      <span>Env: ${info.environment}</span>
      <span>Uptime: ${info.uptimeSeconds}s</span>
    </div>
    <div class="links">
      <a href="/docs">API Documentation<small>Swagger UI</small></a>
      <a href="/api/health">Health Check<small>GET /api/health</small></a>
    </div>
  </main>
</body>
</html>`;
}
