import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ResumeData } from "@/types";
import { setMasterResume, setUserId } from "@/utils/storage";
import { saveResume } from "@/services/mongodb";

export const UploadResume: React.FC = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = async (uploadedResume: ResumeData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a unique user ID if not exists
      const userId = `user_${Date.now()}`;
      await setUserId(userId);

      // Save to local storage
      await setMasterResume(uploadedResume);

      // Save resume data
      try {
        await saveResume(uploadedResume);
      } catch (e) {
        console.warn("Could not save resume:", e);
        // Continue anyway, data is in local storage
      }

      setResume(uploadedResume);
    } catch (err) {
      setError("Failed to save resume. Please try again.");
      console.error("Error saving resume:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (resume) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Resume Successfully Uploaded!
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Your master resume has been saved and is ready to be tailored for
              job applications.
            </p>

            <div className="bg-card border border-border rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold mb-4">Resume Summary</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{resume.contact.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{resume.contact.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Skills</p>
                  <p className="font-medium">
                    {resume.skills.length} skills identified
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">
                    {resume.experience.length} positions
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Education</p>
                  <p className="font-medium">
                    {resume.education.length} degrees
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-lg bg-background border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setResume(null);
                }}
                className="px-6 py-3 rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:shadow-glow transition-all"
              >
                Upload Another Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
            Upload Your Master Resume
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your professional resume as a DOCX file. We'll parse it and
            use it to tailor resumes for job applications.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 mb-8">
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            isLoading={isLoading}
          />

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Resume Requirements</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ DOCX format (.docx file)</li>
              <li>✓ Contact information</li>
              <li>✓ Professional summary or objective</li>
              <li>✓ Skills section</li>
              <li>✓ Work experience</li>
              <li>✓ Education</li>
            </ul>
          </div>

          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use clear section headers</li>
              <li>• Include quantifiable achievements</li>
              <li>• List relevant technical skills</li>
              <li>• Keep formatting simple</li>
              <li>• Proofread for typos</li>
              <li>• Update with recent experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
