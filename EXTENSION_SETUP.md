# ResumeMatch Pro - Chrome Extension Setup Guide

## Overview

ResumeMatch Pro is now fully configured as a Chrome extension that works entirely with browser storage. The extension analyzes job postings on major job sites and generates tailored DOCX resumes automatically.

## How It Works

### Data Flow

1. **Master Resume Upload**: Users upload their master resume (DOCX) on the web app dashboard
2. **Storage**: Resume data is stored in Chrome's sync storage (or localStorage for web version)
3. **Job Site Detection**: When visiting supported job sites, the extension injects a button
4. **Job Analysis**: Users click the button to extract job details from the page
5. **Resume Tailoring**: The extension uses Google Gemini AI to tailor the resume for the specific job
6. **Download**: Users can download the tailored resume as a DOCX file
7. **History**: Application history is saved in browser storage for future reference

## Supported Job Sites

The extension currently works on:
- LinkedIn (linkedin.com)
- Indeed (indeed.com)
- Naukri (naukri.com)
- Monster (monster.com)
- Glassdoor (glassdoor.com)
- Dice (dice.com)
- ZipRecruiter (ziprecruiter.com)
- Built In (builtin.com)

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm (preferred package manager)
- Google Gemini API Key
- Chrome browser (for testing)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```
VITE_GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### Development Server

```bash
# Start the development server
pnpm run dev

# The app will be available at http://localhost:8080
```

## Testing the Extension

### In Development Mode

1. **Start the dev server**:
   ```bash
   pnpm run dev
   ```

2. **Load the extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Navigate to your project root directory
   - The extension should now appear in your extensions list

3. **Test the extension**:
   - Visit a supported job site (e.g., LinkedIn job posting)
   - You should see a "📄 Match & Download Resume" button in the bottom right
   - Click the button to extract job data
   - The extension popup will open automatically
   - Upload a master resume on the dashboard first if you haven't

### Testing Workflow

1. **Upload Master Resume**:
   - Go to the web app at http://localhost:8080
   - Click "Tailor Your Resume"
   - Upload a DOCX resume file
   - The resume is saved to browser storage

2. **Visit Job Site**:
   - Go to a job posting on LinkedIn, Indeed, or another supported site
   - You should see the "📄 Match & Download Resume" button

3. **Extract and Tailor**:
   - Click the extension button
   - The popup opens with job info
   - Click "⚡ Tailor Resume"
   - Wait for AI analysis
   - Click "⬇️ Download Resume" to download the tailored version
   - Optionally click "💾 Save Application" to record it in your history

4. **View History**:
   - Go to http://localhost:8080/#/history
   - See all your tailored applications
   - Update their status (applied, interview, offer, rejected)
   - Export as CSV

## Browser Storage Details

### Stored Data

The extension stores the following in Chrome's `chrome.storage.sync` (synced across devices):

```typescript
// Master Resume
resumematch_master_resume: ResumeData

// Application History
resumematch_applications: ApplicationRecord[]

// User Data
resumematch_user_data: User

// Other
resumematch_user_id: string
resumematch_auth_token: string
resumematch_gemini_key: string
resumematch_last_sync: number
```

### Data Privacy

- All data is stored **locally in your browser**
- No data is sent to any backend server (except Google Gemini API for AI analysis)
- Data is encrypted by Chrome's sync storage
- You can clear all data by clearing your browser's site data

### Accessing Storage in DevTools

1. Open DevTools (F12)
2. Go to Application tab
3. In the left sidebar, expand "Storage" → "Chrome Storage"
4. View your stored data

## Architecture

### File Structure

```
client/
├── extension/
│   ├── background.ts       # Service worker (tab detection, downloads)
│   ├── content.ts          # Content script (job extraction, button injection)
│   ├── popup.ts            # Popup script (UI and tailoring logic)
│   └── popup.html          # Popup UI
├── services/
│   ├── gemini.ts           # AI analysis service
│   ├── mongodb.ts          # Storage service (refactored to use browser storage)
│   └── resumeGenerator.ts  # DOCX generation and download
├── utils/
│   ├── jobExtractor.ts     # Job description parsing
│   ├── storage.ts          # Browser storage wrapper
│   └── atsOptimizer.ts     # ATS scoring logic
└── pages/
    ├── Dashboard.tsx
    ├── UploadResume.tsx
    └── History.tsx
```

### Key Services

#### Background Service Worker (`client/extension/background.ts`)
- Monitors tab changes for job site detection
- Updates extension badge when on job sites
- Injects content scripts
- Handles download requests

#### Content Script (`client/extension/content.ts`)
- Injects "Match & Download Resume" button on job pages
- Extracts job data from page DOM
- Listens for messages from popup

#### Popup (`client/extension/popup.ts` & `popup.html`)
- Shows job information
- Handles resume tailoring workflow
- Downloads and saves applications

#### Storage Service (`client/utils/storage.ts`)
- Abstracts Chrome storage API and localStorage
- Provides promise-based interface
- Works in both extension and web contexts

#### MongoDB Service (`client/services/mongodb.ts`)
- **Fully refactored to use browser storage**
- No backend API calls
- Stores applications locally
- Provides history management

## Common Issues and Solutions

### "No Master Resume" Error
**Problem**: Popup shows "No Master Resume" warning
**Solution**: 
1. Go to http://localhost:8080
2. Click "Tailor Your Resume"
3. Upload a DOCX resume file
4. The master resume is now stored in browser storage

### "No Job Posting Found" Error
**Problem**: Extension doesn't detect job posting
**Solution**:
1. Make sure you're on a supported job site
2. The page might not have loaded completely - refresh and try again
3. Some job sites have different HTML structures - manual job entry is coming soon

### AI Tailoring Fails
**Problem**: Error during resume tailoring
**Solutions**:
1. Check that `VITE_GOOGLE_GEMINI_API_KEY` is set correctly in `.env.local`
2. Verify your Gemini API key is active and has quota
3. Check console (DevTools) for detailed error messages

### Extension Button Not Appearing
**Problem**: "📄 Match & Download Resume" button not visible
**Solution**:
1. Reload the extension: `chrome://extensions` → Find ResumeMatch Pro → Click refresh icon
2. Reload the job site page (Ctrl+R or Cmd+R)
3. Check that the content script is injected:
   - Open DevTools (F12)
   - Go to Sources tab
   - Look for content script in the injected scripts

### Download Not Working
**Problem**: Download doesn't start or file is corrupted
**Solution**:
1. Check Chrome's download settings
2. Ensure you have write permissions to Downloads folder
3. Try downloading to a different location
4. Check that your resume has valid data

## Building for Production

### Build the Extension

```bash
pnpm run build
```

This creates:
- `dist/spa/` - Web app bundle
- Extension files ready for loading

### Package for Chrome Web Store

1. Zip the entire extension folder
2. Go to Chrome Web Store Developer Dashboard
3. Upload the zip file
4. Fill in extension details
5. Submit for review

## API Integration (Optional)

Currently, the extension uses **browser storage only**. To add an optional backend:

1. Update `client/services/mongodb.ts` to call API endpoints
2. Create API routes (examples in `server/routes/`)
3. Deploy backend server
4. Update `VITE_API_URL` environment variable

This is optional and not required for the extension to function.

## Security Considerations

### Best Practices

1. **API Keys**: Store Gemini API key in environment variables, never in code
2. **Data**: All resume data stays on user's device
3. **Communication**: Gemini API calls use HTTPS
4. **Storage**: Use `chrome.storage.sync` for cross-device sync with encryption

### What's NOT Stored in Extension

- Master resume content is stored locally only
- No resume data sent to any server except Gemini API
- No user tracking or analytics
- No 3rd party integrations

## Troubleshooting

### Extension loads but button doesn't appear

```javascript
// Check in DevTools Console:
// 1. Verify content script is running
chrome.tabs.query({}, (tabs) => console.log(tabs));

// 2. Check if button is in DOM
document.getElementById('resumematch-extract-btn')

// 3. Check console for errors
```

### Storage not persisting

```javascript
// Check chrome.storage in DevTools:
// 1. Open DevTools
// 2. Application → Chrome Storage
// 3. Check if data is there

// Debug from background script:
chrome.storage.sync.get(null, (items) => console.log(items));
```

### Gemini API not working

```javascript
// Test API key:
// 1. Check .env.local file exists
// 2. Verify key is correct format
// 3. Check API is enabled in Google Cloud Console
// 4. Check rate limits aren't exceeded
```

## Future Enhancements

- [ ] Support more job sites with custom parsers
- [ ] Manual job entry form
- [ ] Resume templates
- [ ] Interview tips and preparation
- [ ] Email integration for job alerts
- [ ] LinkedIn auto-apply
- [ ] Salary negotiation tips
- [ ] Optional backend sync across devices
- [ ] Batch resume generation
- [ ] Resume version control

## Support

For issues or questions:

1. Check this guide first
2. Review error messages in DevTools
3. Check `.env.local` configuration
4. Verify Gemini API key is active
5. Try disabling other extensions that might conflict

## License

ResumeMatch Pro is built for job seekers to streamline their application process.
