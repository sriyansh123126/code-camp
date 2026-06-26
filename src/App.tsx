import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  Bot, 
  Send, 
  User, 
  Clock, 
  Settings, 
  ClipboardList, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  BookOpen, 
  FileText, 
  Check, 
  RotateCcw, 
  RefreshCw, 
  Play, 
  ArrowRight, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

// Profile types
interface AIProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  systemInstruction: string;
  description: string;
}

// Predefined AI Profiles
const AI_PROFILES: AIProfile[] = [
  {
    id: 'collaborator',
    name: 'Creative Partner',
    title: 'Idea expander & writing assistant',
    avatar: '✍️',
    description: 'Specializes in brainstorming, copy drafting, structural outlining, and descriptive expansion.',
    systemInstruction: 'You are a warm, supportive, and highly creative copywriter. Help the user expand their ideas, brainstorm creative concepts, and draft engaging content.'
  },
  {
    id: 'architect',
    name: 'Technical Architect',
    title: 'Systems design & developer support',
    avatar: '💻',
    description: 'Expert in coding queries, backend architectures, technical specifications, and math.',
    systemInstruction: 'You are a precise, logical, and highly skilled software architect. Respond with extremely clean code, precise system architecture diagrams in ASCII, and direct solutions.'
  },
  {
    id: 'socrates',
    name: 'Socratic Scholar',
    title: 'Philosophical & deep learning tutor',
    avatar: '🦉',
    description: 'Guides understanding of complex academic topics through active reasoning and deep inquiry.',
    systemInstruction: 'You are a Socratic tutor. Instead of giving direct answers immediately, guide the user through logical, structured inquiry and detailed conceptual breakdowns.'
  }
];

// Message structures
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Kanban types
interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  effort: string;
  createdAt: string;
}

// Document drafts type
interface DocDraft {
  id: string;
  title: string;
  content: string;
  tag: string;
  updatedAt: string;
}

export default function App() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'writer' | 'planner'>('dashboard');

  // Global Server Status Check
  const [serverStatus, setServerStatus] = useState<{ status: string; hasApiKey: boolean; loading: boolean }>({
    status: 'checking',
    hasApiKey: false,
    loading: true,
  });

  // Client User Details (localStorage persisted)
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('gemini_studio_username') || '';
  });
  const [editingName, setEditingName] = useState<boolean>(!userName);
  const [tempName, setTempName] = useState<string>(userName);

  // Stats / Counters (from localStorage)
  const [stats, setStats] = useState({
    promptsRun: 0,
    ideasSaved: 0,
    tasksCompleted: 0
  });

  // --- Clock State ---
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Check Server Status on Load ---
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setServerStatus({
          status: data.status || 'online',
          hasApiKey: !!data.hasApiKey,
          loading: false,
        });
      })
      .catch(() => {
        setServerStatus({
          status: 'offline',
          hasApiKey: false,
          loading: false,
        });
      });
  }, []);

  // --- Initialize Stats and Saved Items ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('gemini_studio_chat');
    return saved ? JSON.parse(saved) : [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Welcome to Code Camp Workspace! Select an AI profile from the settings sidebar and ask me anything, or run task mappings inside the Planner Desk.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [docDrafts, setDocDrafts] = useState<DocDraft[]>(() => {
    const saved = localStorage.getItem('gemini_studio_docs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'doc-1',
        title: 'Project Inception Notes',
        content: '# Project Alpha Roadmap\n\n1. Establish robust full-stack container routes.\n2. Leverage Gemini models server-side safely.\n3. Implement local client-side persistence for seamless drafting.',
        tag: 'Strategy',
        updatedAt: new Date().toLocaleDateString()
      }
    ];
  });

  const [tasks, setTasks] = useState<KanbanTask[]>(() => {
    const saved = localStorage.getItem('gemini_studio_tasks');
    return saved ? JSON.parse(saved) : [
      {
        id: 't-1',
        title: 'Configure server-side environment variables',
        description: 'Verify GEMINI_API_KEY is placed safely in Settings > Secrets.',
        priority: 'high',
        status: 'todo',
        effort: '1h',
        createdAt: new Date().toLocaleDateString()
      },
      {
        id: 't-2',
        title: 'Launch Studio application interface',
        description: 'Design beautiful, responsive layout with Tailwind CSS.',
        priority: 'medium',
        status: 'in_progress',
        effort: '4h',
        createdAt: new Date().toLocaleDateString()
      }
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('gemini_studio_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('gemini_studio_docs', JSON.stringify(docDrafts));
    setStats(prev => ({ ...prev, ideasSaved: docDrafts.length }));
  }, [docDrafts]);

  useEffect(() => {
    localStorage.setItem('gemini_studio_tasks', JSON.stringify(tasks));
    const completedCount = tasks.filter(t => t.status === 'done').length;
    setStats(prev => ({ ...prev, tasksCompleted: completedCount }));
  }, [tasks]);

  // Load Prompt count from storage
  useEffect(() => {
    const count = parseInt(localStorage.getItem('gemini_prompts_run') || '0', 10);
    setStats(prev => ({ ...prev, promptsRun: count }));
  }, []);

  const incrementPromptsCount = () => {
    const current = parseInt(localStorage.getItem('gemini_prompts_run') || '0', 10) + 1;
    localStorage.setItem('gemini_prompts_run', current.toString());
    setStats(prev => ({ ...prev, promptsRun: current }));
  };

  // State handles for Client Username
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('gemini_studio_username', tempName.trim());
      setEditingName(false);
    }
  };

  // ==========================================
  // TAB 1: DASHBOARD QUICK ACTIONS
  // ==========================================
  const handleQuickAction = (promptText: string) => {
    setChatInput(promptText);
    setActiveTab('chat');
  };

  // ==========================================
  // TAB 2: CO-PILOT CHAT PLAYGROUND STATE
  // ==========================================
  const [selectedProfile, setSelectedProfile] = useState<AIProfile>(AI_PROFILES[0]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [chatInput, setChatInput] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);
    incrementPromptsCount();

    try {
      const chatHistory = [...chatMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Include system instruction in config if available
      const configObj = {
        systemInstruction: selectedProfile.systemInstruction,
        temperature: temperature,
      };

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: chatHistory,
          config: configObj
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error generating response');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'No response returned from Gemini.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'Unable to connect to model server.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Conversation restarted. Currently chatting with ${selectedProfile.name}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatError(null);
  };

  // ==========================================
  // TAB 3: DOCUMENT CANVAS STATE & FUNCTIONS
  // ==========================================
  const [docSubject, setDocSubject] = useState<string>('');
  const [docTone, setDocTone] = useState<string>('Professional');
  const [activeDraft, setActiveDraft] = useState<DocDraft | null>(docDrafts[0] || null);
  const [writerLoading, setWriterLoading] = useState<boolean>(false);
  const [writerError, setWriterError] = useState<string | null>(null);

  const handleCreateNewDraft = () => {
    const newDoc: DocDraft = {
      id: `doc-${Date.now()}`,
      title: 'Untitled Document Draft',
      content: '',
      tag: 'General',
      updatedAt: new Date().toLocaleDateString()
    };
    setDocDrafts(prev => [newDoc, ...prev]);
    setActiveDraft(newDoc);
  };

  const handleSaveActiveDraft = (newContent: string) => {
    if (!activeDraft) return;
    const updated = {
      ...activeDraft,
      content: newContent,
      updatedAt: new Date().toLocaleDateString()
    };
    setActiveDraft(updated);
    setDocDrafts(prev => prev.map(d => d.id === activeDraft.id ? updated : d));
  };

  const handleSaveActiveTitleAndTag = (newTitle: string, newTag: string) => {
    if (!activeDraft) return;
    const updated = {
      ...activeDraft,
      title: newTitle || 'Untitled Document Draft',
      tag: newTag || 'General',
      updatedAt: new Date().toLocaleDateString()
    };
    setActiveDraft(updated);
    setDocDrafts(prev => prev.map(d => d.id === activeDraft.id ? updated : d));
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = docDrafts.filter(d => d.id !== id);
    setDocDrafts(filtered);
    if (activeDraft?.id === id) {
      setActiveDraft(filtered[0] || null);
    }
  };

  const handleGenerateDocument = async () => {
    if (!docSubject.trim() || writerLoading) return;
    setWriterLoading(true);
    setWriterError(null);
    incrementPromptsCount();

    try {
      const promptText = `Compose a complete, well-structured document, formatted nicely with Markdown, about the following subject: "${docSubject}". The tone must be explicitly "${docTone}". Include an elegant title, section dividers, and structural bullet points.`;
      
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.5-flash',
          prompt: promptText
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error creating document');
      }

      const data = await response.json();

      const newDoc: DocDraft = {
        id: `doc-${Date.now()}`,
        title: docSubject.length > 30 ? docSubject.substring(0, 30) + '...' : docSubject,
        content: data.text || '',
        tag: docTone,
        updatedAt: new Date().toLocaleDateString()
      };

      setDocDrafts(prev => [newDoc, ...prev]);
      setActiveDraft(newDoc);
      setDocSubject('');
    } catch (err: any) {
      console.error(err);
      setWriterError(err.message || 'Unable to generate document draft.');
    } finally {
      setWriterLoading(false);
    }
  };

  // AI Assist Refinements in Doc Editor
  const handleAISubRefinement = async (actionType: 'expand' | 'formal' | 'summarize') => {
    if (!activeDraft || !activeDraft.content.trim() || writerLoading) return;
    setWriterLoading(true);
    setWriterError(null);

    let refinePrompt = '';
    if (actionType === 'expand') {
      refinePrompt = `The following is a draft document. Expand this content by adding more details, professional depth, and illustrative examples. Retain the same core ideas and markdown structure:\n\n${activeDraft.content}`;
    } else if (actionType === 'formal') {
      refinePrompt = `Format the following document to have an elevated, authoritative, and formal executive tone. Retain all technical facts and structure:\n\n${activeDraft.content}`;
    } else {
      refinePrompt = `Analyze the following document and write a high-level executive summary, key accomplishments, and key action item bullets at the absolute top of the content, followed by the original content:\n\n${activeDraft.content}`;
    }

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.5-flash',
          prompt: refinePrompt
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server refinement error');
      }

      const data = await response.json();
      handleSaveActiveDraft(data.text || activeDraft.content);
    } catch (err: any) {
      console.error(err);
      setWriterError(`Refinement failed: ${err.message}`);
    } finally {
      setWriterLoading(false);
    }
  };

  // ==========================================
  // TAB 4: PLANNER STATE & FUNCTIONS (KANBAN)
  // ==========================================
  const [plannerTheme, setPlannerTheme] = useState<string>('');
  const [plannerLoading, setPlannerLoading] = useState<boolean>(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  
  // Custom Manual Task Modal / inputs
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskEffort, setNewTaskEffort] = useState<string>('2h');

  const handleAddTaskManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const added: KanbanTask = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      status: 'todo',
      effort: newTaskEffort || '2h',
      createdAt: new Date().toLocaleDateString()
    };

    setTasks(prev => [...prev, added]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskEffort('2h');
  };

  // AI Task Mapper API Call
  const handleGenerateAITaskMap = async () => {
    if (!plannerTheme.trim() || plannerLoading) return;
    setPlannerLoading(true);
    setPlannerError(null);
    incrementPromptsCount();

    try {
      const response = await fetch('/api/gemini/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: plannerTheme.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to map tasks');
      }

      const data = await response.json();
      
      if (Array.isArray(data.tasks)) {
        const mappedTasks: KanbanTask[] = data.tasks.map((task: any, index: number) => ({
          id: `ai-t-${Date.now()}-${index}`,
          title: task.title || 'Action Item',
          description: task.description || 'Action item details generated by Gemini.',
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          effort: task.effort || '1-2h',
          createdAt: new Date().toLocaleDateString()
        }));

        setTasks(prev => [...prev, ...mappedTasks]);
        setPlannerTheme('');
      } else {
        throw new Error('Server returned invalid task list format.');
      }
    } catch (err: any) {
      console.error(err);
      setPlannerError(err.message || 'Unable to build task plan.');
    } finally {
      setPlannerLoading(false);
    }
  };

  // Simple column actions to move cards
  const handleUpdateTaskStatus = (id: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Code Camp</h1>
            <p className="text-xs text-zinc-400">Advanced Workspace Hub</p>
          </div>
        </div>

        {/* Desktop Tab Selector */}
        <nav className="hidden md:flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'chat' 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Co-Pilot Chat
          </button>
          <button 
            onClick={() => setActiveTab('writer')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'writer' 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Document Canvas
          </button>
          <button 
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'planner' 
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Planner Desk
          </button>
        </nav>

        {/* Global Connection / Status Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-850">
            <div className={`w-2 h-2 rounded-full ${
              serverStatus.loading 
                ? 'bg-amber-400 animate-pulse' 
                : serverStatus.hasApiKey 
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                  : 'bg-red-500 animate-pulse'
            }`} />
            <span className="text-xs font-mono text-zinc-300">
              {serverStatus.loading 
                ? 'SYNCING...' 
                : serverStatus.hasApiKey 
                  ? 'API READY' 
                  : 'MISSING SECRETS'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 font-mono text-sm px-1">
            <Clock className="w-4 h-4 text-amber-500/70" />
            <span>{timeStr || '00:00:00'}</span>
          </div>
        </div>
      </header>

      {/* Missing API Secret Bar Alert */}
      {!serverStatus.loading && !serverStatus.hasApiKey && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3.5 text-amber-400 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>
              <strong>GEMINI_API_KEY environment secret is missing.</strong> Open the <strong>Settings &gt; Secrets</strong> panel in the sidebar menu and provide your API Key to unlock real full-stack generations!
            </p>
          </div>
        </div>
      )}

      {/* Main Layout Body */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-6">
        
        {/* ==========================================
            TAB 1: WORKSPACE DASHBOARD
            ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header / Profile welcome banner */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="space-y-3 z-10">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-500 uppercase">
                  <Bot className="w-4 h-4" /> Studio Dashboard
                </div>
                {editingName ? (
                  <form onSubmit={handleSaveName} className="flex flex-wrap gap-2.5 max-w-md items-center">
                    <input 
                      type="text" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter your name..."
                      className="px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm flex-1 min-w-[200px]"
                      maxLength={24}
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-colors text-black font-semibold text-sm rounded-xl cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-black text-white">
                      Welcome back, {userName}!
                    </h2>
                    <button 
                      onClick={() => { setTempName(userName); setEditingName(true); }}
                      className="text-xs text-zinc-400 hover:text-amber-500 flex items-center gap-1 transition-colors border border-zinc-800 px-2 py-1 rounded-md"
                    >
                      Change
                    </button>
                  </div>
                )}
                <p className="text-zinc-400 text-sm max-w-2xl">
                  Your full-stack generative workstation is live. Synthesize drafts, map tasks using AI, or deep-dive into complex reasoning chains with specialized models.
                </p>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-2.5 z-10 w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="flex-1 md:flex-initial px-5 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 font-bold text-sm text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Bot className="w-4 h-4 text-amber-500" /> Start Chat
                </button>
                <button 
                  onClick={() => setActiveTab('planner')}
                  className="flex-1 md:flex-initial px-5 py-3 bg-amber-500 hover:bg-amber-600 font-bold text-sm text-black rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" /> Map Tasks <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bento Grid Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat Card 1 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between group hover:border-zinc-700 transition-all">
                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400 font-medium">Session Generations</span>
                  <div className="text-2xl font-bold font-mono tracking-tight text-white flex items-baseline gap-1.5">
                    {stats.promptsRun}
                    <span className="text-xs text-zinc-500 font-normal">runs</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between group hover:border-zinc-700 transition-all">
                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400 font-medium">Canvas Drafts Saved</span>
                  <div className="text-2xl font-bold font-mono tracking-tight text-white flex items-baseline gap-1.5">
                    {stats.ideasSaved}
                    <span className="text-xs text-zinc-500 font-normal">items</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between group hover:border-zinc-700 transition-all">
                <div className="space-y-1.5">
                  <span className="text-xs text-zinc-400 font-medium">Active Board Progress</span>
                  <div className="text-2xl font-bold font-mono tracking-tight text-white flex items-baseline gap-1.5">
                    {tasks.filter(t => t.status === 'in_progress').length}
                    <span className="text-xs text-zinc-500 font-normal">in progress</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick-Prompt Deck (Templates Section) */}
            <div className="space-y-4">
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" /> Prebuilt Workflows & Ideation Starters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Prompt Template 1 */}
                <div 
                  onClick={() => handleQuickAction("Write a comprehensive outline for a professional technical architecture document. Include components, server interactions, state persistence, and api structures.")}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-850 cursor-pointer transition-all hover:translate-y-[-2px] border-l-4 border-l-amber-500 flex flex-col justify-between h-48"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-mono font-bold tracking-wider">CODE ARCHITECT</span>
                    <h4 className="font-bold text-white text-sm line-clamp-2">Outline Technical Architectures</h4>
                    <p className="text-xs text-zinc-400 line-clamp-3">
                      Generates standard structural layout markdown detailing server endpoints, payload types, and offline handling.
                    </p>
                  </div>
                  <div className="text-amber-500 font-bold text-xs flex items-center gap-1.5 mt-2">
                    Inject Prompt <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Prompt Template 2 */}
                <div 
                  onClick={() => handleQuickAction("Draft an elegant launch announcement email newsletter for a premium creative workspace SaaS tool. Include catchy subject lines, product core features, clear value propositions, and an engaging call to action.")}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-850 cursor-pointer transition-all hover:translate-y-[-2px] border-l-4 border-l-amber-500 flex flex-col justify-between h-48"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-mono font-bold tracking-wider">CREATIVE COPY</span>
                    <h4 className="font-bold text-white text-sm line-clamp-2">SaaS Announcement Newsletters</h4>
                    <p className="text-xs text-zinc-400 line-clamp-3">
                      Synthesizes high-performing marketing email structures with captivating subject lines and structural feature pitches.
                    </p>
                  </div>
                  <div className="text-amber-500 font-bold text-xs flex items-center gap-1.5 mt-2">
                    Inject Prompt <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Prompt Template 3 */}
                <div 
                  onClick={() => handleQuickAction("Brainstorm 5 distinct, highly memorable marketing taglines or slogans for an innovative organic coffee subscription service. Explain the conceptual reasoning behind each brand theme.")}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-850 cursor-pointer transition-all hover:translate-y-[-2px] border-l-4 border-l-amber-500 flex flex-col justify-between h-48"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-mono font-bold tracking-wider">BRAINSTORM</span>
                    <h4 className="font-bold text-white text-sm line-clamp-2">Creative Brand Slogans</h4>
                    <p className="text-xs text-zinc-400 line-clamp-3">
                      Generates punchy, themed copy pitches and explains the underlying psychology and visual themes for each.
                    </p>
                  </div>
                  <div className="text-amber-500 font-bold text-xs flex items-center gap-1.5 mt-2">
                    Inject Prompt <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Canvas Items Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {/* Drafts Summary */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" /> Recent Document Drafts
                  </h4>
                  <button onClick={() => setActiveTab('writer')} className="text-xs text-zinc-400 hover:text-amber-500 transition-colors">
                    Manage Docs
                  </button>
                </div>
                
                {docDrafts.length === 0 ? (
                  <p className="text-zinc-500 text-xs py-4 text-center">No active drafts on file.</p>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {docDrafts.slice(0, 3).map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => { setActiveDraft(doc); setActiveTab('writer'); }}
                        className="p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 transition-all rounded-xl cursor-pointer flex justify-between items-center"
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-white text-xs truncate max-w-[200px]">{doc.title}</p>
                          <p className="text-[10px] text-zinc-500">Updated: {doc.updatedAt}</p>
                        </div>
                        <span className="text-[10px] bg-zinc-900 text-amber-500 px-2.5 py-1 rounded-full border border-zinc-800 font-mono">
                          {doc.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Quick Check */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-amber-500" /> Urgent Action List
                  </h4>
                  <button onClick={() => setActiveTab('planner')} className="text-xs text-zinc-400 hover:text-amber-500 transition-colors">
                    Open Board
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <p className="text-zinc-500 text-xs py-4 text-center">No planned items active.</p>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {tasks.slice(0, 3).map(t => (
                      <div 
                        key={t.id}
                        onClick={() => setActiveTab('planner')}
                        className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between hover:border-zinc-750 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            t.priority === 'high' 
                              ? 'bg-red-500' 
                              : t.priority === 'medium' 
                                ? 'bg-amber-400' 
                                : 'bg-emerald-400'
                          }`} />
                          <p className="font-bold text-white text-xs truncate max-w-[220px]">{t.title}</p>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          t.status === 'done' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : t.status === 'in_progress' 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: CO-PILOT PLAYGROUND (CHAT)
            ========================================== */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in flex-1">
            
            {/* Sidebar Settings Panel */}
            <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between gap-6 self-start">
              <div className="space-y-5">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Settings className="w-4.5 h-4.5 text-amber-500" /> Agent Profiles
                  </h3>
                  <p className="text-xs text-zinc-400">Choose specialized instruction sets.</p>
                </div>

                {/* Profiles Cards Selection */}
                <div className="space-y-2.5">
                  {AI_PROFILES.map(prof => (
                    <div 
                      key={prof.id}
                      onClick={() => {
                        setSelectedProfile(prof);
                        setChatMessages([
                          {
                            id: `init-${prof.id}`,
                            role: 'assistant',
                            content: `Profile switched to ${prof.name}. ${prof.description}`,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        ]);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                        selectedProfile.id === prof.id 
                          ? 'bg-amber-500/5 border-amber-500/40 shadow-sm shadow-amber-500/5' 
                          : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{prof.avatar}</span>
                        <div>
                          <p className="font-bold text-xs text-white">{prof.name}</p>
                          <p className="text-[10px] text-zinc-400 line-clamp-1">{prof.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advanced Parameter Controls */}
                <div className="border-t border-zinc-800 pt-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Model Target</label>
                    <select 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash (Fast)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Reasoning)*</option>
                    </select>
                    {selectedModel.includes('pro') && (
                      <p className="text-[9px] text-amber-500/80 italic leading-snug">
                        *Requires premium API key config. Make sure your account has permissions activated.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>Creativity Temperature</span>
                      <span className="font-mono text-amber-500">{temperature}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="1.0" 
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1 bg-zinc-950 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                      <span>PRECISE (0.1)</span>
                      <span>CREATIVE (1.0)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Reset Button */}
              <button 
                onClick={handleClearChat}
                className="w-full py-2.5 bg-zinc-950 border border-zinc-800 text-xs hover:bg-zinc-850 hover:text-white transition-colors text-zinc-300 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Context
              </button>
            </div>

            {/* Chat Workspace Main Feed */}
            <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[520px] overflow-hidden">
              {/* Active Profile Info Header */}
              <div className="bg-zinc-950/80 px-5 py-3 border-b border-zinc-850 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-base">
                    {selectedProfile.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                      {selectedProfile.name} 
                      <span className="text-[9px] font-mono text-zinc-500 font-normal">Active System Profile</span>
                    </h4>
                    <p className="text-[10px] text-zinc-400 max-w-md line-clamp-1">{selectedProfile.description}</p>
                  </div>
                </div>
              </div>

              {/* Message Feed Canvas */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-[85%] ${
                      msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-zinc-800 text-zinc-300' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-1">
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-amber-500 text-black font-semibold' 
                          : 'bg-zinc-950 border border-zinc-850 text-zinc-100'
                      }`}>
                        {/* Rendering styled message text block */}
                        <div className="whitespace-pre-wrap break-words prose prose-invert max-w-none">
                          {msg.content}
                        </div>
                      </div>
                      <div className={`text-[9px] text-zinc-500 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Skeletons/Loading State indicator */}
                {chatLoading && (
                  <div className="flex items-start gap-3 max-w-[80%] mr-auto">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 flex-shrink-0 animate-pulse">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-1.5 w-64">
                      <div className="h-2.5 bg-zinc-850 rounded-full w-full animate-pulse" />
                      <div className="h-2.5 bg-zinc-850 rounded-full w-5/6 animate-pulse" />
                      <div className="h-2.5 bg-zinc-850 rounded-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                )}

                {/* Error Banner inside chat */}
                {chatError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 max-w-md mx-auto">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{chatError}</p>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom Input Area Form */}
              <form onSubmit={handleSendChatMessage} className="bg-zinc-950/50 border-t border-zinc-850 p-3.5 flex items-center gap-2.5">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Consult ${selectedProfile.name}...`}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  disabled={chatLoading}
                />
                <button 
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="h-10 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: DOCUMENT CANVAS (WRITER)
            ========================================== */}
        {activeTab === 'writer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in flex-1">
            {/* Left Sidebar - Subject Prompt and Doc list */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              
              {/* Creator Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <BookOpen className="w-4.5 h-4.5 text-amber-500" /> Synthesize Document
                  </h3>
                  <p className="text-xs text-zinc-400">Generate themed copy and structured reports.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Topic / Subject</label>
                    <input 
                      type="text" 
                      value={docSubject}
                      onChange={(e) => setDocSubject(e.target.value)}
                      placeholder="e.g. Project Plan for Q3 Sprint Launch"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Writing Tone</label>
                    <select 
                      value={docTone}
                      onChange={(e) => setDocTone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Professional">Professional / Objective</option>
                      <option value="Casual">Casual / Direct</option>
                      <option value="Technical">Detailed Technical Plan</option>
                      <option value="Creative">Creative / Inspired Pitch</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleGenerateDocument}
                    disabled={writerLoading || !docSubject.trim()}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {writerLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Synthesize Draft
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Draft Archives Panel List */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex-1 flex flex-col justify-between gap-4 max-h-[350px]">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="font-bold text-xs text-white">Saved Canvas Drafts</span>
                  <button 
                    onClick={handleCreateNewDraft}
                    className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 border border-amber-500/20 px-2 py-1 rounded-md bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> New Blank
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {docDrafts.map((doc) => (
                    <div 
                      key={doc.id}
                      onClick={() => setActiveDraft(doc)}
                      className={`p-3 rounded-xl border cursor-pointer flex justify-between items-start transition-all ${
                        activeDraft?.id === doc.id 
                          ? 'bg-amber-500/5 border-amber-500/30' 
                          : 'bg-zinc-950 border-zinc-850 hover:border-zinc-750'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-white truncate max-w-[150px]">{doc.title || 'Untitled Draft'}</p>
                        <p className="text-[9px] text-zinc-500">Tag: {doc.tag} • {doc.updatedAt}</p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteDraft(doc.id, e)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-900"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {docDrafts.length === 0 && (
                    <p className="text-zinc-500 text-xs py-12 text-center">No active drafts saved.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Beautiful Document Editor Area */}
            <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 min-h-[420px]">
              {activeDraft ? (
                <>
                  {/* Draft Title controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <input 
                        type="text" 
                        value={activeDraft.title}
                        onChange={(e) => handleSaveActiveTitleAndTag(e.target.value, activeDraft.tag)}
                        placeholder="Untitled Document Draft"
                        className="text-base font-bold bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-amber-500 focus:outline-none text-white w-full py-0.5"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Document Tag:</span>
                        <input 
                          type="text" 
                          value={activeDraft.tag}
                          onChange={(e) => handleSaveActiveTitleAndTag(activeDraft.title, e.target.value)}
                          placeholder="e.g. Pitch"
                          className="text-[10px] bg-zinc-950 border border-zinc-800 text-amber-500 rounded px-2 py-0.5 font-mono text-center focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* AI Quick Assistant Tools on Selected Draft */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleAISubRefinement('expand')}
                        disabled={writerLoading}
                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all"
                        title="Let Gemini expand the draft text"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" /> Expand
                      </button>
                      <button 
                        onClick={() => handleAISubRefinement('formal')}
                        disabled={writerLoading}
                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all"
                        title="Rephrase into an executive formal tone"
                      >
                        <Bot className="w-3 h-3 text-amber-500" /> Executive Tone
                      </button>
                      <button 
                        onClick={() => handleAISubRefinement('summarize')}
                        disabled={writerLoading}
                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all"
                        title="Summarize document text at the top"
                      >
                        <FileText className="w-3 h-3 text-amber-500" /> Summarize
                      </button>
                    </div>
                  </div>

                  {/* Writer Error Alert banner */}
                  {writerError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{writerError}</span>
                    </div>
                  )}

                  {/* Editor Canvas Body */}
                  <div className="flex-1 flex flex-col relative">
                    {writerLoading && (
                      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center gap-3 shadow-2xl">
                          <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                          <span className="text-xs text-zinc-300 font-bold">Refining content via Gemini...</span>
                        </div>
                      </div>
                    )}
                    <textarea 
                      value={activeDraft.content}
                      onChange={(e) => handleSaveActiveDraft(e.target.value)}
                      placeholder="Start writing or let Gemini synthesize a structural outline from the sidebar creator panel..."
                      className="w-full flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 resize-none leading-relaxed h-[300px]"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                    <FileText className="w-6 h-6 text-zinc-600" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-300">No active document open</h4>
                  <p className="text-zinc-500 text-xs max-w-sm mt-1 mb-4">
                    Select an archived document draft from the left side shelf or create a blank slate to get started.
                  </p>
                  <button 
                    onClick={handleCreateNewDraft}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-xl transition-all"
                  >
                    Create New Blank Draft
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: PLANNER DESK (KANBAN)
            ========================================== */}
        {activeTab === 'planner' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* AI Roadmap Generator */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Cpu className="w-4.5 h-4.5 text-amber-500" /> AI Task Map Generator
                </h3>
                <p className="text-xs text-zinc-400">Describe your project goal, and Gemini will synthesize a complete, actionable task board outline.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text"
                  value={plannerTheme}
                  onChange={(e) => setPlannerTheme(e.target.value)}
                  placeholder="e.g., Build and launch a full-stack recipe manager application in React and Node"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  disabled={plannerLoading}
                />
                <button 
                  onClick={handleGenerateAITaskMap}
                  disabled={plannerLoading || !plannerTheme.trim()}
                  className="h-10 px-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  {plannerLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Structuring Map...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Synthesize Task Map
                    </>
                  )}
                </button>
              </div>

              {plannerError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{plannerError}</p>
                </div>
              )}
            </div>

            {/* Board Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COLUMN 1: TO-DO */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    <h4 className="font-bold text-xs text-white">READY TO START</h4>
                  </div>
                  <span className="text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    {tasks.filter(t => t.status === 'todo').length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[350px] overflow-y-auto max-h-[480px]">
                  {tasks.filter(t => t.status === 'todo').map((task) => (
                    <div 
                      key={task.id}
                      className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3 hover:border-zinc-700 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            task.priority === 'high' 
                              ? 'bg-red-500/10 text-red-400' 
                              : task.priority === 'medium' 
                                ? 'bg-amber-400/10 text-amber-400' 
                                : 'bg-emerald-400/10 text-emerald-400'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">Effort: {task.effort}</span>
                        </div>
                        <h5 className="font-bold text-xs text-white leading-snug">{task.title}</h5>
                        {task.description && <p className="text-[10px] text-zinc-400 leading-normal">{task.description}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 mt-1">
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded"
                          title="Delete card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                          className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-0.5"
                        >
                          Active Progress <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {tasks.filter(t => t.status === 'todo').length === 0 && (
                    <p className="text-zinc-500 text-[11px] py-16 text-center italic">No tasks in backlog.</p>
                  )}
                </div>
              </div>

              {/* COLUMN 2: ACTIVE PROGRESS */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <h4 className="font-bold text-xs text-white">ACTIVE PROGRESS</h4>
                  </div>
                  <span className="text-[10px] bg-zinc-950 border border-zinc-800 text-amber-500 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[350px] overflow-y-auto max-h-[480px]">
                  {tasks.filter(t => t.status === 'in_progress').map((task) => (
                    <div 
                      key={task.id}
                      className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3 hover:border-zinc-700 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            task.priority === 'high' 
                              ? 'bg-red-500/10 text-red-400' 
                              : task.priority === 'medium' 
                                ? 'bg-amber-400/10 text-amber-400' 
                                : 'bg-emerald-400/10 text-emerald-400'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">Effort: {task.effort}</span>
                        </div>
                        <h5 className="font-bold text-xs text-white leading-snug">{task.title}</h5>
                        {task.description && <p className="text-[10px] text-zinc-400 leading-normal">{task.description}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 mt-1">
                        <button 
                          onClick={() => handleUpdateTaskStatus(task.id, 'todo')}
                          className="text-[10px] text-zinc-400 hover:text-white"
                        >
                          Demote
                        </button>
                        <button 
                          onClick={() => handleUpdateTaskStatus(task.id, 'done')}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 border border-emerald-500/20 px-2.5 py-1 rounded bg-emerald-500/5"
                        >
                          Complete <Check className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {tasks.filter(t => t.status === 'in_progress').length === 0 && (
                    <p className="text-zinc-500 text-[11px] py-16 text-center italic">No active works in progress.</p>
                  )}
                </div>
              </div>

              {/* COLUMN 3: COMPLETED */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="font-bold text-xs text-white">COMPLETED</h4>
                  </div>
                  <span className="text-[10px] bg-zinc-950 border border-zinc-800 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    {tasks.filter(t => t.status === 'done').length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[350px] overflow-y-auto max-h-[480px]">
                  {tasks.filter(t => t.status === 'done').map((task) => (
                    <div 
                      key={task.id}
                      className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-xl space-y-3 opacity-70 hover:opacity-100 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                            Done
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">Effort: {task.effort}</span>
                        </div>
                        <h5 className="font-bold text-xs text-zinc-300 leading-snug line-through">{task.title}</h5>
                        {task.description && <p className="text-[10px] text-zinc-500 leading-normal">{task.description}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900/50 mt-1">
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded"
                          title="Delete card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                          className="text-[10px] text-zinc-400 hover:text-white"
                        >
                          Re-open Task
                        </button>
                      </div>
                    </div>
                  ))}

                  {tasks.filter(t => t.status === 'done').length === 0 && (
                    <p className="text-zinc-500 text-[11px] py-16 text-center italic">No completed tasks yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Manual Task Creator Form Row */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5 mb-4 pb-2 border-b border-zinc-800">
                <Plus className="w-4 h-4 text-amber-500" /> Add Custom Task Card Manually
              </h4>
              <form onSubmit={handleAddTaskManual} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1 md:col-span-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Task Title</label>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Test checkout page"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1 md:col-span-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Task Details (Optional)</label>
                  <input 
                    type="text" 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="e.g. Run tests on mobile Chrome"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1 grid grid-cols-2 gap-2 md:col-span-1">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Priority</label>
                    <select 
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Effort</label>
                    <input 
                      type="text" 
                      value={newTaskEffort}
                      onChange={(e) => setNewTaskEffort(e.target.value)}
                      placeholder="e.g. 2h"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="w-full h-10 bg-zinc-800 border border-zinc-750 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-4 h-4 text-amber-500" /> Insert Card
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* Outer humble status footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950 py-4 px-6 flex items-center justify-between text-[10px] text-zinc-500">
        <p>© 2026 Code Camp. Professional Multi-Workspace Platform.</p>
        <p className="font-mono">HOST_PROD // SECURE SERVER TUNNEL</p>
      </footer>
    </div>
  );
}
