export default function handler(req, res) {

    // Salesforce dual-write now happens on hollyburnapi after the Graph invite.
    res.status(200).json({
        result: true
    });

}
