import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

// REPLACE THIS WITH YOUR ACTUAL CLIENT ID FROM GOOGLE CLOUD CONSOLE
const GOOGLE_CLIENT_ID = "179957926735-g40uv2ocp7q1j13sjophavrq9ouaspuv.apps.googleusercontent.com";

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);