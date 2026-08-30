require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  getDeals,
  getWorkOrders
} = require("./services/mondayService");

const {
  prepareDeals,
  prepareWorkOrders
} = require("./utils/normalize");

const {
  buildBusinessSummary
} = require("./analytics/businessAnalytics");

const {
  answerBusinessQuestion
} = require("./services/geminiService");

const app = express();

app.use(cors());
app.use(express.json());

async function loadData() {
  const [
    dealsBoard,
    workOrdersBoard
  ] = await Promise.all([
    getDeals(),
    getWorkOrders()
  ]);

  return {
    deals:
      prepareDeals(dealsBoard),

    workOrders:
      prepareWorkOrders(
        workOrdersBoard
      )
  };
}

app.get("/", (req, res) => {
  res.json({
    name:
      "Skylark Drones BI Agent",

    status:
      "running",

    monday:
      "connected dynamically",

    ai:
      "Gemini"
  });
});

app.get(
  "/api/summary",
  async (req, res) => {
    try {
      const {
        deals,
        workOrders
      } = await loadData();

      const summary =
        buildBusinessSummary(
          deals,
          workOrders
        );

      res.json(summary);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Unable to retrieve business data.",

        detail:
          error.message
      });
    }
  }
);

app.post(
  "/api/chat",
  async (req, res) => {
    try {
      const {
        question
      } = req.body;

      if (!question?.trim()) {
        return res
          .status(400)
          .json({
            error:
              "Please enter a business question."
          });
      }

      const {
        deals,
        workOrders
      } = await loadData();

      const summary =
        buildBusinessSummary(
          deals,
          workOrders
        );

      const answer =
        await answerBusinessQuestion(
          question,
          summary
        );

      res.json({
        question,
        answer,

        source:
          "Live Monday.com boards",

        model:
          process.env.GEMINI_MODEL,

        dataQuality: {
          deals:
            summary.deals.dataQuality,

          workOrders:
            summary.workOrders
              .dataQuality
        }
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "The BI agent could not answer this question.",

        detail:
          error.message
      });
    }
  }
);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Skylark BI Agent running on port ${PORT}`
  );
});
