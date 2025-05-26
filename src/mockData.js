// Generate mock data for the last 14 days with random status changes
function generateMockOrders() {
  const today = new Date();
  const orders = [];
  let id = 1;
  for (let d = 13; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    // Random new orders per day
    const newOrders = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < newOrders; i++) {
      // Randomly assign status
      const statusRoll = Math.random();
      let code, status, finishedDate = null;
      if (statusRoll < 0.35) {
        code = 100; status = 'New';
      } else if (statusRoll < 0.55) {
        code = 151; status = 'Waiting for Spare Parts';
      } else if (statusRoll < 0.8) {
        code = 600; status = 'Submitted';
      } else {
        code = 500; status = 'Problem Solved';
        // Finished today or yesterday
        const finishOffset = Math.floor(Math.random() * 2);
        const finishDate = new Date(date);
        finishDate.setDate(date.getDate() + finishOffset);
        finishedDate = finishDate.toISOString().slice(0, 10);
      }
      orders.push({
        id: id++,
        code,
        status,
        createdDate: dateStr,
        finishedDate,
        submittedDate: code === 600 ? dateStr : null,
        waitingForParts: code === 151
      });
    }
  }
  return orders;
}

export const serviceOrders = generateMockOrders();
