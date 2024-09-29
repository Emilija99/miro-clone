import { createClerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const clerkClient = createClerkClient({
  secretKey: "sk_test_6UFiEcg2X1JdqnTjvcfrdsUo1bU14NqSgZg1wrgUjl",
});

export async function GET(request: Request) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const userIdsParam = url.searchParams.get("userIds");

    if (!userIdsParam) {
      return new Response("User IDs are required", { status: 400 });
    }

    // Split user IDs by comma
    const userIds = userIdsParam.split(",");
    // Fetch users from Clerk
    const usersList = await clerkClient.users.getUserList({
      userId: userIds,
      limit: 500,
    });

    // Example response structure
    return new Response(JSON.stringify(usersList), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const dynamic = "force-dynamic";
