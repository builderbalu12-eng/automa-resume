# How to Test the Chrome Extension - Step by Step

## Step 1: Ensure Dev Server is Running
```bash
# Make sure the app is running at http://localhost:8080
pnpm run dev
```

The app should be accessible at: `http://localhost:8080`

---

## Step 2: Load the Extension in Chrome

### 2A. Open Chrome Extensions Page
1. Open **Google Chrome**
2. Go to: `chrome://extensions/` (copy-paste into address bar)
3. You should see your installed extensions list

### 2B. Enable Developer Mode
1. Look for the **"Developer mode"** toggle in the **top right corner**
2. Click to **turn it ON** (it will turn blue)

### 2C. Load Your Extension
1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. Navigate to your project root folder (where `package.json` is)
3. Click **"Select Folder"**
4. The extension should now appear in your extensions list as **"ResumeMatch Pro"**

---

## Step 3: Upload Your Master Resume

### 3A. Go to the Web App
1. Open your browser and go to: `http://localhost:8080`
2. You'll see the **ResumeMatch Pro** dashboard
3. Click the **"Tailor Your Resume"** button
4. You'll see **"Upload Your Master Resume"** page

### 3B. Prepare a Test Resume
You need a DOCX resume file. If you don't have one:
- Download sample: Use a basic Word document with your name, email, skills, experience
- Save it as `resume.docx`

### 3C. Upload the Resume
1. On the upload page, click the **upload area**
2. Select your `resume.docx` file
3. Wait for it to process and show "✓ Resume Successfully Uploaded!"
4. The resume is now stored in your browser

---

## Step 4: Test the Extension on a Job Site

### 4A. Visit a Job Posting
Go to one of these job sites and open a job posting:
- **LinkedIn** - linkedin.com/jobs (click on any job)
- **Indeed** - indeed.com (search for a job, click on listing)
- **Naukri** - naukri.com (click on a job)
- **Glassdoor** - glassdoor.com (click on a job)
- **Monster** - monster.com (click on a job)

### 4B. Look for the Extension Button
1. Once you're on a job posting page, look for the **"📄 Match & Download Resume"** button
   - It appears in the **bottom right corner** of the page
   - Has a purple background

2. If you don't see it:
   - **Reload the page** (Ctrl+R or Cmd+R)
   - Check the console for errors (F12 → Console tab)
   - Make sure the extension is loaded (step 2C)

### 4C. Click the Button
Click the **"📄 Match & Download Resume"** button. The **extension popup** should open automatically.

---

## Step 5: Use the Extension Popup

### 5A. The Popup Shows
You'll see a popup with:
- **Job Title** (extracted from page)
- **Company Name** (extracted from page)
- **⚡ Tailor Resume** button
- **⬇️ Download Resume** button (disabled until tailoring is done)
- **💾 Save Application** button (disabled until tailoring is done)

### 5B. Tailor the Resume
1. Click **"⚡ Tailor Resume"**
2. Wait for the AI to analyze the job and tailor your resume (takes 10-30 seconds)
3. You should see: **"✓ Resume tailored! ATS Score: XX%"**

### 5C. Download the Tailored Resume
1. Click **"⬇️ Download Resume"**
2. The file downloads to your Downloads folder as:
   - `Resume_CompanyName_JobTitle_YYYY-MM-DD.docx`

### 5D. Save to History (Optional)
1. Click **"💾 Save Application"** to save this to your history
2. You can later view it at: `http://localhost:8080/#/history`

---

## Step 6: Verify Extension is Working

### Check 1: Button Appears on Job Sites
- ✓ You see the "📄 Match & Download Resume" button on job pages
- ✓ Button has purple color and appears in bottom right

### Check 2: Popup Opens
- ✓ Clicking button opens the extension popup
- ✓ Popup shows job title and company name
- ✓ Popup has three buttons (Tailor, Download, Save)

### Check 3: Tailoring Works
- ✓ "Tailor Resume" button processes without errors
- ✓ Shows success message with ATS score
- ✓ Takes 10-30 seconds to complete

### Check 4: Download Works
- ✓ Download button creates DOCX file
- ✓ File appears in Downloads folder
- ✓ File can be opened in Word or Google Docs

### Check 5: History Works
- ✓ Can save applications to history
- ✓ History appears at `http://localhost:8080/#/history`
- ✓ Can update status (applied, interview, offer, rejected)

---

## Troubleshooting

### Problem: Button Not Appearing
**Solution:**
1. Reload the page (Ctrl+R)
2. Reload the extension:
   - Go to `chrome://extensions`
   - Find "ResumeMatch Pro"
   - Click the refresh icon
3. Make sure you're on a supported job site (LinkedIn, Indeed, Glassdoor, etc.)

### Problem: Popup Shows "No Master Resume"
**Solution:**
1. Go to `http://localhost:8080`
2. Click "Tailor Your Resume"
3. Upload a DOCX resume file
4. Return to job site and try extension again

### Problem: Tailoring Fails with Error
**Solution:**
1. Check if you have Gemini API key set:
   - File: `.env.local`
   - Should have: `VITE_GOOGLE_GEMINI_API_KEY=your_key`
2. Get API key from: https://makersuite.google.com/app/apikey
3. Restart dev server: `pnpm run dev`

### Problem: "No Job Posting Found"
**Solution:**
1. Make sure you're on actual job listing page (with job details visible)
2. Different job sites have different HTML structure
3. Try reloading the page
4. Try a different job site

### Problem: Download Not Working
**Solution:**
1. Check Chrome download permissions
2. Make sure Downloads folder exists and is writable
3. Check browser console (F12) for errors
4. Try different browser if Chrome doesn't work

---

## Debugging Tips

### Open DevTools in Extension
1. Go to `chrome://extensions`
2. Find "ResumeMatch Pro"
3. Click **"Details"**
4. Scroll down and click **"Inspect views"** → **"service worker"**
5. This opens DevTools for the background script

### Check Content Script
1. Open any job site
2. Press F12 to open DevTools
3. Go to **"Console"** tab
4. Look for any red error messages

### Check Local Storage
1. Press F12 on any page
2. Go to **"Application"** tab
3. Click **"Local Storage"** → `http://localhost:8080`
4. You should see your saved resume and applications

### Check Chrome Storage
1. Open `chrome://extensions`
2. Open DevTools for the service worker (see above)
3. Run in console:
   ```javascript
   chrome.storage.sync.get(null, (items) => console.log(items));
   ```

---

## What Should Happen

### Workflow Summary
1. ✓ Upload resume once on dashboard
2. ✓ Go to any job site
3. ✓ Click extension button
4. ✓ Extension extracts job details
5. ✓ Click "Tailor Resume"
6. ✓ AI tailors resume for that job
7. ✓ Download tailored DOCX file
8. ✓ (Optional) Save to application history
9. ✓ View history and track applications

### Success Indicators
- Extension icon appears in top right corner
- "Match & Download Resume" button visible on job pages
- Popup opens without errors
- Resume tailoring completes with ATS score
- Tailored resume downloads successfully
- Application history tracks your applications

---

## Getting Help

If something doesn't work:
1. Check console for error messages (F12 → Console)
2. Make sure dev server is running (`pnpm run dev`)
3. Make sure Gemini API key is configured in `.env.local`
4. Try reloading the extension (`chrome://extensions` → refresh)
5. Try reloading the page (Ctrl+R)
6. Check that you're on a supported job site

---

## Next Steps

Once extension works, you can:
- ✓ Tailor resumes for multiple jobs
- ✓ Track applications in history
- ✓ Export history as CSV
- ✓ Update application status
- ✓ Optimize resumes for different roles
