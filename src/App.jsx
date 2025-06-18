import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Subscription from './pages/Price'

export default function App() {
  return (
    <div className="container">
      <Routes>
        <Route path='/chat' element={<Chat />} ></Route>
        <Route path='/' element={<Login />} ></Route>
        <Route path='/price' element={<Subscription />} ></Route>
      </Routes>
    </div>
  )
}
