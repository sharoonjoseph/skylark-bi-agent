const axios = require("axios");

const mondayAPI = axios.create({
  baseURL: "https://api.monday.com/v2",
  headers: {
    Authorization: process.env.MONDAY_API_TOKEN,
    "Content-Type": "application/json"
  }
});

async function queryMonday(query, variables = {}) {
  try {
    const response = await mondayAPI.post("", {
      query,
      variables
    });

    if (response.data.errors) {
      throw new Error(
        response.data.errors
          .map((error) => error.message)
          .join(", ")
      );
    }

    return response.data.data;
  } catch (error) {
    console.error(
      "Monday API error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to retrieve data from Monday.com"
    );
  }
}

async function getBoard(boardId) {
  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        id
        name

        columns {
          id
          title
          type
        }

        items_page(limit: 500) {
          items {
            id
            name

            column_values {
              id
              text
              value
            }
          }
        }
      }
    }
  `;

  const data = await queryMonday(query, {
    boardId: [boardId]
  });

  const board = data.boards?.[0];

  if (!board) {
    throw new Error("Board not found");
  }

  return {
    id: board.id,
    name: board.name,
    columns: board.columns,
    items: board.items_page.items
  };
}

async function getDeals() {
  return getBoard(
    process.env.DEALS_BOARD_ID
  );
}

async function getWorkOrders() {
  return getBoard(
    process.env.WORK_ORDERS_BOARD_ID
  );
}

module.exports = {
  getDeals,
  getWorkOrders
};
