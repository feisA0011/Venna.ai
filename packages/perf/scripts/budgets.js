const budgets = {
  widgetBootBrotliKb: 6,
  widgetUiBrotliKb: 60,
  landingLcpMs: 2500,
  dashboardLcpMs: 3000
};

console.log("Performance budgets:");
for (const [key, value] of Object.entries(budgets)) {
  console.log(`- ${key}: ${value}`);
}
