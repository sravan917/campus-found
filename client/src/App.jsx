import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostItem from './pages/PostItem';
import ItemDetails from './pages/ItemDetails';
import MyPosts from './pages/MyPosts';
import ClaimPage from './pages/ClaimPage';
import Auth from './pages/Auth';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/post" element={
            <ProtectedRoute>
              <PostItem />
            </ProtectedRoute>
          } />
          
          <Route path="/item/:id" element={<ItemDetails />} />
          
          <Route path="/my-posts" element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          } />

          <Route path="/chats" element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          } />

          <Route path="/chats/:chatId" element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          } />
          
          <Route path="/claim/:itemId" element={
            <ProtectedRoute>
              <ClaimPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
