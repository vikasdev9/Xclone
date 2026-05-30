import mongoose from "mongoose";
import dns from "node:dns";
import { ENV } from "./env.js"; 

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
  } catch (error) {
    const isSrvDnsRefused =
      error?.code === "ECONNREFUSED" &&
      error?.syscall === "querySrv";

    if (isSrvDnsRefused) {
      const configuredServers = (ENV.DNS_SERVERS || "")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

      const fallbackServers = configuredServers.length
        ? configuredServers
        : ["8.8.8.8", "1.1.1.1"];

      console.warn(
        `SRV DNS lookup failed with local resolver. Retrying with DNS servers: ${fallbackServers.join(", ")}`,
      );

      try {
        dns.setServers(fallbackServers);
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host} ✅`);
        return;
      } catch (retryError) {
        console.error("MongoDB retry after DNS fallback failed ❌");
        console.error(retryError);
        process.exit(1);
      }
    }

    console.error("Error connecting to MONGODB ❌");
    console.error(error);
    process.exit(1);
  }
};