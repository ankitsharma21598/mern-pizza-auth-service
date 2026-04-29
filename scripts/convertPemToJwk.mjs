import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import rsaPemToJwk from "rsa-pem-to-jwk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pemFile = path.join(__dirname, "../certs/private.pem");
const pem = fs.readFileSync(pemFile, "utf8");
const jwk = rsaPemToJwk(pem, { use: "sig" }, "public");
console.log(jwk);
