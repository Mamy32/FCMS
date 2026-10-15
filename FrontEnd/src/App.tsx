import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiError } from "@/api";
import { AuthProvider } from "@/context/AuthContext";
import { GuestOnly, RequireAdmin, RequireAuth } from "@/components/RequireAuth";
import AppLayout from "./components/AppLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Index from "./pages/Index";
import CheckIn from "./pages/CheckIn";
import Members from "./pages/Members";
import Plans from "./pages/Plans";
import Subscriptions from "./pages/Subscriptions";
import Trainers from "./pages/Trainers";
import Classes from "./pages/Classes";
import Attendance from "./pages/Attendance";
import Payments from "./pages/Payments";
import Staff from "./pages/Staff";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // Retry network blips, but not 4xx errors like "not allowed".
      retry: (count, error) => count < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route element={<GuestOnly />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/check-in" element={<CheckIn />} />
                <Route path="/members" element={<Members />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/account" element={<Account />} />
                <Route element={<RequireAdmin />}>
                  <Route path="/staff" element={<Staff />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
