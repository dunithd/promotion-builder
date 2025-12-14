import React, { useState, useEffect, useRef } from 'react';
import { 
  // Navigation & UI
  LayoutDashboard, 
  PenTool, 
  MessageSquare, 
  X, 
  Send, 
  Terminal, // Icon for the log
  ChevronRight, // Added missing import
  ChevronLeft,  // Added missing import
  
  // Analytics & Sim
  TrendingUp, 
  Clock, // Icon for 'Last Hour'
  DollarSign, 
  Activity, 
  Coffee, 
  Plane, 
  Server, // Icon for EDB infrastructure
  Database,
  
  // Builder
  Rocket, 
  Sparkles, 
  Facebook, 
  Linkedin, 
  Mail, 
  Globe,
  Loader2,
  Cpu // Icon for AI processing
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

const API_KEY = ""; // 🔴 INSERT YOUR GEMINI API KEY HERE

// Mock AI Service
const callGemini = async (prompt, systemInstruction = "") => {
  if (!API_KEY) {
    console.warn("No API Key provided. Returning mock response.");
    return null;
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

// --- Shared UI Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors[color] || colors.indigo}`}>
      {children}
    </span>
  );
};

// --- System Log Console ---
const SystemLog = ({ logs }) => {
  const endRef = useRef(null);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden font-mono text-xs flex flex-col h-[240px] border border-slate-700 shadow-xl">
      <div className="bg-slate-950 px-4 py-2 text-slate-400 flex justify-between items-center border-b border-slate-800">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/> 
          EDB Data Pipeline
        </span>
        <span className="text-[10px] opacity-60">TAIL -F SYSTEM.LOG</span>
      </div>
      <div className="p-4 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
        {logs.length === 0 && <div className="text-slate-600 italic">System ready. Waiting for transactions...</div>}
        {logs.map((log, i) => (
          <div key={i} className="animate-in slide-in-from-left-2 fade-in duration-300 flex gap-2">
            <span className="text-slate-600 shrink-0">[{log.time}]</span>
            <div>
              <span className={`${log.color} font-bold`}>{log.source}:</span>{' '}
              <span className="text-slate-300">{log.message}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

// --- Sub-View: Campaign Builder (The Wizard) ---
const CampaignBuilder = ({ onLaunch, onLog }) => {
  const [step, setStep] = useState(1);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    audienceDesc: '',
    segments: [],
    channels: [],
    message: '',
    budget: 5000,
    cpa: 50
  });

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  
  const toggleChannel = (id) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(id) 
        ? prev.channels.filter(c => c !== id) 
        : [...prev.channels, id]
    }));
  };

  // AI Function 1: Semantic Search
  const handleAiDiscovery = async () => {
    if (!formData.audienceDesc) return;
    setIsAiLoading(true);
    
    // STORY: Log the semantic search
    onLog("EDB-AI", `Generating vector embeddings for input: "${formData.audienceDesc.substring(0, 20)}..."`, "text-violet-400");
    setTimeout(() => onLog("EDB-AI", "Executing vector similarity search on 'customer_profiles' table...", "text-violet-400"), 600);
    
    const prompt = `Based on audience: "${formData.audienceDesc}", generate 3 marketing segments (JSON array with id, name, size, desc).`;
    const res = await callGemini(prompt, "Return ONLY valid JSON array.");
    
    if (res) {
      try {
        const jsonStr = res.replace(/```json/g, '').replace(/```/g, '');
        const data = JSON.parse(jsonStr);
        setFormData(prev => ({ ...prev, segments: data }));
        onLog("EDB-AI", `Search complete. ${data.length} segments retrieved from Analytics Store.`, "text-violet-400");
      } catch (e) { console.error("Parse error", e); }
    }
    setIsAiLoading(false);
  };

  // AI Function 2: Copy Gen
  const handleGenerateCopy = async () => {
    setIsCopyLoading(true);
    onLog("EDB-AI", "Triggering In-Database LLM for Creative Generation...", "text-violet-400");
    
    const prompt = `Write a short 150 char ad copy for "${formData.name}". Goal: ${formData.goal}.`;
    const res = await callGemini(prompt, "You are an expert copywriter.");
    if (res) updateField('message', res.trim());
    setIsCopyLoading(false);
  };

  const handleLaunch = () => {
    onLaunch(formData); 
  };

  // Renderers for Steps
  const renderStep1 = () => (
    <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
      <div>
        <label className="block text-sm font-medium text-slate-700">Campaign Name</label>
        <input 
          value={formData.name} onChange={e => updateField('name', e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="e.g. Summer Promo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Goal</label>
        <input 
          value={formData.goal} onChange={e => updateField('goal', e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Increase sales..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
      <div>
        <label className="block text-sm font-medium text-slate-700">Audience Description</label>
        <div className="flex gap-2 mt-1">
          <textarea 
            value={formData.audienceDesc} onChange={e => updateField('audienceDesc', e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Describe your ideal customer..."
          />
        </div>
        <button 
          onClick={handleAiDiscovery} disabled={isAiLoading || !formData.audienceDesc}
          className="mt-2 text-sm bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-violet-700 shadow-md shadow-violet-200 transition-all"
        >
          {isAiLoading ? <Loader2 size={16} className="animate-spin"/> : <Cpu size={16}/>}
          Run Semantic Search (EDB AI)
        </button>
      </div>
      <div className="space-y-2">
        {formData.segments.map((s, i) => (
          <div key={i} className="p-3 bg-slate-50 border rounded-lg text-sm group hover:border-violet-300 transition-colors">
            <div className="font-bold text-slate-700 flex justify-between">
              {s.name} <span className="text-xs bg-slate-200 px-1.5 rounded text-slate-600">{s.size}</span>
            </div>
            <div className="text-slate-500 text-xs mt-1">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: 'fb', icon: Facebook, label: 'Facebook' },
          { id: 'li', icon: Linkedin, label: 'LinkedIn' },
          { id: 'gl', icon: Globe, label: 'Google' },
          { id: 'em', icon: Mail, label: 'Email' }
        ].map(c => (
          <div 
            key={c.id} onClick={() => toggleChannel(c.id)}
            className={`p-3 border rounded-lg cursor-pointer flex items-center gap-2 text-sm font-medium ${formData.channels.includes(c.id) ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}
          >
            <c.icon size={16}/> {c.label}
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium">Message</label>
          <button onClick={handleGenerateCopy} className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
            {isCopyLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} Write for me
          </button>
        </div>
        <textarea 
          value={formData.message} onChange={e => updateField('message', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg h-20 text-sm"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
       <div className="bg-slate-900 text-white p-4 rounded-xl">
          <div className="text-slate-400 text-xs uppercase tracking-wider">Total Budget</div>
          <div className="text-3xl font-bold">${formData.budget.toLocaleString()}</div>
          <input 
            type="range" min="1000" max="50000" step="1000" 
            value={formData.budget} onChange={e => updateField('budget', parseInt(e.target.value))}
            className="w-full mt-4 accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none"
          />
       </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">New Campaign</h2>
        <div className="text-sm font-medium text-slate-400">Step {step}/4</div>
      </div>

      <Card className="min-h-[400px] flex flex-col">
        <div className="p-6 flex-1">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between">
          <button 
            disabled={step === 1} onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 disabled:opacity-50"
          >
            Back
          </button>
          {step === 4 ? (
            <button 
              onClick={handleLaunch}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              <Rocket size={16} /> Launch
            </button>
          ) : (
            <button 
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};


// --- Sub-View: Live Ops (Real Data via API) ---
const LiveOps = ({ stats, chartData, onSimulate, logs }) => {
  
  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(val));
  };

  const generateSparkline = (data) => {
    if (!data || data.length < 2) return "";
    const max = Math.max(...data, 10); // Ensure minimal height
    const min = Math.min(...data, 0);
    const range = max - min;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      // Protect against divide by zero if range is 0
      const safeRange = range === 0 ? 1 : range;
      const y = 100 - ((val - min) / safeRange) * 100;
      return `${x},${y}`;
    }).join(" ");
    return points;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Global Operations</h2>
           <p className="text-slate-500">Real-time Replication & Analytics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-pulse border border-emerald-100">
           <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
           API Connection: ACTIVE
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign size={20}/></div>
            <Badge color="emerald">Live</Badge>
          </div>
          <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.total_revenue)}</div>
          <div className="text-xs text-slate-500">Global Revenue</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Database size={20}/></div>
             <Badge color="indigo">Total</Badge>
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.total_count.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Replicated Rows</div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock size={20}/></div>
             <Badge color="amber">1hr</Badge>
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.count_last_hour.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Last Hour Txns</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Simulator & Log */}
        <div className="space-y-6">
           <div>
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Global Transaction Injector</h3>
             
             <button 
               onClick={() => onSimulate('coffee')}
               className="w-full mb-3 bg-white border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 p-3 rounded-xl flex items-center gap-4 transition-all group active:scale-95"
             >
               <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Coffee size={20} />
               </div>
               <div className="text-left">
                 <div className="font-bold text-slate-800 text-sm">Simulate Coffee</div>
                 <div className="text-xs text-slate-500">POS: New York ($5.00)</div>
               </div>
               <div className="ml-auto font-bold text-amber-600 text-sm">Inject</div>
             </button>

             <button 
               onClick={() => onSimulate('flight')}
               className="w-full bg-white border-2 border-slate-100 hover:border-sky-400 hover:bg-sky-50 p-3 rounded-xl flex items-center gap-4 transition-all group active:scale-95"
             >
               <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Plane size={20} />
               </div>
               <div className="text-left">
                 <div className="font-bold text-slate-800 text-sm">Simulate Flight</div>
                 <div className="text-xs text-slate-500">Web: Tokyo ($450.00)</div>
               </div>
               <div className="ml-auto font-bold text-sky-600 text-sm">Inject</div>
             </button>
           </div>
           
           {/* The EDB System Log */}
           <SystemLog logs={logs} />
        </div>

        {/* Right Col: Charts */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Analytics Accelerator (Real-Time)</h3>
          <Card className="h-[400px] p-6 flex flex-col justify-end relative bg-gradient-to-b from-white to-slate-50">
             <div className="absolute inset-0 p-6">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />
                  
                  {/* The Line */}
                  {chartData.length > 0 ? (
                    <polyline 
                      points={generateSparkline(chartData)} 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="2" 
                      vectorEffect="non-scaling-stroke"
                      className="drop-shadow-lg"
                    />
                  ) : (
                    <text x="50" y="50" textAnchor="middle" fill="#94a3b8" fontSize="12">Waiting for chart data...</text>
                  )}
                </svg>
             </div>
             <div className="flex justify-between text-xs text-slate-400 mt-2 z-10 relative">
               <span>60 min ago</span>
               <span>30 min ago</span>
               <span>Now (Live)</span>
             </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

// --- Copilot Drawer ---
const Copilot = ({ isOpen, onClose, contextData }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I am connected to the EDB Postgres AI pipeline. Ask me about campaign performance or customer segments." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Create system context from the live metrics
    const contextString = JSON.stringify({
      metrics: contextData.stats,
      activeCampaigns: contextData.campaigns,
      logs: contextData.logs.slice(-3) // Give AI context on recent tech events
    });

    const systemPrompt = `You are an In-Database Inference Agent running on EDB Postgres. 
    Current System Data: ${contextString}. 
    Answer short, punchy, and data-driven. Explain things in terms of database performance if relevant.`;

    const response = await callGemini(userMsg.text, systemPrompt);
    
    setMessages(prev => [...prev, { 
      role: 'ai', 
      text: response || "I'm having trouble connecting to the neural network. Please try again." 
    }]);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
        <div className="flex items-center gap-2 font-bold">
          <Cpu size={18} /> In-DB Inference Agent
        </div>
        <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded"><X size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-bl-none shadow-sm">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about your data..."
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN APP SHELL                               */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [activeView, setActiveView] = useState('builder'); 
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]); // Log state
  
  // Real-time Data State (Updated from API)
  const [stats, setStats] = useState({
    total_count: 0,
    count_last_hour: 0,
    total_revenue: "0.00"
  });
  const [chartData, setChartData] = useState([]);

  const addLog = (source, message, color = "text-blue-400") => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
    setSystemLogs(prev => [...prev, { time, source, message, color }]);
  };

  // --- API Polling (Heartbeat) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Stats
        const statsRes = await fetch('http://localhost:8000/stats');
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson);
        }

        // Fetch Chart Data
        const chartRes = await fetch('http://localhost:8000/chart-data');
        if (chartRes.ok) {
          const chartJson = await chartRes.json();
          // Extract just the counts for the sparkline
          const counts = chartJson.map(item => item.transaction_count);
          setChartData(counts);
        }
      } catch (err) {
        console.error("API Polling Error:", err);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 2 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const handleLaunchCampaign = (campaignData) => {
    setCampaigns(prev => [...prev, { ...campaignData, id: Date.now(), status: 'Active' }]);
    addLog("EDB-AI", `Campaign '${campaignData.name}' deployed to Analytics Cluster.`, "text-violet-400");
    setActiveView('live'); 
  };

  const handleSimulation = async (type) => {
    // 1. Trigger the Real Backend API
    try {
      await fetch('http://localhost:8000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Empty body as requested
      });
    } catch (err) {
      console.error("Failed to inject transaction:", err);
      // We continue to show the logs so the demo flow doesn't break even if API fails
    }
    
    const txId = Date.now().toString().slice(-4);
    const node = type === 'coffee' ? 'New York' : 'Tokyo';
    addLog("DIST-PG", `Ingest TX #${txId} committed (Node: ${node}).`, "text-emerald-400");

    // Simulate the "Delay" of replication in logs for story purposes
    setTimeout(() => {
        addLog("ICEBERG", `TX #${txId} replicated to default Catalog.`, "text-sky-400");
    }, 600);

    setTimeout(() => {
        addLog("ANALYTICS", "Lakehouse transformation complete. View updated.", "text-indigo-400");
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
             <Rocket size={18} /> 
          </div>
          <span className="font-bold text-lg tracking-tight">MarketWiz</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveView('builder')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'builder' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800'}`}
          >
            <PenTool size={18} /> Builder
          </button>
          <button 
            onClick={() => setActiveView('live')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'live' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800'}`}
          >
            <Server size={18} /> Live Ops
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-800 rounded-lg p-3">
             <div className="text-xs font-bold text-slate-500 uppercase mb-2">Active Campaigns</div>
             {campaigns.length === 0 ? (
               <div className="text-xs text-slate-500 italic">No campaigns yet</div>
             ) : (
               campaigns.map(c => (
                 <div key={c.id} className="flex items-center gap-2 text-xs text-white mb-1 truncate">
                   <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                   {c.name}
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
           <h1 className="font-semibold text-lg text-slate-800">
             {activeView === 'builder' ? 'Campaign Wizard' : 'Operations Dashboard'}
           </h1>
           <button 
             onClick={() => setIsCopilotOpen(true)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isCopilotOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
           >
             <MessageSquare size={18} />
             <span className="font-medium">In-DB Inference Agent</span>
           </button>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeView === 'builder' ? (
            <CampaignBuilder onLaunch={handleLaunchCampaign} onLog={addLog} />
          ) : (
            <LiveOps 
              stats={stats} 
              chartData={chartData}
              onSimulate={handleSimulation}
              logs={systemLogs}
            />
          )}
        </main>

        {/* Copilot Drawer (Overlay) */}
        <Copilot 
          isOpen={isCopilotOpen} 
          onClose={() => setIsCopilotOpen(false)} 
          contextData={{ stats, campaigns, logs: systemLogs }}
        />
      </div>

    </div>
  );
}