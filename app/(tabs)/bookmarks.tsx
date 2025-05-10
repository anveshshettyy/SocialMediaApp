import { Loader } from '@/components/Loader';
import { COLORS } from '@/constants/theme';
import { api } from '@/convex/_generated/api'
import { styles } from '@/styles/feed.styles';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react'
import { Image } from 'expo-image';
import { View, Text, ScrollView } from 'react-native'

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarketPosts);

  if(bookmarkedPosts === undefined) return <Loader />
  if(bookmarkedPosts.length === 0) return <NoBookmarksFound />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 8,
          flexDirection: "row",
          flexWrap: "wrap",
        }} 
      >

        {bookmarkedPosts.map((post) => {
          if(!post) return null;
          return (
            <View key={post._id} style={{width: "33.33%", padding: 1}} >
              <Image 
                source={post.imageUrl}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
          )
        })}

      </ScrollView>
    </View>
  )
}

function NoBookmarksFound() {
  return (
    <View
      style = {{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Ionicons name="bookmark-outline" size={48} color={COLORS.primary} />
      <Text style={{ color: COLORS.primary, fontSize: 22, marginTop: "10px" }}>No bookmarked posts yet</Text>
      

    </View>
  )
}