import "dotenv/config";
import app from "./app";
import CONFIG from "./config";

app.listen(CONFIG.port, () => {
  console.log(`GearRent API running on port ${CONFIG.port}`);
});
