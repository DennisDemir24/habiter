import { neon } from "@neondatabase/serverless";

export async function PUT(request: Request, context: any) {
    try {
        console.log("Request URL:", request.url);
        console.log("Context:", JSON.stringify(context));
        
        // Extract the habit ID from the URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const habitId = pathParts[pathParts.length - 1];
        
        console.log("Extracted habitId from URL:", habitId);
        
        if (!habitId) {
            return Response.json({ error: "Habit ID is required" }, { status: 400 });
        }

        const body = await request.json();
        console.log("Request body:", JSON.stringify(body));
        
        const sql = neon(`${process.env.DATABASE_URL}`);
        
        // Execute the update query using a simpler approach
        let updated;
        
        // Handle the completed field specifically since it's the main one we're updating
        if ('completed' in body) {
            // Ensure completed is treated as a boolean
            const completedValue = Boolean(body.completed);
            
            console.log(`Updating habit ${habitId} completed status to:`, completedValue);
            
            try {
                updated = await sql`
                    UPDATE habits 
                    SET completed = ${completedValue}
                    WHERE id = ${habitId}::integer
                    RETURNING *
                `;
                console.log("Update result:", updated);
            } catch (sqlError) {
                console.error("SQL Error:", sqlError);
                throw sqlError;
            }
        } else {
            // For other fields, we'll need to handle them individually
            // This is a simplified approach - add more fields as needed
            if ('title' in body) {
                updated = await sql`
                    UPDATE habits 
                    SET title = ${body.title}
                    WHERE id = ${habitId}::integer
                    RETURNING *
                `;
            } else if ('description' in body) {
                updated = await sql`
                    UPDATE habits 
                    SET description = ${body.description}
                    WHERE id = ${habitId}::integer
                    RETURNING *
                `;
            } else if ('priority' in body) {
                updated = await sql`
                    UPDATE habits 
                    SET priority = ${body.priority}
                    WHERE id = ${habitId}::integer
                    RETURNING *
                `;
            } else if ('interval' in body) {
                updated = await sql`
                    UPDATE habits 
                    SET interval = ${body.interval}
                    WHERE id = ${habitId}::integer
                    RETURNING *
                `;
            }
        }
        
        if (!updated || updated.length === 0) {
            return Response.json({ error: "Habit not found or no fields updated" }, { status: 404 });
        }

        return Response.json({ data: updated[0] }, { status: 200 });
    } catch (error) {
        console.error("Error updating habit:", error);
        // Log more details about the error
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        
        return Response.json(
            { error: "Failed to update habit", details: error instanceof Error ? error.message : String(error) }, 
            { status: 500 }
        );
    }
} 