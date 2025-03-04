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

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, userId, ...updates } = body;

        if (!id || !userId) {
            return Response.json({ error: "Habit ID and User ID are required" }, { status: 400 });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        
        // First verify the habit belongs to the user
        const habit = await sql`
            SELECT * FROM habits 
            WHERE id = ${id} AND user_id = ${userId}
        `;

        if (habit.length === 0) {
            return Response.json({ error: "Habit not found or unauthorized" }, { status: 404 });
        }

        // Handle each field individually to avoid dynamic SQL construction issues
        let updated;
        
        // Check which fields are being updated and handle them
        if ('title' in updates) {
            updated = await sql`
                UPDATE habits 
                SET title = ${updates.title}
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *
            `;
        } else if ('description' in updates) {
            updated = await sql`
                UPDATE habits 
                SET description = ${updates.description}
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *
            `;
        } else if ('completed' in updates) {
            updated = await sql`
                UPDATE habits 
                SET completed = ${updates.completed}
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *
            `;
        } else if ('tags' in updates) {
            const tagsJson = JSON.stringify(updates.tags);
            updated = await sql`
                UPDATE habits 
                SET tags = ${tagsJson}
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *
            `;
        } else if ('frequency' in updates) {
            updated = await sql`
                UPDATE habits 
                SET frequency = ${updates.frequency}
                WHERE id = ${id} AND user_id = ${userId}
                RETURNING *
            `;
        } else {
            return Response.json({ error: "No valid fields to update" }, { status: 400 });
        }

        return Response.json({ data: updated[0] }, { status: 200 });
    } catch (error) {
        console.error("Error updating habit:", error);
        return Response.json(
            { error: "Failed to update habit" }, 
            { status: 500 }
        );
    }
}