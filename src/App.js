import "./App.css";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import SinglePost from "./pages/SinglePost";


function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
            <Route path="/singlepost" component={SinglePost} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/upload" component={Upload} />
            <Route path="/" component={Login} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
