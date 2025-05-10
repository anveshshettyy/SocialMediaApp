import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.style";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function UserProfileScreen() {
    const {id} = useLocalSearchParams();
    const router = useRouter();

    const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);

    const profile = useQuery(api.users.getUserProfile, {id: id as Id<"users">});
    const posts = useQuery(api.posts.getPostsByUser, {userId: id as Id<"users">});
    const isFollowing = useQuery(api.users.isFollowing, {followingId: id as Id<"users">});

    const toggleFollow = useMutation(api.users.toggleFollow);

    const handleBack = () => {
        if(router.canGoBack()) router.back();
        else router.replace("/(tabs)");
    }

    if(profile === undefined || posts === undefined || isFollowing === undefined) return <Loader />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} >{profile.username}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Cover Gradient */}
            <View>
                <LinearGradient
                    colors={["#34d399", "#ffffff"]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.coverImage}
                />
                {/* Overlapping Avatar */}
                <View style={styles.profileAvatarWrapper}>
                    <Image
                        source={profile.image}
                        style={styles.profileAvatar}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Name & Bio */}
                <Text style={styles.name}>{profile.fullname}</Text>
                {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
                {/* Stats Row with separators */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.followers}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.following}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{profile.posts}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                </View>
                {/* Follow Button */}
                <Pressable
                    style={[styles.followButton, isFollowing && styles.followingButton, { alignSelf: 'center', marginBottom: 18 }]}
                    onPress={() => toggleFollow({ followingId: id as Id<"users"> })}
                >
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                        {isFollowing ? "Following" : "Follow"}
                    </Text>
                </Pressable>
                {/* Post Grid */}
                <FlatList
                    data={posts}
                    numColumns={3}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
                            <Image
                                source={item.imageUrl}
                                style={styles.gridImage}
                                contentFit="cover"
                                transition={200}
                                cachePolicy="memory-disk"
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={
                        <View style={styles.noPostsContainer}>
                            <Ionicons name="image-outline" size={48} color={COLORS.grey} />
                            <Text style={styles.noPostsText}>No posts yet</Text>
                        </View>
                    }
                />
            </ScrollView>

            {/* Modal for post detail view */}
            <Modal
                visible={!!selectedPost}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSelectedPost(null)}
            >
                <View style={styles.modalBackdrop}>
                    {selectedPost && (
                        <View style={styles.postDetailContainer}>
                            <View style={styles.postDetailHeader} >
                                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                                    <Ionicons name="close" size={24} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                            <Image
                                source={selectedPost.imageUrl}
                                cachePolicy={"memory-disk"}
                                style={styles.postDetailImage}
                            />
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    )
}