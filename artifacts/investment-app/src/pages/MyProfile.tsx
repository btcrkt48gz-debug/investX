import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserData } from '@/lib/firestoreDb';

export default function MyProfile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<{
    phone?: string;
    dob?: string;
    investxtag?: string;
  }>({});
  const [loading, setLoading] = useState(true);

  const displayName = user?.displayName ?? user?.email ?? 'User';
  const nameParts   = displayName.split(' ');
  const firstName   = nameParts[0] ?? '';
  const lastName    = nameParts.slice(1).join(' ') || '';
  const initials    = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getUserData(btoa(user.email!.trim()).replace(/=/g, ''))
      .then(data => {
        if (data) {
          setProfileData({
            phone:      data.phone     ?? '',
            dob:        data.dob       ?? '',
            investxtag: data.investxtag ?? '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const details = [
    { label: 'First Name',    value: firstName || '—' },
    { label: 'Last Name',     value: lastName  || '—' },
    { label: 'Email',         value: user?.email ?? '—' },
    { label: 'Phone Number',  value: profileData.phone || '—' },
    { label: 'Date of Birth', value: profileData.dob   || '—' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1a4fd6] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col pb-12">
      <div className="px-4 pt-5 pb-2 flex items-center">
        <button onClick={() => setLocation('/profile')} className="p-1.5 -ml-1.5 hover:bg-black/10 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
      </div>

      <div className="flex items-start justify-between px-5 pt-4 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{displayName}</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <div className="w-14 h-14 rounded-full bg-[#1a4fd6] flex items-center justify-center shrink-0 shadow-md">
          <span className="text-white font-bold text-lg tracking-wide">{initials || '?'}</span>
        </div>
      </div>

      <div className="px-5 mb-2">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-2">Personal Details</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {details.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-4">
              <span className="text-sm text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 mb-2">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-2">InvestX Tag</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-sm text-gray-400">InvestX Tag</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{profileData.investxtag || '—'}</span>
              <button
                onClick={() => setLocation('/profile/my-profile/edit-tag')}
                className="w-7 h-7 rounded-full bg-[#1a4fd6]/10 flex items-center justify-center hover:bg-[#1a4fd6]/20 transition-colors"
              >
                <Pencil size={13} className="text-[#1a4fd6]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
