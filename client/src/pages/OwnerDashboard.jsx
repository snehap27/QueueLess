import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock3, Ticket, Users } from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import {
  getBusinesses,
  getQueue,
  serveNextCustomer,
  setQueueOpen,
} from "../services/queueService";

const getErrorMessage = (error) => {
  if (error instanceof TypeError) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  if (/unauthorized|token/i.test(error.message)) {
    return "Your session has expired. Please log in again.";
  }

  return error.message || "Something went wrong. Please try again.";
};

const formatJoinedTime = (joinedAt) => {
  if (!joinedAt || Number.isNaN(new Date(joinedAt).getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(joinedAt));
};

const statusBadgeClasses = {
  waiting: "bg-amber-50 text-amber-700",
  served: "bg-emerald-50 text-emerald-700",
  skipped: "bg-slate-100 text-slate-600",
};

function OwnerDashboard() {
  const { token, user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdatingQueue, setIsUpdatingQueue] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [isServing, setIsServing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadBusiness = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getBusinesses(token);
        const businesses = Array.isArray(data) ? data : [data];
        const ownedBusiness = businesses.find(
          (item) => item.ownerId && item.ownerId === user?.id
        );

        if (isMounted) {
          setBusiness(ownedBusiness || businesses[0] || null);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBusiness();

    return () => {
      isMounted = false;
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (!business?._id) {
      return undefined;
    }

    let isMounted = true;

    const loadQueue = async () => {
      setQueueLoading(true);

      try {
        const queue = await getQueue(business._id, token);
        if (isMounted) {
          setCustomers(queue.customers || []);
        }
      } catch (requestError) {
        if (isMounted) {
          if (/queue not found/i.test(requestError.message)) {
            setCustomers([]);
          } else {
            setError(getErrorMessage(requestError));
          }
        }
      } finally {
        if (isMounted) {
          setQueueLoading(false);
        }
      }
    };

    loadQueue();

    return () => {
      isMounted = false;
    };
  }, [business?._id, token]);

  const handleQueueToggle = async () => {
    if (!business || isUpdatingQueue) {
      return;
    }

    setIsUpdatingQueue(true);
    setError("");

    try {
      const data = await setQueueOpen(business._id, !business.queueOpen, token);
      setBusiness(data.business);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsUpdatingQueue(false);
    }
  };

  const refreshQueue = async () => {
    if (!business) {
      return;
    }

    const queue = await getQueue(business._id, token);
    setCustomers(queue.customers || []);
  };

  const handleServeNextCustomer = async () => {
    if (!business || isServing) {
      return;
    }

    setIsServing(true);
    setError("");
    setSuccessMessage("");

    try {
      await serveNextCustomer(business._id, token);
      await refreshQueue();
      setSuccessMessage("The next customer has been served.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsServing(false);
    }
  };

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => a.tokenNumber - b.tokenNumber),
    [customers]
  );
  const waitingCustomers = customers.filter(
    (customer) => customer.status === "waiting"
  ).length;
  const servedCustomers = customers.filter(
    (customer) => customer.status === "served"
  ).length;

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

          {successMessage && (
            <p
              role="status"
              className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
            >
              {successMessage}
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
                    {waitingCustomers}
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
                    {servedCustomers}
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
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Clock3 size={24} strokeWidth={2.2} />
                    </div>
                    <h2 className="mt-5 text-xl font-bold text-slate-950">Live Queue</h2>
                    <p className="mt-2 leading-7 text-slate-600">
                      Customers are shown in token order.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleServeNextCustomer}
                    disabled={isServing || waitingCustomers === 0}
                    className="inline-flex min-w-48 items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-70"
                  >
                    {isServing ? "Serving..." : "Serve Next Customer"}
                  </button>
                </div>

                {queueLoading ? (
                  <div className="mt-8 space-y-3 animate-pulse">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-14 rounded-2xl bg-emerald-50" />
                    ))}
                  </div>
                ) : sortedCustomers.length === 0 ? (
                  <p className="mt-8 rounded-2xl bg-emerald-50 px-4 py-4 text-sm font-medium text-slate-600">
                    No customers are currently in the queue.
                  </p>
                ) : (
                  <>
                    {waitingCustomers === 0 && (
                      <p className="mt-8 rounded-2xl bg-emerald-50 px-4 py-4 text-sm font-medium text-slate-600">
                        No customers are waiting.
                      </p>
                    )}
                    <div className="mt-8 overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead className="border-b border-emerald-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Token</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50 text-sm">
                          {sortedCustomers.map((customer) => (
                            <tr key={customer._id || customer.tokenNumber}>
                              <td className="whitespace-nowrap px-4 py-4 font-bold text-emerald-700">
                                #{customer.tokenNumber}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                                {customer.customerId?.name || "--"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                                {customer.customerId?.email || "--"}
                              </td>
                              <td className="whitespace-nowrap px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    statusBadgeClasses[customer.status] ||
                                    "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {customer.status
                                    ? `${customer.status.charAt(0).toUpperCase()}${customer.status.slice(1)}`
                                    : "Unknown"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                                {formatJoinedTime(customer.joinedAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
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
