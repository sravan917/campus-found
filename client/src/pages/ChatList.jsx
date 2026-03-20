import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { MessageSquare } from 'lucide-react';
import './Chat.css';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const chatsRef = collection(db, 'chats');
    // Fetch any chats where this user is either the claimant or the owner
    const q = query(chatsRef, where('users', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = [];
      snapshot.forEach((doc) => {
        chatData.push({ id: doc.id, ...doc.data() });
      });
      // Sort in JS (or could use orderBy if we had an index, but this is simpler for 2-user chats)
      chatData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setChats(chatData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) return <Loader />;

  return (
    <div className="container page-wrapper">
      <div className="chat-list-container">
        <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare size={28} color="var(--primary)" />
          My Messages
        </h1>

        {chats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            You don't have any active chats right now.
            <br />
            <small>Chats are automatically created when a claim is approved.</small>
          </div>
        ) : (
          <div>
            {chats.map(chat => (
              <div key={chat.id} className="chat-card" onClick={() => navigate(`/chats/${chat.id}`)}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>Item: {chat.itemTitle || 'Unknown Item'}</h3>
                  <small style={{ color: 'var(--text-muted)' }}>
                    Chat ID: {chat.id.substring(0, 8)}...
                  </small>
                </div>
                <button className="btn btn-outline" style={{ pointerEvents: 'none' }}>
                  Open Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
