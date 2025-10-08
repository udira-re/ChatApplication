/* eslint-disable import/order */
import { Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import type { User } from "../store/use_chat_store"

import { useAuthStore } from "../store/store"
import { useChatStore } from "../store/use_chat_store"

// Skeleton placeholder component
const SidebarSkeleton = () => (
  <div className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col animate-pulse">
    <div className="border-b border-base-300 w-full p-5">
      <div className="h-6 w-24 bg-base-300 rounded"></div>
    </div>
    <div className="flex-1 flex flex-col gap-3 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 bg-base-300 rounded"></div>
      ))}
    </div>
  </div>
)

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
  const { onlineUsers } = useAuthStore()
  const navigate = useNavigate()

  const [showOnlineOnly, setShowOnlineOnly] = useState(false)

  useEffect(() => {
    getUsers()
  }, [getUsers])

  const filteredUsers: User[] = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user.id))
    : users

  if (isUsersLoading) return <SidebarSkeleton />

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2 justify-between">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
          <span
            className="text-xs text-zinc-500  underline hover:text-blue-400 cursor-pointer"
            onClick={() => navigate("/friends")}
          >
            View All
          </span>
        </div>

        {/* Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?.id === user.id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.avatar || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user.id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user.id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar

// /* eslint-disable import/order */
// import { Users } from "lucide-react"
// import { useState } from "react"

// import type { User } from "../store/use_chat_store"

// // import { useAuthStore } from "../store/store"
// import { useChatStore } from "../store/use_chat_store"

// // Skeleton placeholder component
// const SidebarSkeleton = () => (
//   <div className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col animate-pulse">
//     <div className="border-b border-base-300 w-full p-5">
//       <div className="h-6 w-24 bg-base-300 rounded"></div>
//     </div>
//     <div className="flex-1 flex flex-col gap-3 p-3">
//       {Array.from({ length: 6 }).map((_, i) => (
//         <div key={i} className="h-12 bg-base-300 rounded"></div>
//       ))}
//     </div>
//   </div>
// )

// const Sidebar = () => {
//   const { selectedUser, setSelectedUser, isUsersLoading } = useChatStore()
//   // const { onlineUsers } = useAuthStore()

//   const [showOnlineOnly, setShowOnlineOnly] = useState(false)

//   // --- MOCK DATA START ---
//   const mockUsers: User[] = [
//     { id: "1", name: "Alice", profilePic: "/avatar1.png" },
//     { id: "2", name: "Bob", profilePic: "/avatar2.png" },
//     { id: "3", name: "Charlie", profilePic: "/avatar3.png" },
//     { id: "4", name: "Diana", profilePic: "/avatar4.png" },
//   ]

//   const mockOnlineUsers: string[] = ["1", "3"] // only Alice and Charlie are online
//   // --- MOCK DATA END ---

//   const filteredUsers: User[] = showOnlineOnly
//     ? mockUsers.filter((user) => mockOnlineUsers.includes(user.id))
//     : mockUsers

//   if (isUsersLoading) return <SidebarSkeleton />

//   return (
//     <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
//       <div className="border-b border-base-300 w-full p-5">
//         <div className="flex items-center gap-2">
//           <Users className="size-6" />
//           <span className="font-medium hidden lg:block">Contacts</span>
//         </div>

//         {/* Online filter toggle */}
//         <div className="mt-3 hidden lg:flex items-center gap-2">
//           <label className="cursor-pointer flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={showOnlineOnly}
//               onChange={(e) => setShowOnlineOnly(e.target.checked)}
//               className="checkbox checkbox-sm"
//             />
//             <span className="text-sm">Show online only</span>
//           </label>
//           <span className="text-xs text-zinc-500">({mockOnlineUsers.length} online)</span>
//         </div>
//       </div>

//       <div className="overflow-y-auto w-full py-3">
//         {filteredUsers.map((user) => (
//           <button
//             key={user.id}
//             onClick={() => setSelectedUser(user)}
//             className={`
//               w-full p-3 flex items-center gap-3
//               hover:bg-base-300 transition-colors
//               ${selectedUser?.id === user.id ? "bg-base-300 ring-1 ring-base-300" : ""}
//             `}
//           >
//             <div className="relative mx-auto lg:mx-0">
//               <img
//                 src={user.profilePic || "/avatar.png"}
//                 alt={user.name}
//                 className="size-12 object-cover rounded-full"
//               />
//               {mockOnlineUsers.includes(user.id) && (
//                 <span
//                   className="absolute bottom-0 right-0 size-3 bg-green-500
//                   rounded-full ring-2 ring-zinc-900"
//                 />
//               )}
//             </div>

//             {/* User info - only visible on larger screens */}
//             <div className="hidden lg:block text-left min-w-0">
//               <div className="font-medium truncate">{user.name}</div>
//               <div className="text-sm text-zinc-400">
//                 {mockOnlineUsers.includes(user.id) ? "Online" : "Offline"}
//               </div>
//             </div>
//           </button>
//         ))}

//         {filteredUsers.length === 0 && (
//           <div className="text-center text-zinc-500 py-4">No online users</div>
//         )}
//       </div>
//     </aside>
//   )
// }

// export default Sidebar
