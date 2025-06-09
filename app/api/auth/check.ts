import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ isAuthenticated: false }, { status: 401 });
        }
        return NextResponse.json({ isAuthenticated: true }, { status: 200 });
    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json(
            { isAuthenticated: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}