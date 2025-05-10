import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import CommentsModal from "./CommentsModal";

type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
      fullname?: string;
    };
  };
};

export default function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip"
  );

  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);

  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsLiked(newIsLiked);
    } catch (error) {
      console.error("Error toggling like: ", error);
    }
  };

  const handleBookmark = async () => {
    const newIsBookmarked = await toggleBookmark({ postId: post._id });
    setIsBookmarked(newIsBookmarked);
  };

  const handleDelete = async () => {
    try {
        await deletePost({ postId: post._id });
    } catch (error) {
        console.log("Error deleting post:", error);
    }
  }

  return (
    <View style={styles.post}>
      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      {/* Overlay Top: Avatar and Username */}
      <View style={styles.postOverlayTop}>
        <Link href={
          currentUser?._id === post.author._id ? "/(tabs)/profile" : `/user/${post.author._id}`
        } asChild>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy={"memory-disk"}
            />
            <View style={{ justifyContent: 'center' }}>
              <Text style={styles.postName}>{post.author.fullname || post.author.username}</Text>
              <Text style={styles.postUsernameGrey}>@{post.author.username}</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
      {/* Overlay Top Right: Menu or Delete */}
      <View style={styles.postOverlayMenu}>
        {currentUser?._id === post.author._id ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setShowMenu((prev) => !prev)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
        {/* Popup tag for non-user posts */}
        {showMenu && currentUser?._id !== post.author._id && (
          <Pressable
            style={{
              position: 'absolute',
              top: 40,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 16,
              zIndex: 10,
              minWidth: 90,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={() => setShowMenu(false)}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>
              {formatDistanceToNow(post._creationTime, { addSuffix: true })}
            </Text>
          </Pressable>
        )}
      </View>
      {/* Overlay Bottom: Actions, Caption, Comments, Time */}
      <View style={styles.postOverlayBottom}>
        <View style={styles.postActions}>
          <View style={styles.postActionsLeft}>
            <TouchableOpacity onPress={() => handleLike()} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? COLORS.primary : COLORS.white}
              />
              <Text style={{ color: COLORS.white, fontSize: 13, marginLeft: 4 }}>
                {post.likes > 0 ? post.likes.toLocaleString() : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowComments(true)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
              <Ionicons
                name={"chatbubble-outline"}
                size={22}
                color={COLORS.white}
              />
              <Text style={{ color: COLORS.white, fontSize: 13, marginLeft: 4 }}>
                {post.comments > 0 ? post.comments : ''}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleBookmark}>
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}
        <Text style={styles.timeAgo}>
          {/* {formatDistanceToNow(post._creationTime, { addSuffix: true })} */}
        </Text>
      </View>
      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}
