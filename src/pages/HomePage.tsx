import { useEffect } from "react"

import ChatContainer from "../component/ChatContainer"
import NoChatSeleted from "../component/NoChatSeleted"
import Sidebar from "../component/Sidebar"
import { useChatStore } from "../store/use_chat_store"

const HomePage: React.FC = () => {
  const { selectedUser, isUsersLoading, getFriends } = useChatStore()

  useEffect(() => {
    getFriends() // fetch all friends on page load
  }, [getFriends])

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex items-center justify-center">
              {isUsersLoading ? (
                <span className="text-lg font-medium">Loading...</span>
              ) : !selectedUser ? (
                <NoChatSeleted />
              ) : (
                <ChatContainer />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
