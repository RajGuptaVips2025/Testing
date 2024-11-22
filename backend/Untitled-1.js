// import { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { setFollower, setFollowing, setSelectedPost } from '../../features/userDetail/userDetailsSlice';
// import Sidebar from '../Home/Sidebar';
// import CreatePost from './CreatePost';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { BookmarkIcon, Clapperboard, EyeIcon, GridIcon, MessageCircle, MoreHorizontal, Settings, SettingsIcon, UserIcon } from "lucide-react"
// import { FaHeart } from 'react-icons/fa';
// import { InstagramProfileSkeletonComponent } from './instagram-profile-skeleton';
// import { IoChatbubbleSharp } from 'react-icons/io5';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
// import PostComment from '../Home/PostComment';
// import StoryUpload from '../StoryUpload';

// const Profile = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { username, reelId } = useParams();
//   const [user, setUser] = useState(null);
//   const [userID, setUserID] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [postsArr, setPostsArr] = useState([]);
//   const [watched, setWatched] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [profilePicture, setProfilePicture] = useState("");
//   const [followingUserss, setFollowingUserss] = useState([]);
//   const [selectedMedia, setSelectedMedia] = useState(null); // To track selected media
//   const [isDialogOpen, setIsDialogOpen] = useState(false);  // To handle dialog state
//   const userDetails = useSelector((state) => state.counter.userDetails);
//   const following = useSelector((state) => state.counter.following);
//   const watchHistory = useSelector((state) => state.counter.watchHistory);
//   const [page, setPage] = useState(0); // Pagination page
//   const [hasMore, setHasMore] = useState(true); // If more posts are available
//   const [loading, setLoading] = useState(false); // Loading state

//   // Fetch user data with pagination
//   const fetchUserData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const { data } = await axios.get(`/api/users/${username}?page=${page}&limit=10`);
//       setProfilePicture(data?.user?.profilePicture);
//       setUserID(data?.user?._id);
//       setUser(data.user);

//       // Append new posts to the existing posts array for pagination
//       setPostsArr((prevPosts) => [...prevPosts, ...data?.posts]);

//       // Filter watched posts based on user's watch history
//       setWatched(data?.posts?.filter(post =>
//         watchHistory[0]?.some(reelHistory => reelHistory?.postId === post?._id)
//       ));

//       if (data.posts.length === 0 || data.posts.length < 10) {
//         setHasMore(false); // Stop pagination when no more posts
//       }

//       if (reelId) {
//         reelPart(); // Scroll to the specific reel when reelId is provided
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       if (error?.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [username, page, reelId, watchHistory, navigate]);

//   // Fetch the following users list
//   const getFollowing = useCallback(async () => {
//     try {
//       const { data } = await axios.get(`/api/users/${userDetails.id}/following`);
//       // console.log(data)
//       const following = data?.user?.following
//       setFollowingUserss(data?.user?.following)
//       dispatch(setFollowing([...following]));
//     } catch (error) {
//       console.error('Error fetching following users:', error);
//     }
//   }, [dispatch, userDetails.id]);


//   const handleLogout = async () => {
//     try {
//       const { status } = await axios.get('/api/auth/logout');
//       if (status === 200) {
//         console.log('Logged out successfully');
//         navigate('/login');
//       }
//     } catch (error) {
//       console.error('Error during logout:', error);
//     }
//   };

//   const showComments = (e, post) => {
//     e.preventDefault();
//     setSelectedMedia(post);
//     setIsDialogOpen(true);
//     dispatch(setSelectedPost(post));
//   };

//   const handleDeletePost = async (e, postId) => {
//     e.preventDefault()
//     const response = await axios.delete(`/api/posts/delete/${postId}`);
//     console.log(response?.data?.post)
//     setPostsArr((prevPosts) => prevPosts.filter((post) => post?._id !== response?.data?.post?._id))
//   }


//   // Handle following/unfollowing users
//   const handleFollowing = async (e, followingID) => {
//     e.preventDefault();
//     const userId = userDetails.id;
//     try {
//       const { data: { following, followers } } = await axios.put(`/api/users/${userId}/following`, { followingID });
//       dispatch(setFollowing(following));
//       dispatch(setFollower(followers));
//       setFollowingUserss(following);
//     } catch (error) {
//       console.error('Error following/unfollowing the user:', error);
//       if (error.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login');
//     }
//   };

//   // Scroll to the reel part if reelId is provided
//   const reelPart = useCallback(() => {
//     const reelElement = document.getElementById(reelId);
//     if (reelElement) {
//       reelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//   }, [reelId]);

//   // Handle pagination when scrolling
//   const handleScroll = useCallback(() => {
//     if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || !hasMore) {
//       return;
//     }
//     setPage((prevPage) => prevPage + 1); // Load more posts
//   }, [loading, hasMore]);

//   useEffect(() => {
//     fetchUserData(); // Fetch user data
//     getFollowing();  // Fetch following users

//     return () => {
//       setPostsArr([]);
//     }
//   }, [fetchUserData, getFollowing]);

//   useEffect(() => {
//     if (reelId && postsArr.length) {
//       reelPart(); // Scroll to reel after posts are loaded
//     }
//   }, [reelId, postsArr.length, reelPart]);

//   useEffect(() => {
//     window.addEventListener('scroll', handleScroll); // Attach scroll listener for pagination
//     return () => window.removeEventListener('scroll', handleScroll); // Clean up on unmount
//   }, [handleScroll]);

//   if (!user) return <p>Loading...</p>;

//   return (
//     <div className="flex flex-col min-h-screen bg-white dark:text-white dark:bg-neutral-950">
//       <PostComment selectedMedia={selectedMedia} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
//       {isLoading && <InstagramProfileSkeletonComponent />}
//       {/* Main content */}
//       <main className="profile flex-grow sm:px-8 lg:px-[72px] py-[60px] lg:ml-[14.5%] dark:bg-neutral-950 dark:text-white">
//         <div className="w-full mx-auto">
//           {/* Profile info */}
//           <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 md:gap-6 mb-6">
//             <Avatar className="w-20 h-20 sm:w-32 sm:h-32">
//               <AvatarImage src={profilePicture || "/placeholder.svg?height=128&width=128"} alt={`${user.username}`} className="object-cover object-top" />
//               <AvatarFallback>{user.username}</AvatarFallback>
//             </Avatar>
//             <div className="flex flex-col items-center sm:items-start gap-4 flex-grow">
//               <div className="flex flex-col sm:flex-row items-center gap-4">
//                 <h2 className="text-xl font-semibold">{user.username}</h2>
//                 <div className="flex gap-1">
//                   {userDetails?.id === userID ? (
//                     <>
//                       <Link to={`/accounts/edit/${user?._id}`}>
//                         <Button variant="secondary" className="mr-2 rounded-lg px-4" size="sm">Edit profile</Button>
//                       </Link>
//                       <Button variant="secondary" className="rounded-lg px-4 mr-2" size="sm">View archive</Button>
//                       <Link to={`/admindashboard`}>
//                         <Button variant="secondary" className="mr-2 rounded-lg px-4" size="sm">Admin Panel</Button>
//                       </Link>
//                       <Button onClick={handleLogout} variant="ghost" size="icon" className="md:ml-2">
//                         <SettingsIcon className="h-6 w-6" />
//                       </Button>
//                     </>
//                   ) : (
//                     <>
//                       <Button onClick={(e) => handleFollowing(e, userID)} variant="secondary" className="mr-2 rounded-lg px-4" size="sm">{followingUserss?.includes(userID) ? "Following" : "follow"}</Button>
//                       <Link to="/direct/inbox">
//                         <Button variant="secondary" className="rounded-lg px-4" size="sm">Message</Button>
//                       </Link>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="flex justify-center md:justify-start space-x-8 sm:space-x-16 mb-4">
//                 <span><strong>{postsArr.length}</strong> posts</span>
//                 {/* <span><strong>{user.followers?.length || 0}</strong> followers</span> */}
//                 {userDetails?.id === userID ?
//                   <span><strong>{user.followers?.length || 0}</strong> followers</span>
//                   :
//                   <span><strong>{following?.length || 0}</strong> followers</span>
//                 }
//                 <span><strong>{user.following?.length || 0}</strong> following</span>
//               </div>
//               <div className="text-sm text-center sm:text-left">
//                 <p className="font-medium">{user.fullName}</p>
//                 <p className='text-zinc-700 dark:text-white'>{user.bio || "No bio available"}</p>
//               </div>
//             </div>
//           </div>

//           {/* Story highlights */}
//           <div className="mb-6 overflow-x-auto">
//             <div className="flex gap-4">
//               {userDetails?.id === userID && (
//                 <>
//                   <StoryUpload />
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Post Tabs */}
//           <section className="mt-10 w-full h-auto">
//             <Tabs defaultValue="posts" className="w-full h-full">
//               <TabsList className="w-full justify-center">
//                 <TabsTrigger value="posts" className="flex-1 text-sm"><GridIcon className="w-4 h-4 mr-2" />Posts</TabsTrigger>
//                 {userDetails.id === userID ? (
//                   <TabsTrigger value="saved" className="flex-1 text-sm"><BookmarkIcon className="w-4 h-4 mr-2" />Saved</TabsTrigger>
//                 ) : (
//                   <TabsTrigger value="saved" className="flex-1 text-sm"><Clapperboard className="w-4 h-4 mr-2" />Reels</TabsTrigger>
//                 )}
//                 <TabsTrigger value="tagged" className="flex-1 text-sm"><UserIcon className="w-4 h-4 mr-2" />Tagged</TabsTrigger>
//                 {userDetails.id !== userID && (
//                   <TabsTrigger value="watched" className="flex-1 text-sm"><UserIcon className="w-4 h-4 mr-2" />Watched</TabsTrigger>
//                 )}
//               </TabsList>

//               {/* Posts Tab Content */}
//               <TabsContent value="posts" className="w-full h-full">
//                 <div className="grid grid-cols-3 sm:grid-cols-3 gap-1 mb-20 w-full h-full">
//                   {postsArr.map((post) => (
//                     <div onClick={e=>showComments(e,post)} key={post._id} className="relative w-full h-48 sm:h-64 md:h-72 group">
//                       <Card id={post?.caption} className="rounded-none border-none w-full h-full">
//                         <CardContent className="p-0 w-full h-full">
//                           {post?.media[0]?.mediaType === 'image' ? (
//                             <img src={`${post?.media[0]?.mediaPath}`} alt={post.caption} className="w-full h-full object-cover object-top" />
//                           ) : (
//                             <video src={`${post?.media[0]?.mediaPath}`} className="w-full h-full aspect-square object-cover" />
//                           )}
//                         </CardContent>
//                       </Card>

//                       {/* Dropdown menu positioned at top-right */}
//                       <div className="absolute top-2 right-2 z-20">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon">
//                               <MoreHorizontal className="w-5 h-5" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end" className="w-40 md:w-80">
//                             <DropdownMenuItem onClick={e => handleDeletePost(e, post?._id)} className="text-red-600 justify-center font-bold focus:text-red-600 cursor-pointer">Delete</DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem className="justify-center cursor-pointer">Add to favorites</DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem className="justify-center cursor-pointer">Share to...</DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem className="justify-center cursor-pointer">Copy link</DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem className="justify-center cursor-pointer">Cancel</DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </div>

//                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                         <div className="flex flex-col justify-center items-center gap-5">
//                           <p className="text-white flex gap-5">
//                             <div className="likes flex gap-2 justify-center items-center"><FaHeart className='w-6 h-6' /> {post?.likes?.length}</div>
//                             <div className="comments flex gap-2 justify-center items-center"><IoChatbubbleSharp className="w-6 h-6 -rotate-90" /> {post?.comments?.length}</div>
//                           </p>
//                           <p className='text-white'>caption : <span className='font-semibold'>{post?.caption}</span></p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </TabsContent>

//               {/* Other Tabs Content (saved, tagged, watched) */}
//               <TabsContent value="saved">
//                 <div className="text-center py-8 text-gray-500">No saved posts yet.</div>
//               </TabsContent>
//               <TabsContent value="tagged">
//                 <div className="text-center py-8 text-gray-500">No tagged posts yet.</div>
//               </TabsContent>
//               <TabsContent value="watched">
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-20 w-full h-full">
//                   {watched.map((watch) => (
//                     <Card key={watch._id} className="rounded-none border-none w-full h-48 sm:h-64 md:h-72">
//                       <CardContent className="p-0 w-full h-full">
//                         {watch?.mediaType === 'image' ? (
//                           <img src={watch?.mediaPath} alt={watch?.caption} className="w-full h-full object-cover object-top" />
//                         ) : (
//                           <video src={watch?.mediaPath} className="w-full aspect-square object-cover" />
//                         )}
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </section>
//         </div>
//       </main>
//     </div>

//   );

// };

// export default Profile;



import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setFollower, setFollowing, setSelectedPost } from '../../features/userDetail/userDetailsSlice';
import Sidebar from '../Home/Sidebar';
import CreatePost from './CreatePost';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkIcon, Clapperboard, EyeIcon, GridIcon, MessageCircle, MoreHorizontal, Settings, SettingsIcon, UserIcon } from "lucide-react"
import { FaHeart } from 'react-icons/fa';
import { InstagramProfileSkeletonComponent } from './instagram-profile-skeleton';
import { IoChatbubbleSharp } from 'react-icons/io5';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import PostComment from '../Home/PostComment';
import StoryUpload from '../StoryUpload';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username, reelId } = useParams();
  const [user, setUser] = useState(null);
  const [userID, setUserID] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsArr, setPostsArr] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [followingUserss, setFollowingUserss] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null); // To track selected media
  const [isDialogOpen, setIsDialogOpen] = useState(false);  // To handle dialog state
  const userDetails = useSelector((state) => state.counter.userDetails);
  const following = useSelector((state) => state.counter.following);
  const watchHistory = useSelector((state) => state.counter.watchHistory);
  const [page, setPage] = useState(0); // Pagination page
  const [hasMore, setHasMore] = useState(true); // If more posts are available
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch user data with pagination
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/users/${username}?page=${page}&limit=10`);
      setProfilePicture(data?.user?.profilePicture);
      setUserID(data?.user?._id);
      setUser(data.user);

      // Append new posts to the existing posts array for pagination
      setPostsArr((prevPosts) => [...prevPosts, ...data?.posts]);

      // Filter watched posts based on user's watch history
      setWatched(data?.posts?.filter(post =>
        watchHistory[0]?.some(reelHistory => reelHistory?.postId === post?._id)
      ));

      if (data.posts.length === 0 || data.posts.length < 10) {
        setHasMore(false); // Stop pagination when no more posts
      }

      if (reelId) {
        reelPart(); // Scroll to the specific reel when reelId is provided
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error?.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [username, page, reelId, watchHistory, navigate]);

  // Fetch the following users list
  const getFollowing = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/users/${userDetails.id}/following`);
      // console.log(data)
      const following = data?.user?.following
      setFollowingUserss(data?.user?.following)
      dispatch(setFollowing([...following]));
    } catch (error) {
      console.error('Error fetching following users:', error);
    }
  }, [dispatch, userDetails.id]);


  const handleLogout = async () => {
    try {
      const { status } = await axios.get('/api/auth/logout');
      if (status === 200) {
        console.log('Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const showComments = (e, post) => {
    e.preventDefault();
    setSelectedMedia(post);
    setIsDialogOpen(true);
    dispatch(setSelectedPost(post));
  };

  const handleDeletePost = async (e, postId) => {
    e.preventDefault()
    const response = await axios.delete(`/api/posts/delete/${postId}`);
    console.log(response?.data?.post)
    setPostsArr((prevPosts) => prevPosts.filter((post) => post?._id !== response?.data?.post?._id))
  }


  // Handle following/unfollowing users
  const handleFollowing = async (e, followingID) => {
    e.preventDefault();
    const userId = userDetails.id;
    try {
      const { data: { following, followers } } = await axios.put(`/api/users/${userId}/following`, { followingID });
      dispatch(setFollowing(following));
      dispatch(setFollower(followers));
      setFollowingUserss(following);
    } catch (error) {
      console.error('Error following/unfollowing the user:', error);
      if (error.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login');
    }
  };

  // Scroll to the reel part if reelId is provided
  const reelPart = useCallback(() => {
    const reelElement = document.getElementById(reelId);
    if (reelElement) {
      reelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [reelId]);

  // Handle pagination when scrolling
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || !hasMore) {
      return;
    }
    setPage((prevPage) => prevPage + 1); // Load more posts
  }, [loading, hasMore]);

  useEffect(() => {
    fetchUserData(); // Fetch user data
    getFollowing();  // Fetch following users

    return () => {
      setPostsArr([]);
    }
  }, [fetchUserData, getFollowing]);

  useEffect(() => {
    if (reelId && postsArr.length) {
      reelPart(); // Scroll to reel after posts are loaded
    }
  }, [reelId, postsArr.length, reelPart]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll); // Attach scroll listener for pagination
    return () => window.removeEventListener('scroll', handleScroll); // Clean up on unmount
  }, [handleScroll]);

  if (!user) return <p>Loading...</p>;

  return (
    // <div className='dark:bg-neutral-950 dark:text-white'>
    //   {isLoading && <InstagramProfileSkeletonComponent />}
    //   <PostComment selectedMedia={selectedMedia} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
    //   <div className="flex min-h-screen">
    //     {/* Show sidebar only on large screens */}
    //     <div className="hidden lg:block">
    //       <Sidebar />
    //     </div>

    //     <main className="profile flex-grow px-4 sm:px-8 lg:px-[72px] py-[60px] lg:ml-[14.5%] dark:bg-neutral-950 dark:text-white">
    //       <div className="inner-profile w-full h-full">
    //         <header className="flex flex-col md:flex-row items-center mb-8 gap-8 md:gap-16">
    //           <Avatar className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 mb-4 md:mb-0 md:mr-8">
    //             <AvatarImage src={profilePicture} alt={user.username} className="w-full h-full rounded-full object-top object-cover" />
    //             <AvatarFallback>{user.username}</AvatarFallback>
    //           </Avatar>
    //           <div className="text-center md:text-left">
    //             <div className="flex items-center mb-4">
    //               <h1 className="text-xl sm:text-2xl mr-4">{user.username}</h1>
    //               {userDetails?.id === userID ? (
    //                 <>
    //                   <Link to={`/accounts/edit/${user?._id}`}>
    //                     <Button variant="secondary" className="mr-2 rounded-lg px-4" size="sm">Edit profile</Button>
    //                   </Link>
    //                   <Button variant="secondary" className="rounded-lg px-4 mr-2" size="sm">View archive</Button>
    //                   <Link to={`/admindashboard`}>
    //                     <Button variant="secondary" className="mr-2 rounded-lg px-4" size="sm">Admin Panel</Button>
    //                   </Link>
    //                   <Button onClick={handleLogout} variant="ghost" size="icon" className="ml-2">
    //                     <SettingsIcon className="h-6 w-6" />
    //                   </Button>
    //                 </>
    //               ) : (
    //                 <>
    //                   <Button onClick={(e) => handleFollowing(e, userID)} variant="secondary" className="mr-2 rounded-lg px-4" size="sm">{followingUserss?.includes(userID) ? "Following" : "follow"}</Button>
    //                   <Link to="/direct/inbox">
    //                     <Button variant="secondary" className="rounded-lg px-4" size="sm">Message</Button>
    //                   </Link>
    //                 </>
    //               )}
    //             </div>
    //             <div className="flex justify-center md:justify-start space-x-8 sm:space-x-16 mb-4">
    //               <span><strong>{posts.length}</strong> posts</span>
    //               {/* <span><strong>{user.followers?.length || 0}</strong> followers</span> */}
    //               {userDetails?.id === userID ?
    //               <span><strong>{user.followers?.length || 0}</strong> followers</span>
    //               :
    //               <span><strong>{following?.length || 0}</strong> followers</span>
    //               }
    //               <span><strong>{user.following?.length || 0}</strong> following</span>
    //             </div>
    //             <p className="font-medium">{user.fullName}</p>
    //             <p className='text-zinc-700 dark:text-white'>{user.bio}</p>
    //           </div>
    //         </header>

    //         {/* Highlights Section */}
    //         <section className="my-8 overflow-x-auto">
    //           <div className="flex space-x-4 justify-start items-center">
    //             {userDetails?.id === userID &&
    //               <>
    //                 <div className='rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 p-[.5px] border border-zinc-800 flex items-center justify-center flex-shrink-0'>
    //                   <div className="add relative flex items-center justify-center">
    //                     <div className="vertical h-8 sm:h-10 md:h-12 w-[2px] bg-zinc-800 absolute"></div>
    //                     <div className="horizontal w-8 sm:w-10 md:w-12 h-[2px] bg-zinc-800 absolute"></div>
    //                   </div>
    //                 </div>
    //                 <StoryUpload />
    //               </>
    //             }
    //           </div>
    //         </section>

    //         {/* Tabs Section */}
    //         <section className="createPosts mt-10 w-full h-auto">
    //           <Tabs defaultValue="posts" className="w-full h-full">
    //             <TabsList className="w-full justify-center">
    //               <TabsTrigger value="posts" className="flex-1"><GridIcon className="w-4 h-4 mr-2" />Posts</TabsTrigger>
    //               {userDetails.id === userID ? (
    //                 <TabsTrigger value="saved" className="flex-1"><BookmarkIcon className="w-4 h-4 mr-2" />Saved</TabsTrigger>
    //               ) : (
    //                 <TabsTrigger value="saved" className="flex-1"><Clapperboard className="w-4 h-4 mr-2" />Reels</TabsTrigger>
    //               )}
    //               <TabsTrigger value="tagged" className="flex-1"><UserIcon className="w-4 h-4 mr-2" />Tagged</TabsTrigger>
    //               {userDetails.id !== userID && (
    //                 <TabsTrigger value="watched" className="flex-1"><UserIcon className="w-4 h-4 mr-2" />Watched</TabsTrigger>
    //               )}
    //             </TabsList>

    //             <TabsContent value="posts" className='w-full h-full'>
    //               <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-20 w-full h-full">
    //                 {postsArr.map((post) => (
    //                   <div key={post._id} className="relative w-full h-48 sm:h-64 md:h-72 group">
    //                     <Card id={post?.caption} className="rounded-none border-none w-full h-full">
    //                       <CardContent className="p-0 w-full h-full">
    //                         {post?.media[0]?.mediaType === 'image' ? (
    //                           <img src={`${post?.media[0]?.mediaPath}`} alt={post.caption} className="w-full h-full object-cover object-top" />
    //                         ) : (
    //                           <video src={`${post?.media[0]?.mediaPath}`} className="w-full h-full aspect-square object-cover" />
    //                         )}
    //                       </CardContent>
    //                     </Card>

    //                      {/* Dropdown menu positioned at top-right */}
    //                      <div className="absolute top-2 right-2 z-20">
    //                       <DropdownMenu>
    //                         <DropdownMenuTrigger asChild>
    //                           <Button variant="ghost" size="icon">
    //                             <MoreHorizontal className="w-5 h-5" />
    //                           </Button>
    //                         </DropdownMenuTrigger>
    //                         <DropdownMenuContent align="end" className="w-80">
    //                           <DropdownMenuItem onClick={e => handleDeletePost(e, post?._id)} className="text-red-600 justify-center font-bold focus:text-red-600 cursor-pointer">Delete</DropdownMenuItem>
    //                           <DropdownMenuSeparator />
    //                           <DropdownMenuItem className="justify-center cursor-pointer">Add to favorites</DropdownMenuItem>
    //                           <DropdownMenuSeparator />
    //                           <DropdownMenuItem className="justify-center cursor-pointer">Share to...</DropdownMenuItem>
    //                           <DropdownMenuSeparator />
    //                           <DropdownMenuItem className="justify-center cursor-pointer">Copy link</DropdownMenuItem>
    //                           <DropdownMenuSeparator />
    //                           <DropdownMenuItem className="justify-center cursor-pointer">Cancel</DropdownMenuItem>
    //                         </DropdownMenuContent>
    //                       </DropdownMenu>
    //                     </div>

    //                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
    //                       <div className="flex flex-col justify-center items-center gap-5">
    //                         <p className="text-white flex gap-5">
    //                           <div className="likes flex gap-2 justify-center items-center"><FaHeart className='w-6 h-6' /> {post?.likes?.length}</div>
    //                           <div className="comments flex gap-2 justify-center items-center"><IoChatbubbleSharp className="w-6 h-6 -rotate-90" /> {post?.comments?.length}</div>
    //                         </p>
    //                         <p className='text-white'>caption : <span className='font-semibold'>{post?.caption}</span></p>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //               {/* {userDetails?.id === userID && <CreatePost />} */}
    //             </TabsContent>

    //             <TabsContent value="saved">
    //               <div className="text-center py-8 text-gray-500">No saved posts yet.</div>
    //             </TabsContent>

    //             <TabsContent value="tagged">
    //               <div className="text-center py-8 text-gray-500">No tagged posts yet.</div>
    //             </TabsContent>

    //             <TabsContent value="watched" className='w-full h-full'>
    //               <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-20 w-full h-full">
    //                 {watched.map((watch) => (
    //                   <Card id={watch?.caption} key={watch._id} className="rounded-none border-none w-full h-48 sm:h-64 md:h-72">
    //                     <CardContent className="p-0 w-full h-full">
    //                       {watch?.mediaType === 'image' ? (
    //                         <img src={watch?.mediaPath} alt={watch?.caption} className="w-full h-full object-cover object-top" />
    //                       ) : (
    //                         <video src={watch?.mediaPath} className="w-full aspect-square object-cover" />
    //                       )}
    //                     </CardContent>
    //                   </Card>
    //                 ))}
    //               </div>
    //             </TabsContent>
    //           </Tabs>
    //         </section>
    //       </div>
    //     </main>
    //   </div>
    // </div>


    <div className="flex flex-col min-h-screen bg-white dark:text-white dark:bg-neutral-950">
      <PostComment selectedMedia={selectedMedia} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
      {isLoading && <InstagramProfileSkeletonComponent />}
      {/* Main content */}
      <main className="profile flex-grow sm:px-8 lg:px-[72px] py-[60px] lg:ml-[14.5%] dark:bg-neutral-950 dark:text-white">
        <div className="w-full mx-auto">
          {/* Profile info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 md:gap-6 mb-6">
            <Avatar className="w-20 h-20 sm:w-32 sm:h-32">
              <AvatarImage src={profilePicture || "/placeholder.svg?height=128&width=128"} alt={`${user.username}`} className="object-cover object-top" />
              <AvatarFallback>{user.username}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center sm:items-start gap-4 flex-grow">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <h2 className="text-xl font-semibold">{user.username}</h2>
                <div className="flex gap-1">
                  {userDetails?.id === userID ? (
                    <>
                      <Link to={`/accounts/edit/${user?._id}`}>
                        <Button variant="secondary" className="mr-2 rounded-lg px-4" size="sm">Edit profile</Button>
                      </Link>
                      <Button variant="secondary" className="rounded-lg px-4 mr-2" size="sm">View archive</Button>
                      <Link to={`/admindashboard`}>
                        <Button variant="secondary" className="mr-2 rounded-lg px-4" size="sm">Admin Panel</Button>
                      </Link>
                      <Button onClick={handleLogout} variant="ghost" size="icon" className="md:ml-2">
                        <SettingsIcon className="h-6 w-6" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={(e) => handleFollowing(e, userID)} variant="secondary" className="mr-2 rounded-lg px-4" size="sm">{followingUserss?.includes(userID) ? "Following" : "follow"}</Button>
                      <Link to="/direct/inbox">
                        <Button variant="secondary" className="rounded-lg px-4" size="sm">Message</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-center md:justify-start space-x-8 sm:space-x-16 mb-4">
                <span><strong>{postsArr.length}</strong> posts</span>
                {/* <span><strong>{user.followers?.length || 0}</strong> followers</span> */}
                {userDetails?.id === userID ?
                  <span><strong>{user.followers?.length || 0}</strong> followers</span>
                  :
                  <span><strong>{following?.length || 0}</strong> followers</span>
                }
                <span><strong>{user.following?.length || 0}</strong> following</span>
              </div>
              <div className="text-sm text-center sm:text-left">
                <p className="font-medium">{user.fullName}</p>
                <p className='text-zinc-700 dark:text-white'>{user.bio || "No bio available"}</p>
              </div>
            </div>
          </div>

          {/* Story highlights */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-4">
              {userDetails?.id === userID && (
                <>
                  {/* <div className="rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 p-[.5px] border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <div className="add relative flex items-center justify-center">
                  <div className="vertical h-8 sm:h-10 md:h-12 w-[2px] bg-zinc-800 absolute"></div>
                  <div className="horizontal w-8 sm:w-10 md:w-12 h-[2px] bg-zinc-800 absolute"></div>
                </div>
              </div> */}
                  <StoryUpload />
                </>
              )}
            </div>
          </div>

          {/* Post Tabs */}
          <section className="mt-10 w-full h-auto">
            <Tabs defaultValue="posts" className="w-full h-full">
              <TabsList className="w-full justify-center">
                <TabsTrigger value="posts" className="flex-1 text-sm"><GridIcon className="w-4 h-4 mr-2" />Posts</TabsTrigger>
                {userDetails.id === userID ? (
                  <TabsTrigger value="saved" className="flex-1 text-sm"><BookmarkIcon className="w-4 h-4 mr-2" />Saved</TabsTrigger>
                ) : (
                  <TabsTrigger value="saved" className="flex-1 text-sm"><Clapperboard className="w-4 h-4 mr-2" />Reels</TabsTrigger>
                )}
                <TabsTrigger value="tagged" className="flex-1 text-sm"><UserIcon className="w-4 h-4 mr-2" />Tagged</TabsTrigger>
                {userDetails.id !== userID && (
                  <TabsTrigger value="watched" className="flex-1 text-sm"><UserIcon className="w-4 h-4 mr-2" />Watched</TabsTrigger>
                )}
              </TabsList>

              {/* Posts Tab Content */}
              <TabsContent value="posts" className="w-full h-full">
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-1 mb-20 w-full h-full">
                  {postsArr.map((post) => (
                    <div onClick={e => showComments(e, post)} key={post._id} className="relative w-full h-48 sm:h-64 md:h-72 group">
                      <Card id={post?.caption} className="rounded-none border-none w-full h-full">
                        <CardContent className="p-0 w-full h-full">
                          {post?.media[0]?.mediaType === 'image' ? (
                            <img src={`${post?.media[0]?.mediaPath}`} alt={post.caption} className="w-full h-full object-cover object-top" />
                          ) : (
                            <video src={`${post?.media[0]?.mediaPath}`} className="w-full h-full aspect-square object-cover" />
                          )}
                        </CardContent>
                      </Card>

                      {/* Dropdown menu positioned at top-right */}
                      <div className="absolute top-2 right-2 z-20">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 md:w-80">
                            <DropdownMenuItem onClick={e => handleDeletePost(e, post?._id)} className="text-red-600 justify-center font-bold focus:text-red-600 cursor-pointer">Delete</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center cursor-pointer">Add to favorites</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center cursor-pointer">Share to...</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center cursor-pointer">Copy link</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center cursor-pointer">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex flex-col justify-center items-center gap-5">
                          <p className="text-white flex gap-5">
                            <div className="likes flex gap-2 justify-center items-center"><FaHeart className='w-6 h-6' /> {post?.likes?.length}</div>
                            <div className="comments flex gap-2 justify-center items-center"><IoChatbubbleSharp className="w-6 h-6 -rotate-90" /> {post?.comments?.length}</div>
                          </p>
                          <p className='text-white'>caption : <span className='font-semibold'>{post?.caption}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Other Tabs Content (saved, tagged, watched) */}
              <TabsContent value="saved">
                <div className="text-center py-8 text-gray-500">No saved posts yet.</div>
              </TabsContent>
              <TabsContent value="tagged">
                <div className="text-center py-8 text-gray-500">No tagged posts yet.</div>
              </TabsContent>
              <TabsContent value="watched">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-20 w-full h-full">
                  {watched.map((watch) => (
                    <div onClick={e => showComments(e, watch)} key={watch._id} className="relative w-full h-48 sm:h-64 md:h-72 group">
                      <Card key={watch._id} className="rounded-none border-none w-full h-48 sm:h-64 md:h-72">
                        <CardContent className="p-0 w-full h-full">
                          {watch?.media[0]?.mediaType === 'image' ? (
                            <img src={watch?.media[0]?.mediaPath} alt={watch?.caption} className="w-full h-full object-cover object-top" />
                          ) : (
                            <video src={watch?.mediaPath} className="w-full aspect-square object-cover" />
                          )}
                        </CardContent>
                      </Card>
                      <div className="absolute top-2 right-2 z-20">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 md:w-80">
                            <DropdownMenuItem onClick={e => handleDeletePost(e, watch?._id)} className="text-red-600 justify-center font-bold focus:text-red-600 cursor-pointer">Delete</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center cursor-pointer">Add to favorites</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center cursor-pointer">Share to...</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center cursor-pointer">Copy link</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center cursor-pointer">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex flex-col justify-center items-center gap-5">
                          <p className="text-white flex gap-5">
                            <div className="likes flex gap-2 justify-center items-center"><FaHeart className='w-6 h-6' /> {watch?.likes?.length}</div>
                            <div className="comments flex gap-2 justify-center items-center"><IoChatbubbleSharp className="w-6 h-6 -rotate-90" /> {watch?.comments?.length}</div>
                          </p>
                          <p className='text-white'>caption : <span className='font-semibold'>{watch?.caption}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>

  );

};

export default Profile;