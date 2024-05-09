import { google } from "googleapis";
import { readUserSession, getUserToken, refreshGoogleToken } from "@/utils/actions";
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// From langchain/community/dist/tools/gmail
import { SEND_MESSAGE_DESCRIPTION } from "./descriptions";

// Email to execute the draft creation
async function sendEmail(draft: any) {
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
            const send  = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {raw: draft}
            });
            return send.data.id;
        } catch (err) {
            console.log(err)
            return "Send email failed" + err;
        }
    }   
}

// Prepare the draft message to be sent
async function createEmailMessage({ message, to, subject, cc, bcc, }: { message: z.ZodString, to: z.ZodArray<z.ZodString, "many">, subject: z.ZodString, cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>, bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>}) {
    const emailLines = [];
    // Format the recipient(s)
    const formatEmailList = (emails) => Array.isArray(emails) ? emails.join(",") : emails;
    emailLines.push(`To: ${formatEmailList(to)}`);
    if (cc)
        emailLines.push(`Cc: ${formatEmailList(cc)}`);
    if (bcc)
        emailLines.push(`Bcc: ${formatEmailList(bcc)}`);
    emailLines.push(`Subject: ${subject}`);
    emailLines.push("");
    emailLines.push(message);
    // Convert the email message to base64url string
    const email = emailLines.join("\r\n").trim();
    // this encode may be an issue
    return Buffer.from(email).toString("base64url");
}

// Class to create a draft tool
export class SendNewEmail extends StructuredTool {
    schema: z.ZodObject<{
        message: z.ZodString;
        to: z.ZodArray<z.ZodString, "many">;
        subject: z.ZodString;
        confirm: z.ZodString | undefined;
        cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        subject: string;
        to: string[];
        confirm: z.ZodString | undefined;
        cc?: string[] | undefined;
        bcc?: string[] | undefined;
    }, {
        message: string;
        subject: string;
        to: string[];
        confirm: z.ZodString | undefined;
        cc?: string[] | undefined;
        bcc?: string[] | undefined;
    }>;
    name: string;
    description: string;

    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "sendNewEmail"
        });
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: z.object({
                message: z.string(),
                to: z.array(z.string()),
                subject: z.string(),
                confirm: z.string().describe('Leave blank'),
                cc: z.array(z.string()).optional(),
                bcc: z.array(z.string()).optional(),
            })
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: SEND_MESSAGE_DESCRIPTION
        });
    }

    _call({ message, to, subject, confirm, cc, bcc, }: z.output<typeof this.schema>): Promise<string>;
    async _call({ message, to, subject, confirm, cc, bcc, }) {
        console.log(confirm)
        if (!confirm || confirm !== "confirm") {
            const errorMessage = `
            ERRROR! Do not return a success statement. Do not return a success statement. Please confirm the email by typing 'confirm' in the confirm field.
            ERRROR! Do not return a success statement. Do not return a success statement. Please confirm the email by typing 'confirm' in the confirm field.
            ERRROR! Do not return a success statement. Do not return a success statement. Please confirm the email by typing 'confirm' in the confirm field.
            In this error message, please include the email subject and content so that the user can confirm the email.
            `
            return Promise.resolve(errorMessage);
        }
        
        // Prepare the draft message via the prepareDraftMessage function
        const newMessage = await createEmailMessage({
            message,
            to,
            subject,
            cc,
            bcc
    });
        // Send the draft message
        const response = await sendEmail(newMessage);

        // Return the response back to LLM
        return Promise.resolve(`This is the response: ${response}. Make sure this is included in the email draft.`)
    }
}
