import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Users, MessageCircle, AtSign, X } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { format } from 'date-fns';

// Mock users list - in production, this would come from your user management system
const USERS = [
  { id: 'all', name: 'All', email: 'all', role: 'All Team Members' },
  { id: '1', name: 'Admin User', email: 'admin', role: 'Admin' },
  { id: '2', name: 'Staff Member', email: 'staff', role: 'Staff' },
];

export const CommunityChat = () => {
  const { messages, loading, sendMessage, currentUser, needsSetup } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      setShowMentions(false);
    }
  };

  // Handle input change with @ detection
  const handleInputChange = (e) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setNewMessage(value);
    setCursorPosition(cursor);

    // Check if user just typed @
    const lastChar = value[cursor - 1];
    const beforeLastChar = value[cursor - 2];
    
    if (lastChar === '@' && (cursor === 1 || beforeLastChar === ' ')) {
      setShowMentions(true);
      setMentionSearch('');
    } else if (showMentions) {
      // Check if we should hide mentions
      const textBeforeCursor = value.substring(0, cursor);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex === -1) {
        setShowMentions(false);
      } else {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (textAfterAt.includes(' ')) {
          setShowMentions(false);
        } else {
          setMentionSearch(textAfterAt.toLowerCase());
        }
      }
    }
  };

  // Insert mention into message
  const insertMention = (user) => {
    const textBeforeCursor = newMessage.substring(0, cursorPosition);
    const textAfterCursor = newMessage.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      textBeforeCursor.substring(0, lastAtIndex) + 
      `@${user.email} ` + 
      textAfterCursor;
    
    setNewMessage(newText);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  // Filter users based on search
  const filteredUsers = USERS.filter(user => 
    user.name.toLowerCase().includes(mentionSearch) ||
    user.email.toLowerCase().includes(mentionSearch)
  );

  // Extract mentions from message
  const extractMentions = (text) => {
    const mentions = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  // Check if current user is mentioned
  const isUserMentioned = (msg) => {
    const mentions = extractMentions(msg.text);
    const userEmail = currentUser?.email?.split('@')[0];
    return mentions.includes('all') || mentions.includes(userEmail);
  };

  // Highlight mentions in message text
  const renderMessageText = (text) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="bg-blue-100 text-blue-700 px-1 rounded font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'MMM d, h:mm a');
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="w-16 h-16 mb-4 text-blue-300" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Chat Setup Required</h3>
        <p className="text-gray-600 mb-4 max-w-md">
          Real-time chat needs Pusher configuration. Chat will work locally without real-time sync until configured.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-700 max-w-md mb-4">
          <p className="font-medium mb-2">Quick Setup:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Sign up at <a href="https://pusher.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">pusher.com</a> (free, no card)</li>
            <li>Create app → Copy your <strong>App Key</strong></li>
            <li>Replace in <code className="bg-gray-200 px-1 rounded">src/hooks/useChat.js</code></li>
          </ol>
        </div>
        <p className="text-xs text-gray-500">
          Messages still work locally but won't sync to other devices until configured.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Community Chat</h2>
              <p className="text-sm text-blue-100">
                Use @name to tag someone or @all for everyone
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Users className="w-4 h-4" />
            <span>{USERS.length - 1} members</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation! Use @all to notify everyone</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.userId === currentUser?.uid;
            const isMentioned = isUserMentioned(msg);
            
            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : isMentioned
                        ? 'bg-yellow-50 border-2 border-yellow-200 rounded-bl-md'
                        : 'bg-white shadow-sm border rounded-bl-md'
                  }`}
                >
                  {isMentioned && !isCurrentUser && (
                    <div className="flex items-center gap-1 mb-1 text-yellow-600 text-xs font-medium">
                      <AtSign className="w-3 h-3" />
                      Mentioned you
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {msg.userName}
                    </span>
                    {msg.userRole === 'Admin' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isCurrentUser ? 'bg-blue-500 text-blue-100' : 'bg-blue-100 text-blue-700'
                      }`}>
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">
                    {renderMessageText(msg.text)}
                  </p>
                  <p className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t rounded-b-lg relative">
        {/* Mentions Dropdown */}
        {showMentions && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border max-h-48 overflow-y-auto z-10">
            <div className="p-2 border-b bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Mention someone</span>
              <button 
                onClick={() => setShowMentions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => insertMention(user)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  user.id === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {user.id === 'all' ? <AtSign className="w-4 h-4" /> : user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <span className="text-xs text-gray-400">@{user.email}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message... Use @ to mention someone"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => {
                setShowMentions(!showMentions);
                setMentionSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Mention someone"
            >
              <AtSign className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press @ to mention • @all notifies everyone • Enter to send
        </p>
      </div>
    </div>
  );
};

export default CommunityChat;
