#!/usr/bin/env python3
"""
Simple HTTP server to run auth-check.js tests
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Auth Check Test Server running at http://localhost:{PORT}/")
    print("\nAvailable test pages:")
    print(f"  - Visual Test Suite: http://localhost:{PORT}/test-auth-check.html")
    print(f"  - Main Page: http://localhost:{PORT}/index.html")
    print("\nConsole test instructions:")
    print("  1. Open any page with auth-check.js")
    print("  2. Open browser console (F12)")
    print("  3. Copy and paste contents of test-auth-console.js")
    print("\nPress Ctrl+C to stop the server")
    
    # Open the test page
    webbrowser.open(f'http://localhost:{PORT}/test-auth-check.html')
    
    httpd.serve_forever()