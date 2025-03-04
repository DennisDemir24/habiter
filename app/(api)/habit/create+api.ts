import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const body = await request.json();
        const {
            title,
            description,
            color,
            icon,
            completed,
            tags,
            frequency,
            interval,
            priority,
            created_at,
            user_id
        } = body;

        // We'll use the user_id passed in the request body
        if (!title || !description || completed === undefined || !frequency || !created_at || !user_id) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const response = await sql`
            INSERT INTO habits(
                title,
                description,
                color,
                icon,
                frequency,
                interval,
                priority,
                completed,
                created_at,
                user_id
            )
            VALUES(
                ${title},
                ${description || null},
                ${color || null},
                ${icon || 'star'},
                ${frequency},
                ${interval || null},
                ${priority || null},
                ${false},
                ${new Date().toISOString()},
                ${user_id}
            )
            RETURNING *
        `

        return Response.json({ data: response[0] }, { status: 201 })

    } catch (error) {
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
}