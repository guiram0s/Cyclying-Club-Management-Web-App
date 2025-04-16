//Guilherme Ramos 202200083 202200083@estudantes.ips.pt  JoaoFelicio 202200033 202200033@estudantes.ips.pt

import express from "express";
import cors from "cors";
import eventTypesRoutes from "./routes/eventTypesRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import membersRoutes from "./routes/membersRoutes.js";

const app = express();
app.use(cors());
app.use(express.static("www", { "index": "index.html" }));
app.use(express.json());

// Use the routes
eventTypesRoutes(app);
eventsRoutes(app);
membersRoutes(app);

app.listen(8081, function () {
    console.log("Server running at http://localhost:8081");
});
