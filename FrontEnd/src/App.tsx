import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Members from "./pages/Members";
import Plans from "./pages/Plans";
import Subscriptions from "./pages/Subscriptions";
import Trainers from "./pages/Trainers";
import Classes from "./pages/Classes";
import Attendance from "./pages/Attendance";
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/members" element={<Members />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payments" element={<Payments />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
