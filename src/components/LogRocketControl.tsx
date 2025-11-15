import React, { useState, useEffect } from 'react';
import LogRocket from 'logrocket';
import type { GameState, GameStateActions } from '../hooks/useGameState';
import { sessionRecorder } from '../utils/sessionRecorder';

const TESTER_NAMES_KEY = 'logrocket_tester_names';
const SESSION_NAMES_KEY = 'logrocket_session_names';
const LAST_TESTER_KEY = 'logrocket_last_tester';
const HAND_DATA_PREFIX = 'logrocket_hand_';

interface LogRocketControlProps {
  state: GameState;
  actions: GameStateActions;
}

export const LogRocketControl: React.FC<LogRocketControlProps> = ({ state, actions }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string>('');
  const [testerName, setTesterName] = useState('');
  const [bugName, setBugName] = useState('');
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [savedTesterNames, setSavedTesterNames] = useState<string[]>([]);
  const [savedSessionNames, setSavedSessionNames] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load saved names from localStorage
    const savedTesters = localStorage.getItem(TESTER_NAMES_KEY);
    const savedSessions = localStorage.getItem(SESSION_NAMES_KEY);
    const lastTester = localStorage.getItem(LAST_TESTER_KEY);

    if (savedTesters) {
      setSavedTesterNames(JSON.parse(savedTesters));
    }
    if (savedSessions) {
      setSavedSessionNames(JSON.parse(savedSessions));
    }
    if (lastTester) {
      setTesterName(lastTester);
    }
  }, []);

  const saveName = (name: string, type: 'tester' | 'session') => {
    const key = type === 'tester' ? TESTER_NAMES_KEY : SESSION_NAMES_KEY;
    const setter = type === 'tester' ? setSavedTesterNames : setSavedSessionNames;

    const existingNames = localStorage.getItem(key);
    const names = existingNames ? JSON.parse(existingNames) : [];

    if (!names.includes(name)) {
      const updatedNames = [name, ...names].slice(0, 10); // Keep last 10
      localStorage.setItem(key, JSON.stringify(updatedNames));
      setter(updatedNames);
    }

    if (type === 'tester') {
      localStorage.setItem(LAST_TESTER_KEY, name);
    }
  };

  const handleCameraClick = () => {
    if (!isRecording) {
      // Show choice modal: New Session or Load Previous
      setShowChoiceModal(true);
    } else {
      // Stop recording and open session
      handleStopRecording();
    }
  };

  const handleNewSession = () => {
    setShowChoiceModal(false);
    setShowQuickStart(true);
  };

  const handleLoadPrevious = () => {
    setShowChoiceModal(false);
    setShowLoadModal(true);
  };

  const saveGameState = (sessionName: string) => {
    const handData = {
      timestamp: new Date().toISOString(),
      state: {
        players: state.players,
        playerData: state.playerData,
        defaultUnit: state.defaultUnit,
        stackData: state.stackData,
        communityCards: state.communityCards,
        visibleActionLevels: state.visibleActionLevels,
        currentView: state.currentView,
      }
    };

    const key = `${HAND_DATA_PREFIX}${sessionName}`;
    localStorage.setItem(key, JSON.stringify(handData));
    console.log('💾 Saved game state for session:', sessionName);
  };

  const loadGameState = (sessionName: string) => {
    const key = `${HAND_DATA_PREFIX}${sessionName}`;
    const savedData = localStorage.getItem(key);

    if (savedData) {
      try {
        const handData = JSON.parse(savedData);
        const savedState = handData.state;

        // Restore all state
        actions.setPlayers(savedState.players);
        actions.setPlayerData(savedState.playerData);
        actions.setDefaultUnit(savedState.defaultUnit);
        actions.setStackData(savedState.stackData);
        actions.setCommunityCards(savedState.communityCards);
        actions.setVisibleActionLevels(savedState.visibleActionLevels);
        actions.setCurrentView(savedState.currentView);

        console.log('✅ Loaded game state for session:', sessionName);
        return true;
      } catch (error) {
        console.error('❌ Error loading game state:', error);
        return false;
      }
    }
    return false;
  };

  const getSavedSessions = () => {
    const sessions: { name: string; timestamp: string }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(HAND_DATA_PREFIX)) {
        const sessionName = key.replace(HAND_DATA_PREFIX, '');
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            sessions.push({
              name: sessionName,
              timestamp: parsed.timestamp
            });
          } catch (e) {
            // Skip invalid data
          }
        }
      }
    }

    // Sort by timestamp descending (newest first)
    return sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleQuickStartRecording = () => {
    if (!testerName.trim()) {
      alert('Please enter tester name');
      return;
    }
    if (!bugName.trim()) {
      alert('Please enter session name');
      return;
    }

    // Show loading state
    setIsStarting(true);

    // Save names for future use
    saveName(testerName, 'tester');
    saveName(bugName, 'session');

    // Save game state for this session
    saveGameState(bugName);

    // Start session recorder for Chrome DevTools Recorder JSON
    sessionRecorder.startRecording(bugName, testerName);

    try {
      console.log('🚀 [LogRocket] Initializing with app ID: zrgal7/tpro');

      // Initialize LogRocket with app ID
      LogRocket.init('zrgal7/tpro', {
        console: {
          shouldAggregateConsoleErrors: true,
        },
        network: {
          requestSanitizer: request => {
            // Don't log request bodies for privacy
            return request;
          },
        },
      });

      console.log('✅ [LogRocket] Initialized successfully');

      // Identify the tester IMMEDIATELY after init
      console.log('👤 [LogRocket] Identifying user:', testerName);
      LogRocket.identify(testerName, {
        name: testerName,
        role: 'QA Tester',
        sessionName: bugName,
        email: `${testerName.toLowerCase().replace(/\s+/g, '.')}@tester.local`,
      });

      console.log('✅ [LogRocket] User identified');

      // Track session start
      console.log('📊 [LogRocket] Tracking session start event');
      LogRocket.track('QA Session Started', {
        bugName,
        testerName,
        timestamp: new Date().toISOString(),
        gameState: {
          players: state.players.filter(p => p.name).map(p => ({ name: p.name, position: p.position, stack: p.stack })),
          blinds: { sb: state.stackData.smallBlind, bb: state.stackData.bigBlind, ante: state.stackData.ante },
          currentView: state.currentView
        } as any
      });

      console.log('✅ [LogRocket] Event tracked');

      // Get session URL
      console.log('🔗 [LogRocket] Getting session URL...');
      LogRocket.getSessionURL((url) => {
        console.log('✅ [LogRocket] Session URL received:', url);
        setSessionUrl(url);
        setIsRecording(true);
        setIsStarting(false);
        setShowQuickStart(false);

        // Show success message
        console.log('✅✅✅ LogRocket session started successfully!');
        console.log('Session URL:', url);
        console.log('Tester:', testerName);
        console.log('Bug:', bugName);
      });
    } catch (error) {
      console.error('❌ [LogRocket] Error during initialization:', error);
      setIsStarting(false);
      alert(`Error starting LogRocket recording: ${error}`);
    }
  };

  const handleStopRecording = () => {
    // Track the bug name as a custom event
    LogRocket.track('QA Session Ended', {
      bugName,
      testerName,
      sessionUrl,
    });

    // Stop session recorder and download JSON
    const recording = sessionRecorder.stopRecording();
    if (recording) {
      downloadRecordingJSON(recording);
    }

    // Copy only the session URL to clipboard
    navigator.clipboard.writeText(sessionUrl);

    // Show modal instead of auto-opening
    setIsRecording(false);
    setShowStopModal(true);
  };

  /**
   * Download recording as JSON file with file picker dialog
   * Format: {bugName}_{testerName}_{timestamp}.json
   */
  const downloadRecordingJSON = async (recording: any) => {
    try {
      // Create filename: BugName_TesterName_Timestamp.json
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${bugName}_${testerName}_${timestamp}.json`;

      // Convert to Chrome DevTools Recorder format
      const chromeRecorderFormat = {
        title: recording.title,
        timeout: recording.timeout,
        steps: recording.steps,
        // Add Chrome Recorder metadata
        version: 1,
        metadata: recording.metadata
      };

      const jsonString = JSON.stringify(chromeRecorderFormat, null, 2);

      // Check if File System Access API is supported (Chrome, Edge)
      if ('showSaveFilePicker' in window) {
        try {
          // Show native "Save As" dialog
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'Chrome DevTools Recorder JSON',
              accept: { 'application/json': ['.json'] }
            }]
          });

          // Write the file
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();

          console.log('📥 [Recorder] Downloaded JSON:', filename);
          console.log('   Total steps recorded:', recording.steps.length);
          console.log('   🌐 Upload this file to Google Drive manually');
        } catch (err: any) {
          // User cancelled the dialog
          if (err.name === 'AbortError') {
            console.log('⚠️ [Recorder] User cancelled file save');
            return;
          }
          throw err;
        }
      } else {
        // Fallback for browsers without File System Access API (Firefox, Safari)
        console.log('⚠️ [Recorder] File System Access API not supported, using fallback download');
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('📥 [Recorder] Downloaded JSON:', filename);
        console.log('   Total steps recorded:', recording.steps.length);
        console.log('   🌐 Upload this file to Google Drive manually');
      }
    } catch (error) {
      console.error('❌ [Recorder] Error downloading JSON:', error);
      alert('Error downloading session recording. Check console for details.');
    }
  };

  const handleViewRecording = () => {
    window.open(sessionUrl, '_blank');
    setShowStopModal(false);
    setBugName('');
  };

  const handleStayOnPage = () => {
    setShowStopModal(false);
    setBugName('');
  };

  return (
    <>
      {/* Camera Button - Click to start/stop */}
      <button
        onClick={handleCameraClick}
        className={`fixed bottom-4 right-4 z-50 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
            : 'bg-gray-500 hover:bg-gray-600'
        }`}
        title={isRecording ? "Stop Recording" : "Start Recording"}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Choice Modal */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 border-2 border-purple-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Start Recording</h3>
              <button
                onClick={() => setShowChoiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleNewSession}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Session
              </button>

              <button
                onClick={handleLoadPrevious}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Load Previous Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Start Modal */}
      {showQuickStart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 border-2 border-purple-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Start Recording</h3>
              <button
                onClick={() => setShowQuickStart(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tester Name Input with Autocomplete */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tester Name
              </label>
              <input
                type="text"
                value={testerName}
                onChange={(e) => setTesterName(e.target.value)}
                list="tester-names"
                placeholder="Enter your name"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                autoFocus
              />
              <datalist id="tester-names">
                {savedTesterNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
            </div>

            {/* Session/Bug Name Input with Autocomplete */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session/Bug Name
              </label>
              <input
                type="text"
                value={bugName}
                onChange={(e) => setBugName(e.target.value)}
                list="session-names"
                placeholder="e.g., Pot calculation error on flop"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <datalist id="session-names">
                {savedSessionNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
            </div>

            {/* Start Button */}
            <button
              onClick={handleQuickStartRecording}
              disabled={isStarting}
              className={`w-full ${
                isStarting
                  ? 'bg-green-500 cursor-wait'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
            >
              {isStarting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Starting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Recording
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Load Previous Session Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[600px] border-2 border-blue-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Load Previous Session</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Box */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by session name..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {getSavedSessions()
                .filter(session => session.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((session, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setBugName(session.name);
                      loadGameState(session.name);
                      setShowLoadModal(false);
                      setShowQuickStart(true);
                    }}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{session.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(session.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              {getSavedSessions().filter(session => session.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No saved sessions found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stop Recording Modal */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 border-2 border-green-200">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Recording Stopped
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Bug:</span> {bugName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Tester:</span> {testerName}
              </p>
              <p className="text-xs text-green-600 mt-3">
                ✓ Session URL copied to clipboard
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleViewRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Recording
              </button>
              <button
                onClick={handleStayOnPage}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Stay on Page
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
