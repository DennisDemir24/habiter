import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);

        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        
        if (!userId) {
            return Response.json({ error: "User ID is required" }, { status: 400 });
        }

        
        const response = await sql`
            SELECT * FROM journals 
            WHERE user_id = ${userId}
            ORDER BY date DESC
        `;

        return Response.json({ data: response }, { status: 200 });
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return Response.json(
            { error: "Failed to fetch journal entries" }, 
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const body = await request.json();

        const {
            title,
            content,
            mood,
            user_id,
        } = body;
        
        if (!title || !content || !user_id) {
            return Response.json({ 
                error: "Title, content, and userId are required" 
            }, { status: 400 });
        }

        
        const response = await sql`
            INSERT INTO journals (
                title, 
                content, 
                mood, 
                date, 
                user_id
            ) 
            VALUES (
                ${title}, 
                ${content}, 
                ${mood || null}, 
                ${new Date().toISOString()}, 
                ${user_id}
            )
            RETURNING *
        `;

        return Response.json({ data: response[0]}, { status: 201 });
    } catch (error) {
        console.error("Error creating journal entry:", error);
        return Response.json(
            { error: "Failed to create journal entry" }, 
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const entryId = url.searchParams.get('id');
        const userId = url.searchParams.get('userId');
        
        if (!entryId || !userId) {
            return Response.json({ 
                error: "Entry ID and User ID are required" 
            }, { status: 400 });
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        
        // First check if the entry exists and belongs to the user
        const entry = await sql`
            SELECT * FROM journals 
            WHERE id = ${entryId} AND user_id = ${userId}
        `;

        if (entry.length === 0) {
            return Response.json({ 
                error: "Journal entry not found or unauthorized" 
            }, { status: 404 });
        }

        // Then delete it
        await sql`
            DELETE FROM journals 
            WHERE id = ${entryId}
        `;

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error deleting journal entry:", error);
        return Response.json(
            { error: "Failed to delete journal entry" }, 
            { status: 500 }
        );
    }
}
