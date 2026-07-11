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

export const getQueueStatus = (businessId, token) =>
  request(`/api/queue/${businessId}/status`, {
    headers: authenticatedHeaders(token),
  });

export const setQueueOpen = (businessId, shouldOpen, token) =>
  request(`/api/business/${businessId}/${shouldOpen ? "open" : "close"}`, {
    method: "PATCH",
    headers: authenticatedHeaders(token),
  });

export const getQueue = (businessId, token) =>
  request(`/api/queue/${businessId}`, {
    headers: authenticatedHeaders(token),
  });

export const serveNextCustomer = (businessId, token) =>
  request(`/api/queue/${businessId}/serve`, {
    method: "PATCH",
    headers: authenticatedHeaders(token),
  });
