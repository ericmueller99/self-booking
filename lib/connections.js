import {hollyburnApi} from "./hollyburn-api";

export async function getCalendarEventByManageKey(manageKey) {
    try {
        const {data} = await hollyburnApi().get('/leads/booking-by-manage-key', {
            params: { manageKey }
        });
        if (!data?.result || !data.booking || !data.booking.eventId) {
            return {
                result: false,
                booking: null
            };
        }
        return {
            result: true,
            booking: data.booking
        };
    }
    catch (error) {
        return Promise.reject(error);
    }
}
