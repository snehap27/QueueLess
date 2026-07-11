import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, Search, Ticket } from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { getBusinesses, joinQueue } from "../services/queueService";

const getErrorMessage = (error) => {
  if (error instanceof TypeError) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  if (error.message === "Queue is closed") {
    return "This queue is currently closed.";
  }

  if (error.message === "You are already in this queue") {
    return "You are already in this queue.";
  }

  if (/unauthorized|token/i.test(error.message)) {
    return "Your session has expired. Please log in again.";
  }

  return error.message || "Something went wrong. Please try again.";
};

function JoinQueue() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningBusinessId, setJoiningBusinessId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadBusinesses = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getBusinesses(token);
        if (isMounted) {
          setBusinesses(data);
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

    loadBusinesses();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleJoinQueue = async (businessId) => {
    setJoiningBusinessId(businessId);
    setError("");

    try {
      const { tokenNumber } = await joinQueue(businessId, token);
      navigate("/customer/token", {
        state: { businessId, tokenNumber },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setJoiningBusinessId(null);
    }
  };

  const visibleBusinesses = businesses.filter((business) => {
    const searchValue = searchTerm.trim().toLowerCase();

    return (
      !searchValue ||
      business.name.toLowerCase().includes(searchValue) ||
      business.code.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-5 pb-14 pt-32 sm:px-6 sm:pb-16 lg:px-8">
          <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl sm:h-96 sm:w-96" />

          <div className="mx-auto max-w-7xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-950/5">
              <Clock3 size={16} strokeWidth={3} />
              Find a queue near you
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Join a queue without the wait.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Choose a business, take your digital token, and arrive when it is
              your turn.
            </p>

            <div className="mx-auto mt-9 max-w-2xl">
              <label className="sr-only" htmlFor="business-search">
                Search businesses
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-xl shadow-emerald-950/5 ring-1 ring-emerald-950/5 transition focus-within:border-emerald-300 focus-within:ring-emerald-200">
                <Search className="shrink-0 text-emerald-600" size={21} />
                <input
                  id="business-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by business name or code"
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white pb-20 sm:pb-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            {error && (
              <p
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-64 animate-pulse rounded-3xl border border-emerald-100 bg-emerald-50"
                  />
                ))}
              </div>
            ) : visibleBusinesses.length === 0 ? (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 px-6 py-14 text-center">
                <Ticket className="mx-auto text-emerald-600" size={30} />
                <h2 className="mt-4 text-xl font-bold text-slate-950">
                  {businesses.length === 0
                    ? "No businesses are available right now."
                    : "No matching businesses found."}
                </h2>
                <p className="mt-2 text-slate-600">
                  {businesses.length === 0
                    ? "Please check back again soon."
                    : "Try searching by a different name or business code."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleBusinesses.map((business) => {
                  const isJoining = joiningBusinessId === business._id;
                  const isOpen = business.queueOpen;

                  return (
                    <article
                      key={business._id}
                      className="flex flex-col rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <Ticket size={24} strokeWidth={2.2} />
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            isOpen
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isOpen ? "Open" : "Closed"}
                        </span>
                      </div>

                      <h2 className="mt-6 text-xl font-bold text-slate-950">
                        {business.name}
                      </h2>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Business code: {business.code}
                      </p>

                      <div className="mt-6 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                        <span className="text-sm font-medium text-slate-600">
                          Current token
                        </span>
                        <span className="text-lg font-bold text-emerald-700">
                          {business.currentToken ?? 0}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleJoinQueue(business._id)}
                        disabled={isJoining}
                        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-70"
                      >
                        {isJoining ? "Joining..." : "Join Queue"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default JoinQueue;
