# MongoDB Local Database Setup Guide

If you are seeing errors like **"Failed to load chat history"** or database connection timeouts, it means the local MongoDB database is either not installed or not running on your machine. 

Follow these step-by-step instructions to install and start the database.

---

## Step 1: Download & Install MongoDB

### A. Download MongoDB Community Server
1. Go to the [MongoDB Community Server Download Page](https://www.mongodb.com/try/download/community).
2. Select your specifications (these should be default):
   - **Version**: Current Stable version (e.g., `7.x.x` or `8.x.x`)
   - **Platform**: `Windows`
   - **Package**: `MSI`
3. Click **Download**.

### B. Run the Installer
1. Double-click the downloaded `.msi` file to start the installation.
2. Click **Next** and accept the license terms.
3. Choose **Complete** installation.
4. **IMPORTANT**: On the "Service Configuration" screen, leave **"Install MongoDB as a Service"** checked. This ensures MongoDB starts automatically whenever you boot up your computer.
   - Run service as **Network Service user** (default).
   - Leave the Service Name as `MongoDB`.
5. On the next screen, check **"Install MongoDB Compass"**. Compass is a helpful graphical user interface (GUI) that lets you visually inspect your databases, users, messages, and project tasks.
6. Click **Install** and finish the setup.

---

## Step 2: Verify MongoDB is Running

By default, the installer automatically starts the MongoDB service on your Windows system. You can verify this using the Service Manager:

1. Press `Windows Key + R`, type `services.msc`, and press **Enter**.
2. Scroll down the list to find **MongoDB Server (MongoDB)**.
3. Check the **Status** column:
   - It should say **Running**.
   - If it is not running, right-click **MongoDB Server (MongoDB)** and click **Start** or **Restart**.

---

## Step 3: Connect using MongoDB Compass (Optional GUI)

To verify the database structure visually:
1. Open the newly installed **MongoDB Compass** app from your Start menu.
2. In the "New Connection" screen, leave the URI as the default:
   ```text
   mongodb://localhost:27017
   ```
3. Click **Connect**.
4. You should see a list of default databases (e.g. `admin`, `config`, `local`). Once you boot up the ProjectPulse backend, a database named `projectpulse` will automatically appear in this list.

---

## Step 4: Run the ProjectPulse Backend

Now that your database is running, the backend server will automatically connect to it and seed the default administrator account.

1. Open a terminal inside `C:\Users\LENOVO\Desktop\projectpulse\server`.
2. Start the dev server:
   ```powershell
   npm run dev
   ```
3. You should see the following line in the terminal console:
   ```text
   Server running in development mode on port 5000
   MongoDB Connected: 127.0.0.1
   Default Admin Account Seeded (admin@projectpulse.com / admin123)
   ```

---

## Step 5: Test the Web App
1. Refresh your browser at **[http://localhost:5173/](http://localhost:5173/)**.
2. Click **System Admin** at the bottom of the login card and sign in.
3. The toast notifications will now succeed, and you can begin creating teams, tasks, and sending real-time messages!
