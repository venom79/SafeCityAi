import { Routes, Route } from "react-router-dom"
import Home  from "./pages/Home"
import Layout from "./components/Layout"
import Register from "./pages/Register"


function App() {
  return (
    <Routes>
      <Route element={<Layout/>}>
        <Route path="/" element={<Home />} />
         <Route path="/register" element={<Register />} />
        {/* add more routes like this below */}
        {/* <Route path="/" element={<Home />} /> */}  
        {/* <Route path="/" element={<Home />} /> */}
        
      </Route>
    </Routes>
  )
}

export default App