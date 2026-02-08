// import { Routes, Route } from "react-router-dom"
// import Home  from "./pages/Home"
// import Layout from "./components/Layout"

// function App() {
//   return (
//     <Routes>
//       <Route element={<Layout/>}>
//         <Route path="/" element={<Home />} />
//         {/* add more routes like this below */}
//         {/* <Route path="/" element={<Home />} /> */}  
//         {/* <Route path="/" element={<Home />} /> */}
//       </Route>
//     </Routes>
//   )
// }

// export default App

import { Routes, Route } from "react-router-dom"

import UserDashboard from "./pages/user/UserDashboard"
import AboutUs from "./pages/user/AboutUs"

import RegisterCase from "./pages/user/RegisterCase"
import MyCases from "./pages/user/MyCases"

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
      <Route path="/about" element={<AboutUs />} />

      <Route path="/register-case" element={<RegisterCase />} />
      <Route path="/my-cases" element={<MyCases />} />
    </Routes>
  )
}

export default App
