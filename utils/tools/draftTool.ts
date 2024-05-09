import { google } from "googleapis";
import { readUserSession, getUserToken, refreshGoogleToken } from "@/utils/actions";
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// From langchain/community/dist/tools/gmail
import { CREATE_DRAFT_DESCRIPTION } from "./descriptions";

// Email to execute the draft creation
async function sendDraft(draft: any) {
    const gmail = google.gmail({ version: 'v1' });
    // Get the user session
    const { data:session } = await readUserSession();

    // If the user is logged in, continue with email fetching (this safely assume that provider token exists in db)
    if (session.session) {
        try {
        // Get the user's token from db
        const token = await getUserToken();
        
        // Create an OAuth2 client, append token
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
        );
        auth.setCredentials({ access_token: token});
        google.options({ auth });

        // Test auth with ping, if not send refresh token call to get new token
        try {
            const ping = await gmail.users.getProfile({ userId: 'me' });
        } catch (err) {
            // If the token is expired, refresh it using util function
            const tryRefresh = await refreshGoogleToken();
            if(tryRefresh){
                // Get the refreshed token from db and set it to the OAuth2 client
                const token = await getUserToken();
                auth.setCredentials({ access_token: token });
                google.options({ auth });
            } else {
                // If the refresh token fails, return an error
                return "Your refresh token failed" + err;
            }
        }
        } catch (err) {
            // If the auth fails, return an error
            return "Auth failed" + err;
        }

        try {
            const send  = await gmail.users.drafts.create({
                userId: 'me',
                requestBody: draft,
            });
            console.log("Done")
            return send.data.id;
        } catch (err) {
            return "Draft creation failed" + err;
        }
    }   
}

// Prepare the draft message to be sent
async function prepareDraftMessage(message: z.ZodString, to: z.ZodArray<z.ZodString, "many">, subject: z.ZodString, cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>, bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>) {
    const draftMessage = {
        message: {
            raw: "",
        },
    };
    const email = [
        //@ts-ignore
        `To: ${to + ", "}`,
        `Subject: ${subject}`,
        //@ts-ignore
        cc ? `Cc: ${cc + ", "}` : "",
        //@ts-ignore
        bcc ? `Bcc: ${bcc + ", "}` : "",
        "",
        message,
    ].join("\n");
    draftMessage.message.raw = Buffer.from(email).toString("base64url");
    return draftMessage;
}

// Class to create a draft tool
export class DraftTool extends StructuredTool {
    name = "DraftTool";
    description = CREATE_DRAFT_DESCRIPTION;
    schema = z.object({
      message: z.string(),
      to: z.string(),
      subject: z.string(),
      cc: z.string().optional(),
      bcc: z.string().optional(),
    });
    // Call to create a draft
    _call=async (input: z.infer<(typeof this)["schema"]>): Promise<string> => { 
        // Check if the input is valid   
        if (!input.message) {
            throw new Error("You need a message to compose a draft.");
        }
          if (!input.to) {
            throw new Error("You need a recipient to compose a draft.");
        }
          if (!input.subject) {
            throw new Error("You need a subject to compose a draft.");
        }
                
        // Prepare the draft message via the prepareDraftMessage function
        const draftMessage = await prepareDraftMessage(
            //@ts-ignore
            input.message,
            input.to,
            input.subject,
            input.cc,
            input.bcc
        );

        // Send the draft message
        const response = await sendDraft(draftMessage);

        // Return the response back to LLM
        return Promise.resolve(`This is the response: ${response}. Make sure this is included in the email draft.`)
    }
}
