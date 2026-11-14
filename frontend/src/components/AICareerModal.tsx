import React, { useState } from 'react';
import { 
  X, Sparkles, Upload, FileText, CheckCircle2, AlertTriangle, 
  Send, Bot, User, Brain, Code2, HelpCircle, Layers, ArrowRight
} from 'lucide-react';
import { Job, MatchResult, InterviewPrep } from '../types';

interface AICareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob?: Job | null;
  allJobs: Job[];
}

export const AICareerModal: React.FC<AICareerModalProps> = ({
  isOpen,
  onClose,
  selectedJob,
  allJobs
}) => {
  const [activeTab, setActiveTab] = useState<'match' | 'chat' | 'prep'>('match');
  const [resumeText, setResumeText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);
  const [targetJobId, setTargetJobId] = useState<string>(selectedJob ? selectedJob.id : (allJobs[0]?.id || ''));
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: "👋 Hi! I am your **Mumbai Tech Career Copilot**. I can evaluate your resume against genuine Mumbai software openings, provide salary & stipend intelligence, and generate tailored interview questions. How can I help you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Interview Prep state
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null);
  const [isLoadingPrep, setIsLoadingPrep] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData
      });
      const data = await resp.json();
      if (data.parsed_profile) {
        setParsedSkills(data.parsed_profile.flat_skills || []);
        setResumeText(data.parsed_profile.summary || '');
        
        // Auto trigger match if job is selected
        if (targetJobId) {
          triggerJobMatch(targetJobId, data.parsed_profile.summary);
        }
      }
    } catch (err) {
      console.error("Resume upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerJobMatch = async (jobId: string, customText?: string) => {
    setIsMatching(true);
    try {
      const resp = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          resume_text: customText || resumeText || undefined
        })
      });
      const data = await resp.json();
      setMatchResult(data);
    } catch (err) {
      console.error("Match error:", err);
    } finally {
      setIsMatching(false);
    }
  };

  const loadInterviewPrep = async (jobId: string) => {
    setIsLoadingPrep(true);
    try {
      const resp = await fetch(`/api/ai/prep/${jobId}`);
      const data = await resp.json();
      setInterviewPrep(data);
      setActiveTab('prep');
    } catch (err) {
      console.error("Prep load error:", err);
    } finally {
      setIsLoadingPrep(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputMessage).trim();
    if (!msg) return;

    const newMsgs = [...chatMessages, { sender: 'user' as const, text: msg }];
    setChatMessages(newMsgs);
    setInputMessage('');
    setIsSendingChat(true);

    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, job_id: targetJobId || undefined })
      });
      const data = await resp.json();
      setChatMessages([...newMsgs, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setChatMessages([
        ...newMsgs,
        { sender: 'bot', text: "⚠️ Network error connecting to Career Copilot service." }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const targetJob = allJobs.find(j => j.id === targetJobId) || selectedJob;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                AI Career Intelligence & Resume Copilot
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  v2.0 ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Evidence-based skill matching, interview prep & Mumbai hiring insights
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('match')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'match'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Resume Matcher
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'prep'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Interview Preparation
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Career Copilot Chat
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          
          {/* TAB 1: RESUME MATCHER */}
          {activeTab === 'match' && (
            <div className="space-y-6">
              
              {/* Upload Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      Candidate Resume Profile
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload your PDF resume or enter skills to evaluate compatibility.
                    </p>
                  </div>
                  <label className="btn-apply-secondary text-xs cursor-pointer inline-flex items-center gap-1.5 self-start">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Extracting...' : fileName ? 'Replace Resume' : 'Upload Resume (PDF)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {fileName && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Loaded: <strong>{fileName}</strong></span>
                  </div>
                )}

                {/* Detected Skills */}
                {parsedSkills.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Detected Technical Skills ({parsedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs rounded bg-purple-950/40 text-purple-300 border border-purple-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Target Job Selector */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Opportunity to Evaluate:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={targetJobId}
                    onChange={(e) => {
                      setTargetJobId(e.target.value);
                      triggerJobMatch(e.target.value);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {allJobs.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.company} — {j.title} ({j.work_location})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => triggerJobMatch(targetJobId)}
                    disabled={isMatching}
                    className="btn-apply-primary text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isMatching ? 'Calculating...' : 'Recalculate Match'}</span>
                  </button>
                </div>
              </div>

              {/* Match Result Display */}
              {matchResult && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/20 via-slate-950/60 to-slate-900 border border-purple-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
                        {matchResult.match_tier}
                      </span>
                      <h4 className="text-lg font-bold text-white">
                        {matchResult.job_title}
                      </h4>
                      <p className="text-xs text-slate-400">{matchResult.company}</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 font-mono">
                          {matchResult.match_score}%
                        </span>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Compatibility</div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                      <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Matching Stack Requirements ({matchResult.matched_skills.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matched_skills.length > 0 ? (
                          matchResult.matched_skills.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs rounded bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No exact keyword overlap</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                      <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Missing or Recommended Skills ({matchResult.missing_skills.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missing_skills.length > 0 ? (
                          matchResult.missing_skills.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs rounded bg-amber-900/40 text-amber-300 border border-amber-500/30">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">All listed skills matched!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Actionable Application Advice:
                    </span>
                    <p className="leading-relaxed">{matchResult.recommendation}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => loadInterviewPrep(matchResult.job_id)}
                      className="btn-apply-secondary text-xs flex items-center gap-1.5"
                    >
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Prepare Interview for {matchResult.company}</span>
                    </button>

                    {targetJob && (
                      <a
                        href={targetJob.direct_application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-apply-primary text-xs flex items-center gap-1.5"
                      >
                        <span>Apply on Official ATS</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERVIEW PREPARATION */}
          {activeTab === 'prep' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    Interview Question Bank: {targetJob?.company} — {targetJob?.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tailored DSA, System Design & Technical Screening Prompts
                  </p>
                </div>
                <button
                  onClick={() => loadInterviewPrep(targetJobId)}
                  disabled={isLoadingPrep}
                  className="btn-apply-primary text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoadingPrep ? 'Generating...' : 'Generate New Questions'}</span>
                </button>
              </div>

              {interviewPrep ? (
                <div className="space-y-5">
                  {/* Technical Coding Questions */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                      <Code2 className="w-4 h-4" /> Core Technical & Coding Challenges
                    </h4>
                    <div className="space-y-2">
                      {interviewPrep.technical_coding_questions.map((q, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
                          <span className="font-mono text-cyan-400 font-bold mr-2">Q{idx + 1}.</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Design Scenarios */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Architectural & System Design Scenarios
                    </h4>
                    <div className="space-y-2">
                      {interviewPrep.system_design_scenarios.map((s, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
                          <span className="font-mono text-purple-400 font-bold mr-2">Scenario {idx + 1}:</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Interview Tips */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> How to Ace This Technical Evaluation
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                      {interviewPrep.interviewer_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Code2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Click "Generate New Questions" to build tailored interview prompts for this role.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAREER COPILOT CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[500px] rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
              
              {/* Quick Prompt Chips */}
              <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-slate-500 shrink-0">Quick Queries:</span>
                <button
                  onClick={() => handleSendMessage("What are the standard software internship stipends in Mumbai?")}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 hover:bg-slate-800"
                >
                  💰 Mumbai Stipend Ranges
                </button>
                <button
                  onClick={() => handleSendMessage("Which tech hubs in Mumbai have the highest software hiring (Powai vs BKC vs Navi Mumbai)?")}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 hover:bg-slate-800"
                >
                  📍 MMR Tech Hubs
                </button>
                <button
                  onClick={() => handleSendMessage("How should a fresher optimize their technical resume for ATS parsers?")}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 hover:bg-slate-800"
                >
                  📄 ATS Resume Checklist
                </button>
                <button
                  onClick={() => handleSendMessage("What is the typical interview round structure for software engineering roles in Mumbai?")}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 hover:bg-slate-800"
                >
                  🎯 Interview Rounds
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'bot' && (
                      <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap ${
                        m.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.sender === 'user' && (
                      <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
                {isSendingChat && (
                  <div className="flex items-center gap-2 text-xs text-purple-400 italic">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Copilot is formulating intelligence...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about Mumbai tech companies, interview rounds, salaries, or verification..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isSendingChat}
                  className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

