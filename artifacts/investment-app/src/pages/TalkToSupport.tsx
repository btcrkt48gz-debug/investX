import { useLocation } from 'wouter';
import { ArrowLeft, MessageCircle, Mail, ExternalLink } from 'lucide-react';

export default function TalkToSupport() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <button onClick={() => setLocation('/profile')} className="p-1.5 -ml-1.5 hover:bg-black/10 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Talk to Support</h1>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1a2744]/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-[#1a2744]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">We're here to help</h2>
          <p className="text-sm text-gray-500">Our support team is available 24/7 to assist you.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          <a
            href="mailto:support@investx.app"
            className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Mail size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Email Support</p>
              <p className="text-xs text-gray-400">support@investx.app</p>
            </div>
            <ExternalLink size={14} className="text-gray-400" />
          </a>

          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <MessageCircle size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Live Chat</p>
              <p className="text-xs text-gray-400">Chat with us on WhatsApp</p>
            </div>
            <ExternalLink size={14} className="text-gray-400" />
          </a>
        </div>

        <div className="bg-[#1a2744]/5 rounded-2xl p-4">
          <p className="text-xs text-gray-600 leading-relaxed text-center">
            Average response time: <strong>under 2 hours</strong>. For urgent issues, use Live Chat.
          </p>
        </div>
      </div>
    </div>
  );
}
