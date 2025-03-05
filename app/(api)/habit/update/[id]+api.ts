import { neon } from "@neondatabase/serverless";

export async function PUT(request: Request, context: any) {
    try {
        // Extract the habit ID from the URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const habitId = pathParts[pathParts.length - 1];
        
        
        if (!habitId) {
            return Response.json({ error: "Habit ID is required" }, { status: 400 });
        }

        const body = await request.json();
        
        const sql = neon(`${process.env.DATABASE_URL}`);
        
        // Execute the update query using a simpler approach
        let updated;
        
        // Handle the completed field specifically since it's the main one we're updating
        if ('completed' in body) {
            // Ensure completed is treated as a boolean
            const completedValue = Boolean(body.completed);
            
            
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
            // For other fields, we need to handle multiple fields in a single update
            try {
                // Create an object with the fields to update
                const updateData: Record<string, any> = {};
                
                // Add each field to be updated
                if ('title' in body) updateData.title = body.title;
                if ('description' in body) updateData.description = body.description;
                if ('priority' in body) updateData.priority = body.priority;
                if ('interval' in body) updateData.interval = body.interval;
                
                // Only proceed if there are fields to update
                if (Object.keys(updateData).length > 0) {
                    // Construct the SQL query dynamically based on the fields to update
                    if ('title' in updateData && 'description' in updateData && 'priority' in updateData && 'interval' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                title = ${updateData.title},
                                description = ${updateData.description},
                                priority = ${updateData.priority},
                                interval = ${updateData.interval}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('title' in updateData && 'description' in updateData && 'priority' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                title = ${updateData.title},
                                description = ${updateData.description},
                                priority = ${updateData.priority}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('title' in updateData && 'description' in updateData && 'interval' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                title = ${updateData.title},
                                description = ${updateData.description},
                                interval = ${updateData.interval}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('title' in updateData && 'priority' in updateData && 'interval' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                title = ${updateData.title},
                                priority = ${updateData.priority},
                                interval = ${updateData.interval}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('description' in updateData && 'priority' in updateData && 'interval' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                description = ${updateData.description},
                                priority = ${updateData.priority},
                                interval = ${updateData.interval}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('title' in updateData && 'description' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                title = ${updateData.title},
                                description = ${updateData.description}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('title' in updateData && 'priority' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                title = ${updateData.title},
                                priority = ${updateData.priority}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('title' in updateData && 'interval' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                title = ${updateData.title},
                                interval = ${updateData.interval}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('description' in updateData && 'priority' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                description = ${updateData.description},
                                priority = ${updateData.priority}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('description' in updateData && 'interval' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                description = ${updateData.description},
                                interval = ${updateData.interval}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('priority' in updateData && 'interval' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET 
                                priority = ${updateData.priority},
                                interval = ${updateData.interval}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('title' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET title = ${updateData.title}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('description' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET description = ${updateData.description}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('priority' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET priority = ${updateData.priority}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    } else if ('interval' in updateData) {
                        updated = await sql`
                            UPDATE habits 
                            SET interval = ${updateData.interval}
                            WHERE id = ${habitId}::integer
                            RETURNING *
                        `;
                    }
                    
                    console.log("Update result:", updated);
                } else {
                    return Response.json({ error: "No fields provided for update" }, { status: 400 });
                }
            } catch (sqlError) {
                console.error("SQL Error:", sqlError);
                throw sqlError;
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