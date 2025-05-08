import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function InitialLayout() {
    const {isLoaded, isSignedIn} = useAuth();
    const { user } = useUser();
    const createUser = useMutation(api.users.createUser);

    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if(!isLoaded) return;
        
        const inAuthScreen = segments[0] === "(auth)";
        
        if(!isSignedIn && !inAuthScreen) {
            router.replace("/(auth)/login");
        } else if(isSignedIn && inAuthScreen) {
            // Ensure user exists in Convex when signed in
            if (user) {
                createUser({
                    email: user.emailAddresses[0].emailAddress,
                    username: user.emailAddresses[0].emailAddress.split("@")[0],
                    fullname: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                    image: user.imageUrl,
                    clerkId: user.id,
                }).catch(error => {
                    // Ignore error if user already exists
                    console.log("User creation error (might already exist):", error);
                });
            }
            router.replace("/(tabs)");
        }
    }, [isLoaded, isSignedIn, segments, user]);

    if(!isLoaded) return null;

    return <Stack screenOptions={{headerShown: false}} />
}