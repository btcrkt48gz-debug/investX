import { useLocation } from 'wouter';
import { ArrowLeft, Monitor, Smartphone, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function getDeviceIcon(type: string) {
  if (type === 'mobile') return Smartphone;
  if (type === 'web') return Globe;
  return Monitor;
}

export default function DeviceSession() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Current session info derived from browser
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|Android/i.test(ua);
  const browser = ua.includes('Chrome')
    ? 'Chrome'
    : ua.includes('Firefox')
    ? 'Firefox'
    : ua.includes('Safari')
    ? 'Safari'
    : 'Browser';
  const os = ua.includes('iPhone') || ua.includes('iPad')
    ? 'iOS'
    : ua.includes('Android')
    ? 'Android'
    : ua.includes('Win')
    ? 'Windows'
    : ua.includes('Mac')
    ? 'macOS'
    : 'Unknown OS';

  const sessions = [
    {
      id: 'current',
      label: `${browser} on ${os}`,
      type: isMobile ? 'mobile' : 'web',
      location: 'Current device',
      lastActive: 'Active now',
      isCurrent: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 h-14 flex items-center px-4 sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => setLocation('/profile')}
          className="p-1.5 hover:bg-black/10 rounded-full transition-colors mr-3"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Device &amp; Session</h1>
      </nav>

      <div className="flex-1 px-4 pt-8 pb-12 flex flex-col gap-5">
        {/* Account info */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1a2744]/10 flex items-center justify-center shrink-0">
            <CheckCircle size={18} className="text-[#1a2744]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Signed in as</p>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email ?? '—'}</p>
          </div>
        </div>

        {/* Sessions */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
            Active Sessions
          </p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {sessions.map(session => {
              const Icon = getDeviceIcon(session.type);
              return (
                <div key={session.id} className="px-4 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1a2744]/8 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-[#1a2744]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{session.label}</p>
                      {session.isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{session.location} · {session.lastActive}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info note */}
        <div className="bg-blue-50 rounded-2xl px-4 py-4">
          <p className="text-xs text-blue-700 leading-relaxed">
            Session history and multi-device management will be available once you connect your account to the InvestX backend. Only your current session is shown for now.
          </p>
        </div>
      </div>
    </div>
  );
}
