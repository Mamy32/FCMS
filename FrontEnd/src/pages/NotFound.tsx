import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-muted">
    <div className="text-center">
      <h1 className="mb-2 text-5xl font-bold">404</h1>
      <p className="mb-6 text-lg text-muted-foreground">This page doesn't exist.</p>
      <Button asChild className="h-10 px-5">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  </div>
);

export default NotFound;
