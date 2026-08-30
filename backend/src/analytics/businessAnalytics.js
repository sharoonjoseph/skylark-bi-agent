function sum(values) {
  return values
    .filter(
      (value) =>
        typeof value === "number"
    )
    .reduce(
      (total, value) =>
        total + value,
      0
    );
}

function countBy(items, getter) {
  const result = {};

  items.forEach((item) => {
    const key =
      getter(item) || "Unknown";

    result[key] =
      (result[key] || 0) + 1;
  });

  return result;
}

function analyzeDeals(deals) {
  const active = deals.filter((deal) => {
    const status =
      deal.status?.toLowerCase();

    return (
      status === "open" ||
      status === "on hold"
    );
  });

  const sectorPipeline = {};

  active.forEach((deal) => {
    const sector =
      deal.sector || "Unknown";

    if (!sectorPipeline[sector]) {
      sectorPipeline[sector] = {
        deals: 0,
        value: 0
      };
    }

    sectorPipeline[sector].deals++;

    if (
      typeof deal.dealValue === "number"
    ) {
      sectorPipeline[sector].value +=
        deal.dealValue;
    }
  });

  return {
    totalDeals: deals.length,

    activeDeals: active.length,

    pipelineValue: sum(
      active.map(
        (deal) => deal.dealValue
      )
    ),

    statusCounts: countBy(
      deals,
      (deal) => deal.status
    ),

    sectorPipeline,

    dataQuality: {
      missingDealValue:
        deals.filter(
          (deal) =>
            deal.dealValue === null
        ).length,

      missingProbability:
        deals.filter(
          (deal) =>
            !deal.probability
        ).length,

      missingSector:
        deals.filter(
          (deal) =>
            deal.sector === "Unknown"
        ).length
    }
  };
}

function analyzeWorkOrders(workOrders) {
  const completed =
    workOrders.filter((item) =>
      item.executionStatus
        ?.toLowerCase()
        .includes("completed")
    );

  return {
    totalWorkOrders:
      workOrders.length,

    completed:
      completed.length,

    completionRate:
      workOrders.length
        ? Number(
            (
              completed.length /
              workOrders.length *
              100
            ).toFixed(1)
          )
        : 0,

    totalOrderValue: sum(
      workOrders.map(
        (item) => item.orderValue
      )
    ),

    totalBilled: sum(
      workOrders.map(
        (item) => item.billedValue
      )
    ),

    totalCollected: sum(
      workOrders.map(
        (item) =>
          item.collectedAmount
      )
    ),

    totalReceivable: sum(
      workOrders.map(
        (item) =>
          item.receivableAmount
      )
    ),

    statusCounts: countBy(
      workOrders,
      (item) =>
        item.executionStatus
    ),

    sectorCounts: countBy(
      workOrders,
      (item) => item.sector
    ),

    dataQuality: {
      missingOrderValue:
        workOrders.filter(
          (item) =>
            item.orderValue === null
        ).length,

      missingBillingStatus:
        workOrders.filter(
          (item) =>
            !item.billingStatus
        ).length
    }
  };
}

function buildBusinessSummary(
  deals,
  workOrders
) {
  return {
    generatedAt:
      new Date().toISOString(),

    assumptions: {
      activePipeline:
        "Deals with Open or On Hold status are treated as active pipeline."
    },

    deals:
      analyzeDeals(deals),

    workOrders:
      analyzeWorkOrders(workOrders)
  };
}

module.exports = {
  buildBusinessSummary
};
