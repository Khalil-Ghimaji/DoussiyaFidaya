import { headers } from "next/headers";

import { MessagingInterface } from "./messaging-interface";
import type { Conversation as FrontendConversation } from "./messaging-interface";


async function getInitialConversations(): Promise<FrontendConversation[]> {
    try {
        const headerStore = headers();
        const cookieString = headerStore.get("cookie") || "";
        const cookies = cookieString.split(";").map((cookie) => cookie.trim());

        const associatedIdCookie = cookies.find((cookie) =>
            cookie.startsWith("associatedId="),
        );

        if (!associatedIdCookie) {
            console.error("❌ Aucun associatedId trouvé dans les cookies pour getInitialConversations");
            return [];
        }
        const associatedId = associatedIdCookie.substring(associatedIdCookie.indexOf("=") + 1);
        console.log("👤 AssociatedId trouvé pour getInitialConversations:", associatedId);


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

                }
                break;
            }
        }

        if (!authToken) {
            console.error("❌ Aucun token d'authentification trouvé dans les cookies pour getInitialConversations");
            return [];
        }

        const apiUrl = process.env.API_URL || "http://localhost:4000"; // Ensure this points to your backend
        const response = await fetch(`${apiUrl}/chat/conversations/sender`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Erreur API (${response.status}) lors de la récupération des conversations initiales: ${errorData}`);
            return [];
        }

        const data = await response.json();
        console.log("haw lenaaaaa\n",data,"\njjjjjj")

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
            <MessagingInterface initialConversations={initialConversations} />
        </div>
    );
}