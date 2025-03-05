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
            SELECT * FROM user_profiles 
            WHERE user_id = ${userId}
        `;
        
        // If no profile exists yet, return empty data
        if (response.length === 0) {
            return Response.json({ data: null }, { status: 200 });
        }

        return Response.json({ data: response[0] }, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return Response.json(
            { error: "Failed to fetch profile" }, 
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const body = await request.json();

        const {
            user_id,
            display_name,
            bio
        } = body;
        
        if (!user_id) {
            return Response.json({ 
                error: "User ID is required" 
            }, { status: 400 });
        }

        // Check if profile already exists
        const existingProfile = await sql`
            SELECT * FROM user_profiles 
            WHERE user_id = ${user_id}
        `;

        let response;
        
        if (existingProfile.length === 0) {
            // Create new profile
            response = await sql`
                INSERT INTO user_profiles (
                    user_id,
                    display_name,
                    bio
                ) 
                VALUES (
                    ${user_id},
                    ${display_name || null},
                    ${bio || null}
                )
                RETURNING *
            `;
        } else {
            // Update existing profile
            response = await sql`
                UPDATE user_profiles
                SET 
                    display_name = ${display_name || existingProfile[0].display_name},
                    bio = ${bio || existingProfile[0].bio}
                WHERE user_id = ${user_id}
                RETURNING *
            `;
        }

        return Response.json({ data: response[0]}, { status: 201 });
    } catch (error) {
        console.error("Error saving profile:", error);
        return Response.json(
            { error: "Failed to save profile" }, 
            { status: 500 }
        );
    }
}