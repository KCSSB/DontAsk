import Navbar from "./components/Navbar/Navbar";
import Welcome from "./components/Welcome/Welcome";
import Project_list from "./components/Project_list/Project_list";
import "../../fonts/fonts.css";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <div className="home-main-content">
        <Welcome />
        <Project_list />
      </div>
    </div>
  );
}
