import ProjectDescription from "./ProjectDescription.jsx";
import Gantt_chart from "./Gantt_chart.jsx";
import InfoSkeleton from "./InfoSkeleton.jsx";
import { useProject } from "../../HallContext.jsx";
import "./Info.css";

export default function Info() {
  const { loading } = useProject();

  if (loading) {
    return <InfoSkeleton />;
  }

  return (
    <div className="info-container">
      <ProjectDescription />
      <Gantt_chart />
    </div>
  );
}
