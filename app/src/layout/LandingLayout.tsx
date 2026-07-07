import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "../design-system";
import "./LandingLayout.css";

export function LandingLayout() {
  return (
    <div className="landing">
      <header className="landing__header">
        <Link to="/" className="landing__logo">
          Hypora
        </Link>
        <nav className="landing__nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/features">Features</NavLink>
          <NavLink to="/roadmap">Roadmap</NavLink>
        </nav>
        <Link to="/app">
          <Button>Open Workspace</Button>
        </Link>
      </header>

      <main className="landing__main">
        <Outlet />
      </main>

      <footer className="landing__footer">
        <p>Hypora — structure your idea before you build it.</p>
      </footer>
    </div>
  );
}
