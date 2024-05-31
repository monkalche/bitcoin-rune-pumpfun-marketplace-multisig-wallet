import { AppContext, AppProvider } from "./context/UserContext";
import { useContext, useEffect, useState } from "react";
import { ConnectContext } from './context';
import { PrimeReactProvider } from 'primereact/api';
import {
  BrowserRouter as Router,
  useNavigate,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Pump from "./pages/pump";
import Sellandbuy from "./pages/sellandbuy";


function App() {
  const handleBeforeUnload = (event: any) => {
    // Check if the page is being closed (not refreshed)
    if (event.type === 'beforeunload' && !event.isTrusted) {
      // Clear the localStorage
      localStorage.clear();
    }
  };

  useEffect(() => {
    // Set up the event listener when the component mounts
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  return (
    <PrimeReactProvider>
      <ConnectContext>
        <AppProvider>
          <div className="bg-[url(./assets/Mempool.png)] bg-cover w-full overflow-hidden">
            <Routes>
              <Route
                index
                element={
                  <Pump />
                }
              />
              <Route
                path="/trade/:id/:remainAmount/:price"
                element={
                  <Sellandbuy />
                }
              />
            </Routes>
          </div>
        </AppProvider>
      </ConnectContext >
    </PrimeReactProvider>

  );
}

export default App;
