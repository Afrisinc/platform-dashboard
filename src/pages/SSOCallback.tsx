import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AfrisincLoader } from "@/components/AfrisincLoader";

const SSOCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/dashboard/platform");
      navigate("/dashboard/platform", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <AfrisincLoader
      message="Completing sign in..."
      submessage="Setting up your session"
    />
  );
};

export default SSOCallback;
