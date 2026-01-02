---
description: How to run the Smart Healthcare Webapp (Server and Client) in VS Code
---

You can run both the server and the client simultaneously in VS Code using multiple terminal windows.

### Method 1: Manual Terminal (Recommended for Debugging)

1.  **Open two terminals** in VS Code (`Ctrl + Shift + \` or `Terminal -> New Terminal`).
2.  **In the first terminal (Backend):**
    ```bash
    cd server
    npm run dev
    ```
    *Wait for "Server running on port 5000" and "MongoDB Connected".*

3.  **In the second terminal (Frontend):**
    ```bash
    cd client
    npm run dev
    ```
    *The app will be available at [http://localhost:5173](http://localhost:5173).*

### Method 2: Using Batch Files (Quick Start)

You can also use the automated scripts provided in the root directory:

1.  Open your file explorer in VS Code.
2.  Right-click `run_app.bat` and select **Open in Integrated Terminal** (or just double-click it in your system's file explorer).
3.  This will automatically launch two separate command windows for the Backend and Frontend.

> [!TIP]
> If you encounter the **"SecurityError: running scripts is disabled"** error in VS Code, follow the **PowerShell Fix** below.

### Troubleshooting: PowerShell Security Error

If you see an error about `npm.ps1 cannot be loaded`, run this command **once** in your VS Code terminal as Administrator (or just use `cmd`):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Alternatively, you can skip `npm` and run the server directly:
```powershell
node server.js
```
### Method 3: Using CMD (Fastest Workaround)

If PowerShell still blocks `npm`, you can use the Command Prompt wrapper directly by prefixing your commands with `cmd /c`:

**Backend:**
```powershell
cd server
cmd /c npm run dev
```

**Frontend:**
```powershell
cd client
cmd /c npm run dev
```

### Troubleshooting: Address Already in Use (Port 5000)

If you see an error like `EADDRINUSE: address already in use :::5000`, it means a server is already running.

**Fix:**
Run this command to kill the existing server:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```
Then try `npm start` again.


