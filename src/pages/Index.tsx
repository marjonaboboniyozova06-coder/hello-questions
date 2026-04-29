import { Navigate } from "react-router-dom";
import Onboarding from "./Onboarding";

const Index = () => {
  const onboarded = typeof window !== "undefined" && localStorage.getItem("linguo-onboarded") === "1";
  if (onboarded) return <Navigate to="/app" replace />;
  return <Onboarding />;
};

export default Index;
