'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import { setMessages } from '@/features/userDetail/userDetailsSlice'
import axios from 'axios';
import { AiOutlineMessage } from 'react-icons/ai';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ReloadIcon } from '@radix-ui/react-icons';
import { FaLessThan } from "react-icons/fa";
import { Camera, Heart, Info, Mic, Phone, Send, Smile, Video, X } from "lucide-react"

export default function MobileChatBox() {
    const suggestedUser = useSelector((state) => state.counter.suggestedUser);
    const userDetails = useSelector((state) => state.counter.userDetails);
    const messages = useSelector((state) => state.counter.messages);
    const [textMessage, setTextMessage] = useState('')
    const [file, setFile] = useState(null)
    const [filePreview, setFilePreview] = useState(null)
    const [isResOk, setIsResOk] = useState(true)
    const [selectedMedia, setSelectedMedia] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)


    const messagesEndRef = useRef(null)

    const handleMediaClick = (mediaUrl) => {
        setSelectedMedia(mediaUrl)
        setIsDialogOpen(true)
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setFilePreview(URL.createObjectURL(selectedFile))
        }
    }

    const clearFile = () => {
        setFile(null)
        setFilePreview(null)
    }



    const sendMessageHandle = async (e, reciverId) => {
        e.preventDefault();
        try {
            setIsResOk(false)

            const senderId = userDetails.id;
            // Check if textMessage and file are properly set
            if (!textMessage && !file) {
                return; // Avoid sending if no content
            }

            // Create form data to send media and message
            const formData = new FormData();
            formData.append('senderId', senderId); // Sender ID
            formData.append('textMessage', textMessage); // Text message
            if (file) {
                formData.append('media', file);  // Include file if exists
            }
            formData.append('messageType', file ? (file.type.includes('video') ? 'video' : 'image') : 'text');

            const response = suggestedUser && 'groupName' in suggestedUser ?
                await axios.post(`/api/conversations/group/send/message/${suggestedUser?._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }) :
                await axios.post(`/api/conversations/send/message/${reciverId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            if (response.data.success) {
                dispatch(setMessages([...messages, response.data.newMessage]));
                setTextMessage('');
                setFile(null);  // Reset file input after sending
                setFilePreview(null);
            }
        } catch (error) {
            console.log(error.message);
            if (error?.response && error?.response?.status === 401 || error.response?.status === 403) navigate('/login');
        }
        finally {
            setIsResOk(true)
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-neutral-950 dark:text-white">
            <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 flex items-center justify-center">
                        <FaLessThan size={20} />
                        <AvatarImage src={suggestedUser.profilePicture} alt={suggestedUser.username} />
                        <AvatarFallback>{suggestedUser.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <Link href={`/profile/${suggestedUser.username}`}>
                            <p className="font-semibold text-sm dark:text-white">{suggestedUser.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Active 1h ago</p>
                        </Link>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" className="text-black dark:text-white">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-black dark:text-white">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-black dark:text-white">
                        <Info className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-grow py-4 px-4 sm:px-6">
                <div className="flex flex-col items-center mb-6">
                    <Avatar className="w-20 h-20 mb-2">
                        <AvatarImage src={suggestedUser.profilePicture} alt={suggestedUser.username} />
                        <AvatarFallback>{suggestedUser.username[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{suggestedUser.username}</p>
                    <Link href={`/profile/${suggestedUser.username}`}>
                        <Button className="mt-2 text-sm">View profile</Button>
                    </Link>
                </div>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.senderId._id === userDetails.id ? "justify-end" : "justify-start"
                            } mb-4`}
                    >
                        <div className="flex items-end space-x-2">
                            {message.senderId._id !== userDetails.id && (
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={suggestedUser.profilePicture} alt={suggestedUser.username} />
                                    <AvatarFallback>{suggestedUser.username[0]}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`px-3 py-2 rounded-lg max-w-xs sm:max-w-md break-words text-sm ${message.senderId._id === userDetails.id
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                {message.message}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {filePreview && (
                    <div className="relative w-20 h-20 mb-2">
                        {file?.type?.startsWith('image/') ? (
                            <img src={filePreview} alt="Selected" className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <video src={filePreview} controls className="w-full h-full object-cover rounded-md" />
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 bg-black/50 rounded-full p-1"
                            onClick={clearFile}
                        >
                            <X className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                )}
                <form onSubmit={sendMessageHandle} className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" type="button">
                        <Smile className="h-6 w-6" />
                    </Button>
                    <Input
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        className="flex-grow"
                        placeholder="Message..."
                    />
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileInput"
                    />
                    <Button variant="ghost" size="icon" asChild>
                        <label htmlFor="fileInput">
                            <Camera className="h-6 w-6" />
                        </label>
                    </Button>
                    <Button type="submit" size="icon" disabled={!isResOk}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0 bg-transparent border-none">
                    {selectedMedia && (
                        selectedMedia.endsWith(".mp4") || selectedMedia.endsWith(".webm") ? (
                            <video src={selectedMedia} autoPlay controls className="w-full h-full rounded-lg" />
                        ) : (
                            <img src={selectedMedia} alt="Selected media" className="w-full h-full object-contain rounded-lg" />
                        )
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}







// const suggestedUser = { username: 'JohnDoe', profilePicture: '/placeholder.svg' }
// const userDetails = { id: '123' }
// const messages = [
//     { senderId: { _id: '123' }, messageType: 'text', message: 'Hello!' },
//     { senderId: { _id: '456' }, messageType: 'text', message: 'Hi there!' },
// ]


// const sendMessageHandle = async (e) => {
//     e.preventDefault()
//     // Implement your send message logic here
//     setTextMessage('')
//     setFile(null)
//     setFilePreview(null)
//     setIsResOk(true)
// }