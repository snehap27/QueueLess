import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>QueueLess</h1>

      <p>Choose your role</p>

      {/* Link is used to navigate to different routes in the application without reloading the page
      anchor tag reloads <a> */}
      <Link to="/login">
        <button>Login</button>
      </Link>

      <br />

      <Link to="/register">
        <button>Register</button>
      </Link>

      <br />

      <Link to="/customer/join">
        <button>Join Queue</button>
      </Link>
    </div>
  );
}

export default Home;