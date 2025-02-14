// import React from 'react'
import './App.css'
// import { GlobeDemo } from './components/ui/globePreview';
import { LampDemo } from './components/ui/lamp';
import { SparklesPreview} from './components/ui/sparklesPreview'
import TypewriterPreview from './components/ui/typeWriterPreview';
import { VortexDemo } from './components/ui/vortexPreview';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';


function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LampDemo />} />
        <Route path='/LampDemo' element={<LampDemo/>}/>
        <Route path='/SparklesPreview' element={<SparklesPreview/>}/>
        <Route path='/vortexPreview' element={<VortexDemo/>}/>
        <Route path='/typeWriter' element={<TypewriterPreview/>}/>
        {/* <Route path='/globePreview' element={<GlobeDemo/>}/> */}
      </Routes>
    </Router>
  )
}

export default App
