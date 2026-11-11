#!/usr/bin/env python3
"""
Jednoduchý školní Python webový server pro zpracování HTML formuláře.
Nevyžaduje žádné knihovny navíc – používá vestavěný modul http.server!

Spuštění v terminálu:
    python3 server_priklad.py

Poté otevřete v prohlížeči:
    http://localhost:8000
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import os

PORT = 8000

class SkolniHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Pokud přijdeme na kořen, zobrazíme formulář
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.end_headers()

        html = """<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Školní Python Server</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f5f5f7; color: #1d1d1f; }
        .card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        input[type="text"], input[type="email"] { width: 100%; padding: 10px; margin: 8px 0 16px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
        button { background: #0071e3; color: white; border: none; padding: 10px 20px; border-radius: 980px; font-weight: 600; cursor: pointer; }
        button:hover { background: #0077ed; }
    </style>
</head>
<body>
    <div class="card">
        <h2>🐍 Formulář propojený s Pythonem</h2>
        <p>Zadej údaje a klikni na Odeslat. Python server data zpracuje a vrátí odpověď.</p>
        <form method="POST" action="/zpracuj">
            <label>Jméno studenta:</label>
            <input type="text" name="jmeno" placeholder="např. Jan Novák" required>
            
            <label>E-mail:</label>
            <input type="email" name="email" placeholder="student@skola.cz" required>
            
            <label>Zpráva pro server:</label>
            <input type="text" name="vzkaz" placeholder="Zpráva pro Python...">
            
            <button type="submit">Odeslat do Pythonu (POST)</button>
        </form>
    </div>
</body>
</html>"""
        self.wfile.write(html.encode('utf-8'))

    def do_POST(self):
        # 1. Přečteme délku příchozích dat
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        # 2. Rozparsujeme formulářová data (klíč=hodnota)
        data = urllib.parse.parse_qs(body)
        jmeno = data.get('jmeno', ['Neznámý'])[0]
        email = data.get('email', ['neuveden'])[0]
        vzkaz = data.get('vzkaz', ['žádný'])[0]

        print(f"[PŘIJAT FORMULÁŘ V PYTHONU] Jméno: {jmeno}, E-mail: {email}, Vzkaz: {vzkaz}")

        # 3. Vrátíme odpověď studentovi
        self.send_response(200)
        self.send_header("Content-type", "text/html; charset=utf-8")
        self.end_headers()

        odpoved = f"""<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Python odpověď</title>
    <style>
        body {{ font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; background: #f5f5f7; }}
        .card {{ background: white; padding: 24px; border-radius: 16px; border-left: 6px solid #10b981; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }}
        a {{ color: #0071e3; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 16px; }}
    </style>
</head>
<body>
    <div class="card">
        <h2>✅ Python server úspěšně přijal data!</h2>
        <p><strong>Zpracováno v Pythonu:</strong></p>
        <ul>
            <li><strong>Jméno:</strong> {jmeno}</li>
            <li><strong>E-mail:</strong> {email}</li>
            <li><strong>Vzkaz:</strong> {vzkaz}</li>
        </ul>
        <a href="/">← Zpět na formulář</a>
    </div>
</body>
</html>"""
        self.wfile.write(odpoved.encode('utf-8'))

if __name__ == '__main__':
    print("=====================================================")
    print(f"🚀 Školní Python server běží na http://localhost:{PORT}")
    print("Pro ukončení stiskněte Ctrl+C v terminálu.")
    print("=====================================================")
    server = HTTPServer(('localhost', PORT), SkolniHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server ukončen.")
