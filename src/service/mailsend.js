import axios from "axios";

export const sendSellerEmail = async ({
    userName,
    userEmail,
    templateId,
    reason = ""
}) => {
    try {
        const time = new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        const payload = {
            recipients: [
                {
                    to: [{ name: userName, email: userEmail }],
                    variables: {
                        userName,
                        reason,
                        time,
                        year: new Date().getFullYear()
                    }
                }
            ],
            from: {
                name: "Lionies",
                email: "info@lionies.com"
            },
            domain: "mail.sevenunique.com",
            template_id: templateId
        };

        await axios.post(
            "https://control.msg91.com/api/v5/email/send",
            payload,
            {
                headers: {
                    authkey: process.env.MSG91_AUTH_KEY,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (err) {
        console.log("Email error", err.message);
    }
};
