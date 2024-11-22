import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoBookmark, GoBookmarkFill } from 'react-icons/go';
import { BsThreeDots } from "react-icons/bs";
import axios from 'axios';
import Sidebar from '../Home/Sidebar';
import { Button } from '../ui/button';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { FaHeart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setSavedPosts, setWatchHistory } from '@/features/userDetail/userDetailsSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Card, CardContent } from '../ui/card';

const ReelSection = () => {
    const userDetails = useSelector((state) => state.counter.userDetails);
    const savedPost = useSelector((state) => state.counter.savedPosts);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [allPosts, setAllPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const videoRefs = useRef([]); // Ref for video elements
    const watchTimeouts = useRef({}); // Timeouts for tracking watch time

    // Fetch posts with pagination
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const { data: posts } = await axios.get(`/api/posts/getPosts?page=${page}&limit=10`);
            // const reels = posts.filter(post => post?.media[0]?.mediaType === 'video');

            const videoPosts = posts.map(post => {
                // Filter the media array to include only videos
                const videoMedia = post.media.filter(mediaItem => mediaItem.mediaType === "video");


                // If there are video media items, return the post with only video media, else return null
                if (videoMedia.length > 0) {
                    return { ...post, media: videoMedia };  // Store only the video media for this post
                }
                return null;   // Exclude posts without video media
            }).filter(post => post !== null);  // Remove any null posts


            setAllPosts((prevPosts) => [...prevPosts, ...videoPosts]);
            if (posts.length < 10) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            if (error.response?.statusText === 'Unauthorized' || error.response?.status === 403) navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [page, navigate]);

    // Fetch saved posts
    const getSavePosts = useCallback(async () => {
        try {
            const userId = userDetails.id;
            const { data: { savedPosts } } = await axios.get(`/api/posts/${userId}/save`);
            dispatch(setSavedPosts(savedPosts));
        } catch (error) {
            console.error('Error fetching saved posts:', error);
            if (error.response?.statusText === 'Unauthorized' || error.response?.status === 403) navigate('/login');
        }
    }, [dispatch, navigate, userDetails.id]);

    // Optimistically update likes
    const handleLike = useCallback(async (e, postId) => {
        e.preventDefault();
        const userId = userDetails.id;

        try {
            // API request to like the post
            const { data: updatedPost } = await axios.put(`/api/posts/${postId}/like`, { userId });

            // Update the post locally in the state
            setAllPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? updatedPost?.post : post
                )
            );
        } catch (error) {
            console.error('Error liking the post:', error);
            if (error.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login');
        }
    }, [navigate, userDetails.id]);

    // Optimistically update saved posts
    const handleSavePosts = useCallback(async (e, postId) => {
        e.preventDefault();
        try {
            const { data: { savedPosts } } = await axios.put(`/api/posts/${userDetails.id}/save`, { postId });
            dispatch(setSavedPosts(savedPosts));
        } catch (error) {
            console.error('Error saving the post:', error);
            if (error.response?.statusText === 'Unauthorized' || error.response?.status === 403) navigate('/login');
        }
    }, [dispatch, navigate, userDetails.id]);

    // Watch time tracking
    const handleWatchStart = useCallback((postId, videoElement) => {
        watchTimeouts.current[postId] = setTimeout(() => {
            addToHistory(postId);
        }, 5000); // 5 seconds watch time
        videoElement.play();
    }, []);

    const handleWatchEnd = useCallback((postId, videoElement) => {
        clearTimeout(watchTimeouts.current[postId]);
        videoElement.pause();
    }, []);

    const addToHistory = useCallback(async (postId) => {
        try {
            const userId = userDetails.id;
            const response = await axios.post(`/api/users/reelHistory/${userId}/${postId}`);
            const watchHistory = response?.data?.user?.reelHistory
            dispatch(setWatchHistory([watchHistory]));
        } catch (error) {
            console.error('Error adding to history:', error);
            if (error.response?.statusText === 'Unauthorized' || error.response?.status === 403) navigate('/login');
        }
    }, [dispatch, navigate, userDetails.id]);

    // Infinite scrolling
    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || !hasMore) {
            return;
        }
        setPage((prevPage) => prevPage + 1);
    }, [loading, hasMore]);

    // Video intersection observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target;
                    const postId = video.dataset.postid;

                    if (entry.isIntersecting) {
                        handleWatchStart(postId, video);
                    } else {
                        handleWatchEnd(postId, video);
                    }
                });
            },
            { threshold: 0.75 }
        );

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => {
            videoRefs.current.forEach((video) => {
                if (video) observer.unobserve(video);
            });
        };
    }, [allPosts, handleWatchStart, handleWatchEnd]);

    // Initial fetch and pagination setup
    useEffect(() => {
        fetchPosts();
        return () => {
            setAllPosts([]);
        }
    }, [page, fetchPosts]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        getSavePosts();
    }, [getSavePosts]);
    return (
        <>
            {/* <Sidebar /> */}
            <div className="flex-1 min-h-screen flex flex-col items-center py-4 md:ml-[72px] lg:ml-60 ml-auto dark:bg-neutral-950 dark:text-white">
                <div className="w-full flex justify-center mt-4">
                    <Carousel
                        opts={{
                            align: "center", // Center the current reel, partially showing adjacent reels
                        }}
                        orientation="vertical"
                        className="relative w-full max-w-sm md:max-w-md lg:max-w-lg"
                    >
                        <CarouselContent className="h-[95vh] gap-4">
                            {allPosts?.map((post, index) => (
                                <CarouselItem
                                    key={post._id}
                                    className="relative flex flex-col items-center justify-center w-full h-[75vh] gap-4 rounded-lg overflow-hidden"
                                >
                                    {/* Post Content */}
                                    <div className="w-[300px] h-full rounded-lg shadow-lg overflow-hidden">
                                        <div className="video w-full h-full relative rounded-lg overflow-hidden">
                                            <video
                                                ref={(el) => (videoRefs.current[index] = el)} // Assign ref to each video
                                                muted
                                                data-postid={post._id} // Store postId for reference in intersection observer
                                                src={post?.media[0]?.mediaPath}
                                                loop
                                                className="object-cover w-full h-full"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                                {/* Author Info */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Link
                                                        to={`/profile/${post?.author?.username}/${post.caption}`}
                                                        className="flex items-center"
                                                    >
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage
                                                                src={post?.author?.profilePicture}
                                                                alt={post?.username}
                                                                className="object-cover w-full h-full rounded-full"
                                                            />
                                                            <AvatarFallback>{post?.username}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="ml-2 text-white text-sm">
                                                            {post?.author?.username}
                                                        </span>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        className="ml-2 px-4 py-1 text-xs text-white bg-transparent border"
                                                    >
                                                        Follow
                                                    </Button>
                                                </div>
                                                {/* Caption */}
                                                <p className="text-white text-sm mb-2">{post.caption}</p>
                                                {/* Song Info */}
                                                <div className="flex items-center text-white">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="lucide lucide-music"
                                                    >
                                                        <path d="M9 18V5l12-2v13" />
                                                        <circle cx="6" cy="18" r="3" />
                                                        <circle cx="18" cy="16" r="3" />
                                                    </svg>
                                                    <span className="ml-2 text-sm">
                                                        James Quinn - Dreamer's Path
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="absolute right-16 flex flex-col items-center justify-end gap-4">
                                        {/* Like Button */}
                                        <div className="flex flex-col items-center">
                                            <button
                                                onClick={(e) => handleLike(e, post._id)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                {post?.likes?.includes(userDetails.id) ? (
                                                    <FaHeart className="text-red-500 w-6 h-6" />
                                                ) : (
                                                    <Heart className="w-6 h-6" />
                                                )}
                                            </button>
                                            <p className="text-sm">{post?.likes?.length}</p>
                                        </div>

                                        {/* Comment Button */}
                                        <div className="flex flex-col items-center">
                                            <button className="transition-transform hover:scale-110">
                                                <MessageCircle className="w-6 h-6 transform -scale-x-100" />
                                            </button>
                                            <p className="text-sm">{post?.comments?.length}</p>
                                        </div>

                                        {/* Share Button */}
                                        <div className="flex flex-col items-center">
                                            <Send className="w-6 h-6 transition-transform hover:scale-110" />
                                            <p className="text-sm">0</p>
                                        </div>

                                        {/* Save Button */}
                                        <div className="flex flex-col items-center">
                                            <button
                                                onClick={(e) => handleSavePosts(e, post._id)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                {Array.isArray(savedPost) && savedPost.includes(post._id) ? (
                                                    <GoBookmarkFill className="w-6 h-6 text-white" />
                                                ) : (
                                                    <GoBookmark className="w-6 h-6" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Options Button */}
                                        <div className="flex flex-col items-center">
                                            <BsThreeDots className="w-6 h-6 transition-transform hover:scale-110" />
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Carousel Navigation Arrows */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 h-14">
                            <CarouselPrevious className="w-12 h-12 p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition" />
                            <CarouselNext className="w-12 h-12 p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition" />
                        </div>
                    </Carousel>
                </div>
            </div>



        </>
    );
};

export default ReelSection;


















// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { GoBookmark, GoBookmarkFill } from 'react-icons/go';
// import { BsThreeDots } from "react-icons/bs";
// import axios from 'axios';
// import Sidebar from '../Home/Sidebar';
// import { Button } from '../ui/button';
// import { Heart, MessageCircle, Send } from 'lucide-react';
// import { FaHeart } from 'react-icons/fa';
// import { useDispatch, useSelector } from 'react-redux';
// import { setSavedPosts, setWatchHistory } from '@/features/userDetail/userDetailsSlice';
// import { Link, useNavigate } from 'react-router-dom';
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// const ReelSection = () => {
//     const userDetails = useSelector((state) => state.counter.userDetails);
//     const savedPost = useSelector((state) => state.counter.savedPosts);
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const [allPosts, setAllPosts] = useState([]);
//     const [page, setPage] = useState(0);
//     const [hasMore, setHasMore] = useState(true);
//     const [loading, setLoading] = useState(false);
//     const videoRefs = useRef([]); // Ref for video elements
//     const watchTimeouts = useRef({}); // Timeouts for tracking watch time

//     // Fetch posts with pagination
//     const fetchPosts = useCallback(async () => {
//         try {
//             setLoading(true);
//             const { data: posts } = await axios.get(`/api/posts/getPosts?page=${page}&limit=10`);
//             // const reels = posts.filter(post => post?.media[0]?.mediaType === 'video');

//             const videoPosts = posts.map(post => {
//                 // Filter the media array to include only videos
//                 const videoMedia = post.media.filter(mediaItem => mediaItem.mediaType === "video");


//                 // If there are video media items, return the post with only video media, else return null
//                 if (videoMedia.length > 0) {
//                     return { ...post, media: videoMedia };  // Store only the video media for this post
//                 }
//                 return null;   // Exclude posts without video media
//             }).filter(post => post !== null);  // Remove any null posts


//             setAllPosts((prevPosts) => [...prevPosts, ...videoPosts]);
//             if (posts.length < 10) {
//                 setHasMore(false);
//             }
//         } catch (error) {
//             console.error('Error fetching posts:', error);
//             if (error.response?.statusText === 'Unauthorized' || error.response?.status === 403) navigate('/login');
//         } finally {
//             setLoading(false);
//         }
//     }, [page, navigate]);

//     // Fetch saved posts
//     const getSavePosts = useCallback(async () => {
//         try {
//             const userId = userDetails.id;
//             const { data: { savedPosts } } = await axios.get(`/api/posts/${userId}/save`);
//             dispatch(setSavedPosts(savedPosts));
//         } catch (error) {
//             console.error('Error fetching saved posts:', error);
//             if (error.response?.statusText === 'Unauthorized' || error.response?.status === 403) navigate('/login');
//         }
//     }, [dispatch, navigate, userDetails.id]);

//     // Optimistically update likes
//     const handleLike = useCallback(async (e, postId) => {
//         e.preventDefault();
//         const userId = userDetails.id;

//         try {
//             // API request to like the post
//             const { data: updatedPost } = await axios.put(`/api/posts/${postId}/like`, { userId });

//             // Update the post locally in the state
//             setAllPosts((prevPosts) =>
//                 prevPosts.map((post) =>
//                     post._id === postId ? updatedPost?.post : post
//                 )
//             );
//         } catch (error) {
//             console.error('Error liking the post:', error);
//             if (error.response?.statusText === "Unauthorized" || error.response?.status === 403) navigate('/login');
//         }
//     }, [navigate, userDetails.id]);

//     // Optimistically update saved posts
//     const handleSavePosts = useCallback(async (e, postId) => {
//         e.preventDefault();
//         try {
//             const { data: { savedPosts } } = await axios.put(`/api/posts/${userDetails.id}/save`, { postId });
//             dispatch(setSavedPosts(savedPosts));
//         } catch (error) {
//             console.error('Error saving the post:', error);
//             if (error.response?.statusText === 'Unauthorized' || error.response?.status === 403) navigate('/login');
//         }
//     }, [dispatch, navigate, userDetails.id]);

//     // Watch time tracking
//     const handleWatchStart = useCallback((postId, videoElement) => {
//         watchTimeouts.current[postId] = setTimeout(() => {
//             addToHistory(postId);
//         }, 5000); // 5 seconds watch time
//         videoElement.play();
//     }, []);

//     const handleWatchEnd = useCallback((postId, videoElement) => {
//         clearTimeout(watchTimeouts.current[postId]);
//         videoElement.pause();
//     }, []);

//     const addToHistory = useCallback(async (postId) => {
//         try {
//             const userId = userDetails.id;
//             const response = await axios.post(`/api/users/reelHistory/${userId}/${postId}`);
//             dispatch(setWatchHistory([response?.data?.user?.reelHistory]));
//         } catch (error) {
//             console.error('Error adding to history:', error);
//             if (error.response?.statusText === 'Unauthorized' || error.response?.status === 403) navigate('/login');
//         }
//     }, [dispatch, navigate, userDetails.id]);

//     // Infinite scrolling
//     const handleScroll = useCallback(() => {
//         if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || !hasMore) {
//             return;
//         }
//         setPage((prevPage) => prevPage + 1);
//     }, [loading, hasMore]);

//     // Video intersection observer
//     useEffect(() => {
//         const observer = new IntersectionObserver(
//             (entries) => {
//                 entries.forEach((entry) => {
//                     const video = entry.target;
//                     const postId = video.dataset.postid;

//                     if (entry.isIntersecting) {
//                         handleWatchStart(postId, video);
//                     } else {
//                         handleWatchEnd(postId, video);
//                     }
//                 });
//             },
//             { threshold: 0.75 }
//         );

//         videoRefs.current.forEach((video) => {
//             if (video) observer.observe(video);
//         });

//         return () => {
//             videoRefs.current.forEach((video) => {
//                 if (video) observer.unobserve(video);
//             });
//         };
//     }, [allPosts, handleWatchStart, handleWatchEnd]);

//     // Initial fetch and pagination setup
//     useEffect(() => {
//         fetchPosts();
//         return () => {
//             setAllPosts([]);
//         }
//     }, [page, fetchPosts]);

//     useEffect(() => {
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, [handleScroll]);

//     useEffect(() => {
//         getSavePosts();
//     }, [getSavePosts]);
//     return (
//         <>
//             {/* <Sidebar /> */}
//             <div className="flex-1 md:ml-[72px] lg:ml-60 min-h-screen flex flex-col items-center py-4 ml-auto dark:bg-neutral-950 dark:text-white">
//                 <div className="w-full flex flex-wrap justify-center gap-4 mt-2">
//                     {allPosts?.map((post, index) => (
//                         <div
//                             key={post._id}
//                             className="relative w-full h-[90vh] flex gap-2 justify-center items-center rounded-lg overflow-hidden"
//                         >
//                             <div className="h-full w-[300px] rounded-lg flex justify-center items-center overflow-hidden shadow-xl">
//                                 {/* Video Container */}
//                                 <div className="video h-full w-full relative rounded-lg overflow-hidden shadow-lg">
//                                     <video
//                                         ref={(el) => (videoRefs.current[index] = el)} // Assign ref to each video
//                                         muted
//                                         data-postid={post._id} // Store postId for reference in intersection observer
//                                         src={post?.media[0]?.mediaPath}
//                                         loop
//                                         className="object-cover w-full h-full rounded-lg"
//                                     />
//                                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
//                                         <div className="flex items-center mb-2">
//                                             <Link to={`/profile/${post?.author?.username}/${post.caption}`} className='flex justify-center items-center'>
//                                                 <Avatar className="w-8 h-8">
//                                                     <AvatarImage src={post?.author?.profilePicture} alt={post?.username} className="w-full h-full rounded-full object-top object-cover" />
//                                                     <AvatarFallback>{post?.username}</AvatarFallback>
//                                                 </Avatar>
//                                                 <span className="ml-2 text-white text-sm ">{post?.author?.username}</span>
//                                             </Link>
//                                             <Button variant="outline" className="ml-2 py-1 px-4 bg-transparent text-white text-xs">
//                                                 Follow
//                                             </Button>
//                                         </div>

//                                         {/* Caption */}
//                                         <p className="text-white text-sm mb-2">{post.caption}</p>

//                                         {/* Song Info */}
//                                         <div className="flex items-center text-white">
//                                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
//                                             <span className='ml-2 text-sm'>James Quinn - Dreamer's Path</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Controls */}
//                             <div className="controls h-full w-[5%] flex flex-col justify-end items-center gap-5 py-1">
//                                 {/* Like Button */}
//                                 <div className="like flex flex-col justify-center items-center">
//                                     <button onClick={(e) => handleLike(e, post._id)}>
//                                         {post?.likes?.includes(userDetails.id) ? <FaHeart className="w-6 h-6 text-red-500" /> : <Heart className="w-6 h-6 hover:scale-110 transition-transform" />}
//                                     </button>
//                                     <p className="text-sm">{post?.likes?.length}</p>
//                                 </div>

//                                 {/* Comment Button */}
//                                 <div className="comment flex flex-col justify-center items-center">
//                                     <button >
//                                         <MessageCircle
//                                             style={{ transform: 'scaleX(-1)' }}
//                                             className=" w-6 h-6 hover:scale-110 transition-transform"
//                                         />
//                                     </button>
//                                     <p className="text-sm">{post?.comments?.length}</p>
//                                 </div>

//                                 {/* Share Button */}
//                                 <div className="share flex flex-col justify-center items-center">
//                                     <Send className="w-6 h-6 hover:scale-110 transition-transform" />
//                                     <p className="text-sm">0</p>
//                                 </div>

//                                 {/* Save Button */}
//                                 <div className="save flex flex-col justify-center items-center">
//                                     <button onClick={(e) => handleSavePosts(e, post._id)}>
//                                         {Array.isArray(savedPost) && savedPost.includes(post._id) ? <GoBookmarkFill size={25} className="dark:text-white" /> : <GoBookmark size={25} className="hover:text-zinc-800 dark:hover:text-zinc-500 transition-colors darktext-white duration-100" />}

//                                     </button>

//                                 </div>

//                                 {/* Options Button */}
//                                 <div className="options flex flex-col justify-center items-center">
//                                     <BsThreeDots size={22} className="hover:scale-110 transition-transform" />
//                                 </div>
//                                 <div className="w-8 h-8 rounded-md border-[.2px] border-black bg-white flex items-center justify-center">
//                                     <img
//                                         src="/placeholder.svg?height=24&width=24"
//                                         alt="User avatar"
//                                         className="w-6 h-6 rounded" />
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default ReelSection;
