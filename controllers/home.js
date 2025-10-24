function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

export const home = (req, res) => {
  const uptime = formatUptime(process.uptime());
  const year = new Date().getFullYear();

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TradeZone API</title>
        <style>
          body {
            font-family: system-ui, sans-serif;
            background: #fafafaff;
            color: #111827;
            margin: 0;
            padding: 0;
          }
          header {
            color: #28439dff;
            text-align: center;
          }
          main {
            max-width: 600px;
            margin: 2rem auto;
            background: #fff;
            padding: 2rem;
            border-radius: 28px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            text-align: center;
          }
          h1 {
            margin-top: 0;
            color: #2563eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
          }
          th, td {
            padding: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
          }
          th {
            background: #f9fafb;
            font-weight: 600;
          }
          a {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.6rem 1.2rem;
            background: #234ca6ff;
            color: #fff;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 500;
            transition: background 0.2s ease;
          }
          a:hover {
            background: #112052ff;
          }
          footer {
            text-align: center;
            padding: 1rem;
            font-size: 0.9rem;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            margin-top: 2rem;
          }
        </style>
      </head>
      <body>
        <header>
          <h2>📊TradeZone API 🚀</h2>
        </header>
        <main>
          <p>Server is running smoothly ✅</p>
          <table>
            <tr><th>Uptime</th><td>${uptime}</td></tr>
            <tr><th>Environment</th><td>${process.env.NODE_ENV || "development"}</td></tr>
            <tr><th>Node.js Version</th><td>${process.version}</td></tr>
            <tr><th>Server Time</th><td>${new Date().toLocaleString()}</td></tr>
          </table>
          <a href="/api-docs">📖 View API Documentation</a>
        </main>
        <footer>
          &copy; ${year} TradeZone. All rights reserved.
        </footer>
      </body>
    </html>
  `);
};