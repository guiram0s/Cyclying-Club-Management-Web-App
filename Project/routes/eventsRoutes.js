//Guilherme Ramos 202200083 202200083@estudantes.ips.pt  JoaoFelicio 202200033 202200033@estudantes.ips.pt
"use strict";
import { string, date as date2String, sendResponse, sendError, execute } from "../scripts/db.js";

const commandGetAll = `
    SELECT e.id, e.description, e.date, et.description AS type_description
    FROM events e
    JOIN event_types et ON e.type_id = et.id
`;
const commandCreate = "INSERT INTO events (description, type_id, date) VALUES (?, ?, ?)";
const commandUpdate = "UPDATE events SET description = ?, type_id = ?, date = ? WHERE id = ?";
const commandDelete = "DELETE FROM events WHERE id = ?";

const checkMemberDependency = async (eventId) => {
    const command = "SELECT COUNT(*) AS member_count FROM member_enrolled_events WHERE event_id = ?";
    const result = await execute(command, [eventId]);
    return result?.[0]?.member_count > 0;
};

/**
 * Configura as rotas para operações relacionadas com eventos.
 * @param {Object} app - A instância da aplicação Express.
 */
export default async function eventsRoutes(app) {
    /**
     * Obtém todos os eventos.
     * @param {Object} request - O objeto do pedido HTTP.
     * @param {Object} response - O objeto da resposta HTTP.
     */
    app.get("/events", async (request, response) => {
        await sendResponse(response, commandGetAll);
    });

    /**
     * Cria um novo evento.
     * @param {Object} request - O objeto do pedido HTTP.
     * @param {Object} response - O objeto da resposta HTTP.
     */
    app.post("/events", async (request, response) => {
        const description = string(request.body.description);
        const type_id = Number(request.body.type_id);
        const date = date2String(request.body.date);
        if (description && type_id && date) {
            await sendResponse(response, commandCreate, [description, type_id, date], (result) => ({
                id: result.insertId,
                description,
                type_id,
                date,
            }));
        } else {
            sendError(response, "Deve fornecer uma descrição, um ID de tipo e uma data para o evento!");
        }
    });

    /**
     * Atualiza um evento existente.
     * @param {Object} request - O objeto do pedido HTTP.
     * @param {Object} response - O objeto da resposta HTTP.
     */
    app.put("/events/:id", async (request, response) => {
        const id = Number(request.params.id);
        const description = string(request.body.description);
        const type_id = Number(request.body.type_id);
        const date = date2String(request.body.date);
        if (id && description && type_id && date) {
            await sendResponse(response, commandUpdate, [description, type_id, date, id], () => ({
                id,
                description,
                type_id,
                date,
            }));
        } else {
            sendError(response, "Deve fornecer um ID válido, uma descrição, um ID de tipo e uma data!");
        }
    });

    /**
     * Elimina um evento verificando se está associado a menbros.
     * @param {Object} request - O objeto do pedido HTTP.
     * @param {Object} response - O objeto da resposta HTTP.
     */
    app.delete("/events/:id", async (request, response) => {
        const id = Number(request.params.id);
        if (!id) {
            return sendError(response, "Deve fornecer um ID válido!");
        }

        try {
            const isUsedByMember = await checkMemberDependency(id);
            if (isUsedByMember) {
                return sendError(
                    response,
                    "Não é possível eliminar o evento: Está associado a um ou mais membros."
                );
            }

            await sendResponse(response, commandDelete, [id], () => ({
                id,
            }));
        } catch (error) {
            console.error("Erro ao eliminar evento:", error);
            sendError(response, "Ocorreu um erro ao eliminar o evento.");
        }
    });
}
