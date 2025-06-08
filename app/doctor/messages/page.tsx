// page.tsx
import { headers } from "next/headers";
// Remove GraphQL related imports if no longer used in this file
// import { executeGraphQLServer } from "@/lib/graphql-server";
// import { GET_DOCTOR_MESSAGES } from "@/lib/graphql/doctor-queries";
import { MessagingInterface } from "./messaging-interface"; //
import type { Conversation as FrontendConversation } from "./messaging-interface";



async function getInitialConversations(): Promise<FrontendConversation[]> {
    try {
        const headerStore = headers();
        const cookieString = headerStore.get("cookie") || "";
        const cookies = cookieString.split(";").map((cookie) => cookie.trim());

        // Look for associatedId cookie
        const associatedIdCookie = cookies.find((cookie) =>
            cookie.startsWith("associatedId="),
        );

        if (!associatedIdCookie) {
            console.error("❌ Aucun associatedId trouvé dans les cookies pour getInitialConversations");
            return [];
        }
        const associatedId = associatedIdCookie.substring(associatedIdCookie.indexOf("=") + 1);
        console.log("👤 AssociatedId trouvé pour getInitialConversations:", associatedId);

        // Look for auth token cookie (adjust cookie name if necessary)
        // Common names: 'token', 'auth_token', 'jwt', 'access_token'
        // This needs to match the cookie name your authentication system sets.
        const tokenCookieNames = ["token", "authToken", "auth_token", "jwt", "access_token"];
        let authToken = null;

        for (const name of tokenCookieNames) {
            const cookie = cookies.find((c) => c.startsWith(`${name}=`));
            if (cookie) {
                authToken = cookie.substring(cookie.indexOf("=") + 1);
                // Clean the token if it's wrapped in quotes
                if (authToken.startsWith('"') && authToken.endsWith('"')) {
                    authToken = authToken.slice(1, -1);
                }
                try {
                    authToken = decodeURIComponent(authToken);
                } catch (e) {
                    // If decoding fails, use the raw token
                }
                break;
            }
        }

        if (!authToken) {
            console.error("❌ Aucun token d'authentification trouvé dans les cookies pour getInitialConversations");
            // Depending on your app's logic, you might want to throw an error or handle this differently.
            // For now, returning empty to prevent full page crash, but auth should ideally be handled by middleware.
            return [];
        }

        const apiUrl = process.env.API_URL || "http://localhost:4000"; // Ensure this points to your backend
        const response = await fetch(`${apiUrl}/chat/conversations/sender`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store", // Fetch fresh data on every request
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Erreur API (${response.status}) lors de la récupération des conversations initiales: ${errorData}`);
            return [];
        }

        const data = await response.json();
        console.log("haw lenaaaaa\n",data,"\njjjjjj")

        // The API returns { conversations: [...] }, we need the array.
        return data.conversations || [];
    } catch (error) {
        console.error("Erreur lors de la récupération des conversations initiales:", error);
        return [];
    }
}

export default async function MessagesPage() {
    const initialConversations = await getInitialConversations();

    return (
        <div className="h-screen">
            {/* Pass initialConversations instead of initialMessages */}
            <MessagingInterface initialConversations={initialConversations} />
        </div>
    );
}