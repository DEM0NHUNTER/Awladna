// src/pages/Dashboard.tsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChatContext } from "../context/ChatContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

/**
 * Dashboard component showing personalized data, navigation, and analytics.
 */
const Dashboard: React.FC = () => {
  const { user, children } = useAuth();               // Access current user and child profiles
  const { chats } = useChatContext();                 // Access chat session data
  const [analytics, setAnalytics] = useState<any>(null);            // Feedback analytics data
  const [recommendations, setRecommendations] = useState<any[]>([]); // Personalized recommendations
  const navigate = useNavigate();                                  // Navigation hook

  const today = format(new Date(), "EEEE, MMMM d");   // Format current date for UI

  /**
   * Fetch dashboard data: feedback analytics & recommendations
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, recsRes] = await Promise.all([
          axiosInstance.get("/auth/analytics/feedback-analytics"),            // Fetch feedback analytics
          children?.[0]?.child_id                                             // If child profile exists, fetch recommendations
            ? axiosInstance.get("/auth/recommendation/", {
                params: { child_id: children[0].child_id },                   // Send child_id
              })
            : Promise.resolve({ data: [] }),                                  // Else, empty recommendations
        ]);

        setAnalytics(analyticsRes.data);
        setRecommendations(recsRes.data?.slice(0, 2) || []);   // Limit to 2 recommendations
      } catch (err) {
        console.error("Dashboard data load failed", err);
      }
    };

    fetchDashboardData();
  }, []);   // Run once on mount

  return (
    <div className="min-h-screen bg-indigo-50 p-6 text-gray-800">

      {/* 1. Welcome Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          Welcome back, {user?.name || user?.email}!
          <span className="text-red-500">❤️</span>
        </h1>
        <p className="text-gray-500 mt-1">{today}</p>
      </header>

      {/* 2. Introduction Cards */}
      <section className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-2">What Awladna Offers</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Personalized guidance</li>
            <li>Child-specific advice</li>
            <li>AI-powered parenting help</li>
            <li>Expert-driven recommendations</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-2">Your Parenting Journey</h2>
          <p className="text-sm text-gray-600">
            Awladna supports you with tailored insights and proven strategies.
          </p>
          <div className="mt-3 text-red-500 font-medium flex items-center gap-1">
            <span>Trusted by parents</span> ❤️
          </div>
        </div>
      </section>

      {/* 3. Navigation Cards */}
      <section className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { title: "Chat", desc: "Get instant help and AI-powered parenting support.", icon: "💬", path: "/chat" },
          { title: "Profile", desc: "Manage your child profiles and preferences.", icon: "👤", path: "/profile" },
          { title: "Feedback", desc: "Share your experience and help us improve.", icon: "⭐", path: "/feedback" }
        ].map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}                          // Navigate on click
            className="cursor-pointer bg-white rounded-2xl shadow p-6 transition hover:bg-indigo-100 group"
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.desc}</p>
            <ArrowRight className="mt-2 text-indigo-400 group-hover:translate-x-1 transition" />
          </div>
        ))}
      </section>

      {/* 4. Quick Stats */}
      <section className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-indigo-100 rounded-2xl p-6 shadow text-center">
          <p className="text-5xl font-bold">{children?.length || 0}</p>
          <p className="text-sm text-gray-700 mt-1">Children Profiles</p>
        </div>
        <div className="bg-indigo-100 rounded-2xl p-6 shadow text-center">
          <p className="text-5xl font-bold">{chats?.length || 0}</p>
          <p className="text-sm text-gray-700 mt-1">Chat Sessions</p>
        </div>
      </section>

      {/* 5. Role-Specific Content */}
      {user?.role === "admin" ? (
        // Admin view: shows raw analytics
        <section className="bg-white rounded-2xl p-6 shadow mb-10">
          <h2 className="text-lg font-bold mb-3">Admin Analytics Overview</h2>
          <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(analytics, null, 2)}
          </pre>
        </section>
      ) : (
        <>
          {/* User view: Recommendations */}
          <section className="bg-white rounded-2xl p-6 shadow mb-10">
            <h2 className="text-lg font-bold mb-3">Personalized Recommendations</h2>
            {recommendations?.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div key={idx} className="border-l-4 border-indigo-400 pl-4 mb-4">
                  <h3 className="font-semibold text-indigo-700">{rec.title}</h3>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recommendations available.</p>
            )}
          </section>

          {/* User view: Feedback Summary */}
          <section className="bg-white rounded-2xl p-6 shadow mb-10">
            <h2 className="text-lg font-bold mb-3">Feedback Summary</h2>
            {analytics ? (
              <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-700">
                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-indigo-600">{analytics.total_feedback}</p>
                  <p>Total Feedback</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-indigo-600">{analytics.average_rating}⭐</p>
                  <p>Average Rating</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-indigo-600">{analytics.improvement_rate}</p>
                  <p>Improvement Rate</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No analytics data available yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
