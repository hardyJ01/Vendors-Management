import { Navbar } from "./components/Navbar"
import { Dashboard } from "./components/Dashboard"
import { MyVendors } from "./components/MyVendors"
import { BrowseVendors } from "./components/BrowseVendors"
import { VendorDetail } from "./components/VendorDetail"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendors" element={<MyVendors />} />
            <Route path="/vendors/browse" element={<BrowseVendors />} />
            <Route path="/vendors/:id" element={<VendorDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
