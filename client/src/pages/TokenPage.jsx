import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Clock3, Hash, Ticket, Users } from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { getQueueStatus } from "../services/queueService";
import socket from "../socket/socket";

const getErrorMessage = (error) => {
  if (error instanceof TypeError) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  if (/unauthorized|token/i.test(error.message)) {
    return "Your session has expired. Please log in again.";
  }

  return error.message || "Unable to load queue information. Please try again.";
};

const formatStatus = (status) =>
  status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Unknown";

// Storage key for the token page data
const TOKEN_PAGE_STORAGE_KEY = "queueless_customer_token_page";

const getStoredTokenPage = () => {
  try {
    const stored = localStorage.getItem(TOKEN_PAGE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem(TOKEN_PAGE_STORAGE_KEY);
    return null;
  }
};

const saveStoredTokenPage = (data) => {
  try {
    localStorage.setItem(TOKEN_PAGE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
};

function TokenPage() {
  const { token } = useAuth();
  const location = useLocation();
  const { id: routeBusinessId } = useParams();
  const storedTokenPage = getStoredTokenPage();
  const initialBusinessId =
    location.state?.businessId || routeBusinessId || storedTokenPage?.businessId;
  const [businessId, setBusinessId] = useState(initialBusinessId);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialBusinessId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!businessId) {
      return undefined;
    }

    saveStoredTokenPage({ businessId });
    let isMounted = true;

    const loadQueueStatus = async (showLoading = false) => {
      if (showLoading && isMounted) {
        setLoading(true);
        setQueueStatus(null);
        setError("");
      }

      try {
        const data = await getQueueStatus(businessId, token);
        if (isMounted) {
          setQueueStatus(data);
          setError("");
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (showLoading && isMounted) {
          setLoading(false);
        }
      }
    };

    // Load initial queue status with a loading skeleton
    loadQueueStatus(true);

    // Join the Socket.IO room for the business to receive real-time updates
    socket.emit("joinBusinessRoom", businessId);

    // Listen for queue updates and refresh the status
    const handleQueueUpdated = () => {
      loadQueueStatus(false);
    };

    socket.on("queueUpdated", handleQueueUpdated);

    return () => {
      isMounted = false;
      socket.off("queueUpdated", handleQueueUpdated);
    };
  }, [businessId, token]);

  const unavailable = !businessId;
  const statusIsWaiting = queueStatus?.status === "waiting";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-5 pb-20 pt-32 sm:px-6 sm:pb-24 lg:px-8">
        <div className="absolute left-1/2 top-12 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-950/5">
              <Clock3 size={16} strokeWidth={3} />
              Live queue status
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Your Token
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Keep this page open for live updates on your place in the queue.
            </p>
          </div>

          {unavailable ? (
            <section className="mt-10 rounded-[2rem] border border-emerald-100 bg-white p-8 text-center shadow-2xl shadow-emerald-950/10 sm:p-10">
              <Ticket className="mx-auto text-emerald-600" size={34} />
              <h2 className="mt-5 text-2xl font-bold text-slate-950">
                Queue information unavailable
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Please join a queue first.
              </p>
            </section>
          ) : (
            <section className="mt-10 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-2xl shadow-emerald-950/10 sm:p-8">
              {error && (
                <p
                  role="alert"
                  className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </p>
              )}

              {loading ? (
                <div className="animate-pulse">
                  <div className="mx-auto h-4 w-40 rounded bg-emerald-100" />
                  <div className="mx-auto mt-5 h-28 w-40 rounded-3xl bg-emerald-100" />
                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <div className="h-24 rounded-2xl bg-emerald-50" />
                    <div className="h-24 rounded-2xl bg-emerald-50" />
                  </div>
                </div>
              ) : queueStatus ? (
                <>
                  <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                      {queueStatus.businessName}
                    </p>
                    <div className="mx-auto mt-5 flex h-36 w-36 items-center justify-center rounded-[2rem] bg-emerald-500 text-5xl font-extrabold text-white shadow-xl shadow-emerald-500/25 sm:h-40 sm:w-40 sm:text-6xl">
                      {queueStatus.tokenNumber}
                    </div>
                    <div className="mt-5">
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                          statusIsWaiting
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatStatus(queueStatus.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-emerald-50 p-5">
                      <div className="flex items-center gap-3 text-emerald-600">
                        <Users size={20} />
                        <span className="text-sm font-bold">People ahead</span>
                      </div>
                      <p className="mt-4 text-3xl font-extrabold text-slate-950">
                        {queueStatus.peopleAhead}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-5">
                      <div className="flex items-center gap-3 text-emerald-600">
                        <Hash size={20} />
                        <span className="text-sm font-bold">Now serving</span>
                      </div>
                      <p className="mt-4 text-3xl font-extrabold text-slate-950">
                        {queueStatus.currentServing ?? "—"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 text-center text-sm text-slate-500">
                    Queue information updates in real-time.
                  </p>
                </>
              ) : null}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default TokenPage;
