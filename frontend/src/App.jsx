import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CustomerSelector from './components/CustomerSelector';
import CallTimeline from './components/CallTimeline';
import BriefCard from './components/BriefCard';
import LoadingState from './components/LoadingState';
import AddCallModal from './components/AddCallModal';
import { PlusCircle, RefreshCw, AlertCircle, Sparkles, BrainCircuit } from 'lucide-react';

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCallNumber, setSelectedCallNumber] = useState(1);
  const [briefData, setBriefData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch customer list on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      console.log('[FRONTEND] Fetching customers list from backend...');
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        console.log('[FRONTEND] Customers loaded:', data);
        setCustomers(data);
        setIsBackendConnected(true);
        if (data.length > 0 && !selectedCustomer) {
          const rahul = data.find((c) => c.customer_name === 'Rahul Sharma') || data[0];
          setSelectedCustomer(rahul);
          setSelectedCallNumber(1);
        }
      } else {
        throw new Error(`Failed to fetch customers (HTTP ${response.status})`);
      }
    } catch (err) {
      console.warn('[FRONTEND] Backend unavailable, using fallback mock data:', err);
      setIsBackendConnected(false);
      const fallbackList = [
        { customer_name: 'Rahul Sharma', company_name: 'Zenith Textiles', total_calls: 5, latest_sentiment: 'positive' },
        { customer_name: 'Priya Nair', company_name: 'Coastal Foods Ltd', total_calls: 3, latest_sentiment: 'positive' },
        { customer_name: 'Arjun Mehta', company_name: 'BrightPath Logistics', total_calls: 2, latest_sentiment: 'neutral' },
        { customer_name: 'Sneha Kulkarni', company_name: 'Everline Retail', total_calls: 2, latest_sentiment: 'hesitant' }
      ];
      setCustomers(fallbackList);
      if (!selectedCustomer) {
        setSelectedCustomer(fallbackList[0]);
        setSelectedCallNumber(1);
      }
    }
  };

  const customerName = selectedCustomer?.customer_name;

  // Fetch executive brief whenever customerName or selectedCallNumber changes
  useEffect(() => {
    let isCancelled = false;

    if (!customerName) return;

    const loadBrief = async () => {
      setLoading(true);
      setError(null);

      const targetUrl = `/api/brief/${encodeURIComponent(customerName)}/${selectedCallNumber}`;
      console.log(`[FRONTEND] Fetching brief for '${customerName}' call #${selectedCallNumber} from ${targetUrl}...`);

      // 25-second frontend timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`[FRONTEND TIMEOUT] 25s timeout triggered for '${customerName}' call #${selectedCallNumber}`);
        controller.abort();
      }, 25000);

      try {
        const response = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          const message = errorJson.detail || errorJson.error || `HTTP ${response.status}: Failed to generate brief — check backend logs`;
          console.error(`[FRONTEND ERROR] Server returned HTTP ${response.status}:`, message);
          throw new Error(message);
        }

        const data = await response.json();
        if (isCancelled) return;

        console.log(`[FRONTEND SUCCESS] Received brief data for '${customerName}' call #${selectedCallNumber}:`, data);

        setBriefData(data);
        setIsBackendConnected(true);

        // Dynamically sync total calls without triggering object reference re-render loop
        if (data.total_calls_available) {
          setSelectedCustomer(prev => {
            if (!prev || prev.total_calls === data.total_calls_available) return prev;
            return { ...prev, total_calls: data.total_calls_available };
          });
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (isCancelled) return;

        if (err.name === 'AbortError') {
          console.error(`[FRONTEND ERROR] Request timed out after 25s for '${customerName}' call #${selectedCallNumber}`);
          setError('Failed to generate brief — request timed out after 25s. Check backend logs.');
        } else {
          console.error(`[FRONTEND ERROR] Failed to fetch brief:`, err);
          setError(err.message || 'Failed to generate brief — check backend logs');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadBrief();

    return () => {
      isCancelled = true;
    };
  }, [customerName, selectedCallNumber]);

  const fetchBrief = async (cName = customerName, cNum = selectedCallNumber) => {
    if (!cName) return;
    setLoading(true);
    setError(null);

    const targetUrl = `/api/brief/${encodeURIComponent(cName)}/${cNum}`;
    console.log(`[FRONTEND] Fetching brief for '${cName}' call #${cNum} from ${targetUrl}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[FRONTEND TIMEOUT] 25s timeout triggered for '${cName}' call #${cNum}`);
      controller.abort();
    }, 25000);

    try {
      const response = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const message = errorJson.detail || errorJson.error || `HTTP ${response.status}: Failed to generate brief — check backend logs`;
        console.error(`[FRONTEND ERROR] Server returned HTTP ${response.status}:`, message);
        throw new Error(message);
      }

      const data = await response.json();
      console.log(`[FRONTEND SUCCESS] Received brief data for '${cName}' call #${cNum}:`, data);

      setBriefData(data);
      setIsBackendConnected(true);

      if (data.total_calls_available) {
        setSelectedCustomer(prev => {
          if (!prev || prev.total_calls === data.total_calls_available) return prev;
          return { ...prev, total_calls: data.total_calls_available };
        });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error(`[FRONTEND ERROR] Request timed out after 25s for '${cName}' call #${cNum}`);
        setError('Failed to generate brief — request timed out after 25s. Check backend logs.');
      } else {
        console.error(`[FRONTEND ERROR] Failed to fetch brief:`, err);
        setError(err.message || 'Failed to generate brief — check backend logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    console.log(`[FRONTEND] Selected customer:`, customer.customer_name);
    setSelectedCustomer(customer);
    setSelectedCallNumber(1); // Reset to call 1 on customer change
  };

  const handleSelectCall = (callNum) => {
    console.log(`[FRONTEND] Selected call number #${callNum}`);
    setSelectedCallNumber(callNum);
  };

  const handleCallSaved = async (customerName, newCallNum) => {
    console.log(`[FRONTEND] Call #${newCallNum} saved for ${customerName}. Refreshing timeline...`);
    await fetchCustomers();
    setSelectedCallNumber(newCallNum);
    fetchBrief(customerName, newCallNum);
  };

  const totalCallsAvailable = briefData?.total_calls_available || selectedCustomer?.total_calls || 5;
  const nextCallNumber = totalCallsAvailable + 1;

  return (
    <div className="min-h-screen bg-[#14110d] text-slate-100 relative flex flex-col font-sans">
      {/* Background Decorative Ambient Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <Header isBackendConnected={isBackendConnected} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10">
        
        {/* Hero & App Intro */}
        <div className="text-center max-w-2xl mx-auto pt-2 pb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            AI Sales Memory & Pre-Call Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Smart Call History Briefings
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Select an account to view historical sales calls, track buyer sentiment shifts across calls, and generate AI pre-call briefs powered by Groq.
          </p>
        </div>

        {/* Customer Selector Component */}
        <CustomerSelector
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={handleSelectCustomer}
        />

        {/* Action Controls & New Call Button */}
        {selectedCustomer && (
          <div className="flex items-center justify-between max-w-4xl mx-auto border-t border-[#2e2820]/60 pt-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{selectedCustomer.customer_name}</span>
                <span className="text-xs font-normal text-slate-400">({selectedCustomer.company_name})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Timeline records & instant pre-call briefing
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchBrief(selectedCustomer.customer_name, selectedCallNumber)}
                className="px-3.5 py-2 rounded-xl bg-[#1a1612] hover:bg-[#241f1a] text-slate-300 border border-[#2e2820] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Refresh Brief"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Log Call #{nextCallNumber}</span>
              </button>
            </div>
          </div>
        )}

        {/* Call Timeline Stepper */}
        {briefData?.history && briefData.history.length > 0 && (
          <CallTimeline
            calls={briefData.history}
            selectedCallNumber={selectedCallNumber}
            onSelectCall={handleSelectCall}
          />
        )}

        {/* Loading State or Brief Card */}
        {loading ? (
          <LoadingState message="Recalling memory..." />
        ) : error ? (
          <div className="max-w-xl mx-auto my-8 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="font-bold">Unable to generate brief</p>
            <p className="text-xs text-rose-400/80">{error}</p>
            <button
              onClick={() => fetchBrief(selectedCustomer.customer_name, selectedCallNumber)}
              className="mt-2 px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-rose-200 border border-rose-500/40"
            >
              Retry Request
            </button>
          </div>
        ) : (
          <BriefCard
            briefData={briefData}
            selectedCallNumber={selectedCallNumber}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2e2820]/60 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold text-slate-400">DealSense AI</span> — AI-powered Deal Intelligence Agent
        </div>
        <p>Built with FastAPI, Python, Groq LLM, React & Tailwind CSS</p>
      </footer>

      {/* Log Call Modal */}
      <AddCallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCustomer={selectedCustomer}
        nextCallNumber={nextCallNumber}
        onCallSaved={handleCallSaved}
      />
    </div>
  );
}
