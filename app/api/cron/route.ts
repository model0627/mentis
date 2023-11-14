import { api } from "@/convex/_generated/api";

export async function GET(request: Request) {
    // const archive = useMutation(api.documents.archive);
    const cron = "Hello Cron"
    console.log(cron);

    return new Response("Hello, Cron")
}