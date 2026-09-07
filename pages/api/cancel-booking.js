import {hollyburnApi, apiErrorMessage} from "../../lib/hollyburn-api";

export default function handler(req, res) {

    if (req.method !== 'POST') {
        res.status(400).json({
            result: false,
            errorMessage: "unsupported method type"
        });
        return;
    }

    const {eventId} = req.body;
    if (!eventId) {
        res.status(400).json({
            result: false,
            errorMessage: "eventId is required"
        });
        return;
    }

    hollyburnApi()
        .post('/leads/cancel-booking', { eventId })
        .then(() => {
            res.status(200).json({
                result: true
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                result: false,
                errorMessage: apiErrorMessage(error, "unknown internal error")
            });
        });

}
