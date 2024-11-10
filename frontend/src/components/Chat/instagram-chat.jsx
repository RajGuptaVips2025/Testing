import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaInstagram, FaRegEdit, FaRegHeart } from "react-icons/fa";
import MessagesMember from "./MessagesMember";
import { Link, useNavigate } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineExplore } from "react-icons/md";
import { BiSolidMoviePlay } from "react-icons/bi";
import { FiSend } from "react-icons/fi";
import { CiSquarePlus } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setFollowingUsers, setMessages, setSuggestedUser } from "@/features/userDetail/userDetailsSlice";
import ChatBox from "./ChatBox";
import MobileChatBox from "./MobileChatBox";

export function ChatComponent({ socketRef }) {
  const links = [
    { id: 1, icon: <GoHomeFill size={26} />, label: "Home", link: "/" },
    { id: 2, icon: <IoSearchOutline size={26} />, label: "Search", link: "#" },
    { id: 3, icon: <MdOutlineExplore size={26} />, label: "Explore", link: "/explore/" },
    { id: 4, icon: <BiSolidMoviePlay size={26} />, label: "Reels", link: "/reels/" },
    { id: 5, icon: <FiSend size={26} />, label: "Messages", link: "/direct/inbox" },
    { id: 6, icon: <FaRegHeart size={26} />, label: "Notification", link: "/" },
    { id: 7, icon: <CiSquarePlus size={26} />, label: "Create", link: "/" },
    { id: 8, icon: <RxHamburgerMenu size={26} />, label: "More", link: "/" },
  ];

  const messages = useSelector((state) => state.counter.messages);
  const userDetails = useSelector((state) => state.counter.userDetails);
  const suggestedUser = useSelector((state) => state.counter.suggestedUser);
  console.log(suggestedUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getFollowingUsers = async (username) => {
    try {
      const response = await axios.get(`/api/conversations/followingUsers/${username}`);
      const groupResponse = await axios.get(`/api/conversations/groups/${userDetails.id}`);
      const followingUsers = [...response?.data, ...groupResponse?.data];
      dispatch(setFollowingUsers(followingUsers));
      return response.data;
    } catch (error) {
      console.error("Error fetching following users:", error);
      if (error.response.statusText === "Unauthorized" || error.response?.status === 403) navigate("/login");
    }
  };

  const getRealTimeMessages = () => {
    socketRef.current.on("newMessage", (newMessage) => {
      Array.isArray(messages) ? dispatch(setMessages([...messages, newMessage])) : null;
    });
    socketRef.current.on("sendGroupMessage", (newMessage) => {
      Array.isArray(messages) ? dispatch(setMessages([...messages, newMessage])) : null;
    });
  };

  useEffect(() => {
    getRealTimeMessages();
    return () => {
      socketRef.current.off("newMessage");
    };
  }, [messages, setMessages]);

  useEffect(() => {
    if (userDetails?.username) {
      getFollowingUsers(userDetails.username);
    }
    return () => {
      dispatch(setSuggestedUser(null));
    };
  }, [userDetails, setMessages]);

  useEffect(() => {
    if (userDetails?.id) {
      getAllMessages();
    }
  }, [userDetails, suggestedUser]);

  const getAllMessages = async () => {
    try {
      const senderId = userDetails?.id;
      if (!senderId) {
        console.log("User details not available yet.");
        return;
      }

      if (suggestedUser && Object.keys(suggestedUser).length > 0) {
        const response = await axios.get(
          suggestedUser && "groupName" in suggestedUser
            ? `/api/conversations/group/messages/${suggestedUser?._id}`
            : `/api/conversations/all/messages/${suggestedUser?._id}?senderId=${senderId}`
        );

        if (response.data.success) {
          dispatch(setMessages(response.data.messages));
        }
      }
    } catch (error) {
      console.log(error.message);
      if (error?.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate("/login");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-1 dark:bg-neutral-950 dark:text-white">

        <div className="h-full w-16 md:w-20 flex-shrink-0 flex-col gap-4 items-center border-r border-zinc-800 py-4 md:py-8 hidden md:flex">
          <Link to="/" className="mb-4 md:mb-8">
            <FaInstagram size={24} aria-label="Instagram" />
          </Link>
          {links.map((link) => (
            <Link
              to={link.link}
              key={link.id}
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={link.label}
            >
              {React.cloneElement(link.icon, { size: 22 })}
            </Link>
          ))}
        </div>

        {/* Left Panel */}
        <div
          className={`${suggestedUser && Object.keys(suggestedUser).length > 0
              ? " w-0 md:w-80"
              : "w-full sm:w-64 md:w-80"
            } h-full border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-neutral-950 dark:text-white overflow-hidden transition-all duration-300`}
        >
          <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm md:text-base truncate">{userDetails.username}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="px-2 text-black dark:text-white block md:inline-flex"
              >
                <FaRegEdit size={16} aria-label="Edit" />
              </Button>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-sm">Messages</span>
              <span className="text-xs sm:text-sm md:text-sm">Requests</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <MessagesMember socketRef={socketRef} />
          </div>
        </div>

        {/* Main Chat Area */}
        <div
          className={`${suggestedUser && Object.keys(suggestedUser).length > 0 ? "flex-1" : "flex-[3]"
            } overflow-hidden overflow-y-scroll transition-all duration-300`}
        >
          <ChatBox socketRef={socketRef} />
        </div>
      </div>
    </div>
  );
}










// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { FaInstagram, FaRegEdit, FaRegHeart } from "react-icons/fa";
// import MessagesMember from "./MessagesMember";
// import { Link, useNavigate } from "react-router-dom";
// import { GoHomeFill } from "react-icons/go";
// import { IoSearchOutline } from "react-icons/io5";
// import { MdOutlineExplore } from "react-icons/md";
// import { BiSolidMoviePlay } from "react-icons/bi";
// import { FiSend } from "react-icons/fi";
// import { CiSquarePlus } from "react-icons/ci";
// import { RxHamburgerMenu } from "react-icons/rx";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import { setFollowingUsers, setMessages, setSuggestedUser } from "@/features/userDetail/userDetailsSlice";
// import ChatBox from "./ChatBox";
// import MobileChatBox from "./MobileChatBox";

// export function ChatComponent({ socketRef }) {
//   const links = [
//     { id: 1, icon: <GoHomeFill size={26} />, label: "Home", link: "/" },
//     { id: 2, icon: <IoSearchOutline size={26} />, label: "Search", link: "#" },
//     { id: 3, icon: <MdOutlineExplore size={26} />, label: "Explore", link: "/explore/" },
//     { id: 4, icon: <BiSolidMoviePlay size={26} />, label: "Reels", link: "/reels/" },
//     { id: 5, icon: <FiSend size={26} />, label: "Messages", link: "/direct/inbox" },
//     { id: 6, icon: <FaRegHeart size={26} />, label: "Notification", link: "/" },
//     { id: 7, icon: <CiSquarePlus size={26} />, label: "Create", link: "/" },
//     { id: 8, icon: <RxHamburgerMenu size={26} />, label: "More", link: "/" },
//   ];

//   const messages = useSelector((state) => state.counter.messages);
//   const userDetails = useSelector((state) => state.counter.userDetails);
//   const suggestedUser = useSelector((state) => state.counter.suggestedUser);
//   console.log(suggestedUser);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const getFollowingUsers = async (username) => {
//     try {
//       const response = await axios.get(`/api/conversations/followingUsers/${username}`);
//       const groupResponse = await axios.get(`/api/conversations/groups/${userDetails.id}`);
//       const followingUsers = [...response?.data, ...groupResponse?.data];
//       dispatch(setFollowingUsers(followingUsers));
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching following users:", error);
//       if (error.response.statusText === "Unauthorized" || error.response?.status === 403) navigate("/login");
//     }
//   };

//   const getRealTimeMessages = () => {
//     socketRef.current.on("newMessage", (newMessage) => {
//       Array.isArray(messages) ? dispatch(setMessages([...messages, newMessage])) : null;
//     });
//     socketRef.current.on("sendGroupMessage", (newMessage) => {
//       Array.isArray(messages) ? dispatch(setMessages([...messages, newMessage])) : null;
//     });
//   };

//   useEffect(() => {
//     getRealTimeMessages();
//     return () => {
//       socketRef.current.off("newMessage");
//     };
//   }, [messages, setMessages]);

//   useEffect(() => {
//     if (userDetails?.username) {
//       getFollowingUsers(userDetails.username);
//     }
//     return () => {
//       dispatch(setSuggestedUser(null));
//     };
//   }, [userDetails, setMessages]);

//   useEffect(() => {
//     if (userDetails?.id) {
//       getAllMessages();
//     }
//   }, [userDetails, suggestedUser]);

//   const getAllMessages = async () => {
//     try {
//       const senderId = userDetails?.id;
//       if (!senderId) {
//         console.log("User details not available yet.");
//         return;
//       }

//       if (suggestedUser && Object.keys(suggestedUser).length > 0) {
//         const response = await axios.get(
//           suggestedUser && "groupName" in suggestedUser
//             ? `/api/conversations/group/messages/${suggestedUser?._id}`
//             : `/api/conversations/all/messages/${suggestedUser?._id}?senderId=${senderId}`
//         );

//         if (response.data.success) {
//           dispatch(setMessages(response.data.messages));
//         }
//       }
//     } catch (error) {
//       console.log(error.message);
//       if (error?.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate("/login");
//     }
//   };

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <div className="flex flex-1 dark:bg-neutral-950 dark:text-white">

// <div className="h-full w-16 md:w-20 flex-shrink-0 flex-col gap-4 items-center border-r border-zinc-800 py-4 md:py-8 hidden md:flex">
//   <Link to="/" className="mb-4 md:mb-8">
//     <FaInstagram size={24} aria-label="Instagram" />
//   </Link>
//   {links.map((link) => (
//     <Link
//       to={link.link}
//       key={link.id}
//       className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
//       aria-label={link.label}
//     >
//       {React.cloneElement(link.icon, { size: 22 })}
//     </Link>
//   ))}
// </div>


//         <div className="w-full sm:w-64 md:w-80 h-full border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-neutral-950 dark:text-white overflow-hidden">
//           <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 dark:border-zinc-800">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <span className="font-semibold text-sm md:text-base truncate">{userDetails.username}</span>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="px-2 text-black dark:text-white block md:inline-flex"
//               >
//                 <FaRegEdit size={16} aria-label="Edit" />
//               </Button>
//             </div>
//             <div className="flex justify-between items-center py-2">
//               <span className="font-semibold text-sm">Messages</span>
//               <span className="text-xs sm:text-sm md:text-sm">Requests</span>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto">
//             <MessagesMember socketRef={socketRef} />
//           </div>
//         </div>

//         {/* Main Chat Area */}
//         <div className="flex-1 overflow-hidden overflow-y-scroll">
//           <ChatBox socketRef={socketRef} />
//         </div>

//       </div>
//     </div>
//   );
// }