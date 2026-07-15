import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Ticket, Users, Zap } from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { getBusinesses, setQueueOpen, getQueue, serveNextCustomer } from "../services/queueService";
import socket from "../socket/socket";

// Helper function to get a user-friendly error message based on the error type or message
const getErrorMessage = (error) => {
  if (error instanceof TypeError) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  if (/unauthorized|token/i.test(error.message)) {
    return "Your session has expired. Please log in again.";
  }

  return error.message || "Unable to load your business. Please try again.";
};

// OwnerDashboard component that displays the owner's dashboard for managing their business queue
function OwnerDashboard() {
  const { token, user } = useAuth(); // Get the authentication token and user information from the useAuth hook
  const [business, setBusiness] = useState(null);
  const [queue, setQueue] = useState(null);
  const [queueLoading, setQueueLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdatingQueue, setIsUpdatingQueue] = useState(false);
  const [isServing, setIsServing] = useState(false);

  const queueCustomers = queue?.customers ?? [];
  const waitingCustomers = queueCustomers.filter((customer) => customer.status === "waiting");
  const servedCustomers = queueCustomers.filter((customer) => customer.status === "served");
  const hasWaitingCustomers = waitingCustomers.length > 0;

  // Function to load the business information for the logged-in owner
  const loadBusiness = async (isMounted = true) => {
    setError("");

    try {
      const businesses = await getBusinesses(token);

      const ownedBusiness = businesses.find(
        (item) => item.ownerId && item.ownerId === user?.id
      );

      if (isMounted) {
        console.log("Setting business:", ownedBusiness || businesses[0]); // Log the business being set for debugging purposes
        setBusiness(ownedBusiness || businesses[0] || null);
        console.log("queueOpen from API:", (ownedBusiness || businesses[0]).queueOpen); // Log the queueOpen status for debugging purposes
      }
    } catch (requestError) {
      if (isMounted) {
        setError(getErrorMessage(requestError));
      }
    }
  };

  // Function to load the queue for the business
  const loadQueue = async (businessId, isMounted = true) => {
    if (isMounted) {
      setQueueLoading(true);
      setQueue(null);
    }

    try {
      const queueData = await getQueue(businessId, token);
      if (isMounted) {
        setQueue(queueData);
      }
    } catch (requestError) {
      if (isMounted) {
        if (/queue not found/i.test(requestError.message)) {
          setQueue({ customers: [] });
        } else {
          console.error("Error loading queue:", requestError);
          setError(getErrorMessage(requestError));
        }
      }
    } finally {
      if (isMounted) {
        setQueueLoading(false);
      }
    }
  };
  
  useEffect(() => {
    console.log("Business state changed:", business);
  }, [business]);

  // Effect to load the queue whenever the business changes
  useEffect(() => {
    if (!business?._id) return;
    
    let isMounted = true;
    loadQueue(business._id, isMounted);
    
    return () => {
      isMounted = false;
    };
  }, [business?._id, token]);

  useEffect(() => {
    let isMounted = true;

    // Fetch the business information when the component mounts or when the token or user ID changes
    const fetchBusiness = async () => {
      setLoading(true);
      await loadBusiness(isMounted);
      setLoading(false);
    }

    fetchBusiness();

    return () => {
      isMounted = false;
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (!business?._id) return;

    socket.emit("joinBusinessRoom", business._id); // Join the Socket.IO room for the specific business to receive real-time updates

    // async function to handle the "queueUpdated" event from the server and reload the business information
    // await loadBusiness() is called to refresh the business data when the queue is updated
    const handleQueueUpdated = async () => {
      console.log("Queue updated!");
      await Promise.all([loadBusiness(), loadQueue(business._id)]); // Reload both business and queue information
      console.log("Business after refresh:", business);
    };

    socket.on("queueUpdated", handleQueueUpdated);

    return () => {
      socket.off("queueUpdated", handleQueueUpdated);
    };
  }, [business?._id]);

  // Function to handle the opening or closing of the queue for the business
  const handleQueueToggle = async () => {
    if (!business || isUpdatingQueue) {
      return;
    }

    setIsUpdatingQueue(true); // Set the state to indicate that the queue update is in progress
    setError("");

    // Toggle the queue open/close state for the business and update the business state accordingly
    try {
      const data = await setQueueOpen(business._id, !business.queueOpen, token);
      setBusiness(data.business);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsUpdatingQueue(false);
    }
  };

  // Function to serve the next customer in the queue
  const handleServeNext = async () => {
    if (!business || isServing) {
      return;
    }

    setIsServing(true);
    setError("");

    try {
      await serveNextCustomer(business._id, token);
      // Queue update will be handled by Socket.IO event, so we don't need to manually refresh
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsServing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-5 pb-20 pt-32 sm:px-6 sm:pb-24 lg:px-8">
        <div className="absolute left-1/2 top-12 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-950/5">
                <BarChart3 size={16} strokeWidth={3} />
                Owner dashboard
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Manage your queue
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
                Keep your customers moving with a clear view of your queue.
              </p>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-8 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}

          {loading ? (
            <div className="mt-10 animate-pulse space-y-6">
              <div className="h-52 rounded-[2rem] border border-emerald-100 bg-white" />
              <div className="grid gap-6 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 rounded-3xl border border-emerald-100 bg-white"
                  />
                ))}
              </div>
            </div>
          ) : business ? (
            <>
              <section className="mt-10 overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10">
                <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                        {business.name}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          business.queueOpen
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {business.queueOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-500">
                      Business code: {business.code}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleQueueToggle}
                    disabled={isUpdatingQueue}
                    className="inline-flex min-w-36 items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-70"
                  >
                    {isUpdatingQueue
                      ? "Updating..."
                      : business.queueOpen
                        ? "Close Queue"
                        : "Open Queue"}
                  </button>
                </div>
              </section>

              <section className="mt-8 grid gap-6 sm:grid-cols-3">
                <article className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Users size={24} strokeWidth={2.2} />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-600">
                    Waiting Customers
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950">
                    {queueLoading ? "Loading..." : waitingCustomers.length}
                  </p>
                </article>
                <article className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={24} strokeWidth={2.2} />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-600">
                    Served Today
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950">
                    {queueLoading ? "Loading..." : servedCustomers.length}
                  </p>
                </article>
                <article className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Ticket size={24} strokeWidth={2.2} />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-600">
                    Current Token
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950">
                    {business.currentToken ?? "--"}
                  </p>
                </article>
              </section>

              <section className="mt-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5 sm:p-8">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Clock3 size={24} strokeWidth={2.2} />
                  </div>
                  <button
                    type="button"
                    onClick={handleServeNext}
                    disabled={isServing || !hasWaitingCustomers}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50"
                  >
                    <Zap size={18} strokeWidth={2.2} />
                    {isServing ? "Serving..." : "Serve Next"}
                  </button>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-950">Live Queue</h2>
                
                {queueLoading ? (
                  <div className="mt-6 space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-20 rounded-3xl bg-emerald-50" />
                    ))}
                  </div>
                ) : queueCustomers.length === 0 ? (
                  <p className="mt-4 text-slate-600">No customers in queue.</p>
                ) : waitingCustomers.length === 0 ? (
                  <p className="mt-4 text-slate-600">No waiting customers.</p>
                ) : (
                  <div className="mt-5 divide-y divide-emerald-100">
                    {waitingCustomers
                      .slice()
                      .sort((a, b) => a.tokenNumber - b.tokenNumber)
                      .map((customer, index) => (
                        <div key={customer._id} className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-950">
                                Token #{customer.tokenNumber}
                              </div>
                              <div className="text-xs text-slate-600">
                                {customer.customerId?.name || "Customer"} • {customer.customerId?.email || ""}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              Waiting
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="mt-10 rounded-[2rem] border border-emerald-100 bg-white p-8 text-center shadow-2xl shadow-emerald-950/10 sm:p-10">
              <Ticket className="mx-auto text-emerald-600" size={34} />
              <h2 className="mt-5 text-2xl font-bold text-slate-950">
                No business available
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Your business will appear here once it is available.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerDashboard;
