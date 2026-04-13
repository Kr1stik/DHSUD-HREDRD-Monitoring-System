import tkinter as tk
from tkinter import messagebox
import subprocess
import os
import sys
import socket
import webbrowser

# --- CRITICAL .EXE PATH FIX ---
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(BASE_DIR)
# ------------------------------

class DHSUDLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("DHSUD HREDRD System Control Panel")
        self.root.geometry("420x550")
        self.root.configure(bg="#f8fafc")
        self.server_process = None
        self.setup_ui()

    def get_ip_address(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except: return "127.0.0.1"

    def setup_ui(self):
        header = tk.Frame(self.root, bg="#1e293b", height=120)
        header.pack(fill="x")
        tk.Label(header, text="DHSUD HREDRD", font=("Segoe UI", 18, "bold"), bg="#1e293b", fg="white").pack(pady=(20, 0))
        tk.Label(header, text="NEG ISLAND REGION (NIR)", font=("Segoe UI", 10, "bold"), bg="#1e293b", fg="#94a3b8").pack()

        # --- NEW: DISPLAY THE STAFF IP ADDRESS ---
        lan_ip = self.get_ip_address()
        tk.Label(self.root, text="STAFF ACCESS LINK:", font=("Segoe UI", 9, "bold"), fg="#64748b", bg="#f8fafc").pack(pady=(20, 0))
        tk.Label(self.root, text=f"http://{lan_ip}:8000", font=("Consolas", 14, "bold"), fg="#2563eb", bg="#f8fafc").pack()
        # -----------------------------------------

        self.status_label = tk.Label(self.root, text="● SYSTEM OFFLINE", font=("Segoe UI", 10, "bold"), fg="#ef4444", bg="#f8fafc", pady=15)
        self.status_label.pack()

        btn_style = {"font": ("Segoe UI", 10, "bold"), "fg": "white", "height": 2, "bd": 0, "cursor": "hand2"}
        tk.Button(self.root, text="🚀 START SERVER", bg="#2563eb", command=self.start_server, **btn_style).pack(pady=5, padx=40, fill="x")
        
        # Changed text to explicitly say (ADMIN)
        tk.Button(self.root, text="🌐 OPEN SYSTEM (ADMIN)", bg="#3b82f6", command=self.open_system, **btn_style).pack(pady=5, padx=40, fill="x")
        
        tk.Button(self.root, text="🛑 STOP SERVER", bg="#475569", command=self.stop_server, **btn_style).pack(pady=5, padx=40, fill="x")

    def start_server(self):
        if not self.server_process:
            try:
                venv_python = os.path.join(BASE_DIR, "venv", "Scripts", "python.exe")
                cmd = [venv_python, "-m", "waitress", "--listen=0.0.0.0:8000", "housingProject.wsgi:application"]
                self.server_process = subprocess.Popen(cmd, creationflags=subprocess.CREATE_NO_WINDOW)
                self.status_label.config(text="● SYSTEM LIVE", fg="#22c55e")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to start server:\n{str(e)}")

    def open_system(self):
        # Admin opens localhost to get cloud backup permissions
        webbrowser.open("http://localhost:8000/static/trackerApp/")

    def stop_server(self):
        try:
            subprocess.run('for /f "tokens=5" %a in (\'netstat -aon ^| findstr :8000\') do taskkill /f /pid %a', shell=True, capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
            self.server_process = None
            self.status_label.config(text="● SYSTEM OFFLINE", fg="#ef4444")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to stop server:\n{str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    DHSUDLauncher(root)
    root.mainloop()