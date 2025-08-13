import client from 'prom-client';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const showsRequests = new client.Counter({ name: 'shows_requests_total', help: 'Total /shows requests', registers: [register] });
export const seatmapRequests = new client.Counter({ name: 'seatmap_requests_total', help: 'Total /seatmap requests', registers: [register] });
export const checkoutRequests = new client.Counter({ name: 'checkout_requests_total', help: 'Total /checkout requests', registers: [register] });
export const confirmRequests = new client.Counter({ name: 'confirm_requests_total', help: 'Total /confirm requests', registers: [register] });


