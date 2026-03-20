import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import Loader from '../components/Loader';
import { Send, ArrowLeft, Trash2, ShieldBan } from 'lucide-react';
import './Chat.css';

const ChatRoom = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chat metadata and verify authorization
  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));
        if (chatDoc.exists()) {
          const data = chatDoc.data();
          // Security Check: Make sure current user is in this chat
          if (!data.users.includes(currentUser.uid)) {
            alert("You do not have permission to view this chat.");
            navigate('/chats');
            return;
          }
          setChatInfo(data);
        } else {
          alert("Chat does not exist.");
          navigate('/chats');
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };
    
    fetchChatDetails();
  }, [chatId, currentUser, navigate]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgsData = [];
      snapshot.forEach((doc) => {
        msgsData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleDeleteChat = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this chat? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'chats', chatId));
      navigate('/chats');
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Failed to delete chat. Check permissions.");
    }
  };

  const handleBlockUser = async () => {
    const otherUserId = chatInfo.users.find(id => id !== currentUser.uid);
    if (!otherUserId) return;
    
    if (!window.confirm("Are you sure you want to block this user? They will be banned from ever claiming your items again.")) return;
    
    try {
      await userService.blockUser(otherUserId);
      alert("User successfully blocked.");
      navigate('/chats');
    } catch (err) {
      console.error("Error blocking user:", err);
      alert(err.response?.data?.message || "Failed to block user.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        message: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container page-wrapper">
      <div className="chat-room-container">
        <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => navigate('/chats')} className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', marginRight: '0.5rem' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.1rem' }}>
                {chatInfo?.itemTitle ? `Chat: ${chatInfo.itemTitle}` : 'Loading...'}
              </h2>
              <small style={{ color: 'var(--text-muted)' }}>Secure 1-on-1 session</small>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleBlockUser} className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }} title="Block User">
              <ShieldBan size={18} />
            </button>
            <button onClick={handleDeleteChat} className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Delete Chat">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto', color: 'var(--text-muted)' }}>
              No messages yet. Send a message to coordinate pickup!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser.uid;
              return (
                <div key={msg.id} className={`message-bubble ${isMine ? 'message-mine' : 'message-other'}`}>
                  <div>{msg.message}</div>
                  <span className="message-time">
                    {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              className="chat-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              autoFocus
            />
            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()} style={{ borderRadius: '99px', padding: '0 1.25rem' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
