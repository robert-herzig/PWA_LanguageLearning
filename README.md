# PWA Language Learning App

A Progressive Web App (PWA) for learning languages with offline capabilities, push notifications, and app-like experience.

## Features

✅ **Progressive Web App Capabilities**
- Installable on mobile and desktop
- Offline functionality with Service Worker
- App-like experience in standalone mode
- Push notifications support
- Responsive design

✅ **Language Learning Features**
- Interactive vocabulary lessons
- Progress tracking (localStorage)
- Offline learning capability
- Clean, modern UI

## Project Structure

```
PWA_LanguageLearning/
├── index.html          # Main HTML file
├── manifest.json       # Web App Manifest
├── sw.js              # Service Worker
├── css/
│   └── styles.css     # Main stylesheet
├── js/
│   └── app.js         # Main JavaScript application
├── icons/             # App icons (various sizes)
└── README.md          # This file
```

## Installation & Setup

### Prerequisites
No special software installation required! This is a pure web-based PWA that runs in any modern browser.

### Quick Start

1. **Clone or download this repository**
2. **Serve the files using a local web server** (required for PWA features)

#### Option 1: Using Python (if installed)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option 2: Using Node.js (if installed)
```bash
# Install a simple server globally
npm install -g http-server

# Run the server
http-server -p 8000
```

#### Option 3: Using VS Code Live Server Extension
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

3. **Open your browser and navigate to:**
   - `http://localhost:8000` (or the port your server is using)

4. **Test PWA Features:**
   - **Desktop:** Look for the install button in the address bar
   - **Mobile:** Use "Add to Home Screen" from browser menu
   - **Offline:** Disconnect internet and refresh - app should still work

## PWA Features Included

### 1. Web App Manifest (`manifest.json`)
- App metadata (name, description, icons)
- Display mode (standalone)
- Theme colors
- Icon definitions for various screen sizes

### 2. Service Worker (`sw.js`)
- Caches static assets for offline use
- Network-first strategy with fallback to cache
- Background sync capabilities
- Push notification handling

### 3. Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Safe area support for devices with notches

### 4. Installation Prompt
- Custom install prompt
- Remembers user's choice
- Re-shows prompt after 7 days if dismissed

## Browser Compatibility

- ✅ Chrome 45+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+

## Development

### Adding New Features
1. Update the HTML structure in `index.html`
2. Add styles in `css/styles.css`
3. Implement functionality in `js/app.js`
4. Update Service Worker cache in `sw.js` if needed

### Creating Icons
You'll need to create icons in these sizes:
- 16x16, 32x32 (favicon)
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 (PWA icons)

### Testing PWA Features
1. **Lighthouse Audit:** Use Chrome DevTools > Lighthouse > Progressive Web App
2. **Application Tab:** Check Service Worker, Manifest, and Storage
3. **Network Throttling:** Test offline functionality

## Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Your PWA will be available at `https://username.github.io/repository-name`

### Netlify
1. Connect your repository to Netlify
2. Deploy automatically on push

### Other Platforms
- Vercel
- Firebase Hosting
- Any static hosting service

## Next Steps

1. **Create actual app icons** (currently using placeholder paths)
2. **Add more language content** and lessons
3. **Implement user authentication**
4. **Add more interactive features**
5. **Set up analytics**
6. **Add unit tests**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this as a template for your own PWA projects!