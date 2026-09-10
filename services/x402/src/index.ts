import type { NextFunction, Request, Response } from "express";
import { paymentMiddleware } from "@x402/express";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { ALGORAND_TESTNET_CAIP2, USDC_TESTNET_ASA_ID } from "@x402/avm";
import { ExactAvmScheme } from "@x402/avm/exact/server";
import type { Network } from "@x402/core/types";

const route = "POST /api/x402/incident-intelligence";

export interface X402Config {
  network: string;
  payTo: string;
  facilitatorUrl: string;
  price: string;
  asset: string;
}

export function readX402Config(env: NodeJS.ProcessEnv = process.env): X402Config | null {
  const network = env.X402_NETWORK || ALGORAND_TESTNET_CAIP2;
  const payTo = env.X402_PAY_TO;
  const facilitatorUrl = env.X402_FACILITATOR_URL;
  if (!payTo || !facilitatorUrl) return null;
  if (network !== ALGORAND_TESTNET_CAIP2) {
    throw new Error(`X402_NETWORK must be ${ALGORAND_TESTNET_CAIP2}; mainnet is not supported by Sentinel`);
  }
  return {
    network,
    payTo,
    facilitatorUrl,
    price: env.X402_PRICE || "0.01",
    asset: env.X402_ASSET || USDC_TESTNET_ASA_ID
  };
}

export function createX402Middleware(config: X402Config) {
  const facilitator = new HTTPFacilitatorClient({ url: config.facilitatorUrl });
  const resourceServer = new x402ResourceServer(facilitator)
    .register(config.network as Network, new ExactAvmScheme());
  return paymentMiddleware(
    {
      [route]: {
        accepts: {
          scheme: "exact",
          price: { amount: config.price, asset: config.asset },
          network: config.network as Network,
          payTo: config.payTo
        },
        description: "Advanced Sentinel incident intelligence",
        mimeType: "application/json"
      }
    },
    resourceServer
  );
}

function decodePaymentResponse(value: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(value, "base64").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function x402DemoLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const payment = req.header("payment-signature") || req.header("x-payment");
    if (payment) console.info("[x402] payment received");
    res.on("finish", () => {
      if (res.statusCode === 402) console.info("[x402] payment required");
      const encoded = res.getHeader("payment-response");
      if (typeof encoded !== "string") return;
      const result = decodePaymentResponse(encoded);
      if (!result) return;
      console.info("[x402] settlement result", result.success ? "success" : "failure");
      if (result.transaction) console.info("[x402] transaction ID", result.transaction);
    });
    next();
  };
}
