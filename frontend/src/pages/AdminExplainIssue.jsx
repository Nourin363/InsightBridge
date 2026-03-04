import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminExplainIssue() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const token = localStorage.getItem("token");


  const cleanAI = (text) => {
    if (!text) return "";
    return text
      .replace(/###/g, "")
      .replace(/\*\*/g, "")
      .replace(/---/g, "")
      .trim();
  };


  useEffect(() => {

    if (!token) {
      navigate("/");
      return;
    }

    axios.get(
      "http://127.0.0.1:8000/api/issues/list/",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then((res) => {

      const found = res.data.find(
        (i) => i.id === Number(id)
      );

      setIssue(found);

      if (found?.explanation) {
        setExplanation(found.explanation);
      }

      setLoading(false);

    })
    .catch(() => setLoading(false));

  }, [id]);


  const generateExplanation = () => {

    setAiLoading(true);

    axios.get(
      `http://127.0.0.1:8000/api/issues/ai-explain/${id}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then((res) => {

      setExplanation(cleanAI(res.data.ai_explanation));
      setAiLoading(false);

    })
    .catch(() => setAiLoading(false));

  };


  const saveExplanation = () => {

    axios.patch(
      `http://127.0.0.1:8000/api/issues/explain/${id}/`,
      {
        explanation,
        status: "resolved"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then(() => navigate("/admin-issues"));

  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-gray-400">
        Loading issue...
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-gray-400">
        Issue not found
      </div>
    );
  }


  return (

    <div className="min-h-screen bg-[#0f172a] text-gray-200 px-6 py-10">

      <div className="max-w-5xl mx-auto space-y-8">

        <h1 className="text-3xl font-semibold text-[#7fa889]">
          System Diagnosis
        </h1>


        {/* Issue Card */}

        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 shadow-md transition hover:shadow-lg">

          <h2 className="text-lg font-semibold">
            {issue.title}
          </h2>

          <p className="text-gray-400 mt-1">
            {issue.description}
          </p>

          <div className="flex gap-2 mt-3 text-xs">

            <span className="bg-[#334155] px-3 py-1 rounded">
              {issue.category}
            </span>

            <span className="bg-[#334155] px-3 py-1 rounded">
              {issue.priority}
            </span>

            <span className="bg-[#334155] px-3 py-1 rounded">
              {issue.status}
            </span>

          </div>

        </div>


        {/* AI Diagnostic Engine */}

        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 shadow-md">

          <h3 className="text-lg font-semibold text-[#7fa889] mb-4">
            AI Diagnostic Engine
          </h3>

          <button
            onClick={generateExplanation}
            disabled={aiLoading}
            className="bg-[#6b8f71] hover:bg-[#5c7a61] px-6 py-2 rounded-md text-sm font-medium transition"
          >
            {aiLoading ? "Analyzing..." : "Generate AI Diagnosis"}
          </button>

        </div>


        {/* AI Result */}

        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 shadow-md">

          <h3 className="text-lg font-semibold text-[#7fa889] mb-4">
            AI System Diagnosis
          </h3>

          <div className="bg-[#020617] border border-[#334155] rounded-lg p-4 max-h-[420px] overflow-y-auto">

            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {explanation || "Waiting for AI analysis..."}
            </pre>

          </div>

        </div>


        {/* Buttons */}

        <div className="flex gap-4 pt-2">

          <button
            onClick={saveExplanation}
            className="bg-[#6b8f71] hover:bg-[#5c7a61] px-6 py-2 rounded-md text-sm font-medium transition"
          >
            Save Explanation
          </button>

          <button
            onClick={() => navigate("/admin-issues")}
            className="bg-[#334155] hover:bg-[#475569] px-6 py-2 rounded-md text-sm font-medium transition"
          >
            Back
          </button>

        </div>

      </div>

    </div>

  );
}