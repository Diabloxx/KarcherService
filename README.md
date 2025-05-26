# Karcher Service Orders Dashboard

This project is a Vite + React dashboard for Karcher Service Division. It visualizes service order data (mocked for now) including:

- Counts of New, Finished, Submitted, and Waiting for Parts service orders
- Flow chart of order statuses
- Daily work order completion charts
- Estimated wait times based on available data

## Getting Started

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```

## Project Structure
- `src/` — React components and logic
- `mockData.js` — Mock service order data (to be replaced with API integration)

## Customization
- Replace mock data with real API data once access to Karcher OneView API is available.
- Update charts and logic as needed for your workflow.

---

This project was bootstrapped with Vite and React.
