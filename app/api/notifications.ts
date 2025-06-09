import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {fetchGraphQL} from "@/lib/graphql-client";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }

        // Verify the token
        const userId = cookieStore.get("userId")?.value;
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid token" },
                { status: 401 }
            );
        }

        // Fetch notifications for the authenticated user
        // Assuming getNotifications is a function that queries your database
        // const notifications = await fetchGraphQL<any>(
        //     ``
        // );
        const notifications = []

        return NextResponse.json(
            { notifications },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}