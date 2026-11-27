from typing import List, Optional
from pydantic import BaseModel, Field

class AnalysisRequest(BaseModel):
    resume_text: str = Field(..., description="Extracted plain text from the student resume")
    role_id: str = Field(..., description="Unique slug or identifier for target role")
    role_title: str = Field(..., description="Display title of the target job role")
    target_skills: Optional[List[str]] = Field(default=[], description="Configured technical skills for the role")
    target_tools: Optional[List[str]] = Field(default=[], description="Configured tools and platforms for the role")
    job_description: Optional[str] = Field(default="", description="Optional specific job description or requirements")

class MatchedSkillItem(BaseModel):
    skill: str
    evidence: str
    importance: str = "high"

class MissingSkillItem(BaseModel):
    skill: str
    reason: str
    priority: str = "high"
    suggestion: str

class SectionFeedbackItem(BaseModel):
    section: str
    score: int
    feedback: str
    suggestion: str

class AnalysisResponse(BaseModel):
    overallScore: int
    jobMatchScore: int
    summary: str
    strengths: List[str] = []
    matchedSkills: List[MatchedSkillItem] = []
    missingOrWeakSkills: List[MissingSkillItem] = []
    keywordSuggestions: List[str] = []
    sectionFeedback: List[SectionFeedbackItem] = []
    projectSuggestions: List[str] = []
    formattingFeedback: List[str] = []
    actionPlan: List[str] = []
    limitations: List[str] = []
    model_id: str = "mistral-7b-instruct-v0.1.Q4_K_M"

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: str
    model_exists: bool
    n_ctx: int
    n_threads: int
    device: str
    details: Optional[str] = None
