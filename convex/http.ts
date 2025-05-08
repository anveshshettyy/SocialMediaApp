import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
    path:"/clerk-webhook",
    method:"POST",
    handler: httpAction(async(ctx, request) => {
        console.log("Received webhook request");
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if(!webhookSecret) {
            console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
            throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
        }

        const svix_id = request.headers.get("svix-id");
        const svix_signature = request.headers.get("svix-signature");
        const svix_timestamp = request.headers.get("svix-timestamp");

        if(!svix_id || !svix_signature || !svix_timestamp) {
            console.error("Missing svix headers", { svix_id, svix_signature, svix_timestamp });
            return new Response("Error occurred -- no svix headers", {
                status: 400,
            })
        }

        const payload = await request.json();
        const body = JSON.stringify(payload);
        console.log("Webhook payload:", payload);

        const wh = new Webhook(webhookSecret);
        let evt: any;
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as any;
        } catch (error) {
            console.error("Error verifying webhook:", error);
            return new Response("Error occurred", {status: 400});
        }

        const eventType = evt.type;
        console.log("Webhook event type:", eventType);

        if(eventType === "user.created") {
            const {id, email_addresses, first_name, last_name, image_url} = evt.data;
            console.log("User creation data:", { id, email_addresses, first_name, last_name, image_url });
            const email = email_addresses[0].email_address;
            const name = `${first_name || ""} ${last_name || ""}`.trim();

            try {
                await ctx.runMutation(api.users.createUser, {
                    email,
                    fullname: name,
                    image: image_url,
                    clerkId: id,
                    username: email.split("@")[0],
                })
                console.log("Successfully created user in Convex");
            } catch (error) {
                console.error("Error creating user: ", error);
                return new Response("Error creating user", { status: 500 });
            }
        }

        return new Response("Webhook processed successfully", { status: 200 });
    })
})

export default http;