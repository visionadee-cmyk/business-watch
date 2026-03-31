import React, { useState } from 'react';
import { MessageSquare, AtSign, Paperclip, Send, MoreHorizontal, Heart, CornerDownRight } from 'lucide-react';

const mockComments = [
  {
    id: 1,
    user: 'Ahmed',
    avatar: 'A',
    content: 'The IT tender specifications have been updated. Please review the new requirements.',
    timestamp: '2026-03-20 14:30',
    tender: 'IT Equipment Supply',
    likes: 2,
    replies: [
      { id: 11, user: 'Fathimath', content: 'Reviewed. I\'ll prepare the technical response.', timestamp: '2026-03-20 15:15' }
    ]
  },
  {
    id: 2,
    user: 'Fathimath',
    avatar: 'F',
    content: '@Ahmed Have we received the updated pricing from the supplier?',
    timestamp: '2026-03-19 10:20',
    tender: 'Office Renovation',
    likes: 1,
    replies: []
  },
  {
    id: 3,
    user: 'Ahmed',
    avatar: 'A',
    content: 'Bid submitted successfully for the medical supplies tender. Awaiting opening date.',
    timestamp: '2026-03-18 16:45',
    tender: 'Medical Supplies',
    likes: 3,
    replies: [
      { id: 31, user: 'Fathimath', content: 'Great work! Fingers crossed.', timestamp: '2026-03-18 17:00' },
      { id: 32, user: 'Ahmed', content: 'Thanks! We should hear back by next week.', timestamp: '2026-03-18 17:05' }
    ]
  }
];

const mockActivity = [
  { id: 1, user: 'Ahmed', action: 'submitted bid', target: 'IT Equipment Supply', time: '2 hours ago' },
  { id: 2, user: 'Fathimath', action: 'updated tender status', target: 'Office Renovation', time: '4 hours ago' },
  { id: 3, user: 'System', action: 'reminder: deadline approaching', target: 'Medical Supplies', time: '1 day ago' },
  { id: 4, user: 'Ahmed', action: 'added new supplier', target: 'Tech Solutions Ltd', time: '2 days ago' },
];

export default function TeamCollaboration() {
  const [activeTab, setActiveTab] = useState('comments');
  const [newComment, setNewComment] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
        <p className="text-gray-500 mt-1">Comments, mentions, and activity feed</p>
      </div>

      <div className="flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab('comments')}
          className={`pb-2 px-4 font-medium ${activeTab === 'comments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Comments & Mentions
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`pb-2 px-4 font-medium ${activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Activity Feed
        </button>
      </div>

      {activeTab === 'comments' && (
        <div className="space-y-6">
          {/* New Comment */}
          <div className="card">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                You
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment or @mention someone..."
                  rows={3}
                  className="input w-full"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                      <AtSign className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="btn btn-primary flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.map((comment) => (
              <div key={comment.id} className="card">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-medium">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.user}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{comment.timestamp}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded">{comment.tender}</span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        {comment.likes}
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                        <CornerDownRight className="w-4 h-4" />
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-medium">
                              {reply.user[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{reply.user}</span>
                                <span className="text-xs text-gray-500">{reply.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card">
          <div className="space-y-4">
            {mockActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  activity.user === 'System' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {activity.user[0]}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium text-blue-600">{activity.target}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
