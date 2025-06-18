import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Home } from './pages/Home/Home';
import { Board } from './pages/Board/Board';
import { store } from './common/store/store';
import { ToastContainer } from 'react-toastify';
import './App.scss';

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="/board/:board_id" element={<Board />} />
        <Route path="/board/:board_id/card/:card_id" element={<Board />} />
      </Routes>
      <ToastContainer />
    </ Provider>
  );
}

export default App;
