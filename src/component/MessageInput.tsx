import { Image, Send, X, Smile } from "lucide-react"
import React, { useRef, useState, lazy, Suspense, type ChangeEvent, type FormEvent } from "react"
import toast from "react-hot-toast"

import { useChatStore } from "../store/use_chat_store"
import { handleApiError } from "../utillis/handle-api-error"

// Lazy load emoji picker
const EmojiPicker = lazy(() => import("emoji-picker-react"))

const MessageInput: React.FC = () => {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Inside your componenth
  const chatStore = useChatStore() // ✅ call the hook

  const selectedUser = chatStore.selectedUser
  const sendMessage = chatStore.sendMessage

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
  //
  //

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSending || (!text.trim() && !fileInputRef.current?.files?.[0])) return

    if (!selectedUser) {
      toast.error("No user selected to send message")
      return
    }

    // Get receiverId from either _id or id
    const receiverId = "_id" in selectedUser ? selectedUser._id : selectedUser.id
    if (!receiverId) {
      toast.error("Selected user does not have a valid ID")
      return
    }

    setIsSending(true)
    try {
      await sendMessage({
        text: text.trim() || undefined,
        file: fileInputRef.current?.files?.[0],
        receiverId, // safe receiver ID
      })

      setText("")
      removeImage()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSending(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className="p-4 w-full relative">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
        <div className="flex-1 flex items-center gap-2 relative">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md pr-10"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Emoji button */}
          <button
            type="button"
            className="absolute pr-5 right-10 sm:right-12 text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile size={20} />
          </button>

          {/* Image button */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle transition-colors ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <Suspense fallback={<div>Loading...</div>}>
              <div className="absolute bottom-12 right-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            </Suspense>
          )}
        </div>

        <button
          type="submit"
          className={`btn btn-sm btn-circle transition-colors ${
            text.trim() || imagePreview ? "btn-primary" : "btn-disabled"
          }`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
