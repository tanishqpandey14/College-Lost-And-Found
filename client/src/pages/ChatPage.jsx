import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { ArrowLeft, Send, Shield } from 'lucide-react';

export default function ChatPage() {
  const { claimId } = useParams();
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [claimId]);

  // Join room and listen for real-time messages
  useEffect(() => {
    if (socket && claimId) {
      socket.emit('join_room', claimId);

      const handleReceiveMessage = (newMsg) => {
        const rawClaimId = typeof newMsg.claim === 'object' ? newMsg.claim?._id : newMsg.claim;
        const incomingRoom = String(rawClaimId || '');

        if (incomingRoom === String(claimId)) {
          setMessages((prev) => {
            if (prev.some((m) => String(m._id) === String(newMsg._id))) return prev;
            return [...prev, newMsg];
          });
        }
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [socket, claimId]);

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/chat/${claimId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await API.post(`/chat/${claimId}`, { text });
      const sentMessage = res.data.message;

      // Append locally immediately
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(sentMessage._id))) return prev;
        return [...prev, sentMessage];
      });

      setText('');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to send message');
    }
  };

  const isMyMessage = (sender) => {
    if (!user || !sender) return false;
    const currentUserId = String(user.id || user._id);
    const senderId = String(sender._id || sender);
    return currentUserId === senderId;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        to="/claims"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1A1A] hover:text-[#000B76] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to claims
      </Link>

      <div className="bg-[#F4EFE6] border border-[#E8E1D5] rounded-3xl overflow-hidden shadow-sm flex flex-col h-[80vh]">
        
        {/* Chat Header */}
        <div className="p-5 bg-[#EFE9DD] border-b border-[#E2D9C8] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#000B76] text-white flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">P2P Coordination Chat</h2>
            <p className="text-xs text-[#007A55] font-semibold">● Real-time WebSocket connection active</p>
          </div>
        </div>

        {/* Message Feed Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FDFBF7]">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-[#000B76] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-[#666666] text-xs">
              No messages yet. Coordinate handover location and time here.
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = isMyMessage(msg.sender);

              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs space-y-1 shadow-sm ${
                      isMe
                        ? 'bg-[#000B76] text-white rounded-br-none'
                        : 'bg-[#F4EFE6] border border-[#E8E1D5] text-[#1A1A1A] rounded-bl-none'
                    }`}
                  >
                    <p className="font-medium leading-relaxed">{msg.text}</p>
                    <span className={`block text-[9px] text-right ${isMe ? 'text-white/70' : 'text-[#666666]'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Footer */}
        <form onSubmit={handleSend} className="p-4 bg-[#F4EFE6] border-t border-[#E8E1D5] flex items-center gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-5 py-3 rounded-full bg-[#EFE9DD] border border-[#E2D9C8] text-xs text-[#1A1A1A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#000B76]"
          />
          <button
            type="submit"
            className="w-11 h-11 rounded-full bg-[#000B76] text-white flex items-center justify-center hover:bg-[#000B76]/90 transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}