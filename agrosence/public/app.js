import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUpPage from "./SignUpPage";
import LoginPage from "../pages/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<LoginPage />} />
        {/* Add other routes as necessary */}
      </Routes>
    </Router>
  );
};

export default App;
