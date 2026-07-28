import { useLocation } from 'wouter';
import {
  User,
  Lock,
  Monitor,
  HeadphonesIcon,
  ChevronRight,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  {
    icon: User,
    label: 'My Profile',
    description: 'View and edit your personal details',
    href: '/profile/my-profile',
  },
  {
    icon: Lock,
    label: 'Change Password',
    description: 'Update your login password',
    href: '/profile/change-password',
  },
  {
    icon: Monitor,
    label: 'Device and Session',
    description: 'Manage your active sessions',
    href: '/profile/device-session',
  },
  {
    icon: HeadphonesIcon,
    label: 'Talk to Support',
    description: 'Get help from our team',
    href: '/profile/support',
  },
];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, signOut } = useAuth();

  const displayName = user?.displayName ?? user?.email ?? 'User';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleLogout() {
    await signOut();
    setLocation('/');
  }

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      {/* Header */}
      <nav
        className="bg-white/10 backdrop-blur-xl border-b border-white/20 h-14 flex items-center px-4 sticky top-0 z-50"
        style={{ boxShadow: '0 2px 24px 0 rgba(10,20,60,0.10)' }}
      >
        <button
          onClick={() => setLocation('/app')}
          className="p-1.5 hover:bg-black/10 rounded-full transition-colors mr-3"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Settings</h1>
      </nav>

      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div className="w-20 h-20 rounded-full bg-[#1a2744] flex items-center justify-center shadow-lg mb-3">
          {initials ? (
            <span className="text-white font-bold text-2xl tracking-wide">{initials}</span>
          ) : (
            <User size={36} className="text-white" />
          )}
        </div>
        <p className="text-base font-bold text-gray-900">{displayName}</p>
        {user?.email && <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>}
      </div>

      {/* Menu items */}
      <div className="px-4 flex-1">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {menuItems.map(({ icon: Icon, label, description, href }) => (
            <button
              key={label}
              onClick={() => href && setLocation(href)}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#1a2744]/8 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[#1a2744]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-6 mb-10 flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 font-semibold text-sm hover:text-red-600 active:text-red-700 transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
