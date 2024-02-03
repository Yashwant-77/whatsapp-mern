import { useEffect, useState } from "react";
import "./App.css";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import Pusher from "pusher-js";
import axios from "./axios";

function App() {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    axios.get("/messages/sync").then((response) => {
      console.log("I am fetchin data");
      setMessages(response.data);
    });
  }, []);

  useEffect(() => {
    const pusher = new Pusher("d710fe4cd9252f751f59", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe("messages");
    channel.bind("inserted", (newMessage) => {
      // alert(JSON.stringify(newMessage));
      console.log("i am going to alert");
      setMessages([...messages, newMessage]);

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    });
  }, [messages]);

  console.log(messages);
  return (
    <>
      <div className="app">
        <div className="app__body">
          <Sidebar />
          <Chat messages={messages} />
        </div>
      </div>
    </>
  );
}

export default App;
