import {
  useEffect,
  useState
} from "react";

import "./index.css";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function formatMoney(value) {
  if (!value) {
    return "₹0";
  }

  if (value >= 10000000) {
    return `₹${(
      value / 10000000
    ).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(
      value / 100000
    ).toFixed(2)} L`;
  }

  return `₹${Math.round(
    value
  ).toLocaleString("en-IN")}`;
}

function App() {
  const [
    summary,
    setSummary
  ] = useState(null);

  const [
    question,
    setQuestion
  ] = useState("");

  const [
    messages,
    setMessages
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const response =
        await fetch(
          `${API}/api/summary`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error
        );
      }

      setSummary(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function askAgent(
    presetQuestion
  ) {
    const text =
      presetQuestion ||
      question.trim();

    if (!text || loading) {
      return;
    }

    setMessages((old) => [
      ...old,
      {
        role: "user",
        text
      }
    ]);

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `${API}/api/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                question: text
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.error
        );
      }

      setMessages((old) => [
        ...old,
        {
          role:
            "assistant",

          text:
            data.answer
        }
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "How is our pipeline looking?",
    "Which sector has the strongest pipeline?",
    "How are our work orders performing?",
    "Compare sales and execution across sectors.",
    "Prepare a leadership update."
  ];

  return (
    <div className="page">

      <header>

        <div>
          <p className="eyebrow">
            SKYLARK DRONES
          </p>

          <h1>
            Business Intelligence Agent
          </h1>

          <p className="subtitle">
            Founder-level insights
            from live Monday.com data
            powered by Gemini
          </p>
        </div>

        <div className="live">
          ● Monday Live
        </div>

      </header>

      {summary && (
        <section className="cards">

          <div className="card">

            <span>
              Active Pipeline
            </span>

            <strong>
              {formatMoney(
                summary.deals
                  .pipelineValue
              )}
            </strong>

          </div>

          <div className="card">

            <span>
              Active Deals
            </span>

            <strong>
              {
                summary.deals
                  .activeDeals
              }
            </strong>

          </div>

          <div className="card">

            <span>
              Work Orders
            </span>

            <strong>
              {
                summary.workOrders
                  .totalWorkOrders
              }
            </strong>

          </div>

          <div className="card">

            <span>
              Completion Rate
            </span>

            <strong>
              {
                summary.workOrders
                  .completionRate
              }
              %
            </strong>

          </div>

        </section>
      )}

      <main>

        <h2>
          Ask the BI Agent
        </h2>

        <div className="suggestions">

          {suggestions.map(
            (suggestion) => (

              <button
                key={suggestion}

                onClick={() =>
                  askAgent(
                    suggestion
                  )
                }
              >
                {suggestion}
              </button>

            )
          )}

        </div>

        <section className="messages">

          {messages.length === 0 && (
            <div className="empty">
              Ask a founder-level
              business question.
            </div>
          )}

          {messages.map(
            (message, index) => (

              <div
                key={index}

                className={
                  message.role
                }
              >

                <b>
                  {message.role ===
                  "user"
                    ? "You"
                    : "BI Agent"}
                </b>

                <p>
                  {message.text}
                </p>

              </div>

            )
          )}

          {loading && (

            <div className="assistant">
              Gemini is analysing
              live Monday.com data...
            </div>

          )}

        </section>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <div className="input">

          <textarea
            value={question}

            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }

            placeholder="Ask about pipeline, sectors, revenue, execution..."
          />

          <button
            onClick={() =>
              askAgent()
            }
          >
            Ask Agent
          </button>

        </div>

      </main>

    </div>
  );
}

export default App;
