// import React from 'react'
import './App.css'
import { LampDemo } from './components/ui/lamp';
import { SparklesPreview} from './components/ui/sparklesPreview'

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LampDemo />} />
        <Route path='/LampDemo' element={<LampDemo/>}/>
        <Route path='/SparklesPreview' element={<SparklesPreview/>}/>
      </Routes>
    </Router>
  )
}

export default App
