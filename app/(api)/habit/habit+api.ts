import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        
        if (!userId) {
            return Response.json({ error: "User ID is required" }, { status: 400 });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        
        const response = await sql`
            SELECT * FROM habits 
            WHERE user_id = ${userId}
        `;

        return Response.json({ data: response }, { status: 200 });
    } catch (error) {
        console.error("Error fetching habits:", error);
        return Response.json(
            { error: "Failed to fetch habits" }, 
            { status: 500 }
        );
    }
}

// You can also add other HTTP methods here if needed
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const habitId = url.searchParams.get('habitId');
        const userId = url.searchParams.get('userId');

        if (!habitId || !userId) {
            return Response.json({ error: "Habit ID and User ID are required" }, { status: 400 });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        
        // First verify the habit belongs to the user
        const habit = await sql`
            SELECT * FROM habits 
            WHERE id = ${habitId} AND user_id = ${userId}
        `;

        if (habit.length === 0) {
            return Response.json({ error: "Habit not found or unauthorized" }, { status: 404 });
        }

        // Then delete it
        await sql`
            DELETE FROM habits 
            WHERE id = ${habitId}
        `;

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting habit:", error);
        return Response.json(
            { error: "Failed to delete habit" }, 
            { status: 500 }
        );
    }
}
