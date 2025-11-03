# ResumeMatch Pro - Complete Project Documentation

## 📋 Project Overview

**Name**: ResumeMatch Pro  
**Description**: AI-powered Chrome extension + web app that automatically tailors resumes for job applications, optimizes for ATS (Applicant Tracking System), and provides real-time match scores.

**Core Technologies**:

- Frontend: React 18 + React Router 6 + TypeScript + Vite
- Styling: Tailwind CSS 3 + Radix UI
- AI: Google Gemini API for resume analysis
- Database: Backend API (Express) with mock in-memory storage (optional MongoDB)
- Document Processing: docx.js (generation), mammoth.js (parsing)
- Chrome Extension: Manifest V3

---

## 🏗️ Project Structure

```
resumematch-pro/
├── client/                          # Frontend React SPA
│   ├── App.tsx                      # Main app router (entry point)
│   ├── main.tsx                     # React DOM entry point
│   ├── global.css                   # Global styles + theme variables
│   ├── pages/                       # Route components
│   │   ├── Dashboard.tsx            # Homepage/landing page
│   │   ├── UploadResume.tsx         # Resume upload page
│   │   ├── History.tsx              # Application tracking page
│   │   └── NotFound.tsx             # 404 page
│   ├── components/                  # Reusable React components
│   │   ├── ResumeUpload.tsx         # Drag-drop resume uploader
│   │   ├── ATSScore.tsx             # ATS score visualization
│   │   └── ApplicationList.tsx      # Application history display
│   ├── services/                    # API integration layer
│   │   ├── mongodb.ts               # Database operations
│   │   ├── gemini.ts                # Google Gemini AI
│   │   ├── resumeParser.ts          # DOCX parsing
│   │   └── resumeGenerator.ts       # DOCX generation
│   ├── utils/                       # Utility functions
│   │   ├── jobExtractor.ts          # DOM parsing for job postings
│   │   ├── atsOptimizer.ts          # ATS scoring logic
│   │   └── storage.ts               # Chrome/Local storage
│   ├── types/                       # TypeScript interfaces
│   │   └── index.ts                 # All type definitions
│   └── extension/                   # Chrome extension files
│       ├── content.ts               # Content script (injects button)
│       ├── background.ts            # Background service worker
│       ├── popup.ts                 # Extension popup logic
│       └── popup.html               # Extension popup UI
├── server/                          # Express backend
│   ├── index.ts                     # Server setup + routes
│   └── routes/
│       └── resume.ts                # Resume API handlers
├── shared/                          # Shared types
│   └── api.ts                       # API interfaces
├── public/
│   └── manifest.json                # Chrome extension manifest
├── index.html                       # HTML entry point
├── vite.config.ts                   # Vite configuration
├── vite.config.server.ts            # Server build config
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies + scripts
├── .env.example                     # Environment variables template
└── README.md                        # Setup instructions
```

---

## 📄 Page-by-Page Functionality

### 1. **Dashboard (`/`)** - `client/pages/Dashboard.tsx`

**Purpose**: Landing page and main hub  
**Key Components**:

- Hero section with gradient background
- Feature cards (3-column grid)
- Call-to-action buttons
- Statistics section (if user has uploaded resume)
- Recent applications list (if any)

**Logic Flow**:

```typescript
1. Load master resume from localStorage
2. Load application history from API
3. Calculate stats: total apps, avg ATS score, success rate
4. Display hero section for new users OR stats section for returning users
5. Show recent applications (last 5)
```

**Data Loaded**:

- `getMasterResume()` → ResumeData or null
- `getUserId()` → string or null
- `getApplicationHistory(userId)` → ApplicationRecord[]

**Navigation**:

- "Upload Your Resume" button → `/upload`
- "View History" button → `/history` (only if resume exists)
- "Tailor Your Resume" button → `/upload` (if resume exists)

**Visual Features**:

- Animated gradient background
- Floating blob shapes (decorative)
- Responsive grid layout
- Loading skeletons

---

### 2. **Upload Resume (`/upload`)** - `client/pages/UploadResume.tsx`

**Purpose**: Upload master resume and tailor for jobs  
**Key Components**:

- `<ResumeUpload />` component
- Resume summary display (after upload)
- Success/error messages

**Logic Flow**:

```typescript
1. Show file upload component
2. On file drop/select:
   - Validate file is .docx
   - Parse resume using parseDocxFile()
   - Validate resume has required sections
   - Save to localStorage via setMasterResume()
   - Generate unique userId via setUserId()
   - (Optional) Save to backend via saveResume()
3. Show success screen with resume summary
4. Display action buttons
```

**Resume Parsing** (`resumeParser.ts`):

```typescript
Extracts from DOCX:
- Contact info (name, email, phone, location)
- Professional summary
- Skills (comma/line separated)
- Experience (job title, company, dates, descriptions)
- Education (degree, institution, graduation date)
- Projects (optional)
```

**Validation Rules**:

```typescript
Required fields:
- ✓ Name
- ✓ Email
- ✓ Phone
- ✓ At least 1 skill
- ✓ At least 1 experience entry
- ✓ At least 1 education entry
```

**Error Handling**:

- Invalid file format → Show error message
- Parsing failure → Suggest re-saving resume
- Missing required fields → List specific errors

**State Management**:

```typescript
const [resume, setResume] = useState<ResumeData | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

---

### 3. **History (`/history`)** - `client/pages/History.tsx`

**Purpose**: Track all resume applications and outcomes  
**Key Components**:

- `<ApplicationList />` component
- Status filter buttons
- Export CSV button
- Statistics cards

**Logic Flow**:

```typescript
1. Load applications from API: getApplicationHistory(userId)
2. On mount, fetch all applications
3. Display filter options: [All, Applied, Interview, Offer, Rejected]
4. User clicks filter → Update filtered list
5. User clicks status badge → Show status options
6. User selects new status → Call updateApplicationStatus()
7. User clicks Export → Generate CSV and download
```

**CSV Export**:

```
Headers: Job Title, Company, Status, Match Score, Applied Date
Format: Quoted CSV with commas
Filename: applications_YYYY-MM-DD.csv
```

**Status Options**:

- `applied` - Initial application
- `interview` - Moved to interview stage
- `offer` - Received offer
- `rejected` - Rejected by company

**Statistics Displayed**:

```typescript
- Total Applications: length of array
- Offers: filter(s => s.status === 'offer').length
- Interviews: filter(s => s.status === 'interview').length
- Avg Match Score: Math.round(sum / length)
```

**Application Card Display**:

```typescript
Shows per application:
- Job title + Company
- Status badge (color coded)
- Match percentage
- Applied date
- View job posting link
- Expandable details (description, status change)
```

---

## 🎨 Component Deep Dive

### **ResumeUpload Component** - `client/components/ResumeUpload.tsx`

**Props**:

```typescript
interface ResumeUploadProps {
  onUploadSuccess: (resume: ResumeData) => void;
  isLoading?: boolean;
}
```

**Features**:

- Drag-and-drop zone
- File input fallback
- Hover animations
- Loading spinner
- Error messages

**Event Handlers**:

- `handleDrag()` - Track mouse over drop zone
- `handleDrop()` - Process dropped file
- `handleChange()` - Process selected file
- `handleFile()` - Main processing logic

---

### **ATSScore Component** - `client/components/ATSScore.tsx`

**Props**:

```typescript
interface ATSScoreProps {
  score: ATSScore;
  isLoading?: boolean;
}
```

**Displays**:

1. **Circular progress indicator**
   - Percentage (0-100%)
   - Color coding: Green (80+), Yellow (60-79), Orange (<60)
2. **ATS Score breakdown**
   - Numeric score /100
   - Progress bar visualization

3. **Matched Keywords** (green badges)
   - Shows up to 8 keywords
   - "+X more" indicator if overflow

4. **Missing Keywords** (amber badges)
   - Shows up to 8 missing keywords
   - Critical for optimization

5. **Recommended Improvements** (bulleted list)
   - Up to 5 actionable suggestions
   - Based on gap analysis

---

### **ApplicationList Component** - `client/components/ApplicationList.tsx`

**Props**:

```typescript
interface ApplicationListProps {
  applications: ApplicationRecord[];
  onStatusChange?: (appId: string, status: ApplicationRecord["status"]) => void;
  isLoading?: boolean;
}
```

**Card Features**:

- Job title + company
- Status badge with icon
- Match score display
- Applied date
- Job URL link
- Expandable details

**Empty State**:
Shows emoji and message when no applications

---

## 🔌 Services Layer

### **MongoDB Service** - `client/services/mongodb.ts`

**Functions**:

```typescript
// User operations
saveUser(userData: User) → Promise<User>
getUserResume(userId: string) → Promise<ResumeData | null>
saveResume(userId: string, resume: ResumeData) → Promise<ResumeData>

// Application tracking
saveApplication(app: ApplicationRecord) → Promise<ApplicationRecord>
getApplicationHistory(userId: string) → Promise<ApplicationRecord[]>
updateApplicationStatus(appId: string, status: string) → Promise<ApplicationRecord>
```

**Current Implementation**:

- Uses backend REST API endpoints
- API_URL: `http://localhost:8080/api` (from env or default)
- All calls go to Express server
- Falls back gracefully if API unavailable

**Error Handling**:

```typescript
try {
  const response = await fetch(...)
  if (!response.ok) throw new Error("Failed to save")
  return await response.json()
} catch (error) {
  console.error("Error:", error)
  throw error  // Caller handles
}
```

---

### **Gemini Service** - `client/services/gemini.ts`

**API Key**: `VITE_GOOGLE_GEMINI_API_KEY` from environment

**Functions**:

#### 1. **analyzeMasterResume(resume: ResumeData) → Promise<string>**

- Creates summary of candidate profile
- Used for comparison against jobs
- Returns 2-3 sentence analysis

#### 2. **extractJobRequirements(jobDescription: string) → Promise<JobDescription>**

- Parses job posting text
- Returns structured JSON:
  ```typescript
  {
    title: string,
    company: string,
    location: string,
    requirements: string[],
    skills: string[]
  }
  ```

#### 3. **tailorResumeForJob(master: ResumeData, job: JobDescription) → Promise<ResumeData>**

- Takes master resume + job
- Returns new ResumeData with:
  - Tailored professional summary
  - Rewritten experience descriptions
  - Keyword-optimized content
  - Same overall structure

**Prompt Template**:

```
"Tailor this resume for this job.
Highlight relevant skills matching the job.
Use keywords from job description.
Optimize for ATS.
Return JSON with tailoredSummary and tailoredExperience."
```

#### 4. **calculateATSScore(resume: ResumeData, job: JobDescription) → Promise<ATSScore>**

Returns:

```typescript
{
  score: number (0-100),           // Overall ATS score
  matchPercentage: number,         // Keyword match %
  keywordMatches: string[],        // Found keywords
  missingKeywords: string[],       // Not found keywords
  improvements: string[]           // Suggestions
}
```

---

### **Resume Parser Service** - `client/services/resumeParser.ts`

**Main Function**: `parseDocxFile(file: File) → Promise<ResumeData>`

**Parsing Strategy**:

1. Convert DOCX to text using mammoth.js
2. Split by lines and clean
3. Extract sections by keyword matching:
   - Contact info: regex for email, phone, URL
   - Skills: text between "SKILLS" and "EXPERIENCE"
   - Experience: regex for job titles + companies + dates
   - Education: regex for degrees + institutions

**Key Regex Patterns**:

```typescript
Email: /[\w\.-]+@[\w\.-]+\.\w+/;
Phone: /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
URL: /(https?:\/\/[^\s]+|www\.[^\s]+)/i;
Experience: /([A-Z][a-z\s]+)\s+at\s+([A-Z][a-z\s&\-\.]+)(\d{4})?[-–](\d{4}|present)?/gi;
Education: /(Bachelor|Master|PhD).*?in\s+([A-Za-z\s]+).*?from\s+([A-Z].*?(?:University|College))/gi;
```

**Validation**: `validateResume(resume: ResumeData)`

```typescript
Returns:
{
  isValid: boolean,
  errors: string[]  // List of missing sections
}
```

---

### **Resume Generator Service** - `client/services/resumeGenerator.ts`

**Main Function**: `generateResumeDocx(resume: ResumeData, company: string, jobTitle: string) → Promise<Blob>`

**DOCX Structure**:

```
1. Header (Name + Contact Info)
2. Professional Summary (if exists)
3. Skills (bullet-separated)
4. Professional Experience
   - Job Title (bold)
   - Company | Date Range (italic)
   - Description bullets (indented)
5. Education
   - Degree | Field (bold)
   - Institution | Date (italic)
6. Projects (if exists)
```

**Formatting**:

- Font: Calibri 11pt (body), 14pt bold (headings)
- Section headers: 24pt bold with bottom border
- Proper spacing between sections
- Professional styling

**Download Function**: `downloadResume(...)`

```typescript
1. Generate DOCX blob
2. Create object URL
3. Create <a> element
4. Download with filename: Resume_[Company]_[JobTitle]_[Date].docx
5. Clean up URL
```

---

## 🛠️ Utility Functions

### **Job Extractor** - `client/utils/jobExtractor.ts`

#### `extractJobDescriptionFromDOM() → JobDescription | null`

**Strategy**: Multi-site DOM parsing

```typescript
1. Try LinkedIn selectors:
   - Title: h2.show-more-less-html__title
   - Company: a[href*="company"]
   - Description: .show-more-less-html__markup

2. Try Indeed selectors:
   - Title: h1.jobsearch-JobInfoHeader-title
   - Company: a[data-testid="company-name"]
   - Description: #jobDescriptionText

3. Try Naukri selectors:
   - Title: .jd-header .naukri-text
   - Description: .job-desc

4. Try Glassdoor selectors:
   - Title: [data-test="jobTitle"]
   - Company: [data-test="companyName"]
   - Description: [data-test="JobDescription"]
```

#### `extractRequirements(text: string) → string[]`

```typescript
1. Find "requirements/qualifications" section
2. Extract bullet points (•, -, *)
3. Filter out short/invalid items
4. Return array of requirements
```

#### `extractSkills(text: string) → string[]`

```typescript
1. Match against hardcoded skill list (100+ common tech skills)
2. Extract years of experience
3. Return unique matched skills
```

#### `createJobExtractionButton() → HTMLElement`

```typescript
Creates styled button:
- Position: fixed bottom-right
- Gradient background
- Hover animations
- Click handler that triggers extraction
```

---

### **ATS Optimizer** - `client/utils/atsOptimizer.ts`

#### `analyzeATSCompatibility(resume: ResumeData, job: JobDescription) → ATSScore`

**Scoring Algorithm**:

```
Contact Info: 10 points (3+3+4)
  - Email: 3
  - Phone: 3
  - Name: 4

Summary: 5 points
  - Present: 5, Missing: 0

Skills: 15 points
  - Count * 2 (max 15)

Experience: 30 points
  - Count * 8 (max 30)

Education: 15 points
  - Count * 7 (max 15)

Keyword Matching: 25 points
  - (matched_keywords / total_job_keywords) * 25

Format: 5 points (assumed)

TOTAL: 100 points
```

#### `generateImprovements(resume, job, missing) → string[]`

Suggests:

- Add professional summary if missing
- Add more skills (aim for 10+)
- Add experience if none
- Add education if none
- Incorporate critical missing keywords
- Add more bullet points to thin roles
- Quantify achievements with metrics

#### Common Skills List (100+ tech skills):

```typescript
Languages: JavaScript, Python, Java, C++, Go, Rust, etc.
Frameworks: React, Vue, Angular, Node, Express, etc.
Databases: MongoDB, PostgreSQL, MySQL, DynamoDB, etc.
Tools: Docker, Kubernetes, Git, Jenkins, AWS, etc.
Methodologies: Agile, Scrum, CI/CD, DevOps, etc.
```

---

### **Storage Utility** - `client/utils/storage.ts`

**Storage Keys**:

```typescript
USER_ID: "resumematch_user_id";
MASTER_RESUME: "resumematch_master_resume";
AUTH_TOKEN: "resumematch_auth_token";
GEMINI_API_KEY: "resumematch_gemini_key";
```

**Functions**:

```typescript
// Generic
saveToStorage(key, value) → Promise<void>
getFromStorage(key) → Promise<any>
removeFromStorage(key) → Promise<void>

// Specific getters/setters
getUserId() → Promise<string | null>
setUserId(userId: string) → Promise<void>
getMasterResume() → Promise<ResumeData | null>
setMasterResume(resume: ResumeData) → Promise<void>
getAuthToken() → Promise<string | null>
setAuthToken(token: string) → Promise<void>
clearAllStorage() → Promise<void>
```

**Dual Storage**:

- Chrome Extension: Uses `chrome.storage.sync` (synced across devices)
- Web App: Falls back to `localStorage`

---

## 📊 Data Types

### **ResumeData**

```typescript
{
  contact: {
    name: string
    email: string
    phone: string
    location: string
    website?: string
    linkedin?: string
    github?: string
  }
  summary?: string
  skills: string[]
  experience: [{
    title: string
    company: string
    location?: string
    startDate: string
    endDate?: string
    isCurrentlyWorking?: boolean
    description: string[]
  }]
  education: [{
    institution: string
    degree: string
    field: string
    graduationDate: string
    gpa?: string
    achievements?: string[]
  }]
  projects?: [{
    title: string
    description: string
    technologies: string[]
    link?: string
    date?: string
  }]
  certifications?: string[]
}
```

### **ApplicationRecord**

```typescript
{
  _id?: string
  userId: string
  jobTitle: string
  company: string
  jobUrl?: string
  jobDescription: JobDescription
  originalResume: ResumeData
  tailoredResume: ResumeData
  atsScore: number
  matchPercentage: number
  appliedDate: Date
  status: 'applied' | 'interview' | 'rejected' | 'offer'
  createdAt?: Date
  updatedAt?: Date
}
```

### **ATSScore**

```typescript
{
  score: number (0-100)
  matchPercentage: number (0-100)
  keywordMatches: string[]
  missingKeywords: string[]
  improvements: string[]
}
```

---

## 🔄 Data Flow

### **Resume Upload Flow**

```
User uploads DOCX
  ↓
ResumeUpload.handleFile()
  ↓
parseDocxFile() → ResumeData
  ↓
validateResume() → check required fields
  ↓
onUploadSuccess(resume)
  ↓
setUserId(generated_id)
setMasterResume(resume) → localStorage
saveResume(userId, resume) → API (optional)
  ↓
Update state
Show success screen
```

### **Resume Tailoring Flow**

```
User inputs job description
  ↓
extractJobRequirements(text) → JobDescription
  ↓
tailorResumeForJob(master, job) → tailored ResumeData
  ↓
calculateATSScore(tailored, job) → ATSScore
  ↓
Display results:
  - Tailored resume preview
  - ATS score visualization
  - Matched/missing keywords
  - Improvement suggestions
```

### **Application Saving Flow**

```
User clicks "Save Application"
  ↓
Create ApplicationRecord {
  userId, jobTitle, company, jobUrl,
  jobDescription, originalResume, tailoredResume,
  atsScore, status: 'applied'
}
  ↓
saveApplication(record) → API
  ↓
Show success notification
```

---

## 🌐 API Endpoints

### **Base URL**: `http://localhost:8080/api`

### **Health Check**

```
GET /api/health
Response: { status: "ok" }
```

### **User Management**

```
POST /api/users
Body: User
Response: User with _id

GET /api/users/:userId/resume
Response: ResumeData | null

POST /api/users/:userId/resume
Body: ResumeData
Response: ResumeData
```

### **Applications**

```
GET /api/applications?userId=123
Response: ApplicationRecord[]

POST /api/applications
Body: ApplicationRecord
Response: ApplicationRecord with _id

PATCH /api/applications/:appId
Body: { status: string }
Response: ApplicationRecord
```

---

## 🎨 Styling & Theme

### **Color Scheme**

```css
Primary: hsl(262, 80%, 50%)  /* Purple */
Secondary: hsl(218, 92%, 50%)  /* Blue */
Accent: hsl(16, 100%, 60%)    /* Orange */

Background: white (light) / dark slate (dark)
Foreground: dark slate (light) / white (dark)
Muted: light gray
Border: light gray
```

### **Typography**

```css
Headings: Poppins (600, 700, 800 weight)
Body: Inter (400, 500, 600, 700 weight)
Mono: Fira Code (for code snippets)
```

### **Spacing**

- Default padding: 1rem (16px)
- Border radius: 0.75rem (12px)
- Gap/margin increment: 0.5rem

---

## ⚙️ Configuration

### **Environment Variables** (`.env.local`)

```
# Required for AI features
VITE_GOOGLE_GEMINI_API_KEY=your_api_key

# Optional for MongoDB sync
VITE_MONGODB_REALM_APP_ID=your_app_id

# API configuration
VITE_API_URL=http://localhost:8080/api
```

### **Build Configuration** (`vite.config.ts`)

```typescript
- Entry: client/main.tsx
- Output: dist/spa/
- Server: localhost:8080
- Path aliases: @/ and @shared/
- Plugins: React SWC
```

---

## 🚀 Error Handling Strategy

### **API Fetch Errors**

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error("API error");
  return await response.json();
} catch (error) {
  console.error("Error:", error);
  // Show user-friendly message
  // Fallback to local storage if available
  throw error;
}
```

### **Gemini API Errors**

```typescript
- No API key: Show setup instruction
- Rate limit: Queue request or show error
- Parse error: Fallback to basic extraction
```

### **Resume Parsing Errors**

```typescript
- Invalid file: "Please upload a .docx file"
- Corrupted: "Resume parsing failed"
- Missing sections: List specific errors
```

---

## 🔐 Security Considerations

1. **API Keys**
   - Never hardcoded in source
   - Passed via environment variables
   - Not logged or exposed

2. **User Data**
   - Stored in localStorage (client-side)
   - HTTPS only on production
   - No PII sent to external APIs except Gemini

3. **Chrome Extension**
   - Content scripts sandboxed
   - No unauthorized data collection
   - Permissions minimized

---

## 📱 Responsive Design

- **Mobile** (< 768px): Single column, smaller fonts
- **Tablet** (768px - 1024px): 2 column grid
- **Desktop** (> 1024px): 3 column grid, full featured

---

## 🔧 Common Tasks & Code Locations

### **To add a new page**:

1. Create `client/pages/MyPage.tsx`
2. Add route to `client/App.tsx`
3. Create navigation link

### **To call an API**:

1. Create function in `client/services/mongodb.ts`
2. Use from component via `useState`
3. Handle loading/error states

### **To add a new AI feature**:

1. Create function in `client/services/gemini.ts`
2. Add prompt template
3. Parse response JSON
4. Return typed result

### **To style a component**:

1. Use Tailwind classes
2. Use CSS variables for colors
3. Extend in `tailwind.config.ts` if needed

---

## 🐛 Known Issues & Debugging

### **"Failed to fetch" Error**

- Cause: Backend API not running or unreachable
- Solution: Start backend server or disable API calls
- Fallback: App uses localStorage if API fails

### **Resume parsing doesn't extract content**

- Cause: DOCX formatting is unusual
- Solution: Regenerate resume in Word/LibreOffice
- Debug: Check mammoth.js output

### **Gemini API errors**

- Cause: Invalid API key, rate limit, network
- Solution: Check .env.local, verify API key active
- Fallback: Basic extraction without AI

---

## 📚 Additional Resources

- Google Gemini Docs: https://ai.google.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- React Router: https://reactrouter.com/
- Chrome Extension API: https://developer.chrome.com/docs/extensions/

---

This documentation should give Claude or any AI assistant complete understanding of:

- ✅ What each page does
- ✅ How components work together
- ✅ Data flow and state management
- ✅ API integration points
- ✅ Styling approach
- ✅ Error handling
- ✅ File organization
- ✅ Configuration needs
