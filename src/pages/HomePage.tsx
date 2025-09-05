import ChatContainer from "../component/ChatContainer"
import NoChatSeleted from "../component/NoChatSeleted"
import Sidebar from "../component/Sidebar"
import { UseChatStore } from "../store/use_chat_store"

const HomePage = () => {
  const { selectedUser } = UseChatStore()
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSeleted /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
