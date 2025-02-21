import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import MessageContainer from "../../components/messages/MessageContainer";

const Home = () => {
  return (
    <div className="flex h-[450px] md:h-[550px] rounded-lg overflow-hidden bg-gray-400/20 backdrop-blur-2xl border-2 border-white/30 shadow-xl">
      <Sidebar />
      <MessageContainer />
    </div>
  );
};

export default Home;
