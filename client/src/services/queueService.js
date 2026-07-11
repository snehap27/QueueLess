import { request } from "./api";

const authenticatedHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getBusinesses = (token) =>
  request("/api/business", {
    headers: authenticatedHeaders(token),
  });

export const joinQueue = (businessId, token) =>
  request(`/api/queue/${businessId}/join`, {
    method: "POST",
    headers: authenticatedHeaders(token),
  });
