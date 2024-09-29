import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const roomIdsParam = url.searchParams.get("roomIds");

    if (!roomIdsParam) {
      return new Response("Room IDs are required", { status: 400 });
    }

    // Split user IDs by comma
    const roomIds = roomIdsParam.split(",");
    // Fetch users from Clerk
    // Assuming roomIds is an array of room IDs
    const roomsInfo = await Promise.all(
      roomIds.map(async (roomId: any) => {
        // Call the get function or a similar handler to retrieve room data
        const roomData = await convex.query(api.board.get, { id: roomId });

        // Return the needed room data (name and URL in this case)
        return {
          name: roomData?.title,
          url: `/board/${roomId}`,
        };
      })
    );

    // Example response structure
    return new Response(JSON.stringify(roomsInfo), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const dynamic = "force-dynamic";
