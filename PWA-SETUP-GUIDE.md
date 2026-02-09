# One Bill PWA - Setup Guide

## 📱 What is a PWA?

A **Progressive Web App (PWA)** is a website that works like a native mobile app:
- ✅ Install on phone home screen
- ✅ Works offline
- ✅ Access camera
- ✅ Push notifications
- ✅ Faster than websites
- ✅ No app store needed!

## 🚀 Quick Start (Test on Your Phone NOW!)

### Method 1: GitHub Pages (Easiest - FREE)

1. **Create GitHub Account** (if you don't have one)
   - Go to github.com
   - Sign up for free

2. **Create New Repository**
   - Click "New Repository"
   - Name it: `onebill-pwa`
   - Make it Public
   - Click "Create"

3. **Upload Files**
   - Upload these 3 files:
     - `index.html`
     - `manifest.json`
     - `service-worker.js`

4. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: main
   - Click Save

5. **Access Your App**
   - URL will be: `https://yourusername.github.io/onebill-pwa`
   - Open this on your phone!

### Method 2: Netlify (Also FREE & Easier)

1. **Go to netlify.com**
2. **Sign up** with GitHub
3. **Drag and drop** the 3 files
4. **Get instant URL**: `https://random-name.netlify.app`
5. **Open on phone** and install!

## 📲 Installing on Phone

### On iPhone (Safari):
1. Open the PWA URL
2. Tap the **Share** button (□↑)
3. Scroll and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. App appears on home screen! 🎉

### On Android (Chrome):
1. Open the PWA URL
2. See **"Install app"** banner at bottom
3. Tap **"Install"**
4. App appears in app drawer! 🎉

Alternative:
- Tap menu (⋮)
- Tap **"Add to Home Screen"**
- Tap **"Add"**

## ✨ PWA Features You Now Have

### 1. **Camera Capture** 📷
- Tap floating camera button
- Take photo of bill
- Auto-saved to form
- No need for gallery!

### 2. **Offline Mode** 📵
- Works without internet
- Bills saved locally
- Auto-sync when online
- See offline indicator

### 3. **Install Banner** 📱
- Prompts users to install
- Shows after 30 seconds
- Can dismiss

### 4. **Home Screen Shortcuts** ⚡
- Long press app icon
- Quick actions:
  - Add Bill
  - Capture Bill

### 5. **Toast Notifications** 🔔
- Success messages
- Sync notifications
- Status updates

### 6. **Background Sync** 🔄
- Bills sync automatically
- When connection returns
- No data loss

## 🔧 Customization

### Change App Colors
Edit in `manifest.json`:
```json
"theme_color": "#667eea",
"background_color": "#667eea"
```

### Change App Name
Edit in `manifest.json`:
```json
"name": "Your App Name",
"short_name": "App Name"
```

### Add Custom Icons
Replace the SVG icons with PNG/JPG:
```json
"icons": [
  {
    "src": "icon-192.png",
    "sizes": "192x192",
    "type": "image/png"
  }
]
```

## 🎯 Next Steps for Production

### 1. **Add Backend API**
Currently stores in browser. For multi-device:

```javascript
// In service-worker.js, replace syncBills():
async function syncBills() {
  const bills = await getPendingBills();
  
  for (const bill of bills) {
    await fetch('https://your-api.com/bills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify(bill)
    });
  }
}
```

### 2. **Add Authentication**
```javascript
// Add to index.html
function login(email, password) {
  return fetch('https://your-api.com/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }).then(r => r.json());
}
```

### 3. **Cloud Storage for Bills**
Upload images to AWS S3 or Firebase Storage:
```javascript
async function uploadBill(file) {
  const formData = new FormData();
  formData.append('bill', file);
  
  return fetch('https://your-api.com/upload', {
    method: 'POST',
    body: formData
  });
}
```

### 4. **Push Notifications**
Enable push for reminders:
```javascript
// Request permission
const permission = await Notification.requestPermission();

// Subscribe to push
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: 'your-vapid-key'
});
```

### 5. **OCR Integration**
Add receipt scanning:
```javascript
// Use Tesseract.js for OCR
import Tesseract from 'tesseract.js';

async function scanReceipt(image) {
  const { data: { text } } = await Tesseract.recognize(image, 'eng');
  
  // Extract amount, date, merchant
  const amount = text.match(/₹?\s*(\d+[\d,]*\.?\d*)/);
  return { amount, text };
}
```

## 🐛 Troubleshooting

### Camera Not Working?
- **Permissions**: Allow camera access
- **HTTPS Only**: PWA camera needs HTTPS
- **Use localhost** for testing (works without HTTPS)

### Install Button Not Showing?
- Must be on **HTTPS**
- Must have **valid manifest**
- Must have **service worker**
- Chrome/Safari only

### Offline Mode Not Working?
- Check service worker registered
- Check browser console for errors
- Clear cache and reload

### Can't Upload Files?
- Check file size (5MB limit in service worker)
- Check file type (.jpg, .png, .pdf allowed)
- Check storage quota

## 📊 Testing Checklist

- [ ] Opens on phone
- [ ] Install banner appears
- [ ] Can install to home screen
- [ ] App icon works
- [ ] Camera opens
- [ ] Can capture photo
- [ ] Photo saves to form
- [ ] Can submit bill
- [ ] Works offline (turn off wifi)
- [ ] Syncs when online returns
- [ ] Notifications work

## 🌐 Domain Setup (Optional)

### Using Custom Domain

1. **Buy domain** (e.g., onebill.app)
2. **Point to GitHub Pages/Netlify**:
   ```
   CNAME: yourusername.github.io
   ```
3. **Enable HTTPS** (automatic on both platforms)
4. **Update manifest.json**:
   ```json
   "start_url": "https://onebill.app/"
   ```

## 💰 Costs

- **GitHub Pages**: FREE
- **Netlify**: FREE (100GB bandwidth/month)
- **Custom Domain**: ₹500-1000/year
- **Backend API** (if needed): 
  - Firebase: FREE tier available
  - Railway: FREE tier available
  - AWS: ~₹500/month for small app

## 📱 App Store Alternative?

PWAs don't need app stores, but you CAN:

1. **Google Play** (PWA Wrapper)
   - Use TWA (Trusted Web Activity)
   - Free to publish

2. **Apple App Store**
   - Need MacOS
   - $99/year developer account
   - Wrap PWA in native container

But **PWAs work great without app stores!**

## 🎉 You're Done!

Your One Bill PWA is now:
✅ Installable
✅ Works offline
✅ Has camera access
✅ Professional app-like experience
✅ No app store needed
✅ FREE to host

**Share your app URL with anyone - they can install directly from browser!**

---

## 📧 Questions?

Common questions:

**Q: Can I monetize this?**
A: Yes! Add payment gateway, subscriptions, ads

**Q: Can multiple people use it?**
A: Yes, but needs backend for data sharing

**Q: Is data secure?**
A: Currently stored locally. Add encryption + backend for production

**Q: Can I build this for my company?**
A: Yes! Check out One Bill Enterprise version

**Q: How to update the app?**
A: Just update files on GitHub/Netlify
Users get updates automatically!

---

**Next: Build backend API for cloud sync and multi-user support!**
