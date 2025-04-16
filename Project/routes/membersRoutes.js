//Guilherme Ramos 202200083 202200083@estudantes.ips.pt  JoaoFelicio 202200033 202200033@estudantes.ips.pt
"use strict";
import { string, execute, sendResponse, sendError } from "../scripts/db.js";

const commandGetAll = `
    SELECT 
        m.id, 
        m.name, 
        GROUP_CONCAT(DISTINCT et.description) AS preferred_types,
        GROUP_CONCAT(DISTINCT e.description) AS enrolled_events
    FROM members m
    LEFT JOIN member_preferred_event_types mpet ON m.id = mpet.member_id
    LEFT JOIN event_types et ON mpet.event_type_id = et.id
    LEFT JOIN member_enrolled_events mee ON m.id = mee.member_id
    LEFT JOIN events e ON mee.event_id = e.id
    GROUP BY m.id
`;
const commandCreate = "INSERT INTO members (name) VALUES (?)";
const commandUpdate = "UPDATE members SET name = ? WHERE id = ?";
const commandDelete = "DELETE FROM members WHERE id = ?";
const commandInsertPreferredTypes = "INSERT INTO member_preferred_event_types (member_id, event_type_id) VALUES (?, ?)";
const commandDeletePreferredTypes = "DELETE FROM member_preferred_event_types WHERE member_id = ?";
const commandGetEventTypeId = "SELECT id FROM event_types WHERE description = ?";

/**
 * Configura as rotas para operações relacionadas com membros.
 * @param {Object} app - A instância da aplicação Express.
 */
export default async function membersRoutes(app) {
    /**
     * Obtém todos os membros.
     */
    app.get("/members", async (request, response) => {
        await sendResponse(response, commandGetAll);
    });

    /**
     * Obtém os eventos recomendados para um membro com base nos seus tipos de eventos preferidos.
     */
    app.get("/members/:memberId/events", async (request, response) => {
        const memberId = Number(request.params.memberId);
        if (!memberId) return sendError(response, "Deve fornecer um ID de membro válido.");
        const commandGetEventsByMember = `
            SELECT e.id, e.description, e.date, et.description AS type
            FROM events e
            JOIN event_types et ON e.type_id = et.id
            WHERE et.description IN (
                SELECT et.description
                FROM member_preferred_event_types mpet
                JOIN event_types et ON mpet.event_type_id = et.id
                WHERE mpet.member_id = ?
            )
        `;
        try {
            const events = await execute(commandGetEventsByMember, [memberId]);
            response.json(events);
        } catch (error) {
            console.error("Erro ao obter eventos para o membro:", error);
            sendError(response, "Falha ao obter eventos para o membro.");
        }
    });

    /**
     * Cria um novo membro.
     */
    app.post("/members", async (request, response) => {
        const name = string(request.body.name);
        const preferredTypes = request.body.preferredTypes;
        if (!name || !preferredTypes || !Array.isArray(preferredTypes)) {
            return sendError(response, "Deve fornecer um nome e tipos de eventos preferidos para o membro!");
        }
        try {
            const memberResult = await execute(commandCreate, [name]);
            const memberId = memberResult.insertId;
            for (const typeDescription of preferredTypes) {
                const eventTypeResult = await execute(commandGetEventTypeId, [typeDescription]);
                if (eventTypeResult.length > 0) {
                    const eventTypeId = eventTypeResult[0].id;
                    await execute(commandInsertPreferredTypes, [memberId, eventTypeId]);
                }
            }
            response.json({ id: memberId, name, preferredTypes });
        } catch (error) {
            console.error("Erro ao criar membro:", error);
            sendError(response, "Falha ao criar membro.");
        }
    });

    /**
     * Atualiza um membro existente.
     */
    app.put("/members/:id", async (request, response) => {
        const id = Number(request.params.id);
        const { name, preferredTypes } = request.body;
        if (!id || !name || !preferredTypes || !Array.isArray(preferredTypes)) {
            return sendError(response, "Deve fornecer um ID válido, nome e tipos de eventos preferidos!");
        }
        try {
            await execute(commandUpdate, [name, id]);
            await execute(commandDeletePreferredTypes, [id]);
            for (const typeDescription of preferredTypes) {
                const eventTypeResult = await execute(commandGetEventTypeId, [typeDescription]);
                if (eventTypeResult.length > 0) {
                    const eventTypeId = eventTypeResult[0].id;
                    await execute(commandInsertPreferredTypes, [id, eventTypeId]);
                }
            }
            response.json({ id, name, preferredTypes });
        } catch (error) {
            console.error("Erro ao atualizar membro:", error);
            sendError(response, "Falha ao atualizar membro.");
        }
    });

    /**
     * Remove um membro.
     */
    app.delete("/members/:id", async (request, response) => {
        const id = Number(request.params.id);
        if (!id) return sendError(response, "Deve fornecer um ID válido!");
        await sendResponse(response, commandDelete, [id], () => ({ id }));
    });
}
