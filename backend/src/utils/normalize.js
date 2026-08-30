function cleanText(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text = String(value).trim();

  if (
    text === "" ||
    text.toLowerCase() === "null" ||
    text.toLowerCase() === "n/a" ||
    text.toLowerCase() === "na" ||
    text.toLowerCase() === "nan"
  ) {
    return null;
  }

  return text;
}

function parseNumber(value) {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  const cleaned = text
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/%/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
}

function normalizeSector(value) {
  const text = cleanText(value);

  if (!text) {
    return "Unknown";
  }

  const lower = text.toLowerCase();

  const mapping = {
    renewable: "Renewables",
    renewables: "Renewables",
    railway: "Railways",
    railways: "Railways",
    mining: "Mining",
    construction: "Construction",
    aviation: "Aviation",
    manufacturing: "Manufacturing",
    other: "Others",
    others: "Others"
  };

  return mapping[lower] || text;
}

function boardToRows(board) {
  const titleMap = {};

  board.columns.forEach((column) => {
    titleMap[column.id] = column.title;
  });

  return board.items.map((item) => {
    const row = {
      __id: item.id,
      __name: cleanText(item.name)
    };

    item.column_values.forEach((column) => {
      const title =
        titleMap[column.id] || column.id;

      row[title] =
        cleanText(column.text);
    });

    return row;
  });
}

function prepareDeals(board) {
  return boardToRows(board)
    .map((row) => ({
      id: row.__id,

      dealName:
        cleanText(row["Deal Name"]) ||
        row.__name,

      status:
        cleanText(row["Deal Status"]),

      probability:
        cleanText(
          row["Closure Probability"]
        ),

      dealValue:
        parseNumber(
          row["Masked Deal value"]
        ),

      stage:
        cleanText(row["Deal Stage"]),

      product:
        cleanText(row["Product deal"]),

      sector:
        normalizeSector(
          row["Sector/service"]
        ),

      closeDate:
        cleanText(row["Close Date (A)"]),

      tentativeCloseDate:
        cleanText(
          row["Tentative Close Date"]
        )
    }))
    .filter(
      (deal) =>
        deal.dealName &&
        deal.dealName.toLowerCase() !==
          "deal name"
    );
}

function prepareWorkOrders(board) {
  return boardToRows(board)
    .map((row) => ({
      id: row.__id,

      dealName:
        cleanText(
          row["Deal name masked"]
        ) ||
        row.__name,

      executionStatus:
        cleanText(
          row["Execution Status"]
        ),

      sector:
        normalizeSector(row["Sector"]),

      orderValue:
        parseNumber(
          row[
            "Amount in Rupees (Excl of GST) (Masked)"
          ]
        ),

      billedValue:
        parseNumber(
          row[
            "Billed Value in Rupees (Incl of GST.) (Masked)"
          ]
        ),

      collectedAmount:
        parseNumber(
          row[
            "Collected Amount in Rupees (Incl of GST.) (Masked)"
          ]
        ),

      receivableAmount:
        parseNumber(
          row[
            "Amount Receivable (Masked)"
          ]
        ),

      billingStatus:
        cleanText(
          row["Billing Status"]
        )
    }));

}

module.exports = {
  prepareDeals,
  prepareWorkOrders
};
