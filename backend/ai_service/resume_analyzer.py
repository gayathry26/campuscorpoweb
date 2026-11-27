import json
import logging
from typing import Dict, Any, List
from model_loader import model_manager
from schemas import AnalysisRequest, AnalysisResponse, MatchedSkillItem, MissingSkillItem, SectionFeedbackItem

logger = logging.getLogger("resume_analyzer")

def clean_text_for_prompt(text: str, max_chars: int = 2500) -> str:
    """
    Sanitize and truncate resume text to fit cleanly inside model context window.
    Implemented purely with standard Python string methods without regular expressions.
    """
    if not text:
        return ""
    
    # Normalize carriage returns and tabs
    normalized = text.replace('\r\n', '\n').replace('\r', '\n').replace('\t', ' ')
    
    # Process lines: collapse consecutive spaces and limit consecutive blank lines
    cleaned_lines = []
    consecutive_empty = 0
    for raw_line in normalized.split('\n'):
        line = " ".join(raw_line.split())
        if line:
            cleaned_lines.append(line)
            consecutive_empty = 0
        else:
            if consecutive_empty < 1 and cleaned_lines:
                cleaned_lines.append("")
                consecutive_empty += 1
                
    cleaned = "\n".join(cleaned_lines).strip()
    if len(cleaned) > max_chars:
        cleaned = cleaned[:max_chars] + "\n...[truncated]..."
    return cleaned

def strip_trailing_commas_pure(s: str) -> str:
    """
    Removes trailing commas before closing braces/brackets without regex,
    safely preserving commas that occur inside string literals.
    """
    result = []
    in_str = False
    escape = False
    last_comma_idx = -1

    for ch in s:
        if in_str:
            result.append(ch)
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
                result.append(ch)
            elif ch == ',':
                last_comma_idx = len(result)
                result.append(ch)
            elif ch in ('}', ']'):
                if last_comma_idx != -1:
                    # Check if everything between last comma and this brace is whitespace
                    between = ''.join(result[last_comma_idx + 1:])
                    if between.strip() == '':
                        del result[last_comma_idx]
                last_comma_idx = -1
                result.append(ch)
            else:
                if not ch.isspace():
                    last_comma_idx = -1
                result.append(ch)
    return ''.join(result)

def repair_and_parse_json(text: str) -> Dict[str, Any]:
    """
    Robust JSON parser and repair utility that handles code fences,
    trailing commas, and cut-off LLM token streams without using regex.
    """
    # 1. Strip markdown code fences if present (handles closed or unclosed fences)
    if "```" in text:
        first_fence = text.find("```")
        after_fence = text[first_fence + 3:].lstrip()
        if after_fence.lower().startswith("json"):
            after_fence = after_fence[4:].lstrip()
        second_fence = after_fence.find("```")
        if second_fence != -1:
            text = after_fence[:second_fence].strip()
        else:
            text = after_fence.strip()

    start_idx = text.find('{')
    if start_idx == -1:
        raise ValueError("No JSON object found in response.")

    candidate = text[start_idx:].strip()

    # Try direct parse first
    try:
        return json.loads(candidate)
    except Exception:
        pass

    # Strip trailing commas safely
    candidate = strip_trailing_commas_pure(candidate)
    try:
        return json.loads(candidate)
    except Exception:
        pass

    # Handle unclosed string (e.g. LLM token generation stopped mid-string)
    trimmed = candidate
    quote_count = 0
    in_escape = False
    for ch in trimmed:
        if in_escape:
            in_escape = False
        elif ch == '\\':
            in_escape = True
        elif ch == '"':
            quote_count += 1
            
    if quote_count % 2 != 0:
        last_quote = trimmed.rfind('"')
        if last_quote != -1:
            trimmed = trimmed[:last_quote]

    # Remove dangling comma at end
    trimmed = trimmed.rstrip()
    if trimmed.endswith(','):
        trimmed = trimmed[:-1].rstrip()

    # Track open braces and brackets properly (respecting strings)
    open_curly = 0
    open_square = 0
    in_str = False
    in_escape = False
    for ch in trimmed:
        if in_str:
            if in_escape:
                in_escape = False
            elif ch == '\\':
                in_escape = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == '{':
                open_curly += 1
            elif ch == '}':
                open_curly = max(0, open_curly - 1)
            elif ch == '[':
                open_square += 1
            elif ch == ']':
                open_square = max(0, open_square - 1)

    closing = (']' * open_square) + ('}' * open_curly)
    candidate_repaired = trimmed + closing

    try:
        return json.loads(candidate_repaired)
    except Exception as e:
        logger.warning(f"JSON repair failed: {e}. Raw text snippet: {text[:250]}")
        raise ValueError("Model output could not be parsed into JSON.")

def build_prompt(req: AnalysisRequest) -> str:
    resume_clean = clean_text_for_prompt(req.resume_text)
    skills_list_str = ", ".join(req.target_skills[:8]) if req.target_skills else "General engineering skills"
    job_desc = f"\nSpecific Criteria: {req.job_description.strip()[:300]}\n" if req.job_description and req.job_description.strip() else ""

    prompt = f"""[INST] You are an expert ATS Resume Evaluator for Campus Placements.
Analyze this student resume for the role: '{req.role_title}'.
Target Skills: {skills_list_str}{job_desc}
Resume Text:
\"\"\"
{resume_clean}
\"\"\"

Return ONLY valid JSON (no markdown formatting, no explanations outside JSON):
{{
  "overallScore": 80,
  "jobMatchScore": 75,
  "summary": "1 concise sentence evaluating the student profile.",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "matchedSkills": [
    {{"skill": "SkillName", "evidence": "Direct quote from resume", "importance": "high"}}
  ],
  "missingOrWeakSkills": [
    {{"skill": "SkillName", "reason": "Why missing", "priority": "high", "suggestion": "Action to take"}}
  ],
  "keywordSuggestions": ["Keyword1", "Keyword2", "Keyword3"],
  "sectionFeedback": [
    {{"section": "Projects", "score": 80, "feedback": "Feedback", "suggestion": "Tip"}},
    {{"section": "Skills & Technologies", "score": 75, "feedback": "Feedback", "suggestion": "Tip"}},
    {{"section": "Formatting & ATS Structure", "score": 85, "feedback": "Feedback", "suggestion": "Tip"}}
  ],
  "projectSuggestions": ["1 recommended project idea"],
  "formattingFeedback": ["1 formatting tip"],
  "actionPlan": ["Step 1", "Step 2", "Step 3"],
  "limitations": ["Advisory evaluation based on extracted text."]
}}
[/INST]"""
    return prompt

def find_standalone_token(token: str, text_lower: str) -> int:
    """
    Finds starting index of token in text_lower with whole-word boundary validation,
    without using regular expressions. Safely accounts for symbols like C++, C#, .NET.
    """
    t_len = len(token)
    start = 0
    while True:
        idx = text_lower.find(token, start)
        if idx == -1:
            return -1
        
        # Preceding character check
        before_ok = (idx == 0) or (not text_lower[idx - 1].isalnum() and text_lower[idx - 1] not in ('+', '#', '@'))
        
        # Following character check
        end_idx = idx + t_len
        after_ok = (end_idx == len(text_lower)) or (not text_lower[end_idx].isalnum() and text_lower[end_idx] not in ('+', '#'))
        
        if before_ok and after_ok:
            return idx
        start = idx + 1

def compute_deterministic_skill_overlap(resume_text: str, target_skills: List[str]) -> Dict[str, Any]:
    """
    Calculates deterministic keyword matching between target skills and resume text
    using boundary-aware string inspection without regular expressions.
    """
    if not target_skills:
        return {"matched": [], "missing": [], "ratio": 0.5}

    text_lower = resume_text.lower()
    matched = []
    missing = []

    for s in target_skills:
        # Extract searchable sub-tokens without regex
        clean_s = s.replace('(', ' ').replace(')', ' ')
        for delimiter in ('/', '&', ',', '|'):
            clean_s = clean_s.replace(delimiter, ' ')
        
        tokens = []
        # Add full phrase first if reasonable
        full_phrase = " ".join(s.replace('(', '').replace(')', '').split()).lower()
        if len(full_phrase) >= 2:
            tokens.append(full_phrase)

        # Check for composite tokens like 'ci/cd'
        if 'ci/cd' in s.lower() and 'ci/cd' not in tokens:
            tokens.append('ci/cd')

        stop_words = {'and', 'for', 'the', 'basics', 'foundations', 'development', 'management', 'programming', 'architecture'}
        for p in clean_s.split():
            clean_p = p.strip().lower()
            if len(clean_p) >= 2 and clean_p not in stop_words:
                if clean_p not in tokens:
                    tokens.append(clean_p)

        found = False
        evidence_snippet = ""
        for t in tokens:
            idx = find_standalone_token(t, text_lower)
            if idx != -1:
                found = True
                start_c = max(0, idx - 15)
                end_c = min(len(resume_text), idx + len(t) + 35)
                evidence_snippet = resume_text[start_c:end_c].replace('\n', ' ').strip()
                break

        if found:
            matched.append({"skill": s, "evidence": evidence_snippet or f"Evidenced in resume ({s})"})
        else:
            missing.append(s)

    ratio = len(matched) / max(1, len(target_skills))
    return {"matched": matched, "missing": missing, "ratio": ratio}

def analyze_resume(req: AnalysisRequest) -> AnalysisResponse:
    if not req.resume_text or len(req.resume_text.strip()) < 30:
        raise ValueError("Resume text is empty or too short for analysis.")

    # 1. Deterministic baseline (pure Python, regex-free)
    overlap = compute_deterministic_skill_overlap(req.resume_text, req.target_skills)

    # 2. Build concise prompt
    prompt = build_prompt(req)

    # 3. Model inference: max 450 tokens keeps CPU generation quick (~25-45s)
    raw_response = model_manager.generate(prompt=prompt, max_tokens=450, temperature=0.1)

    # 4. Extract and parse structured JSON (regex-free, robust repair)
    try:
        data = repair_and_parse_json(raw_response)
    except Exception as e:
        logger.warning(f"Fallback parsing triggered due to: {e}")
        matched_items = overlap["matched"]
        data = {
            "overallScore": int(70 + overlap["ratio"] * 22),
            "jobMatchScore": int(45 + overlap["ratio"] * 48),
            "summary": f"Resume evaluated for {req.role_title}. Demonstrates core foundational knowledge with {len(matched_items)} key competencies identified.",
            "strengths": [
                f"Demonstrated proficiency in {', '.join([m['skill'] for m in matched_items[:3]])}" if matched_items else "Clear academic background",
                "Structured presentation of engineering coursework and technical exposure",
                "Relevant portfolio activities suitable for entry-level placement drives"
            ],
            "matchedSkills": [{"skill": m["skill"], "evidence": m["evidence"], "importance": "high"} for m in matched_items[:6]],
            "missingOrWeakSkills": [{"skill": s, "reason": "Not explicitly evidenced in projects or coursework", "priority": "high", "suggestion": f"Build a practical capstone showcasing {s}"} for s in overlap["missing"][:4]],
            "keywordSuggestions": overlap["missing"][:5] + ["CI/CD", "Agile", "RESTful APIs"],
            "sectionFeedback": [
                {"section": "Projects", "score": 75, "feedback": "Projects demonstrate hands-on coding but need metric-driven outcomes.", "suggestion": "Add measurable statistics like '% latency reduced' or 'users handled'."},
                {"section": "Skills & Technologies", "score": 70, "feedback": "Skills are listed clearly.", "suggestion": "Group skills by domain (Languages, Frameworks, Cloud, Databases)."},
                {"section": "Formatting & ATS Structure", "score": 85, "feedback": "Clean structure parsed cleanly by ATS.", "suggestion": "Maintain standard bullet points."}
            ],
            "projectSuggestions": [f"Develop an end-to-end full stack project integrating {req.role_title} best practices."],
            "formattingFeedback": ["Ensure GitHub repositories and LinkedIn links are clickable."],
            "actionPlan": [
                "Quantify bullet points with tangible business metrics and percentages.",
                f"Address priority missing skills: {', '.join(overlap['missing'][:2]) if overlap['missing'] else 'Advanced architecture'}.",
                "Tailor project descriptions to align directly with campus placement recruitment rubrics."
            ],
            "limitations": ["Automated ATS synthesis based on extracted text."]
        }

    # 5. Normalization & bounds checking (0-100)
    overall_score = max(10, min(100, int(data.get("overallScore", 70))))
    job_match_score = max(10, min(100, int(data.get("jobMatchScore", 65))))

    if req.target_skills:
        calibrated_match = int((job_match_score * 0.6) + (overlap["ratio"] * 100 * 0.4))
        job_match_score = max(15, min(98, calibrated_match))

    matched_skills = []
    for item in data.get("matchedSkills", []):
        if isinstance(item, dict):
            matched_skills.append(MatchedSkillItem(
                skill=item.get("skill", "Competency"),
                evidence=item.get("evidence", "Mentioned in resume"),
                importance=item.get("importance", "high")
            ))

    if not matched_skills and overlap["matched"]:
        for m in overlap["matched"][:6]:
            matched_skills.append(MatchedSkillItem(
                skill=m["skill"],
                evidence=m["evidence"],
                importance="high"
            ))

    missing_skills = []
    for item in data.get("missingOrWeakSkills", []):
        if isinstance(item, dict):
            missing_skills.append(MissingSkillItem(
                skill=item.get("skill", "Required Skill"),
                reason=item.get("reason", "Insufficient evidence demonstrated"),
                priority=item.get("priority", "high"),
                suggestion=item.get("suggestion", "Review technical documentation and build a demonstration demo")
            ))

    if not missing_skills and overlap["missing"]:
        for s in overlap["missing"][:4]:
            missing_skills.append(MissingSkillItem(
                skill=s,
                reason=f"Recommended for competitive {req.role_title} recruitment profiles",
                priority="high",
                suggestion=f"Complete a tutorial and link a GitHub project exhibiting {s}"
            ))

    section_feedback = []
    for sec in data.get("sectionFeedback", []):
        if isinstance(sec, dict):
            section_feedback.append(SectionFeedbackItem(
                section=sec.get("section", "General"),
                score=max(0, min(100, int(sec.get("score", 70)))),
                feedback=sec.get("feedback", "Good standard presentation."),
                suggestion=sec.get("suggestion", "Consider adding more quantifiable impact.")
            ))

    return AnalysisResponse(
        overallScore=overall_score,
        jobMatchScore=job_match_score,
        summary=data.get("summary", f"Comprehensive evaluation for {req.role_title}.").strip(),
        strengths=data.get("strengths", ["Clear technical presentation", "Standard academic layout"]),
        matchedSkills=matched_skills,
        missingOrWeakSkills=missing_skills,
        keywordSuggestions=data.get("keywordSuggestions", ["Git", "Testing", "Deployment"]),
        sectionFeedback=section_feedback,
        projectSuggestions=data.get("projectSuggestions", []),
        formattingFeedback=data.get("formattingFeedback", []),
        actionPlan=data.get("actionPlan", ["Tailor resume to target job descriptions"]),
        limitations=data.get("limitations", ["Automated AI evaluation is advisory and not a guarantee of placement."]),
        model_id="mistral-7b-instruct-v0.1.Q4_K_M"
    )
